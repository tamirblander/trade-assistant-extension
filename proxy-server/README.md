# Trade Assistant Proxy Server

This proxy server securely handles OpenAI API requests for the Trade Assistant browser extension, keeping your API key safe on the server-side.

## 🔒 Security Benefits

- **API Key Protection**: Your OpenAI API key never leaves the server
- **Client-Side Safety**: Extensions can't expose the API key in DevTools
- **Controlled Access**: Server validates and filters requests

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   cd proxy-server
   npm install
   ```

2. **Configure your API key:**
   
   Create a `.env` file in this directory with:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   PORT=3001
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### `GET /health`
Health check endpoint to verify server is running.

### `POST /api/analyze`
Proxy endpoint for OpenAI image analysis.

**Request Body:**
```json
{
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "prompt": "Optional custom prompt (uses default trading analysis prompt if not provided)"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "OpenAI response content",
  "usage": { ... }
}
```

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | - | Your OpenAI API key (required) |
| `PORT` | 3001 | Server port |

## 🛡️ Security Notes

- The `.env` file should never be committed to version control
- Add `.env` to your `.gitignore` file
- Only run this server in a secure environment
- Consider adding authentication for production use

## 🔗 Extension Integration

The browser extension should be configured to make requests to:
```
http://localhost:3001/api/analyze
```

Instead of calling OpenAI directly. 