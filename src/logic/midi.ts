
// Minimal type definitions for WebMIDI to avoid dependencies for now
export interface MIDIOutput {
    send(data: number[] | Uint8Array, timestamp?: number): void;
    id: string;
    name?: string;
    manufacturer?: string;
}

export interface MIDIAccess {
    inputs: Map<string, any>;
    outputs: Map<string, MIDIOutput>;
    onstatechange: ((event: any) => void) | null;
}

export const getMidiOutputs = async (): Promise<MIDIOutput[]> => {
    if (!(navigator as any).requestMIDIAccess) {
        console.warn("WebMIDI is not supported in this browser.");
        return [];
    }
    try {
        const access = await (navigator as any).requestMIDIAccess();
        return Array.from(access.outputs.values());
    } catch (err) {
        console.error("Failed to access MIDI:", err);
        return [];
    }
};

export const sendMidiNoteOn = (output: MIDIOutput, note: number, velocity: number = 100, channel: number = 0) => {
    // Note On status byte: 0x90 + channel (0-15)
    const status = 0x90 + (channel & 0x0f);
    output.send([status, note, velocity]);
};

export const sendMidiNoteOff = (output: MIDIOutput, note: number, channel: number = 0) => {
    // Note Off status byte: 0x80 + channel (0-15)
    const status = 0x80 + (channel & 0x0f);
    output.send([status, note, 0]);
};
