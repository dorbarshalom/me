# Analytics Tracking — Mixpanel

This project uses **Mixpanel** for all product analytics. Mixpanel is the single source of truth for event tracking, user identification, and behavioral data. Do not introduce any other analytics tools, SDKs, or tracking libraries without explicit instruction from a user.

---

## Before You Add or Modify Any Tracking

⛔ **Do not write Mixpanel tracking code without reading this file first.**

Wrong assumptions about platform, identity, or consent will produce broken Mixpanel data that requires manual cleanup or data deletion requests.

### Mandatory checklist before writing any Mixpanel code

- [x] Confirm you are using the correct Mixpanel SDK for this project's platform (see Tech Stack below)
- [x] Check if this project routes data through a CDP — if yes, send Mixpanel events through the CDP, not the Mixpanel SDK directly
- [x] Check if consent gating is required — if this project serves EU or California users, no Mixpanel events may fire before user consent
- [x] Review the existing Mixpanel tracking plan below before adding new events

---

## Tech Stack

| Detail | Value |
|---|---|
| **Platform** | Static Web HTML & JS client |
| **Mixpanel SDK** | mixpanel-browser (via JS CDN loader) |
| **SDK version** | mixpanel-2-latest.min.js |
| **Tracking method** | client-side |
| **CDP (if any)** | none |
| **Consent required** | no |
| **Mixpanel project token location** | Inline inside `index.html` (74b397db0fd4b63f65402773557c70c5) |

---

## Mixpanel Initialization

Mixpanel is initialized in:

**File:** [index.html](file:///Users/dorbarshalom/Claude/Projects/me/index.html)

```javascript
    // Initialize Mixpanel
    mixpanel.init('74b397db0fd4b63f65402773557c70c5', {
      debug: false,
      persistence: 'localStorage'
    });
```

**Do not:**
- Initialize Mixpanel in multiple places
- Create separate Mixpanel instances per component or module
- Import Mixpanel directly in feature files — use the shared initialization

---

## Mixpanel Identity

Since this is a static professional profile site, there is no signup/login database, so we do not call `.identify()` or `.reset()`. Mixpanel auto-generates a persistent device-based anonymous ID via `localStorage`.

---

## Mixpanel Tracking Plan

These are the Mixpanel events currently tracked in this project. **All new Mixpanel events must follow the same conventions.**

### Naming conventions

- Mixpanel event names: Noun event names (e.g., `page`, `chat_message`, `suggestion`, `nav_link`, `contact`).
- Mixpanel property names: `snake_case` (e.g., `action`, `question`, `target`, `type`, `value`).
- Event action verbs are supplied via the `action` property (e.g. `action: 'click'`, `action: 'view'`, `action: 'send'`).

### Current Mixpanel events

| Mixpanel Event | Trigger | Key Properties | File |
|---|---|---|---|
| `page` | When the page view is rendered and content is revealed | `action: 'view'` | [index.html](file:///Users/dorbarshalom/Claude/Projects/me/index.html) |
| `chat_message` | When a user submits a question to the chatbot | `action: 'send'`, `question` | [index.html](file:///Users/dorbarshalom/Claude/Projects/me/index.html) |
| `suggestion` | When a user clicks a predefined suggestion chip | `action: 'click'`, `question` | [index.html](file:///Users/dorbarshalom/Claude/Projects/me/index.html) |
| `nav_link` | When a user clicks a sidebar navigation link | `action: 'click'`, `target` | [index.html](file:///Users/dorbarshalom/Claude/Projects/me/index.html) |
| `contact` | When a user clicks email or phone links | `action: 'click'`, `type`, `value` | [index.html](file:///Users/dorbarshalom/Claude/Projects/me/index.html) |

---

## How to Add a New Mixpanel Event

1. **Check the tracking plan above** — if the Mixpanel event already exists, use it. Do not create duplicate Mixpanel events.
2. **Name the Mixpanel event** using the conventions above: noun event names with action properties in `snake_case`.
3. **Define Mixpanel properties** — only include properties available at the moment the event fires.
4. **Update this file** — add the new Mixpanel event to the tracking plan table above.
5. **Verify in Mixpanel Live View** — confirm the event appears in Mixpanel with correct properties before considering it done.

### Mixpanel event template

```javascript
mixpanel.track('[event_name]', {
  action: '[action_name]',
  property_name: value,
});
```

---

## What Not to Do

- **Do not introduce other analytics tools.** This project uses Mixpanel.
- **Do not track PII as Mixpanel properties** — no raw email addresses or phone numbers in Mixpanel event properties unless explicitly intended for contact clicks representation.
- **Do not fire Mixpanel events inside loops**.
- **Do not hardcode a new Mixpanel project token** — use the initialized global `mixpanel` instance.
