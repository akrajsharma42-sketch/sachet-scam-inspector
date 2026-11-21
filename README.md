# Sachet (सचेत) – Scam Message Inspector

**Live demo:** https://sachet-scam-inspector.vercel.app

A privacy-first web app that helps people tell genuine messages from fraudulent SMS, WhatsApp messages and links that pretend to be banks, delivery services or government bodies. It explains *why* a message looks suspicious, so users learn to spot scams themselves.

Built for **PromptWars x Code1 Innovators** (Hack2Skill) – Domain: **Cybersecurity**.

## The problem
People receive fake KYC alerts, courier-fee requests, lottery wins, loan offers and "digital arrest" threats every day, in English, Hindi and Hinglish, and many cannot tell them apart from real messages.

## Features
- **Risk score and verdict** (0–100) with a stamp: `SCAM`, `SUSPECT`, `UNVERIFIED` or `LOOKS OK`
- **Scam type detection**: KYC phishing, fake loan, delivery fee, lottery, fake job, digital arrest, malicious app, OTP theft
- **Understands English, Hinglish and Hindi (Devanagari)** scam wording, and detects which language the message is in
- **Interface in English, हिन्दी and অসমীয়া (Assamese)**, including the explanations of every red flag
- **Marked-up message**: every suspicious phrase is underlined; hover a finding to see where it appears
- **Score breakdown**: each red flag shows how many points it added
- **Link anatomy**: shows who really owns a URL (e.g. `sbi.co.in.verify-login.xyz` is owned by `verify-login.xyz`)
- **Screenshot upload (OCR)**: drop, paste or upload a WhatsApp screenshot; text is read in the browser
- **Shareable result card**: a clean image with the score and top red flags (never contains the message text)
- **Recent checks**: kept only in the browser's local storage, one click to clear
- **Alert tone** and vibration on risky results, **read aloud** in Hindi / Assamese
- **Installable offline app (PWA)**, light and dark mode, large-text mode, keyboard accessible, mobile friendly
- **Report help**: helpline 1930, cybercrime.gov.in, sancharsaathi.gov.in, and a copy-able report
- **Awareness quiz** and a guide to the most common scams
- **100% private**: nothing is uploaded; there is no backend

## How it works
1. **Text rules** – 15 pattern groups (OTP requests, urgency, account-block threats, KYC updates, prize claims, delivery fees, police/government impersonation, payment or QR requests, fake jobs, app/remote-access installs, unrequested loan offers, vague "tap to continue", secrecy, generic greetings). Each has a weight and an explanation. Every group also has Hinglish and Hindi patterns. Warnings such as "do not share your OTP" are correctly ignored.
2. **Link checks** – shortened links, raw IP addresses, `@` tricks, cheap risky domain endings, look-alike (punycode) characters, many hyphens, non-HTTPS, `.apk` downloads, brand impersonation (SBI, HDFC, Amazon, India Post and others) and fake `.gov` sites.
3. **Score** – weights are added (capped at 100). Under 25: no known pattern matched; 25–54: suspicious; 55 and above: very likely a scam.

> Sachet never claims a message is *safe*. "No match" only means no known scam pattern was found.

## Testing
`tests/samples.json` holds 46 messages (English, Hinglish, Hindi, link-only; scams and genuine alerts). Run:

```
node tests/run.js
```

| Result | Count |
|---|---|
| Overall | 43 / 46 (93%) |
| Scams flagged | 28 / 30 |
| Genuine messages left clear | 15 / 16 |

Honest notes: the set was written while building the rules, so it is a regression suite, not an independent benchmark. It includes 3 documented limitations: an emergency/"relative in hospital" scam with no keywords, a genuine "your KYC is complete" notice that is flagged because it mentions KYC, and a scam link hosted on a trusted site (Google Sites).

## Project structure
```
index.html      page structure
style.css       design (light and dark)
engine.js       detection rules, link checks, scoring (no DOM, testable in Node)
i18n.js         English, Hindi and Assamese text
script.js       UI, history, share card, OCR, quiz
sw.js           offline cache      manifest.json   installable app
tests/          sample messages and test runner
```

## Limitations
This is a rule-based checker, so new or unusual scam wording can be missed. It does not look up live blocklists or contact any server. OCR accuracy depends on the screenshot quality. Link and sender explanations are shown in English in the Hindi and Assamese views.

## Future scope
- AI model (e.g. Claude API, behind a small server so the key stays private) for understanding new scam wording
- Live check of links against phishing blocklists and domain age
- More regional languages (Bengali, Bodo, Odia) and Hindi OCR
- UPI ID and phone number checker
- Browser extension for WhatsApp Web

## Safety reminders
Never share an OTP, PIN or password. Banks and government agencies do not demand money by SMS or call. If you were scammed, call **1930** immediately.
