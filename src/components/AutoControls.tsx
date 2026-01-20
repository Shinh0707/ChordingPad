import styled from '@emotion/styled';
import { type AutoDirection, type AutoModeState } from '../logic/types';

interface AutoControlsProps {
    autoMode: AutoModeState;
    onChange: (newState: AutoModeState) => void;
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1e1e1e;
  border-top: 1px solid #333;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Label = styled.span`
  color: #aaa;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  background-color: #2c2c2c;
  border: 1px solid #3d3d3d;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  width: 60px;
  text-align: center;
  font-size: 1rem;

  &:focus {
      outline: none;
      border-color: #646cff;
  }
`;

const DirectionButton = styled.button<{ isActive?: boolean; direction?: string }>`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  min-width: 80px;

  ${props => {
        if (props.isActive) {
            switch (props.direction) {
                case 'Up': return 'background-color: #ff5252; color: white; box-shadow: 0 0 10px rgba(255, 82, 82, 0.4);'; // Red/Tension
                case 'Down': return 'background-color: #4caf50; color: white; box-shadow: 0 0 10px rgba(76, 175, 80, 0.4);'; // Green/Relax
                case 'Stay': return 'background-color: #2196f3; color: white; box-shadow: 0 0 10px rgba(33, 150, 243, 0.4);'; // Blue/Stable
                case 'Rest': return 'background-color: #9e9e9e; color: black;';
                case 'Energy': return 'background-color: #FFD93D; color: black; box-shadow: 0 0 10px rgba(255, 217, 61, 0.4);';
                case 'Relax': return 'background-color: #6BCB77; color: white; box-shadow: 0 0 10px rgba(107, 203, 119, 0.4);';
                case 'Sad': return 'background-color: #4D96FF; color: white; box-shadow: 0 0 10px rgba(77, 150, 255, 0.4);';
                case 'Tension': return 'background-color: #FF6B6B; color: white; box-shadow: 0 0 10px rgba(255, 107, 107, 0.4);';
                default: return 'background-color: #646cff; color: white;';
            }
        }
        return 'background-color: #333; color: #aaa; &:hover { background-color: #444; }';
    }}
`;

const ToggleButton = styled.button<{ isOn: boolean }>`
    padding: 8px 16px;
    border-radius: 20px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    background-color: ${props => props.isOn ? '#646cff' : '#333'};
    color: ${props => props.isOn ? '#fff' : '#aaa'};
    transition: all 0.3s;
`;

export function AutoControls({ autoMode, onChange }: AutoControlsProps) {
    const handleDirectionClick = (direction: AutoDirection) => {
        onChange({ ...autoMode, direction });
    };

    const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            onChange({ ...autoMode, bpm: val });
        }
    };

    const toggleActive = () => {
        onChange({ ...autoMode, isActive: !autoMode.isActive });
    };

    return (
        <Container>
            <ControlGroup>
                <ToggleButton isOn={autoMode.isActive} onClick={toggleActive}>
                    {autoMode.isActive ? "AUTO ON" : "AUTO OFF"}
                </ToggleButton>
            </ControlGroup>

            <div style={{ width: '1px', height: '40px', background: '#333' }} />

            <ControlGroup>
                <Label>BPM</Label>
                <Input
                    type="number"
                    value={autoMode.bpm}
                    onChange={handleBpmChange}
                    min="30"
                    max="300"
                />
            </ControlGroup>

            <div style={{ width: '1px', height: '40px', background: '#333' }} />

            <ControlGroup>
                <DirectionButton
                    direction="Up"
                    isActive={autoMode.direction === 'Up'}
                    onClick={() => handleDirectionClick('Up')}
                >
                    UP
                </DirectionButton>
                <DirectionButton
                    direction="Down"
                    isActive={autoMode.direction === 'Down'}
                    onClick={() => handleDirectionClick('Down')}
                >
                    DOWN
                </DirectionButton>
                <DirectionButton
                    direction="Stay"
                    isActive={autoMode.direction === 'Stay'}
                    onClick={() => handleDirectionClick('Stay')}
                >
                    STAY
                </DirectionButton>
                <DirectionButton
                    direction="Rest"
                    isActive={autoMode.direction === 'Rest'}
                    onClick={() => handleDirectionClick('Rest')}
                >
                    REST
                </DirectionButton>
                <DirectionButton
                    direction="Energy"
                    isActive={autoMode.direction === 'Energy'}
                    onClick={() => handleDirectionClick('Energy')}
                >
                    ENERGY
                </DirectionButton>
                <DirectionButton
                    direction="Relax"
                    isActive={autoMode.direction === 'Relax'}
                    onClick={() => handleDirectionClick('Relax')}
                >
                    RELAX
                </DirectionButton>
                <DirectionButton
                    direction="Sad"
                    isActive={autoMode.direction === 'Sad'}
                    onClick={() => handleDirectionClick('Sad')}
                >
                    SAD
                </DirectionButton>
                <DirectionButton
                    direction="Tension"
                    isActive={autoMode.direction === 'Tension'}
                    onClick={() => handleDirectionClick('Tension')}
                >
                    TENSION
                </DirectionButton>
            </ControlGroup>
        </Container>
    );
}
