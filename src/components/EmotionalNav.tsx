import styled from '@emotion/styled';
import { Note, Chord } from 'tonal';
import type { ChordCell } from '../logic/types';

interface EmotionalNavProps {
    currentRoot: string;
    onNavigate: (newRoot: string) => void;
    onChordDown: (cell: ChordCell) => void;
    onChordUp: (cell: ChordCell) => void;
}

const NavContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const NavButton = styled.button<{ moodColor: string }>`
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  -webkit-touch-callout: none;

  &:hover {
    background: ${props => props.moodColor};
    transform: translateY(-2px);
    border-color: transparent;
    color: #000;
    font-weight: 600;
  }
  
  &:active {
      transform: scale(0.95);
  }
`;

export const EmotionalNav = ({ currentRoot, onNavigate, onChordDown, onChordUp }: EmotionalNavProps) => {
    // Transpose helper
    const t = (interval: string) => Note.simplify(Note.transpose(currentRoot, interval));

    const emotions = [
        { label: "Bright / Dominant", interval: "5P", color: "#FFD93D", mood: "Energy", suffix: "" },
        { label: "Calm / Subdominant", interval: "4P", color: "#6BCB77", mood: "Relax" },
        { label: "Melancholy / Rel. Minor", interval: "-3m", color: "#4D96FF", mood: "Sad", suffix: "m" },
        { label: "Anxious / Distant", interval: "5d", color: "#FF6B6B", mood: "Tension", suffix: "" },
    ];

    const handleDown = (e: React.MouseEvent | React.TouchEvent, interval: string, suffix: string) => {
        // e.preventDefault(); // Optional: prevent selection
        const targetRoot = t(interval);
        const chordName = targetRoot + (suffix || "");
        const chord = Chord.get(chordName);

        // Construct a virtual cell
        const cell: ChordCell = {
            id: `emo-${targetRoot}`,
            root: targetRoot,
            suffix: suffix || "",
            fullName: chordName,
            intervals: chord.notes,
            verticalFunction: 'Stability', // Approximate
            distanceType: 'Outer', // Approximate
            isInKey: false, // Maybe true/false but not critical for playback
            rowType: 'Same',
            colIndex: 0
        };

        onChordDown(cell);
        onNavigate(targetRoot);
    };

    const handleUp = () => {
        // We can pass a dummy cell or null because stopChord usually releases all.
        // But types require a cell. Let's make onChordUp allow optional cell or just pass dummy.
        // Actually onChordUp in App.tsx ignores cell for Synth but uses it (re-calc) for MIDI.
        // For MIDI, we need the SAME notes to stop them.
        // IF we navigated, the previous "virtual cell" is lost?
        // App.tsx uses `playingNotesRef` (which I implemented previously!) to stop MIDI notes.
        // So `stopChord` actually doesn't strictly need the `cell` for MIDI Note Off 
        // IF we rely on `playingNotesRef`.
        // Let's check `App.tsx`: 
        // "For MIDI, we need to know WHICH notes to stop... We could calculate them again from cell, or use the stored ref?"
        // Implementation: `if (output) { const notesWithOctaves = getVoicedNotes(cell); ... sendMidiNoteOff... }`
        // It DOES use the cell. 
        // BUT `startChord` also pushes to `playingNotesRef`.
        // Wait, `stopChord` implementation in my last edit: 
        // It RE-CALCULATES from cell. It does NOT use `playingNotesRef` for NoteOff.
        // That is a bug/limitation if we want to support stopping stateless chords.
        // I should fix `App.tsx` `stopChord` to use `playingNotesRef` so we don't need to reconstruct the exact cell.

        // For now, I'll pass a dummy cell, but I MUST fix App.tsx to use `playingNotesRef`.
        // Or I reconstruct the cell here. But I need to know which one was pressed.
        // It's easier to fix App.tsx Use `playingNotesRef` for MIDI Off.

        // So I will fix App.tsx first or concurrently.

        // Let's pass a dummy cell for now and assume I fix App.tsx.
        const dummyCell: ChordCell = {
            id: 'dummy',
            root: 'C',
            suffix: '',
            fullName: '',
            intervals: [],
            verticalFunction: 'Stability',
            distanceType: 'Center',
            isInKey: true,
            rowType: 'Same',
            colIndex: 0
        };
        onChordUp(dummyCell);
    };

    return (
        <NavContainer>
            {emotions.map((e) => {
                const target = t(e.interval);
                return (
                    <NavButton
                        key={e.label}
                        moodColor={e.color}
                        onMouseDown={(ev) => handleDown(ev, e.interval, e.suffix || "")}
                        onMouseUp={handleUp}
                        onMouseLeave={handleUp}
                        onTouchStart={(ev) => handleDown(ev, e.interval, e.suffix || "")}
                        onTouchEnd={(ev) => { ev.preventDefault(); handleUp(); }}
                    >
                        <span>{e.mood}</span>
                        <span style={{ opacity: 0.7, fontSize: '0.8em' }}>({target})</span>
                    </NavButton>
                );
            })}
        </NavContainer>
    );
};
