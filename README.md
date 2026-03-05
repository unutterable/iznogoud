# ☪ Iznogoud — Møteassistent

> *«Den som hersker over sine møter, hersker over sin skjebne»*

En møteassistent med persisk 1001 natt-design, bygget med React og Vite.

## Funksjoner

**Tre trinn for hvert møte:**

1. **Forberedelse** — Tittel, dato, klokkeslett, deltakere, agendapunkter og mål
2. **Gjennomføring** — Notater og aksjonspunkter (med AI-forslag)
3. **Etterarbeid** — Redigering av notater, nøkkelpunkter (AI), aksjonspunkter og møtereferat

**Øvrige funksjoner:**
- Persistente møter i localStorage (overlever sessions)
- Startside med kronologisk møteliste
- Drag-and-drop rekkefølge på alle lister
- AI-drevne forslag via Anthropic API (aksjonspunkter og nøkkelpunkter)
- Generer møtereferat med ett klikk

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173)

## Sett opp AI-funksjonene

AI-knappene i Iznogoud (foreslå aksjonspunkter, lag nøkkelpunkter) trenger
en Anthropic API-nøkkel for å fungere. Slik setter du det opp:

### Steg 1: Skaff API-nøkkel

1. Gå til [console.anthropic.com](https://console.anthropic.com)
2. Opprett konto hvis du ikke har en
3. Gå til **API Keys** og klikk **Create Key**
4. Kopier nøkkelen (den starter med `sk-ant-...`)

### Steg 2: Legg nøkkelen inn i Vercel

1. Gå til [vercel.com](https://vercel.com) og åpne Iznogoud-prosjektet
2. Klikk **Settings** i toppmenyen
3. Klikk **Environment Variables** i sidemenyen
4. Fyll inn:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Lim inn nøkkelen fra steg 1
5. Klikk **Save**

### Steg 3: Deploy på nytt

1. Push endringene til GitHub (inkludert den nye `api/chat.js`-filen)
2. Vercel deployer automatisk
3. AI-knappene i Iznogoud skal nå fungere!

## Prosjektstruktur

```
iznogoud/
├── api/
│   └── chat.js          ← Serverless proxy (legger til API-nøkkel)
├── public/
│   └── iznogoud-logo.png
├── src/
│   ├── main.jsx
│   └── IznogoudApp.jsx  ← Hele appen
├── index.html
├── package.json
└── vite.config.js
```

## Teknologi

- React 18
- Vite 6
- Vercel Serverless Functions
- Anthropic Claude API
- Fonter: Cormorant Garamond + Amiri (Google Fonts)

## Lisens

MIT
