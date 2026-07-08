"use client";
import { useEffect, useRef, useState } from "react";

const COLUMNS = [
  { key: "wins", label: "Wins", icon: "🏆", prompt: "What went well?" },
  { key: "learn", label: "Learnings", icon: "🧭", prompt: "What did we learn?" },
  { key: "improve", label: "Improvements", icon: "🧳", prompt: "What should change next time?" },
  { key: "question", label: "Questions", icon: "🗺️", prompt: "What still puzzles us?" },
];

const TOPICS = [
  { key: "emails", label: "Emails" },
  { key: "website", label: "Website" },
  { key: "app", label: "App" },
  { key: "qa", label: "QA flow" },
  { key: "meetings", label: "Meetings structure" },
  { key: "comms", label: "Communication channels" },
  { key: "general", label: "General" },
];

function slug(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "board";
}

async function apiGet(key) {
  const res = await fetch(`/api/kv?key=${encodeURIComponent(key)}`);
  const data = await res.json();
  return data.value ?? null;
}
async function apiSet(key, value) {
  await fetch("/api/kv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
}

export default function Page() {
  const [stage, setStage] = useState("gate"); // gate | board
  const [boardCode, setBoardCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [myName, setMyName] = useState("Anon");
  const [meta, setMeta] = useState({ title: "Phase 1 Rebrand Retro", date: "", revealed: false });
  const [cards, setCards] = useState([]);
  const [toast, setToast] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    setCodeInput(localStorage.getItem("lastBoardCode") || "");
    setNameInput(localStorage.getItem("lastName") || "");
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function refresh(code) {
    const metaRaw = await apiGet("meta:" + code);
    const m = metaRaw ? JSON.parse(metaRaw) : { title: "Phase 1 Rebrand Retro", date: new Date().toISOString().slice(0, 10), revealed: false };
    setMeta(m);
    const cardsRaw = await apiGet("cards:" + code);
    setCards(cardsRaw ? JSON.parse(cardsRaw) : []);
  }

  async function enterBoard() {
    if (!codeInput.trim()) { showToast("Enter a board code first"); return; }
    const code = slug(codeInput);
    const name = nameInput.trim() || "Anon";
    setBoardCode(code);
    setMyName(name);
    localStorage.setItem("lastBoardCode", code);
    localStorage.setItem("lastName", name);

    const existing = await apiGet("meta:" + code);
    if (!existing) {
      await apiSet("meta:" + code, JSON.stringify({ title: "Phase 1 Rebrand Retro", date: new Date().toISOString().slice(0, 10), revealed: false }));
    }
    await refresh(code);
    setStage("board");
    pollRef.current = setInterval(() => refresh(code), 4000);
  }

  function switchBoard() {
    if (pollRef.current) clearInterval(pollRef.current);
    setStage("gate");
  }

  async function saveCards(newCards) {
    setCards(newCards);
    await apiSet("cards:" + boardCode, JSON.stringify(newCards));
  }

  async function addCard(column, topic, text) {
    const card = { id: "c" + Date.now() + Math.random().toString(36).slice(2, 7), column, topic, text, author: myName, votes: 0, createdAt: Date.now() };
    const latestRaw = await apiGet("cards:" + boardCode);
    const latest = latestRaw ? JSON.parse(latestRaw) : [];
    await saveCards([...latest, card]);
  }
  async function deleteCard(id) {
    const latestRaw = await apiGet("cards:" + boardCode);
    const latest = latestRaw ? JSON.parse(latestRaw) : [];
    await saveCards(latest.filter((c) => c.id !== id));
  }
  async function upvote(id) {
    const latestRaw = await apiGet("cards:" + boardCode);
    const latest = latestRaw ? JSON.parse(latestRaw) : [];
    await saveCards(latest.map((c) => (c.id === id ? { ...c, votes: c.votes + 1 } : c)));
  }
  async function moveCard(id, newCol) {
    const latestRaw = await apiGet("cards:" + boardCode);
    const latest = latestRaw ? JSON.parse(latestRaw) : [];
    await saveCards(latest.map((c) => (c.id === id ? { ...c, column: newCol } : c)));
  }
  async function toggleReveal() {
    const next = { ...meta, revealed: !meta.revealed };
    setMeta(next);
    await apiSet("meta:" + boardCode, JSON.stringify(next));
  }
  async function saveTitle(title) {
    const next = { ...meta, title: title || "Phase 1 Rebrand Retro" };
    setMeta(next);
    await apiSet("meta:" + boardCode, JSON.stringify(next));
  }

  function exportMarkdown() {
    let md = "# " + meta.title + "\n" + (meta.date || "") + "\n\n";
    COLUMNS.forEach((col) => {
      md += "## " + col.icon + " " + col.label + "\n";
      TOPICS.forEach((topic) => {
        const items = cards
          .filter((c) => c.column === col.key && c.topic === topic.key)
          .sort((a, b) => b.votes - a.votes);
        if (items.length === 0) return;
        md += "### " + topic.label + "\n";
        items.forEach((c) => { md += "- " + c.text.replace(/\n/g, " ") + "  _(— " + c.author + ", ▲" + c.votes + ")_\n"; });
        md += "\n";
      });
    });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = boardCode + "-retro.md";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast("Exported " + boardCode + "-retro.md");
  }

  if (stage === "gate") {
    return (
      <div className="wrap">
        <div className="gate">
          <div className="eyebrow">Reflection Board</div>
          <h1>Phase 1 Rebrand Retro</h1>
          <div className="gate-sub">Let&apos;s look back on Phase 1 of the Faye rebranding project together — wins, learnings, what to change, and what&apos;s still unclear.</div>
          <div className="field">
            <label>Board code (share this with your team)</label>
            <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="e.g. sprint-24" onKeyDown={(e) => e.key === "Enter" && enterBoard()} />
          </div>
          <div className="field">
            <label>Your name</label>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="e.g. Dana" onKeyDown={(e) => e.key === "Enter" && enterBoard()} />
          </div>
          <button className="btn" onClick={enterBoard}>Open board →</button>
          <div className="gate-hint">Everyone who enters the same board code sees and can edit the same board — no account needed.</div>
        </div>
        {toast && <div className="toast show">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="board-head">
        <div>
          <div className="board-title-row">
            <div className="board-logo">✈</div>
            <input className="board-title" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} onBlur={(e) => saveTitle(e.target.value)} />
          </div>
          <div className="board-meta">board &ldquo;{boardCode}&rdquo; · {meta.date} · {meta.revealed ? "revealed" : "hidden until reveal"}</div>
        </div>
        <div className="head-actions">
          <div className="toggle">
            <span>Reveal</span>
            <div className={"switch" + (meta.revealed ? " on" : "")} onClick={toggleReveal}><i /></div>
          </div>
          <button className="icon-btn" onClick={exportMarkdown}>Export .md</button>
          <button className="icon-btn" onClick={switchBoard}>Switch board</button>
        </div>
      </div>

      <div className="board">
        {COLUMNS.map((col) => (
          <div className={"col col-" + col.key} key={col.key}>
            <div className="col-tag">
              {col.icon} {col.label}
              <span className="n">{cards.filter((c) => c.column === col.key).length || ""}</span>
            </div>
            <div className="col-body">
              {TOPICS.map((topic) => (
                <TopicSection
                  key={topic.key}
                  col={col}
                  topic={topic}
                  cards={cards.filter((c) => c.column === col.key && c.topic === topic.key)}
                  revealed={meta.revealed}
                  myName={myName}
                  onAdd={(text) => addCard(col.key, topic.key, text)}
                  onDelete={deleteCard}
                  onVote={upvote}
                  onMove={moveCard}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="status-line">synced</div>
      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

function TopicSection({ col, topic, cards, revealed, myName, onAdd, onDelete, onVote, onMove }) {
  const [text, setText] = useState("");
  const sorted = [...cards].sort((a, b) => b.votes - a.votes || a.createdAt - b.createdAt);
  function submit() {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
  }
  return (
    <div className="topic-section">
      <div className="topic-head">
        <span>{topic.label}</span>
        <span className="tn">{sorted.length || ""}</span>
      </div>
      <div className="card-list">
        {sorted.map((card) => (
          <Card key={card.id} card={card} revealed={revealed} myName={myName} onDelete={onDelete} onVote={onVote} onMove={onMove} />
        ))}
      </div>
      <div className="quick-add">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Add to ${topic.label.toLowerCase()}…`} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button onClick={submit}>+</button>
      </div>
    </div>
  );
}

function Card({ card, revealed, myName, onDelete, onVote, onMove }) {
  if (!revealed && card.author !== myName) {
    return <div className="hidden-card">Someone added a card — reveal to view</div>;
  }
  return (
    <div className="card">
      <div className="card-text">{card.text}</div>
      <div className="card-foot">
        <div className="card-author">{card.author}</div>
        <div className="card-actions">
          <button className="vote-btn" onClick={() => onVote(card.id)}>▲ {card.votes}</button>
          <select className="move-select" value={card.column} onChange={(e) => onMove(card.id, e.target.value)}>
            {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <button className="del-btn" onClick={() => onDelete(card.id)}>✕</button>
        </div>
      </div>
    </div>
  );
}
