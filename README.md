# Liquid Habits PWA

A premium, liquid-glass aesthetic habit tracker built with Vue 3, Vite, and PWA capabilities.

## Features

- **Liquid Glass Design**: Modern UI with blurring, gradients, and subtle animations.
- **Progressive Web App**: Installable on iOS and Android.
- **Offline Capable**: Works without internet.
- **Persistent Storage**: Data is saved automatically to your device (LocalStorage).
- **Interactive Grid**: Visualize your habits with a satisfying dot grid system.

## Project Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Run Locally (Development):

   ```sh
   npm run dev
   ```

3. Build for Production:

   ```sh
   npm run build
   ```

## How to Install on iPhone

To install this on your iPhone, the app needs to be served over a network (HTTPS is preferred for PWAs, but local IP works for testing sometimes).

1. **Local Network Method**:
   - Run `npm run dev -- --host`
   - Note the Network IP address shown (e.g., `http://192.168.1.x:5173`)
   - Open Safari on your iPhone and visit that address.
   - Tap the "Share" button (box with upward arrow).
   - Scroll down and tap "Add to Home Screen".

2. **Deployment Method (Recommended)**:
   - Deploy this folder to Vercel, Netlify, or GitHub Pages.
   - Visit the URL on your iPhone.
   - Add to Home Screen.
