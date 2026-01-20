# ChordingPad

**ChordingPad** is a web-based musical tool designed for everyone—especially those who may not be familiar with music theory but want to enjoy playing chords and creating music.

## 🎵 What is ChordingPad?

ChordingPad allows you to play complex chord progressions simply by pressing buttons on a grid. It leverages music theory concepts (like GTTM and TPS) behind the scenes to generate "Tension" and "Relaxation" flows, letting you focus on the feeling of the music rather than the mechanics.

### Key Features

-   **Intuitive Chord Grid**: Play chords by clicking or tapping. The grid is organized to naturally suggest logical progressions.
-   **Emotional Navigation**: Change the key and mood of your progression instantly using emotional descriptors like "Energy", "Relax", "Sad", or "Tension".
-   **Auto Mode**: Let the app play itself! It generates endless ambient chord progressions based on your direction.
-   **MIDI Support**: Connect your MIDI synthesizer or electronic piano to play the chords with your own hardware sounds. (Internal synth is also available!).
-   **Tension Control**: Adjust the complexity of the chords (from simple Triads to complex Jazz variations) with a slider.

## 🚀 Getting Started

### Prerequisites

-   Node.js (latest LTS recommended)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Shinh0707/ChordingPad.git
    cd ChordingPad
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173/ChordingPad/` (or the URL shown in your terminal).

## 🛠️ Tech Stack

-   **React** - UI Library
-   **TypeScript** - Type Safety
-   **Vite** - Build Tool
-   **Tone.js** - Audio Synthesis & Timing
-   **Tonal.js** - Music Theory Logic
-   **Emotion** - CSS-in-JS Styling

## 📦 Deployment

This project is configured for deployment to GitHub Pages.

```bash
npm run deploy
```

## 📄 License

[MIT](LICENSE)
