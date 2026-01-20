import styled from '@emotion/styled';
import type { GridState, ChordCell } from '../logic/types';
import { ChordButton } from './ChordButton';

interface ChordGridProps {
    gridState: GridState;
    onChordDown: (cell: ChordCell) => void;
    onChordUp: (cell: ChordCell) => void;
}

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  align-items: center;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
`;

const FunctionLabel = styled.div<{ func: string }>`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: 4px;
  font-weight: 600;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${props =>
        props.func === 'Tension' ? '#FF6B6B' :
            props.func === 'Stability' ? '#4ECDC4' :
                '#1A535C'};
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center; /* Center the label */
`;

export const ChordGrid = ({ gridState, onChordDown, onChordUp }: ChordGridProps) => {
    return (
        <GridContainer>
            {/* Up / Tension Row */}
            <RowContainer>
                <FunctionLabel func="Tension">Up / Tension / Dominant</FunctionLabel>
                <Row>
                    {gridState.up.map(cell => (
                        <ChordButton
                            key={cell.id}
                            cell={cell}
                            onMouseDown={onChordDown}
                            onMouseUp={onChordUp}
                        />
                    ))}
                </Row>
            </RowContainer>

            {/* Same / Stability Row */}
            <RowContainer>
                <FunctionLabel func="Stability">Same / Stability / Tonic</FunctionLabel>
                <Row>
                    {gridState.same.map(cell => (
                        <ChordButton
                            key={cell.id}
                            cell={cell}
                            onMouseDown={onChordDown}
                            onMouseUp={onChordUp}
                        />
                    ))}
                </Row>
            </RowContainer>

            {/* Down / Relaxation Row */}
            <RowContainer>
                <FunctionLabel func="Relaxation">Down / Relaxation / Subdominant</FunctionLabel>
                <Row>
                    {gridState.down.map(cell => (
                        <ChordButton
                            key={cell.id}
                            cell={cell}
                            onMouseDown={onChordDown}
                            onMouseUp={onChordUp}
                        />
                    ))}
                </Row>
            </RowContainer>
        </GridContainer>
    );
};
