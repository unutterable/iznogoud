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

## Kom i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173)

## Deploy

```bash
npm run build
```

Mappen `dist/` kan deployes til Vercel, Netlify, GitHub Pages eller lignende.

### Vercel (enklest)

1. Push til GitHub
2. Koble repoet til [vercel.com](https://vercel.com)
3. Vercel oppdager Vite automatisk — klikk Deploy

### Netlify

1. Push til GitHub
2. Koble repoet til [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`

### GitHub Pages

1. Installer: `npm install -D gh-pages`
2. Legg til i `package.json` scripts: `"deploy": "gh-pages -d dist"`
3. Kjør: `npm run build && npm run deploy`

## AI-funksjonalitet

Iznogoud bruker Anthropic API for å foreslå aksjonspunkter og nøkkelpunkter.
API-kall gjøres direkte fra klienten. For produksjonsbruk anbefales det å
sette opp en enkel proxy-backend som legger til API-nøkkelen server-side.

## Teknologi

- React 18
- Vite 6
- Ren CSS-in-JS (ingen eksterne UI-biblioteker)
- Fonter: Cormorant Garamond + Amiri (Google Fonts)

## Lisens

MIT
