// Cloud Function (2nd gen) — proxies chat questions from the CV page to Gemini.
// The Gemini API key NEVER goes to the browser: it lives only in this
// function's runtime (as a Secret Manager-backed env var), and this function
// is the only thing that ever sends it to Google.
//
// Deploy with (see README instructions in chat):
//   gcloud functions deploy chatProxy \
//     --gen2 --runtime nodejs20 --region us-central1 \
//     --trigger-http --allow-unauthenticated \
//     --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
//     --set-env-vars ALLOWED_ORIGIN=https://YOUR-USERNAME.github.io

const functions = require('@google-cloud/functions-framework');

const fs = require('fs');
const path = require('path');

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.5-flash';

// Grounds Gemini's answers in facts about Dor, so it doesn't hallucinate.
// Loads from knowledge/context.md, with a fallback if the file is missing.
let cvContent = '';
try {
  cvContent = fs.readFileSync(path.join(__dirname, 'knowledge/context.md'), 'utf8');
} catch (err) {
  console.warn('Could not read knowledge/context.md, using default fallback context:', err);
}

const DEFAULT_CONTEXT = `Facts about Dor:
- Role: E2E AI Product Builder & Leader. Based in Petah-Tikva, Israel.
- 20 years in product. Co-founder of hifred.ai (Jan 2026-present, AI-native workflow for product teams) and
  maintor.systems (Oct 2025-present, CMMS for factory/industrial maintenance, 2 active B2B customers).
- VP of Products @ Storydoc (May 2025-Jan 2026).
- Director of Product Integrations @ D-ID (Nov 2021-May 2025) — shipped LLM+RAG digital agents:
  D-ID Agents, Video Translate, Creative Reality Studio Mobile App.
- Head of Product @ vCita/WiseStamp (2015-2021) — built WiseIntro, WiseCards, WiseKick from scratch.
- Earlier: Product Manager @ Bontact, co-founder @ Traders-Education, UX/UI freelance @ Brandor,
  Designer -> Art Director @ ZeDesign.
- Skills: product strategy, AI-native workflow (discovery/analysis/specs solo with AI), UX/UI design,
  rapid prototyping (Claude/Cursor), experimentation (Mixpanel, Hotjar), shipping AI products live in production.
- Contact: dorbarshalom@gmail.com, 054.680.0360.
- Personal: musician (piano & Balkan accordion), paraglider, homebrewer (IPA specialist),
  former IDF 8200 translator, speaks Hebrew/English/Arabic.`;

const SYSTEM_CONTEXT = `You are answering questions as Dor Bar Shalom, on his personal interactive CV website.
Answer in first person, casual and direct, 1-4 sentences max.

Knowledge/CV details about Dor:
${cvContent || DEFAULT_CONTEXT}

If asked something unrelated to Dor/his work, politely redirect to CV topics.`;

functions.http('chatProxy', async (req, res) => {
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  const question = ((req.body && req.body.question) || '').toString().trim().slice(0, 500);
  if (!question) {
    res.status(400).json({ error: 'Missing question' });
    return;
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${SYSTEM_CONTEXT}\n\nQuestion: ${question}` }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.6 }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini upstream error:', geminiRes.status, errText);
      res.status(502).json({ error: 'Upstream error' });
      return;
    }

    const data = await geminiRes.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || "Sorry, I couldn't come up with an answer to that.";
    res.status(200).json({ answer });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});
