# Trade Assistant Chrome Extension

A pure Chrome extension that analyzes stock/crypto charts using OpenAI Vision. Triggered by keyboard shortcut (Alt+Shift+A) or via popup.

## Project Structure

```
├── manifest.json          # Chrome extension manifest
├── popup.html             # Extension popup UI  
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Content script for overlays
├── icon.png               # Extension icon
├── proxy-server/          # Secure API proxy server
└── src/                   # Original source files (kept for reference)
```

## Setup Instructions

1. **Configure the API proxy server:**
   - Navigate to `proxy-server/` directory
   - Follow the proxy server setup instructions
   - Deploy to Vercel or your preferred hosting platform

2. **Load the extension in Chrome:**
   - Go to `chrome://extensions`
   - Enable "Developer Mode" (top right toggle)
   - Click "Load unpacked"
   - Select this project folder (the one containing `manifest.json`)

## Usage

### Via Keyboard Shortcut:
- Press **Alt+Shift+A** (or **Option+Shift+A** on Mac)
- Wait for the countdown and screenshot capture
- AI analysis will appear as an overlay on the page

### Via Extension Popup:
- Click the extension icon in Chrome toolbar (📈)
- Use the "Chart Analysis" button to analyze current tab
- Configure settings using the collapsible settings panel

## Features

- **Clean Design**: Modern popup interface with trading-focused UI
- **Keyboard Shortcut**: Quick analysis with Alt+Shift+A
- **Auto-Analysis**: Configurable automatic chart detection
- **Settings**: Persistent settings for user preferences
- **Secure API**: All OpenAI calls go through secure proxy server
- **Visual Feedback**: Screen overlays and gesture indicators

## Files Overview

### Core Extension Files:
- **`manifest.json`** - Chrome extension configuration
- **`popup.html`** - Main popup interface (380x500px)
- **`popup.js`** - Popup interactions and state management
- **`background.js`** - Service worker for screenshots and API calls
- **`content.js`** - Handles page overlays and visual feedback

### Security:
- No exposed API keys in client code
- All OpenAI requests go through secure proxy server
- Minimal permissions (activeTab, storage, tabs)

## Development

This is a pure Chrome extension without build tools:

1. Make changes to any `.js`, `.html`, or `.json` files
2. Go to `chrome://extensions`
3. Click the refresh icon on your extension
4. Test the changes

## Proxy Server

The extension requires the proxy server to be running for AI analysis. See the `proxy-server/` directory for setup instructions.

---

**Note**: This extension has been converted from Plasmo framework to pure Chrome extension for simplicity and reduced complexity. 