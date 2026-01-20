import styled from '@emotion/styled';
import { Slider } from '@mui/material';
import type { TensionLevel } from '../logic/types';

interface HeaderProps {
    currentChordName: string;
    tensionLevel: TensionLevel;
    onTensionChange: (level: TensionLevel) => void;
    onSettingsClick: () => void;
    onHelpClick: () => void;
}

const HeaderContainer = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1e1e2f 0%, #2a2a40 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  margin-bottom: 20px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0 0 16px 0;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #4ECDC4, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SettingsButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: 1px solid #444;
  color: #aaa;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #646cff;
    color: #fff;
  }
`;

const HelpButton = styled.button`
  position: absolute;
  top: 20px;
  right: 120px; /* Positioned to the left of Settings */
  background: transparent;
  border: 1px solid #444;
  color: #aaa;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4ECDC4;
    color: #fff;
  }
`;

const ChordDisplay = styled.div`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.4);
`;

const ControlsContainer = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #aaa;
  display: flex;
  justify-content: space-between;
`;

export const Header = ({ currentChordName, tensionLevel, onTensionChange, onSettingsClick, onHelpClick }: HeaderProps) => {
    const handleChange = (_: Event, value: number | number[]) => {
        onTensionChange(value as TensionLevel);
    };

    const getTensionLabel = (level: number) => {
        switch (level) {
            case 0: return "Triad (Simple)";
            case 1: return "7th (Basic)";
            case 2: return "9th (Urban)";
            case 3: return "13th/Alt (Complex)";
            default: return "";
        }
    };

    return (
        <HeaderContainer>
            <HelpButton onClick={onHelpClick}>Help</HelpButton>
            <SettingsButton onClick={onSettingsClick}>Settings</SettingsButton>
            <Title>ChordingPad</Title>
            <ChordDisplay>{currentChordName || "Start Playing"}</ChordDisplay>

            <ControlsContainer>
                <Label>
                    <span>Tension Quality</span>
                    <span>{getTensionLabel(tensionLevel)}</span>
                </Label>
                <Slider
                    value={tensionLevel}
                    min={0}
                    max={3}
                    step={1}
                    marks
                    onChange={handleChange}
                    sx={{
                        color: '#4ECDC4',
                        '& .MuiSlider-thumb': {
                            boxShadow: '0 0 10px rgba(78, 205, 196, 0.5)',
                        }
                    }}
                />
            </ControlsContainer>
        </HeaderContainer>
    );
};
