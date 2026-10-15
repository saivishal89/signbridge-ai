# SignBridge AI 🌉✋🔊
> **Every gesture deserves to be heard.**  
> Real-Time Sign-to-Text & Speech Accessibility Prototype | 4-Hour Codeathon Edition

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks--Vision-00C49F.svg)](https://developers.google.com/mediapipe)
[![Web Speech API](https://img.shields.io/badge/Web%20Speech-API-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](#privacy-guarantee)

---

## 🎯 Executive Overview & The Problem

Over **70 million deaf individuals worldwide** use sign language as their primary mode of communication, yet over 99% of hearing society does not understand signs. Most existing AI assistive tools require expensive cloud APIs, heavy servers, or produce only silent text transcripts.

**SignBridge AI** bridges this divide by delivering a **zero-latency, 100% on-device sign-to-speech platform**:
1. **Live Camera Feed**: Tracks 21 3D hand keypoints directly inside the web browser via MediaPipe Tasks Vision.
2. **Dual Simultaneous Outputs**: Every recognized sign produces **both high-contrast on-screen text AND real audible speech** through the device speakers.
3. **Multilingual Speech**: Spoken translations in **English (India)**, **Hindi (हिन्दी)**, and **Telugu (తెలుగు)**.
4. **Instant Demo Mode**: Recognizes pretrained hand gestures (Open Palm, Thumbs Up, Thumbs Down, Victory, I Love You, Pointing Up, Closed Fist) mapped to essential communication phrases.
5. **Custom Sign Studio**: In-browser normalized **KNN classifier** allowing users to record custom personal signs (e.g., "Water", "Medicine", "Need Help") in 25-frame bursts.
6. **Sentence Builder**: Sequential sign chaining with punctuation, undo, auto-append, and whole-sentence speech.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested)
- **Webcam**: Built-in laptop camera or USB webcam
- **Browser**: Modern Chromium browser (Chrome, Edge, Brave) or Firefox with WebRTC and Web Speech API enabled.

### 1. Installation
```bash
# Clone or navigate to the repository
cd "c:\Users\HP\OneDrive\Desktop\codeathon CMRTC"

# Install dependencies
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Production Build & Preview
```bash
# Type-check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🎙️ 60–90 Second Codeathon Live Demo Pitch Script

| Time | Action | Spoken Pitch / Script |
|---|---|---|
| **00:00 - 00:15** | **The Hook** | *"Judges, 70 million deaf individuals face daily barriers because 99% of hearing society does not understand sign language. Today we present **SignBridge AI**: Every gesture deserves to be heard."* |
| **00:15 - 00:35** | **Instant Demo** | *"Watch our live camera feed. When I hold up an **Open Palm**, our on-device MediaPipe vision model tracks 21 3D keypoints at 30+ FPS, displays the translated text, and speaks aloud: **[Audible speech: 'Hello, how can I help you?']**. When I show a **Thumbs Up**: **[Audible speech: 'Yes, absolutely']**."* |
| **00:35 - 00:50** | **Multilingual & Sentence** | *"Notice that every recognized sign produces **both text and audible speech simultaneously**. Users can toggle output to Hindi or Telugu, and chain words inside our **Sentence Builder** without repetitive audio stuttering."* |
| **00:50 - 01:15** | **Custom Sign Studio** | *"Pretrained gestures are only a starting point. In our **Custom Sign Studio**, we can record personalized signs—such as 'Water' or 'Medicine'—in 25-frame bursts. Our in-browser KNN classifier normalizes wrist origin and palm scale so distance from camera doesn't break recognition."* |
| **01:15 - 01:30** | **Privacy & Honesty** | *"100% of video processing runs client-side with zero cloud data transmission. While today's prototype recognizes static signs, our architecture is ready for dual-hand temporal sequence models with validated ISL datasets. Thank you!"* |

---

## 🧠 System Architecture & Recognition Pipeline

```
[Webcam Stream] 
       │
       ▼
[MediaPipe Tasks Vision (WASM / GPU)] 
       │  Extracts 21 3D Landmarks (x, y, z)
       ▼
[Feature Engineering & Normalization]
  ├── 1. Translation Invariance: Landmark[i] - Wrist[0]
  └── 2. Scale Invariance: Normalized by Palm Scale ||Middle_MCP - Wrist||
       │
       ├───► [Mode A: Pretrained Gesture Recognizer]
       │       └── Categorizes: Open_Palm, Thumb_Up, Victory, etc.
       │
       └───► [Mode B: Custom KNN Classifier]
               ├── Distance-weighted voting among K-nearest neighbors
               └── Rejection threshold: Drops unknown poses (no false positives)
       │
       ▼
[Temporal Smoothing & Cooldown Engine]
  ├── Majority voting over 6 rolling frames (>65% agreement required)
  └── 1,400ms cooldown prevents machine-gun audio spam
       │
       ├────────────────────────┬────────────────────────┐
       ▼                        ▼                        ▼
[📝 Text Output Canvas]   [🔊 Web Speech API]    [📋 Sentence Builder]
  - Permanent display       - Real speaker audio    - Sequential chaining
  - Multilingual support    - en-IN, hi-IN, te-IN   - Undo, punctuation
```

---

## 🛠️ Feature Deep Dive

### 1. Instant Demo Mode (13 Pretrained & Geometric Vision Gestures)
- Powered by MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) + Geometric Landmark Pose Engine (`src/services/geometricGestureDetector.ts`).
- **13 Supported Gestures**:
  1. ✋ **Open Palm**: *"Hello, how can I help you?"*
  2. 👍 **Thumbs Up**: *"Yes, absolutely"*
  3. 👎 **Thumbs Down**: *"No, I need assistance"*
  4. ✌️ **Victory (V-Sign)**: *"Peace and good health"*
  5. 🤟 **I Love You**: *"Thank you and respect"*
  6. 👌 **OK / Perfect**: *"Everything is OK and fine."*
  7. 🤙 **Call Me / Phone**: *"Please call my phone or doctor."*
  8. 🤘 **Rock On / Strong**: *"I am feeling strong and great!"*
  9. 3️⃣ **Water / Three (W-Sign)**: *"I need clean drinking water."*
  10. 4️⃣ **Wait / Four Fingers**: *"Please give me four minutes."*
  11. 🤏 **A Little Bit (Pinch)**: *"Just a little bit, please."*
  12. ☝️ **Pointing Up**: *"Please wait a moment"*
  13. ✊ **Closed Fist**: *"Stop / Emergency"*
- Editable phrase mappings with real-time translation into English, Hindi, and Telugu.
- Visual matching indicator highlights the active gesture card in real time.

### 2. Custom Sign Studio (10 Essential Accessibility Signs)
- **10 Pre-loaded Accessibility Signs Ready for Burst Training**:
  1. 💧 **Water**: *"I need drinking water, please."*
  2. 🆘 **Need Help**: *"I need immediate assistance."*
  3. 💊 **Medicine**: *"Please bring my medicine."*
  4. 🍲 **Food / Hunger**: *"I am hungry, I need food."*
  5. 🩺 **Doctor / Nurse**: *"Please call a doctor or nurse."*
  6. 🚻 **Washroom / Toilet**: *"I need to use the washroom."*
  7. ⚡ **Pain / Hurt**: *"I am experiencing sharp pain."*
  8. 🚨 **Emergency / Urgent**: *"This is an urgent emergency!"*
  9. 🏠 **Family / Home**: *"I want to reach my family."*
  10. 🙏 **Thank You**: *"Thank you very much for your help."*
- **Burst Sample Capture**: Records 25 real landmark frames in ~1.5 seconds while holding the sign.
- **Anatomical Scale Normalization**:
  $$\text{Normalized}_i = \frac{L_i - L_{\text{wrist}}}{\|L_{\text{middle\_mcp}} - L_{\text{wrist}}\|}$$
  Ensures that standing closer or further from the camera does not degrade classification accuracy.
- **Configurable K & Threshold**: Adjust $K$ neighbors (1–7) and rejection distance (0.8–2.5) to avoid false triggers.
- **Persistence & Portability**: Data is saved in browser `localStorage`. Includes 1-click **Export to JSON** and **Import from JSON**.

### 3. Dual Text + Speech Engine
- Driven by the native HTML5 `SpeechSynthesis` API.
- Configurable speech rate (0.6x – 1.6x), pitch, and automatic voice matching for Indian English (`en-IN`), Hindi (`hi-IN`), and Telugu (`te-IN`).
- **Anti-Spam Filter**: Recognitions are debounced so holding the same pose does not cause audio stuttering.
- **Replay Audio**: Dedicated button allows replaying the last recognized translation anytime.

### 4. Sentence Builder Strip
- Dedicated accessible communication board.
- Supports Auto-Append on stable recognition or manual Append.
- Quick punctuation buttons (`.`, `?`, `!`), Undo Last Word, Clear All, and Copy to Clipboard.
- Accessible manual keyboard text input if camera is not active.

---

## 🔒 Privacy Guarantee

- **Zero Video Transmission**: Webcam video frames are decoded and processed in volatile browser memory. No camera frames or video streams are ever uploaded to any server.
- **Zero Cloud API Keys**: Requires no OpenAI, Google Cloud, or third-party paid API tokens.
- **Local Data Storage**: All custom training samples reside strictly in the user's browser `localStorage` and can be wiped with one click via **Settings -> Wipe Data**.

---

## ⚖️ Technical Honesty & Known Limitations

1. **Pretrained Gestures $\neq$ Complete Sign Language**:
   The pretrained gestures (thumbs up, open palm, peace) are computer-vision categories used as demonstration shortcuts. They are **not** official Indian Sign Language (ISL) grammar.
2. **Static Poses vs Dynamic Trajectories**:
   Current custom vocabulary classifies static 3D landmark poses. Signs requiring motion trajectories (e.g. circling hands, directional movement) require a temporal sequence model (BiLSTM or Temporal Transformer).
3. **Single-Hand Tracking (v1.0)**:
   The prototype focuses on single-hand recognition for stability and high frame rates (30+ FPS). Authentic ISL frequently uses two hands and facial expressions (affective non-manual markers).

---

## 🗺️ Roadmap to Production ISL Translator (v2.0)

- [ ] **Dual-Hand & Holistic Tracking**: Integrate MediaPipe Holistic for simultaneous face, pose, and dual-hand keypoints.
- [ ] **Temporal Sequence Modeling**: In-browser ONNX / TensorFlow.js Transformer model trained on validated continuous ISL video datasets.
- [ ] **Grammar Reconstruction**: LLM-assisted gloss-to-natural-language translation (converting ISL gloss order into fluid English/Hindi grammar).

---

## 👨‍💻 Author & Codeathon Attribution

- **Project**: SignBridge AI
- **Tagline**: *Every gesture deserves to be heard.*
- **Built for**: 4-Hour Codeathon CMRTC
- **Tech Lead**: Full-Stack & Accessibility Engineer
