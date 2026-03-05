import { useState, useRef, useEffect } from "react";

const G = "#D4A547", DEEP = "#1A0A2E", WINE = "#6B1D3A", TEAL = "#1B6B6B",
  SAND = "#F5E6C8", CREAM = "#FDF8EE", INK = "#2C1810", RUBY = "#9B2335";

const LOGO_URL = "./iznogoud-logo.png";

const arabesqueBg = `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30Z' fill='none' stroke='%23D4A54720' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23D4A54715' stroke-width='0.5'/%3E%3C/svg%3E")`;
const starBg = `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,5 47,28 72,28 52,42 58,65 40,52 22,65 28,42 8,28 33,28' fill='none' stroke='%23D4A54710' stroke-width='0.5'/%3E%3C/svg%3E")`;

function useDragReorder(items, setItems) {
  const dragIdx = useRef(null), overIdx = useRef(null);
  return {
    onDragStart: (i) => (e) => { dragIdx.current = i; e.dataTransfer.effectAllowed = "move"; e.currentTarget.style.opacity = "0.5"; },
    onDragEnd: (e) => { e.currentTarget.style.opacity = "1"; if (dragIdx.current !== null && overIdx.current !== null && dragIdx.current !== overIdx.current) { const n = [...items]; const [m] = n.splice(dragIdx.current, 1); n.splice(overIdx.current, 0, m); setItems(n); } dragIdx.current = null; overIdx.current = null; },
    onDragOver: (i) => (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; overIdx.current = i; },
  };
}

// ── Storage helpers (localStorage for web) ──
const STORAGE_KEY = "iznogoud-meetings";
async function loadMeetings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
async function saveMeetings(meetings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings)); }
  catch (e) { console.error("Save failed", e); }
}

const toISO = (d) => d.toISOString().split("T")[0];
const isoToDisplay = (iso) => { if (!iso) return ""; const [, m, d] = iso.split("-"); return `${parseInt(d)}.${parseInt(m)}`; };
const tomorrow = () => toISO(new Date(Date.now() + 86400000));

function emptyMeeting() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: "", dateISO: tomorrow(), hour: "09", minute: "00",
    participants: [""], agendaItems: [""], goal: "",
    notes: "", actionItems: [],
    editableNotes: "", keyPoints: [], step3Actions: [],
    summaryText: "", step: 1,
  };
}

// ══════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════
export default function IznogoudApp() {
  const [meetings, setMeetings] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [fadeClass, setFadeClass] = useState("iz-fade-in");

  useEffect(() => { loadMeetings().then((m) => { setMeetings(m); setLoaded(true); }); }, []);
  useEffect(() => { if (loaded) saveMeetings(meetings); }, [meetings, loaded]);

  const current = meetings.find((m) => m.id === currentId) || null;

  const updateCurrent = (patch) => {
    setMeetings((prev) => prev.map((m) => m.id === currentId ? { ...m, ...patch } : m));
  };

  const openMeeting = (id) => { setFadeClass("iz-fade-out"); setTimeout(() => { setCurrentId(id); setFadeClass("iz-fade-in"); }, 300); };
  const goHome = () => { setFadeClass("iz-fade-out"); setTimeout(() => { setCurrentId(null); setFadeClass("iz-fade-in"); }, 300); };

  const createMeeting = () => {
    const m = emptyMeeting();
    setMeetings((prev) => [m, ...prev]);
    openMeeting(m.id);
  };

  const deleteMeeting = (id) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (currentId === id) setCurrentId(null);
  };

  const S = styles;

  if (!loaded) return <div style={{ ...S.wrapper, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: G, fontFamily: "'Cormorant Garamond', serif", fontSize: 22 }}>✦ Laster Iznogoud... ✦</span></div>;

  return (
    <div style={S.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
        .iz-fade-in { animation: izFadeIn 0.4s ease forwards; }
        .iz-fade-out { animation: izFadeOut 0.3s ease forwards; }
        @keyframes izFadeIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes izFadeOut { from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-12px)} }
        @keyframes shimmer { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px ${G}30}50%{box-shadow:0 0 40px ${G}60} }
        *::-webkit-scrollbar{width:8px} *::-webkit-scrollbar-track{background:${DEEP}20;border-radius:4px} *::-webkit-scrollbar-thumb{background:${G}60;border-radius:4px}
        .iz-input:focus{border-color:${G}!important;box-shadow:0 0 0 3px ${G}20!important}
        .iz-meeting-card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(212,165,71,0.25)!important;border-color:${G}80!important}
      `}</style>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={S.headerInner}>
          <div style={{ ...S.logoArea, cursor: currentId ? "pointer" : "default" }} onClick={currentId ? goHome : undefined}>
            <img src={LOGO_URL} alt="Iznogoud" style={S.logoImg} />
            <div>
              <h1 style={S.title}>Iznogoud</h1>
              <p style={S.subtitle}>Møteassistent</p>
            </div>
          </div>
          <div style={S.headerDecor}>✦ ✦ ✦</div>
        </div>
        {current && <Stepper step={current.step} goToStep={(s) => {
          if (s === 3) updateCurrent({ step: s, editableNotes: current.notes, step3Actions: [...current.actionItems] });
          else updateCurrent({ step: s });
        }} />}
      </div>

      {/* ── BODY ── */}
      <div style={S.body}>
        <div className={fadeClass}>
          {!currentId ? <HomePage meetings={meetings} onCreate={createMeeting} onOpen={openMeeting} onDelete={deleteMeeting} S={S} /> :
            <MeetingEditor meeting={current} update={updateCurrent} S={S} />}
        </div>
      </div>

      <div style={S.footer}>
        <span style={{ color: `${G}80`, fontFamily: "'Amiri', serif", fontSize: 13 }}>✦ Iznogoud Møteassistent — Inspirert av Tusen og én natt ✦</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  STEPPER
// ══════════════════════════════════════
function Stepper({ step, goToStep }) {
  return (
    <div style={styles.stepper}>
      {[{ n: 1, label: "Forberedelse", icon: "📜" }, { n: 2, label: "Gjennomføring", icon: "✒️" }, { n: 3, label: "Etterarbeid", icon: "⚖️" }].map(({ n, label, icon }, idx) => (
        <div key={n} style={{ display: "flex", alignItems: "center" }}>
          <div onClick={() => n <= step + 1 && goToStep(n)} style={{ ...styles.stepDot, background: step >= n ? `linear-gradient(135deg, ${G}, ${WINE})` : "rgba(212,165,71,0.15)", color: step >= n ? "#fff" : G, cursor: n <= step + 1 ? "pointer" : "default", transform: step === n ? "scale(1.12)" : "scale(1)", boxShadow: step === n ? `0 0 20px ${G}50` : "none" }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 11, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, letterSpacing: 1 }}>{label}</span>
          </div>
          {idx < 2 && <div style={{ width: 50, height: 2, background: step > n ? G : "rgba(212,165,71,0.2)", margin: "0 4px", transition: "background 0.4s" }} />}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════
//  HOME PAGE
// ══════════════════════════════════════
function HomePage({ meetings, onCreate, onOpen, onDelete, S }) {
  const [deleteId, setDeleteId] = useState(null);
  const sorted = [...meetings].sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || "") || (a.hour || "").localeCompare(b.hour || ""));

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src={LOGO_URL} alt="Iznogoud" style={{ width: 120, height: 120, objectFit: "contain", filter: "drop-shadow(0 4px 20px rgba(212,165,71,0.4))", animation: "float 4s ease-in-out infinite", marginBottom: 12 }} />
        <h2 style={{ ...S.sectionTitle, fontSize: 32, marginBottom: 6 }}>Velkommen til Iznogoud</h2>
        <p style={{ color: `${SAND}90`, fontFamily: "'Amiri', serif", fontSize: 16, margin: "0 0 24px", fontStyle: "italic" }}>
          «Den som hersker over sine møter, hersker over sin skjebne»
        </p>
        <button onClick={onCreate} style={{ ...S.megaBtn, maxWidth: 400, margin: "0 auto", display: "block", fontSize: 18, padding: "14px 24px" }}>
          ✦ Nytt møte ✦
        </button>
      </div>

      {sorted.length > 0 && (
        <div>
          <h3 style={{ color: G, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, letterSpacing: 2, textAlign: "center", marginBottom: 16 }}>
            ─── Dine møter ───
          </h3>
          {sorted.map((m) => (
            <div key={m.id} className="iz-meeting-card" style={S.meetingCard} onClick={() => onOpen(m.id)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 18, color: WINE, marginBottom: 4 }}>
                  {m.title || "Uten tittel"}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: `${INK}90` }}>
                  <span>📅 {m.dateISO ? isoToDisplay(m.dateISO) : "—"}</span>
                  <span>🕐 {m.hour || "09"}:{m.minute || "00"}</span>
                  {m.participants?.filter((p) => p.trim()).length > 0 && (
                    <span>👥 {m.participants.filter((p) => p.trim()).join(", ")}</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: `${G}90`, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: `${G}15` }}>
                  {m.step === 1 ? "Forberedelse" : m.step === 2 ? "Gjennomføring" : "Etterarbeid"}
                </span>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(m.id); }} style={{ ...S.removeBtn, fontSize: 16 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sorted.length === 0 && (
        <p style={{ textAlign: "center", color: `${SAND}60`, fontFamily: "'Amiri', serif", fontStyle: "italic", marginTop: 32 }}>
          Ingen møter ennå. Opprett ditt første møte!
        </p>
      )}

      {/* ── Bekreftelsesdialog ── */}
      {deleteId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(13,6,32,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={() => setDeleteId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: `linear-gradient(135deg, ${CREAM}, #FFF9F0)`, borderRadius: 20, padding: "28px 32px", maxWidth: 420, width: "100%", border: `2px solid ${G}50`, boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${G}20`, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>☪</div>
            <p style={{ fontFamily: "'Amiri', serif", fontSize: 17, color: INK, lineHeight: 1.6, margin: "0 0 24px" }}>
              O mektige kalif! Er du sikker på at du vil slette dette møtet?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => { onDelete(deleteId); setDeleteId(null); }} style={{ ...S.primaryBtn, background: `linear-gradient(135deg, ${RUBY}, ${WINE})`, padding: "10px 24px" }}>
                Ja, slett møtet
              </button>
              <button onClick={() => setDeleteId(null)} style={{ ...S.secondaryBtn, padding: "10px 24px" }}>
                Nei, behold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  MEETING EDITOR
// ══════════════════════════════════════
function MeetingEditor({ meeting: m, update, S }) {
  const [newAction, setNewAction] = useState("");
  const [newActionOwner, setNewActionOwner] = useState("");
  const [newKeyPoint, setNewKeyPoint] = useState("");
  const [newS3Action, setNewS3Action] = useState("");
  const [newS3Owner, setNewS3Owner] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [kpLoading, setKpLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);

  const vp = m.participants.filter((p) => p.trim() !== "");
  const dragAgenda = useDragReorder(m.agendaItems, (v) => update({ agendaItems: v }));
  const dragActions = useDragReorder(m.actionItems, (v) => update({ actionItems: v }));
  const dragKP = useDragReorder(m.keyPoints, (v) => update({ keyPoints: v }));
  const dragS3 = useDragReorder(m.step3Actions, (v) => update({ step3Actions: v }));

  const moveItem = (arr, key, i, dir) => { const n = [...arr]; const j = i + dir; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; update({ [key]: n }); };

  const goToStep = (s) => {
    if (s === 3) update({ step: s, editableNotes: m.notes, step3Actions: [...m.actionItems] });
    else update({ step: s });
  };

  const addParticipant = () => { update({ participants: [...m.participants, ""] }); setTimeout(() => { const el = document.querySelectorAll('[data-field="participant"]'); if (el.length) el[el.length - 1].focus(); }, 50); };
  const addAgenda = () => { update({ agendaItems: [...m.agendaItems, ""] }); setTimeout(() => { const el = document.querySelectorAll('[data-field="agenda"]'); if (el.length) el[el.length - 1].focus(); }, 50); };

  const addActionItem = () => {
    if (!newAction.trim()) return;
    update({ actionItems: [...m.actionItems, { text: newAction.trim(), owner: newActionOwner || "Ikke tildelt" }] });
    setNewAction(""); setNewActionOwner("");
    setTimeout(() => { const el = document.querySelector('[data-field="new-action"]'); if (el) el.focus(); }, 50);
  };

  const aiCall = async (prompt) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content?.map((c) => c.text || "").join("") || "[]";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  };

  const suggestActions = async () => {
    if (!m.notes.trim()) return; setAiLoading(true);
    try { const s = await aiCall(`Du er en møteassistent. Basert på disse møtenotatene, foreslå 3-5 konkrete aksjonspunkter. Svar KUN med en JSON-array av strings.\n\nNotater:\n${m.notes}`); update({ actionItems: [...m.actionItems, ...s.map((t) => ({ text: t, owner: "Ikke tildelt" }))] }); } catch (e) { console.error(e); }
    setAiLoading(false);
  };

  const genKeyPoints = async () => {
    if (!m.editableNotes.trim()) return; setKpLoading(true);
    try { const s = await aiCall(`Du er en møteassistent. Basert på disse møtenotatene, lag en liste med nøkkelpunkter. Svar KUN med en JSON-array av strings.\n\nNotater:\n${m.editableNotes}`); update({ keyPoints: s }); } catch (e) { console.error(e); }
    setKpLoading(false);
  };

  const suggestMoreActions = async () => {
    if (!m.keyPoints.length) return; setMoreLoading(true);
    try { const s = await aiCall(`Du er en møteassistent. Basert på disse nøkkelpunktene, foreslå 2-4 nye aksjonspunkter. Svar KUN med en JSON-array av strings.\n\nNøkkelpunkter:\n${m.keyPoints.join("\n")}`); update({ step3Actions: [...m.step3Actions, ...s.map((t) => ({ text: t, owner: "Ikke tildelt" }))] }); } catch (e) { console.error(e); }
    setMoreLoading(false);
  };

  const genSummary = () => {
    const ag = m.agendaItems.filter((a) => a.trim()).map((a, i) => `  ${i + 1}. ${a}`).join("\n");
    const kp = m.keyPoints.map((k) => `  • ${k}`).join("\n");
    const ac = m.step3Actions.map((a, i) => `  ${i + 1}. ${a.text} (Ansvarlig: ${a.owner})`).join("\n");
    update({ summaryText: `════════════════════════════════════════
  ✦  MØTEREFERAT: ${m.title || "Uten tittel"}  ✦
════════════════════════════════════════

Dato: ${m.dateISO ? isoToDisplay(m.dateISO) : "Ikke angitt"}  |  Tid: ${m.hour}:${m.minute}
Deltakere: ${vp.join(", ") || "Ingen angitt"}
Mål: ${m.goal || "Ikke angitt"}

────────────────────────────────────────
  AGENDA
────────────────────────────────────────
${ag || "  Ingen agendapunkter"}

────────────────────────────────────────
  NØKKELPUNKTER FRA MØTET
────────────────────────────────────────
${kp || "  Ingen nøkkelpunkter fra møtet"}

────────────────────────────────────────
  AKSJONSPUNKTER
────────────────────────────────────────
${ac || "  Ingen aksjonspunkter"}

════════════════════════════════════════
  Generert av Iznogoud Møteassistent ✦
════════════════════════════════════════` });
  };

  return (
    <div>
      {/* ═══ STEP 1 ═══ */}
      {m.step === 1 && (<div>
        <h2 style={S.sectionTitle}><span style={S.ornament}>✦</span> Forberedelse <span style={S.ornament}>✦</span></h2>
        <div style={S.card}>
          <label style={S.label}>Tittel</label>
          <input className="iz-input" style={S.input} value={m.title} onChange={(e) => update({ title: e.target.value })} placeholder="Møtets tittel..." />
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <div style={{ flex: 1 }}><label style={S.label}>Dato</label><input className="iz-input" style={S.input} type="date" value={m.dateISO} onChange={(e) => update({ dateISO: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label style={S.label}>Klokkeslett</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select className="iz-input" style={{ ...S.input, flex: 1, marginBottom: 0 }} value={m.hour} onChange={(e) => update({ hour: e.target.value })}>
                  {Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")).map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span style={{ color: G, fontWeight: 700, fontSize: 20 }}>:</span>
                <select className="iz-input" style={{ ...S.input, flex: 1, marginBottom: 0 }} value={m.minute} onChange={(e) => update({ minute: e.target.value })}>
                  {["00", "15", "30", "45"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <label style={S.label}>Deltakere</label>
          {m.participants.map((p, i) => (<div key={i} style={S.listRow}>
            <input data-field="participant" className="iz-input" style={{ ...S.input, flex: 1, marginBottom: 0 }} value={p} onChange={(e) => { const n = [...m.participants]; n[i] = e.target.value; update({ participants: n }); }} placeholder={`Deltaker ${i + 1}`} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }} />
            {m.participants.length > 1 && <button onClick={() => update({ participants: m.participants.filter((_, idx) => idx !== i) })} style={S.removeBtn}>✕</button>}
          </div>))}
          <button onClick={addParticipant} style={S.addBtn}>+ Legg til deltaker</button>
        </div>
        <div style={S.card}>
          <label style={S.label}>Agendapunkter</label>
          {m.agendaItems.map((a, i) => (<div key={i} style={S.listRow} draggable onDragStart={dragAgenda.onDragStart(i)} onDragEnd={dragAgenda.onDragEnd} onDragOver={dragAgenda.onDragOver(i)}>
            <span style={S.dragHandle}>⠿</span><span style={S.agendaNum}>{i + 1}</span>
            <input data-field="agenda" className="iz-input" style={{ ...S.input, flex: 1, marginBottom: 0 }} value={a} onChange={(e) => { const n = [...m.agendaItems]; n[i] = e.target.value; update({ agendaItems: n }); }} placeholder={`Agendapunkt ${i + 1}`} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAgenda(); } }} />
            {m.agendaItems.length > 1 && <button onClick={() => update({ agendaItems: m.agendaItems.filter((_, idx) => idx !== i) })} style={S.removeBtn}>✕</button>}
          </div>))}
          <button onClick={addAgenda} style={S.addBtn}>+ Legg til agendapunkt</button>
        </div>
        <div style={S.card}>
          <label style={S.label}>Hva ønsker jeg å oppnå med dette møtet?</label>
          <textarea className="iz-input" style={S.textarea} value={m.goal} onChange={(e) => update({ goal: e.target.value })} placeholder="Beskriv målet med møtet..." rows={3} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}><button onClick={() => goToStep(2)} style={S.primaryBtn}>Til gjennomføring ➜</button></div>
      </div>)}

      {/* ═══ STEP 2 ═══ */}
      {m.step === 2 && (<div>
        <h2 style={S.sectionTitle}><span style={S.ornament}>✦</span> Gjennomføring <span style={S.ornament}>✦</span></h2>
        <div style={S.card}>
          <label style={S.label}>Møtenotater</label>
          <textarea className="iz-input" style={S.notesArea} value={m.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Skriv møtenotater her..." />
        </div>
        <div style={S.card}>
          <label style={S.label}>Aksjonspunkter</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input data-field="new-action" className="iz-input" style={{ ...S.input, flex: 2, marginBottom: 0, minWidth: 180 }} value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="Nytt aksjonspunkt..." onKeyDown={(e) => e.key === "Enter" && addActionItem()} />
            <select className="iz-input" style={{ ...S.input, flex: 1, marginBottom: 0, minWidth: 140 }} value={newActionOwner} onChange={(e) => setNewActionOwner(e.target.value)}>
              <option value="">Velg ansvarlig...</option>
              {vp.map((p, i) => <option key={i} value={p}>{p}</option>)}
            </select>
            <button onClick={addActionItem} style={S.addBtn}>+ Legg til</button>
          </div>
          {m.actionItems.map((item, i) => (<div key={i} style={S.actionRow} draggable onDragStart={dragActions.onDragStart(i)} onDragEnd={dragActions.onDragEnd} onDragOver={dragActions.onDragOver(i)}>
            <span style={S.dragHandle}>⠿</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 6 }}>
              <button onClick={() => moveItem(m.actionItems, "actionItems", i, -1)} style={S.arrowBtn} disabled={i === 0}>▲</button>
              <button onClick={() => moveItem(m.actionItems, "actionItems", i, 1)} style={S.arrowBtn} disabled={i === m.actionItems.length - 1}>▼</button>
            </div>
            <span style={S.actionBullet}>◆</span>
            <input style={{ ...S.inlineInput, flex: 1 }} value={item.text} onChange={(e) => { const n = [...m.actionItems]; n[i] = { ...n[i], text: e.target.value }; update({ actionItems: n }); }} />
            <select style={S.ownerSelect} value={item.owner} onChange={(e) => { const n = [...m.actionItems]; n[i] = { ...n[i], owner: e.target.value }; update({ actionItems: n }); }}>
              <option value="Ikke tildelt">Ikke tildelt</option>
              {vp.map((p, j) => <option key={j} value={p}>{p}</option>)}
            </select>
            <button onClick={() => update({ actionItems: m.actionItems.filter((_, idx) => idx !== i) })} style={S.removeBtn}>✕</button>
          </div>))}
          <button onClick={suggestActions} disabled={aiLoading} style={{ ...S.aiBtn, marginTop: 16, opacity: aiLoading ? 0.6 : 1 }}>{aiLoading ? "✦ Tenker..." : "✦ Foreslå aksjonspunkter med AI"}</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button onClick={() => goToStep(1)} style={S.secondaryBtn}>← Forberedelse</button>
          <button onClick={() => goToStep(3)} style={S.primaryBtn}>Til etterarbeid ➜</button>
        </div>
      </div>)}

      {/* ═══ STEP 3 ═══ */}
      {m.step === 3 && (<div>
        <h2 style={S.sectionTitle}><span style={S.ornament}>✦</span> Etterarbeid <span style={S.ornament}>✦</span></h2>
        <div style={S.card}>
          <label style={S.label}>Notater fra møtet</label>
          <textarea className="iz-input" style={S.notesArea} value={m.editableNotes} onChange={(e) => update({ editableNotes: e.target.value })} placeholder="Notater fra møtet..." />
        </div>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ ...S.label, marginBottom: 0 }}>Nøkkelpunkter fra møtet</label>
            <button onClick={genKeyPoints} disabled={kpLoading} style={{ ...S.aiBtn, opacity: kpLoading ? 0.6 : 1 }}>{kpLoading ? "✦ Analyserer..." : "✦ Lag nøkkelpunkter"}</button>
          </div>
          {m.keyPoints.map((kp, i) => (<div key={i} style={S.actionRow} draggable onDragStart={dragKP.onDragStart(i)} onDragEnd={dragKP.onDragEnd} onDragOver={dragKP.onDragOver(i)}>
            <span style={S.dragHandle}>⠿</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 6 }}><button onClick={() => moveItem(m.keyPoints, "keyPoints", i, -1)} style={S.arrowBtn} disabled={i === 0}>▲</button><button onClick={() => moveItem(m.keyPoints, "keyPoints", i, 1)} style={S.arrowBtn} disabled={i === m.keyPoints.length - 1}>▼</button></div>
            <span style={S.actionBullet}>•</span>
            <input style={{ ...S.inlineInput, flex: 1 }} value={kp} onChange={(e) => { const n = [...m.keyPoints]; n[i] = e.target.value; update({ keyPoints: n }); }} />
            <button onClick={() => update({ keyPoints: m.keyPoints.filter((_, idx) => idx !== i) })} style={S.removeBtn}>✕</button>
          </div>))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input className="iz-input" style={{ ...S.input, flex: 1, marginBottom: 0 }} value={newKeyPoint} onChange={(e) => setNewKeyPoint(e.target.value)} placeholder="Legg til nøkkelpunkt..." onKeyDown={(e) => { if (e.key === "Enter" && newKeyPoint.trim()) { update({ keyPoints: [...m.keyPoints, newKeyPoint.trim()] }); setNewKeyPoint(""); } }} />
            <button onClick={() => { if (newKeyPoint.trim()) { update({ keyPoints: [...m.keyPoints, newKeyPoint.trim()] }); setNewKeyPoint(""); } }} style={S.addBtn}>+ Legg til</button>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ ...S.label, marginBottom: 0 }}>Aksjonspunkter</label>
            <button onClick={suggestMoreActions} disabled={moreLoading} style={{ ...S.aiBtn, opacity: moreLoading ? 0.6 : 1 }}>{moreLoading ? "✦ Tenker..." : "✦ Foreslå flere aksjonspunkter"}</button>
          </div>
          {m.step3Actions.map((item, i) => (<div key={i} style={S.actionRow} draggable onDragStart={dragS3.onDragStart(i)} onDragEnd={dragS3.onDragEnd} onDragOver={dragS3.onDragOver(i)}>
            <span style={S.dragHandle}>⠿</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 6 }}><button onClick={() => moveItem(m.step3Actions, "step3Actions", i, -1)} style={S.arrowBtn} disabled={i === 0}>▲</button><button onClick={() => moveItem(m.step3Actions, "step3Actions", i, 1)} style={S.arrowBtn} disabled={i === m.step3Actions.length - 1}>▼</button></div>
            <span style={S.actionBullet}>◆</span>
            <input style={{ ...S.inlineInput, flex: 1 }} value={item.text} onChange={(e) => { const n = [...m.step3Actions]; n[i] = { ...n[i], text: e.target.value }; update({ step3Actions: n }); }} />
            <span style={S.ownerBadge}>{item.owner}</span>
            <button onClick={() => update({ step3Actions: m.step3Actions.filter((_, idx) => idx !== i) })} style={S.removeBtn}>✕</button>
          </div>))}
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <input className="iz-input" style={{ ...S.input, flex: 2, marginBottom: 0, minWidth: 180 }} value={newS3Action} onChange={(e) => setNewS3Action(e.target.value)} placeholder="Legg til aksjonspunkt..." onKeyDown={(e) => { if (e.key === "Enter" && newS3Action.trim()) { update({ step3Actions: [...m.step3Actions, { text: newS3Action.trim(), owner: newS3Owner || "Ikke tildelt" }] }); setNewS3Action(""); setNewS3Owner(""); } }} />
            <select className="iz-input" style={{ ...S.input, flex: 1, marginBottom: 0, minWidth: 140 }} value={newS3Owner} onChange={(e) => setNewS3Owner(e.target.value)}>
              <option value="">Velg ansvarlig...</option>
              {vp.map((p, j) => <option key={j} value={p}>{p}</option>)}
            </select>
            <button onClick={() => { if (newS3Action.trim()) { update({ step3Actions: [...m.step3Actions, { text: newS3Action.trim(), owner: newS3Owner || "Ikke tildelt" }] }); setNewS3Action(""); setNewS3Owner(""); } }} style={S.addBtn}>+ Legg til</button>
          </div>
        </div>
        <button onClick={genSummary} style={S.megaBtn}>✦ Oppsummer møte ✦</button>
        {m.summaryText && (<div style={S.card}>
          <label style={S.label}>Møtereferat</label>
          <textarea className="iz-input" style={S.summaryArea} value={m.summaryText} onChange={(e) => update({ summaryText: e.target.value })} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "a") e.stopPropagation(); }} />
        </div>)}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 20 }}><button onClick={() => goToStep(2)} style={S.secondaryBtn}>← Gjennomføring</button></div>
      </div>)}
    </div>
  );
}

// ══════════════════════════════════════
//  STYLES
// ══════════════════════════════════════
const styles = {
  wrapper: { minHeight: "100vh", background: `linear-gradient(170deg, ${DEEP} 0%, #0D0620 40%, ${DEEP} 100%)`, backgroundImage: `${arabesqueBg}, ${starBg}, linear-gradient(170deg, ${DEEP} 0%, #0D0620 40%, ${DEEP} 100%)`, fontFamily: "'Amiri', serif", color: INK, display: "flex", flexDirection: "column" },
  header: { background: `linear-gradient(180deg, rgba(26,10,46,0.98) 0%, rgba(26,10,46,0.9) 100%)`, borderBottom: `2px solid ${G}40`, padding: "16px 24px 0", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
  headerInner: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 800, margin: "0 auto", width: "100%" },
  logoArea: { display: "flex", alignItems: "center", gap: 12 },
  logoImg: { width: 52, height: 52, objectFit: "contain", borderRadius: 8, filter: `drop-shadow(0 2px 8px ${G}40)` },
  title: { margin: 0, fontSize: 28, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: G, letterSpacing: 2, textShadow: `0 2px 12px ${G}30` },
  subtitle: { margin: 0, fontSize: 12, color: `${SAND}90`, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Cormorant Garamond', serif" },
  headerDecor: { color: `${G}50`, fontSize: 14, letterSpacing: 8 },
  stepper: { display: "flex", justifyContent: "center", alignItems: "center", padding: "14px 0 10px", maxWidth: 600, margin: "0 auto" },
  stepDot: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 18px", borderRadius: 14, transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", border: `1px solid ${G}30`, minWidth: 100 },
  body: { flex: 1, padding: "24px 16px 40px", maxWidth: 800, margin: "0 auto", width: "100%", boxSizing: "border-box" },
  sectionTitle: { textAlign: "center", color: G, fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, letterSpacing: 3, marginBottom: 24, textShadow: `0 2px 10px ${G}20` },
  ornament: { color: `${G}60`, fontSize: 16, verticalAlign: "middle" },
  card: { background: `linear-gradient(135deg, ${CREAM} 0%, #FFF9F0 100%)`, borderRadius: 16, padding: "20px 24px", marginBottom: 18, border: `1px solid ${G}30`, boxShadow: `0 4px 24px rgba(26,10,46,0.15), inset 0 1px 0 ${G}15` },
  meetingCard: { background: `linear-gradient(135deg, ${CREAM} 0%, #FFF9F0 100%)`, borderRadius: 14, padding: "16px 20px", marginBottom: 10, border: `1px solid ${G}25`, boxShadow: `0 2px 12px rgba(26,10,46,0.1)`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.3s ease" },
  label: { display: "block", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 15, color: WINE, marginBottom: 8, letterSpacing: 0.8, textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 14px", border: `1.5px solid ${G}40`, borderRadius: 10, fontSize: 15, fontFamily: "'Amiri', serif", background: "#fff", color: INK, outline: "none", marginBottom: 8, boxSizing: "border-box", transition: "border-color 0.3s, box-shadow 0.3s" },
  textarea: { width: "100%", padding: "10px 14px", border: `1.5px solid ${G}40`, borderRadius: 10, fontSize: 15, fontFamily: "'Amiri', serif", background: "#fff", color: INK, outline: "none", resize: "vertical", boxSizing: "border-box" },
  notesArea: { width: "100%", minHeight: 200, padding: "14px 16px", border: `1.5px solid ${G}40`, borderRadius: 10, fontSize: 15, fontFamily: "'Amiri', serif", background: "#fff", color: INK, outline: "none", lineHeight: 1.7, resize: "vertical", boxSizing: "border-box", transition: "border-color 0.3s, box-shadow 0.3s" },
  listRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  agendaNum: { width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${G}30, ${WINE}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: WINE, flexShrink: 0 },
  addBtn: { background: "none", border: `1.5px dashed ${G}50`, borderRadius: 10, padding: "8px 16px", color: TEAL, fontFamily: "'Amiri', serif", fontSize: 14, cursor: "pointer", transition: "all 0.3s", marginTop: 4 },
  removeBtn: { background: "none", border: "none", color: `${RUBY}90`, fontSize: 14, cursor: "pointer", padding: "4px 8px", borderRadius: 6, transition: "all 0.2s", flexShrink: 0 },
  primaryBtn: { background: `linear-gradient(135deg, ${G}, ${WINE})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 16, letterSpacing: 1, cursor: "pointer", boxShadow: `0 4px 16px ${G}40`, transition: "all 0.3s" },
  secondaryBtn: { background: "transparent", color: G, border: `1.5px solid ${G}60`, borderRadius: 12, padding: "12px 24px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.3s" },
  actionRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${G}08`, borderRadius: 10, marginBottom: 6, border: `1px solid ${G}15` },
  actionBullet: { color: G, fontSize: 12, flexShrink: 0 },
  ownerBadge: { background: `linear-gradient(135deg, ${TEAL}20, ${TEAL}10)`, color: TEAL, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap", flexShrink: 0 },
  ownerSelect: { background: `linear-gradient(135deg, ${TEAL}12, ${TEAL}06)`, color: TEAL, padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", border: `1px solid ${TEAL}30`, outline: "none", cursor: "pointer", flexShrink: 0 },
  aiBtn: { background: `linear-gradient(135deg, ${DEEP}, ${WINE})`, color: G, border: `1px solid ${G}40`, borderRadius: 10, padding: "10px 20px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14, letterSpacing: 0.5, cursor: "pointer", transition: "all 0.3s", boxShadow: `0 2px 12px ${DEEP}40` },
  arrowBtn: { background: "none", border: "none", color: `${G}80`, fontSize: 10, cursor: "pointer", padding: "0 2px", lineHeight: 1 },
  dragHandle: { cursor: "grab", color: `${G}60`, fontSize: 16, flexShrink: 0, userSelect: "none", lineHeight: 1, padding: "0 2px" },
  inlineInput: { background: "transparent", border: "none", borderBottom: `1px solid ${G}20`, padding: "2px 4px", fontSize: 14, fontFamily: "'Amiri', serif", color: INK, outline: "none" },
  megaBtn: { width: "100%", padding: "18px 24px", background: `linear-gradient(135deg, ${G}, ${WINE}, ${G})`, backgroundSize: "200% 200%", animation: "shimmer 4s ease infinite", color: "#fff", border: "none", borderRadius: 16, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, letterSpacing: 3, cursor: "pointer", boxShadow: `0 6px 30px ${G}50, 0 2px 8px ${WINE}40`, marginTop: 24, transition: "all 0.3s", textShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  summaryArea: { width: "100%", minHeight: 300, padding: "16px", border: `1.5px solid ${G}40`, borderRadius: 10, fontSize: 13, fontFamily: "'Amiri', monospace", color: INK, whiteSpace: "pre-wrap", lineHeight: 1.6, background: `${DEEP}05`, resize: "vertical", boxSizing: "border-box", outline: "none", transition: "border-color 0.3s, box-shadow 0.3s" },
  footer: { textAlign: "center", padding: "16px", borderTop: `1px solid ${G}15` },
};
