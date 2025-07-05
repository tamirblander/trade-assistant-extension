# Trade Assistant Chrome Extension

A Chrome extension built with Plasmo + React that analyzes stock/crypto charts using OpenAI Vision. Triggered by keyboard shortcut (Ctrl+Shift+Y) or via popup.

## Project Structure

- popup.tsx — React popup UI
- background.ts — Background service worker (handles shortcut, screenshot)
- content.ts — Content script (injects overlay, calls OpenAI API)
- package.json — Manifest config (permissions, commands)
- assets/icon.png — Extension icon

## Setup Instructions

1. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```
2. **Set your OpenAI API key:**
   - Open `content.ts` and replace `YOUR_OPENAI_API_KEY_HERE` with your key.
   - For production, use Plasmo's secret management and environment variables. See [Plasmo docs](https://docs.plasmo.com/framework/environment-variables/) for details.
3. **Run in development mode:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```
4. **Load the extension in Chrome:**
   - Go to `chrome://extensions`, enable Developer Mode.
   - Click "Load Unpacked" and select `build/chrome-mv3-dev`.

## Usage

- Press <kbd>Ctrl+Shift+Y</kbd> (or <kbd>Cmd+Shift+Y</kbd> on Mac) to analyze the current tab's chart.
- Or open the popup and click "Analyze Current Tab".
- The analysis will appear as an overlay on the page. If no chart is detected, you'll see a message.

---

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
