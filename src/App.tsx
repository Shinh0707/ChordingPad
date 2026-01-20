import { useState, useMemo, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import * as Tone from 'tone';
import { Note, Chord } from 'tonal';
import { generateGrid } from './logic/chordGeneration';
import type { GridParams, ChordCell, TensionLevel, AutoModeState, AutoDirection } from './logic/types';
import { Header } from './components/Header';
import { EmotionalNav } from './components/EmotionalNav';
import { ChordGrid } from './components/ChordGrid';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { AutoControls } from './components/AutoControls';
import { sendMidiNoteOn, sendMidiNoteOff, getMidiOutputs } from './logic/midi';

// Global Styles
const GlobalStyles = css`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #121212;
    color: #e0e0e0;
    -webkit-font-smoothing: antialiased;
  }
  
  * {
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 120px; /* More padding for AutoControls */
  width: 100%;
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px; /* Constrain width */
  margin: 0 auto;
`;

function App() {
  // State
  const [params, setParams] = useState<GridParams>({
    currentRoot: "C",
    gridWidth: 5,
    tensionLevel: 0,
  });

  const [currentChordName, setCurrentChordName] = useState("");
  const [midiOutputId, setMidiOutputId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [autoMode, setAutoMode] = useState<AutoModeState>({
    isActive: false,
    bpm: 120,
    direction: 'Stay'
  });

  // Keep track of currently playing notes to stop them later
  const playingNotesRef = useRef<number[]>([]);

  // Refs for access inside Transport callback
  const paramsRef = useRef(params);
  const autoModeRef = useRef(autoMode);
  const midiOutputIdRef = useRef(midiOutputId);

  useEffect(() => {
    paramsRef.current = params;
    autoModeRef.current = autoMode;
    midiOutputIdRef.current = midiOutputId;
  }, [params, autoMode, midiOutputId]);

  // Synthesizer
  const synth = useMemo(() => {
    return new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 } // Faster release for manual control
    }).toDestination();
  }, []);

  // Update Grid
  const gridState = useMemo(() => {
    return generateGrid(params);
  }, [params]);

  // Helper to get Octaved Notes
  const getVoicedNotes = (cell: ChordCell) => {
    return cell.intervals.map((noteName, index) => {
      // Simple voicing: Root at 3, others at 4
      if (index === 0) return noteName + "3";
      return noteName + "4";
    });
  };

  // Start Playing Chord (Note On)
  const startChord = async (cell: ChordCell) => {
    setCurrentChordName(cell.fullName);
    const notesWithOctaves = getVoicedNotes(cell);
    const currentMidiId = midiOutputIdRef.current;

    // MIDI
    if (currentMidiId) {
      try {
        const outputs = await getMidiOutputs();
        const output = outputs.find(o => o.id === currentMidiId);
        if (output) {
          const midiNotes: number[] = [];
          notesWithOctaves.forEach(n => {
            const midiNum = Tone.Frequency(n).toMidi();
            sendMidiNoteOn(output, midiNum);
            midiNotes.push(midiNum);
          });
          playingNotesRef.current = midiNotes;
          return;
        }
      } catch (e) {
        console.error("MIDI Error:", e);
      }
    }

    // Synth
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      synth.releaseAll();
      synth.triggerAttack(notesWithOctaves);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  };

  // Stop Playing Chord (Note Off)
  const stopChord = async (cell?: ChordCell) => {
    // Synth
    // We ignore cell for synth (release all)
    synth.releaseAll();

    // MIDI
    // Note: cell is ignored too, because we trust playingNotesRef
    const currentMidiId = midiOutputIdRef.current;
    if (currentMidiId && playingNotesRef.current.length > 0) {
      try {
        const outputs = await getMidiOutputs();
        const output = outputs.find(o => o.id === currentMidiId);
        if (output) {
          // Use stored notes to stop exactly what started
          playingNotesRef.current.forEach(note => {
            sendMidiNoteOff(output, note);
          });
        }
      } catch (e) {
        console.error("MIDI Error:", e);
      }
      // Clear
      playingNotesRef.current = [];
    }
  };


  // Handlers
  const handleChordDown = (cell: ChordCell) => {
    startChord(cell);

    // Re-center on press
    if (cell.root !== params.currentRoot) {
      setParams(prev => ({
        ...prev,
        currentRoot: cell.root
      }));
    }
  };

  const handleChordUp = (cell: ChordCell) => {
    stopChord(cell);
  };

  const handleTensionChange = (level: TensionLevel) => {
    setParams(prev => ({ ...prev, tensionLevel: level }));
  };

  const handleNavigate = (newRoot: string) => {
    setParams(prev => ({ ...prev, currentRoot: newRoot }));
  };

  const handleMidiOutputChange = (id: string | null) => {
    setMidiOutputId(id);
  };

  // Auto Mode Effect
  useEffect(() => {
    if (autoMode.isActive) {
      Tone.Transport.bpm.value = autoMode.bpm;

      const loopId = Tone.Transport.scheduleRepeat((time) => {
        const currentParams = paramsRef.current;
        const currentAuto = autoModeRef.current;

        if (currentAuto.direction === 'Rest') return;

        const tempGrid = generateGrid(currentParams);
        let targetCell: ChordCell | undefined;

        // Map Direction to Grid logic
        if (currentAuto.direction === 'Up' || currentAuto.direction === 'Energy') {
          targetCell = tempGrid.up.find(c => c.colIndex === 0);
        } else if (currentAuto.direction === 'Down' || currentAuto.direction === 'Relax') {
          targetCell = tempGrid.down.find(c => c.colIndex === 0);
        } else if (currentAuto.direction === 'Stay') {
          targetCell = tempGrid.same.find(c => c.colIndex === 0);
        } else if (currentAuto.direction === 'Sad') {
          // Sad -> Relative Minor (-3m)
          const targetRoot = Note.simplify(Note.transpose(currentParams.currentRoot + "4", "-3m"));
          const chordName = targetRoot + "m";
          const chord = Chord.get(chordName);

          targetCell = {
            id: `auto-sad-${targetRoot}`,
            root: targetRoot,
            suffix: "m",
            fullName: chordName,
            intervals: chord.notes,
            verticalFunction: 'Relaxation',
            distanceType: 'Outer',
            isInKey: true,
            rowType: 'Down',
            colIndex: 0
          } as any;
        } else if (currentAuto.direction === 'Tension') {
          // Tension -> 5d (Tritone). Major.
          const targetRoot = Note.simplify(Note.transpose(currentParams.currentRoot + "4", "5d")); // 5d from C4 is Gb4
          const chordName = targetRoot; // Major triad
          const chord = Chord.get(chordName);

          targetCell = {
            id: `auto-tension-${targetRoot}`,
            root: targetRoot,
            suffix: "",
            fullName: chordName,
            intervals: chord.notes,
            verticalFunction: 'Tension',
            distanceType: 'Outer',
            isInKey: false,
            rowType: 'Up',
            colIndex: 0
          } as any;
        }

        if (targetCell) {
          // For Auto Mode, we want a fixed duration (1 beat).

          setCurrentChordName(targetCell.fullName);
          const notesWithOctaves = getVoicedNotes(targetCell);

          const currentMidiId = midiOutputIdRef.current;

          // Duration: 1 Beat
          const beatDurationMs = (60 / currentAuto.bpm) * 1000;

          if (currentMidiId) {
            getMidiOutputs().then(outputs => {
              const output = outputs.find(o => o.id === currentMidiId);
              if (output) {
                notesWithOctaves.forEach(n => {
                  const midiNum = Tone.Frequency(n).toMidi();
                  sendMidiNoteOn(output, midiNum);
                  setTimeout(() => {
                    sendMidiNoteOff(output, midiNum);
                  }, beatDurationMs);
                });
              }
            });
          } else {
            // Synth duration: 1 beat ("4n")
            synth.triggerAttackRelease(notesWithOctaves, "4n");
          }

          // Update UI State (Next Root)
          Tone.Draw.schedule(() => {
            if (targetCell && targetCell.root !== currentParams.currentRoot) {
              setParams(prev => ({
                ...prev,
                currentRoot: targetCell!.root
              }));
            }
          }, time);
        }

      }, "1m");

      Tone.Transport.start();

      return () => {
        Tone.Transport.clear(loopId);
        Tone.Transport.stop();
      };
    }
  }, [autoMode.isActive]);

  useEffect(() => {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.bpm.rampTo(autoMode.bpm, 1);
    } else {
      Tone.Transport.bpm.value = autoMode.bpm;
    }
  }, [autoMode.bpm]);

  useEffect(() => {
    return () => {
      synth.dispose();
    };
  }, [synth]);

  return (
    <>
      <Global styles={GlobalStyles} />
      <AppContainer>
        <Header
          currentChordName={currentChordName}
          tensionLevel={params.tensionLevel}
          onTensionChange={handleTensionChange}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onHelpClick={() => setIsHelpOpen(true)}
        />

        <ContentArea>
          <EmotionalNav
            currentRoot={params.currentRoot}
            onNavigate={handleNavigate}
            onChordDown={handleChordDown}
            onChordUp={handleChordUp}
          />

          <ChordGrid
            gridState={gridState}
            onChordDown={handleChordDown}
            onChordUp={handleChordUp}
          />
        </ContentArea>

        <AutoControls
          autoMode={autoMode}
          onChange={setAutoMode}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          midiOutputId={midiOutputId}
          onMidiOutputChange={handleMidiOutputChange}
        />

        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </AppContainer>
    </>
  );
}

export default App;
