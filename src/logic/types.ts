export type TensionLevel = 0 | 1 | 2 | 3;

export interface GridParams {
    currentRoot: string;   // e.g. "C"
    gridWidth: number;     // e.g. 5
    tensionLevel: TensionLevel;
}

export type ChordFunction = 'Tension' | 'Stability' | 'Relaxation';
export type DistanceType = 'Center' | 'Inner' | 'Outer';

export interface ChordCell {
    id: string;          // Unique key, e.g. "C-Up-0"
    root: string;        // Note name, e.g. "G"
    suffix: string;      // Chord quality, e.g. "7"
    fullName: string;    // Display name, e.g. "G7"
    intervals: string[]; // Constituent notes, e.g. ["G", "B", "D", "F"]

    // UI metadata
    verticalFunction: ChordFunction;
    distanceType: DistanceType;
    isInKey: boolean;    // Is diatonic

    // Grid coordinates for easier debugging/rendering
    rowType: 'Up' | 'Same' | 'Down';
    colIndex: number; // Relative index, 0 is center
}


export interface GridState {
    up: ChordCell[];
    same: ChordCell[];
    down: ChordCell[];
}

export type AutoDirection = 'Up' | 'Down' | 'Stay' | 'Rest' | 'Energy' | 'Relax' | 'Sad' | 'Tension';

export interface AutoModeState {
    isActive: boolean;
    bpm: number;
    direction: AutoDirection;
}
