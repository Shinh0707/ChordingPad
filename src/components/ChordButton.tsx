import styled from '@emotion/styled';
import type { ChordCell } from '../logic/types';

interface ChordButtonProps {
  cell: ChordCell;
  onMouseDown: (cell: ChordCell) => void;
  onMouseUp: (cell: ChordCell) => void;
}

// Color palettes based on function
const FUNCTION_COLORS = {
  Tension: { bg: '#FF6B6B', text: '#fff' }, // Red-ish
  Stability: { bg: '#4ECDC4', text: '#fff' }, // Teal-ish
  Relaxation: { bg: '#1A535C', text: '#fff' }, // Dark Teal/Blue
};

const DISTANCE_STYLES = {
  Center: { opacity: 1.0, scale: 1.05 },
  Inner: { opacity: 0.85, scale: 1.0 },
  Outer: { opacity: 0.6, scale: 1.0 },
};

// Non-diatonic warning overlay
const WARNING_COLOR = 'rgba(255, 159, 28, 0.3)'; // Orange overlay

const ButtonContainer = styled.button<{
  verticalFunc: string;
  distance: string;
  isInKey: boolean;
}>`
  width: 100%;
  height: 80px;
  border: none;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s cubic-bezier(0.25, 0.8, 0.25, 1); /* Faster transition for press */
  position: relative;
  overflow: hidden;
  user-select: none; /* Prevent selection */
  -webkit-touch-callout: none; /* iOS Safari */
  
  /* Base Colors */
  background-color: ${props => FUNCTION_COLORS[props.verticalFunc as keyof typeof FUNCTION_COLORS]?.bg || '#ccc'};
  color: ${props => FUNCTION_COLORS[props.verticalFunc as keyof typeof FUNCTION_COLORS]?.text || '#000'};
  
  /* Distance Styling */
  opacity: ${props => DISTANCE_STYLES[props.distance as keyof typeof DISTANCE_STYLES]?.opacity || 1};
  transform: scale(${props => DISTANCE_STYLES[props.distance as keyof typeof DISTANCE_STYLES]?.scale || 1});
  z-index: ${props => props.distance === 'Center' ? 10 : 1};
  box-shadow: ${props => props.distance === 'Center' ? '0 10px 20px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)'};

  /* Non-diatonic warning */
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: ${props => props.isInKey ? 'transparent' : WARNING_COLOR};
    pointer-events: none;
  }

  /* Hover only on non-touch devices ideally, but media query is safer if needed */
  @media (hover: hover) {
    &:hover {
        transform: scale(${props => props.distance === 'Center' ? 1.1 : 1.05}) translateY(-2px);
        box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
        opacity: 1;
        filter: brightness(1.1);
    }
  }

  &:active {
    transform: scale(0.95);
    filter: brightness(0.9);
  }
`;

const ChordName = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  pointer-events: none; /* Let clicks pass to button */
`;

const IntervalInfo = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 4px;
  pointer-events: none;
`;

export const ChordButton = ({ cell, onMouseDown, onMouseUp }: ChordButtonProps) => {
  // We handle both mouse and touch events
  // Prevent default on touch to avoid scrolling while playing/dragging

  return (
    <ButtonContainer
      verticalFunc={cell.verticalFunction}
      distance={cell.distanceType}
      isInKey={cell.isInKey}
      onMouseDown={() => onMouseDown(cell)}
      onMouseUp={() => onMouseUp(cell)}
      onMouseLeave={() => onMouseUp(cell)} // Stop if drag out
      onTouchStart={(e) => {
        e.preventDefault(); // Might block scrolling of the page? 
        // Better to not block default unless necessary?
        // If the prompt is specific about playing, let's try to block to be responsive.
        // But user might want to scroll the grid if it's large.
        // The grid is 5 columns, fits on screen usually.
        // Let's block default for now to prevent weird ghost clicks.
        onMouseDown(cell);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onMouseUp(cell);
      }}
    >
      <ChordName>{cell.fullName}</ChordName>
      <IntervalInfo>{cell.intervals.join(' ')}</IntervalInfo>
    </ButtonContainer>
  );
};
