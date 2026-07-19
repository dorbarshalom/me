# Local Gemini Development Guide

By default, Gemini access is disabled on `localhost` and `127.0.0.1` for security and to prevent accidental API quota usage during local development. In this mode, the frontend chat component uses pre-configured static fallback responses.

Follow the instructions below if you need to re-enable local Gemini chat for development or testing.

---

## 1. Re-enable the Local Proxy URL in the Frontend

In the root [index.html](file:///Users/dorbarshalom/Claude/Projects/me/index.html), locate the `CHAT_PROXY_URL` definition and change the `null` value back to `'http://localhost:8088'`:

```javascript
const CHAT_PROXY_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8088'
  : 'https://us-central1-gen-lang-client-0699834113.cloudfunctions.net/chatProxy';
```

## 2. Start the Local Proxy Server

To handle communication with Gemini securely without exposing your API key to the frontend client, run the local proxy server:

1. Open your terminal and navigate to the proxy directory:
   ```bash
   cd gemini-proxy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server with your `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY="your-api-key-here" npm run dev
   ```

The proxy will run locally on port `8088`. When you send messages via your local website browser tab, the requests will now be dynamically answered by Gemini via your local proxy server.
