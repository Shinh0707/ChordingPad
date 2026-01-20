import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import { getMidiOutputs, type MIDIOutput } from '../logic/midi';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    midiOutputId: string | null;
    onMidiOutputChange: (id: string | null) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: #1e1e1e;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #fff;
  font-size: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #aaa;
  font-size: 0.9rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #2c2c2c;
  border: 1px solid #3d3d3d;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #646cff;
  }
`;

const CloseButton = styled.button`
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #444;
  }
`;

export function SettingsModal({ isOpen, onClose, midiOutputId, onMidiOutputChange }: SettingsModalProps) {
    const [midiOutputs, setMidiOutputs] = useState<MIDIOutput[]>([]);

    useEffect(() => {
        if (isOpen) {
            getMidiOutputs().then(outputs => setMidiOutputs(outputs));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <Title>Settings</Title>

                <Section>
                    <Label htmlFor="midi-output">MIDI Output</Label>
                    <Select
                        id="midi-output"
                        value={midiOutputId || ""}
                        onChange={(e) => onMidiOutputChange(e.target.value === "" ? null : e.target.value)}
                    >
                        <option value="">Internal Synth (Default)</option>
                        {midiOutputs.map(output => (
                            <option key={output.id} value={output.id}>
                                {output.name || "Unknown Device"}
                            </option>
                        ))}
                    </Select>
                </Section>

                <CloseButton onClick={onClose}>Close</CloseButton>
            </Modal>
        </Overlay>
    );
}
