import { Note, Chord, Scale } from "tonal";
import type { GridParams, GridState, ChordCell, TensionLevel, ChordFunction, DistanceType } from "./types";

// --- Suffix Map Definitions ---
// Level | Major (Tonic/Sub) | Dominant | Minor
// 0     | ""                | ""       | "m"
// 1     | "M7"              | "7"      | "m7"
// 2     | "M9"              | "9"       | "m9"
// 3     | "M13"             | "7b9"     | "m11"

const SUFFIX_MAP = {
    0: { major: "", dominant: "", minor: "m" },
    1: { major: "M7", dominant: "7", minor: "m7" },
    2: { major: "M9", dominant: "9", minor: "m9" },
    3: { major: "M13", dominant: "7b9", minor: "m11" },
};

export const getSuffix = (level: TensionLevel, type: 'major' | 'dominant' | 'minor'): string => {
    return SUFFIX_MAP[level][type];
};

// --- Helper Functions ---

const getDistanceType = (col: number): DistanceType => {
    if (col === 0) return 'Center';
    if (Math.abs(col) === 1) return 'Inner';
    return 'Outer';
};

/**
 * Calculates the root note based on horizontal position (Circle of Fifths).
 * @param centerRoot The current center root note.
 * @param col Relative column index (-2, -1, 0, 1, 2).
 */
const getHorizontalRoot = (centerRoot: string, col: number): string => {
    // Simple Circle of Fifths move: interval = col * 7 (Perfect 5th is 7 semitones)
    // iterate P5 transpositions
    let result = centerRoot;
    const absCol = Math.abs(col);
    const direction = col > 0 ? "5P" : "-5P";

    for (let i = 0; i < absCol; i++) {
        result = Note.transpose(result, direction);
    }

    return Note.simplify(result);
};

const createCell = (
    baseRoot: string,
    rowType: 'Up' | 'Same' | 'Down',
    colIndex: number,
    tensionLevel: TensionLevel,
    diatonicScale: string[] // notes in the current diatonic scale (chroma or simple names)
): ChordCell => {

    let root = baseRoot;
    let suffix = "";
    let verticalFunction: ChordFunction = 'Stability';

    // 4.3.2 Vertical Function
    if (rowType === 'Up') {
        // Dominant direction
        verticalFunction = 'Tension';
        root = Note.transpose(baseRoot, "5P");
        suffix = getSuffix(tensionLevel, 'dominant');
    } else if (rowType === 'Same') {
        // Tonic direction (Stability)
        verticalFunction = 'Stability';
        root = baseRoot;
        suffix = getSuffix(tensionLevel, 'major');
    } else if (rowType === 'Down') {
        // Subdominant direction
        verticalFunction = 'Relaxation';
        root = Note.transpose(baseRoot, "4P");
        suffix = getSuffix(tensionLevel, 'major');
    }

    // Clean up root
    root = Note.simplify(root);

    // Create chord
    const chordName = root + suffix;
    const chord = Chord.get(chordName);

    // Check diatonic
    // Use Note.chroma to compare pitch classes regardless of octave/enharmonic
    const chordChromas = chord.notes.map(n => Note.chroma(n));
    const scaleChromas = diatonicScale.map(n => Note.chroma(n));

    const isInKey = chordChromas.every(cc => scaleChromas.includes(cc));

    return {
        id: `${root}-${rowType}-${colIndex}`,
        root: root,
        suffix: suffix,
        fullName: chordName,
        intervals: chord.notes,
        verticalFunction,
        distanceType: getDistanceType(colIndex),
        isInKey,
        rowType,
        colIndex
    };
};

export const generateGrid = (params: GridParams): GridState => {
    const { currentRoot, gridWidth, tensionLevel } = params;

    // Get diatonic scale of current center for "isInKey" check
    const scaleName = `${currentRoot} major`;
    const scale = Scale.get(scaleName);
    const scaleNotes = scale.notes;

    const half = Math.floor(gridWidth / 2);
    const up: ChordCell[] = [];
    const same: ChordCell[] = [];
    const down: ChordCell[] = [];

    // Loop from -half to +half
    for (let c = -half; c <= half; c++) {
        const colIndex = c;

        // 1. Horizontal Root
        const baseRoot = getHorizontalRoot(currentRoot, colIndex);

        // 2. Create Rows
        up.push(createCell(baseRoot, 'Up', colIndex, tensionLevel, scaleNotes));
        same.push(createCell(baseRoot, 'Same', colIndex, tensionLevel, scaleNotes));
        down.push(createCell(baseRoot, 'Down', colIndex, tensionLevel, scaleNotes));
    }

    return { up, same, down };
};
