
import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Bell,
  Check,
  CheckSquare,
  Gamepad2,
  Grid2X2,
  Lightbulb,
  List,
  Menu,
  Moon,
  Palette,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import "./App.css";

const colors = ["white", "sand", "peach", "sage", "blue", "lavender"];
const starterNotes = [
  {
    id: "1",
    title: "A little space for big ideas.",
    body: "Thoughts, plans, and little things worth remembering. Make yourself at home. ✨",
    color: "sand",
    pinned: true,
    label: "Personal",
    art: "sunrise",
  },
  {
    id: "2",
    title: "The weekend list",
    body: "",
    color: "sage",
    pinned: true,
    label: "Personal",
    items: [
      { text: "Find a new coffee spot", done: true },
      { text: "A long walk, no destination", done: false },
      { text: "Pick up fresh flowers", done: false },
      { text: "Start that book", done: false },
    ],
  },
  {
    id: "3",
    title: "Less, but better.",
    body: "A gentle reminder to make room for the things that matter.",
    color: "lavender",
    pinned: true,
    label: "Inspiration",
  },
  {
    id: "4",
    title: "Ideas for a rainy day",
    body: "Make a playlist for slow mornings\nTry that homemade pasta recipe\nRearrange the bookshelf\nWrite a letter to a friend",
    color: "white",
    label: "Personal",
  },
  {
    id: "5",
    title: "Make something good",
    body: "It doesn’t have to be perfect.\nIt just has to be yours.",
    color: "peach",
    label: "Inspiration",
    art: "shapes",
  },
  {
    id: "6",
    title: "A few things to pick up",
    body: "",
    color: "sand",
    label: "Personal",
    items: [
      { text: "Oat milk", done: false },
      { text: "Avocados", done: false },
      { text: "Sourdough bread", done: true },
      { text: "Something sweet", done: false },
    ],
  },
  {
    id: "7",
    title: "Website refresh",
    body: "Keep it simple. More breathing room, a warmer palette, and a little personality.\n\nStart with the homepage →",
    color: "blue",
    label: "Work",
  },
  {
    id: "8",
    title: "Words to keep",
    body: "“Almost everything will work again if you unplug it for a few minutes, including you.”\n\n— Anne Lamott",
    color: "sage",
    label: "Inspiration",
  },
  {
    id: "9",
    title: "Learning something new",
    body: "One small step, every day.\n\nToday: build something with React.\nTomorrow: make it a little better.",
    color: "white",
    label: "Work",
  },
];

function readSaved(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (
      key === "little-keep-notes" &&
      Array.isArray(value) &&
      value.every(
        (n) =>
          n &&
          typeof n.id === "string" &&
          typeof n.title === "string" &&
          typeof n.body === "string" &&
          (!n.items ||
            (Array.isArray(n.items) &&
              n.items.every((i) => i && typeof i.text === "string"))),
      )
    )
      return value;
    if (key === "little-keep-dark" && typeof value === "boolean") return value;
  } catch {
    /* Beginner shortcut: fall back to defaults if saved data is invalid. */
  }
  return fallback;
}

export default function App() {
  // Intentionally one large component: this is a beginner React exercise.
  const [notes, setNotes] = useState(() =>
    readSaved("little-keep-notes", starterNotes),
  );
  const [dark, setDark] = useState(() => readSaved("little-keep-dark", false));
  const [page, setPage] = useState("Notes");
  const [query, setQuery] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [listView, setListView] = useState(false);
  const [draft, setDraft] = useState(null);
  const [palette, setPalette] = useState(null);
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const dialog = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("little-keep-notes", JSON.stringify(notes));
      localStorage.setItem("little-keep-dark", JSON.stringify(dark));
      queueMicrotask(() => setSaveError(false));
    } catch {
      queueMicrotask(() => setSaveError(true));
    }
  }, [notes, dark]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (draft && !dialog.current.open) dialog.current.showModal();
    if (!draft && dialog.current.open) dialog.current.close();
  }, [draft]);
  useEffect(() => {
    if (flipped.length !== 2) return;
    const timer = setTimeout(() => {
      if (cards[flipped[0]] === cards[flipped[1]])
        setMatched((old) => [...old, ...flipped]);
      setFlipped([]);
    }, 650);
    return () => clearTimeout(timer);
  }, [flipped, cards]);

  function updateNote(id, changes) {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, ...changes } : note)),
    );
  }
  function newNote(checklist = false) {
    setDraft({
      title: "",
      body: "",
      color: "white",
      label: ["Personal", "Work", "Inspiration"].includes(page) ? page : "",
      reminder: "",
      checklist,
      checklistText: "",
    });
  }
  function saveNote(event) {
    event.preventDefault();
    if (
      !draft.title.trim() &&
      !draft.body.trim() &&
      !draft.checklistText?.trim()
    ) {
      setNotice("Add a title or a little something to your note.");
      return;
    }
    const saved = { ...draft, id: draft.id || crypto.randomUUID() };
    if (draft.checklist) {
      saved.items = draft.checklistText
        .split("\n")
        .filter((line) => line.trim())
        .map((text, index) => ({
          text: text.trim(),
          done:
            draft.items?.[index]?.text === text.trim()
              ? draft.items[index].done
              : false,
        }));
      saved.body = "";
    } else delete saved.items;
    if (draft.id)
      setNotes(notes.map((note) => (note.id === draft.id ? saved : note)));
    else setNotes([saved, ...notes]);
    setDraft(null);
    setNotice(draft.id ? "Note updated" : "A little thought, safely kept.");
  }
  function startGame() {
    // Hardcoded board size is a deliberate beginner shortcut.
    const deck = ["☀", "☀", "✿", "✿", "☕", "☕", "♫", "♫", "★", "★", "☁", "☁"];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }
  const visible = notes.filter((note) => {
    if (page === "Trash") {
      if (!note.deleted) return false;
    } else if (page === "Archive") {
      if (!note.archived || note.deleted) return false;
    } else {
      if (note.deleted || note.archived) return false;
      if (page === "Reminders" && !note.reminder) return false;
      if (
        ["Personal", "Work", "Inspiration"].includes(page) &&
        note.label !== page
      )
        return false;
    }
    return `${note.title} ${note.body} ${note.label || ""} ${(note.items || []).map((i) => i.text).join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });
  const pinned = visible.filter((note) => note.pinned);
  const others = visible.filter((note) => !note.pinned);
  // Repeated win checks are deliberately more complicated than necessary.
  let won = false;
  if (matched.length > 0) {
    if (matched.length === 12) {
      if (cards.length === 12) won = true;
    }
  }

  function renderNote(note) {
    return (
      <article className={`note color-${note.color || "white"}`} key={note.id}>
        {note.art && (
          <div className={`note-art ${note.art}`} aria-hidden="true">
            <span />
            <i />
            <b />
          </div>
        )}
        {!note.deleted && (
          <button
            className={`icon-button pin ${note.pinned ? "is-pinned" : ""}`}
            title={note.pinned ? "Unpin note" : "Pin note"}
            aria-label={`${note.pinned ? "Unpin" : "Pin"} ${note.title}`}
            onClick={() => updateNote(note.id, { pinned: !note.pinned })}
          >
            <Pin size={16} fill={note.pinned ? "currentColor" : "none"} />
          </button>
        )}
        <div className="note-content">
          <button
            className="note-edit"
            disabled={!!note.deleted}
            aria-label={`Edit ${note.title || "untitled note"}`}
            onClick={() =>
              setDraft({
                ...note,
                checklist: !!note.items,
                checklistText: (note.items || []).map((i) => i.text).join("\n"),
              })
            }
          >
            <h3>{note.title || "Untitled"}</h3>
            {note.body && <p>{note.body}</p>}
          </button>
          {note.items && (
            <div className="checklist">
              {note.items.map((item, index) => (
                <label className={item.done ? "done" : ""} key={index}>
                  <input
                    type="checkbox"
                    checked={!!item.done}
                    disabled={!!note.deleted}
                    onChange={() =>
                      updateNote(note.id, {
                        items: note.items.map((old, i) =>
                          i === index ? { ...old, done: !old.done } : old,
                        ),
                      })
                    }
                  />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          )}
          <div className="note-meta">
            {note.label && (
              <button onClick={() => setPage(note.label)} className="tag">
                {note.label}
              </button>
            )}
            {note.reminder && (
              <span
                className={`reminder ${new Date(note.reminder).getTime() <= now ? "due" : ""}`}
              >
                <Bell size={11} />
                {new Date(note.reminder).getTime() <= now ? "Due · " : ""}
                {new Date(note.reminder).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
        <div className="note-actions">
          {note.deleted ? (
            <>
              <button
                className="icon-button"
                title="Restore note"
                aria-label={`Restore ${note.title}`}
                onClick={() => updateNote(note.id, { deleted: false })}
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="icon-button"
                title="Delete forever"
                aria-label={`Delete ${note.title} forever`}
                onClick={() => {
                  setNotes(notes.filter((n) => n.id !== note.id));
                  setNotice("Note permanently deleted");
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                className="icon-button"
                title="Note color"
                aria-label={`Change color of ${note.title}`}
                onClick={() => setPalette(palette === note.id ? null : note.id)}
              >
                <Palette size={16} />
              </button>
              <button
                className="icon-button"
                title="Set reminder"
                aria-label={`Set reminder for ${note.title}`}
                onClick={() =>
                  setDraft({
                    ...note,
                    checklist: !!note.items,
                    checklistText: (note.items || [])
                      .map((i) => i.text)
                      .join("\n"),
                  })
                }
              >
                <Bell size={16} />
              </button>
              <button
                className="icon-button"
                title={note.archived ? "Unarchive note" : "Archive note"}
                aria-label={`${note.archived ? "Unarchive" : "Archive"} ${note.title}`}
                onClick={() =>
                  updateNote(note.id, {
                    archived: !note.archived,
                    pinned: false,
                  })
                }
              >
                <Archive size={16} />
              </button>
              <button
                className="icon-button"
                title="Move to trash"
                aria-label={`Delete ${note.title}`}
                onClick={() => {
                  updateNote(note.id, { deleted: true });
                  setNotice("Moved to Trash. You can restore it there.");
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
        {palette === note.id && (
          <div className="palette">
            {colors.map((color) => (
              <button
                key={color}
                className={`swatch color-${color}`}
                aria-label={`Set ${color} color`}
                onClick={() => {
                  updateNote(note.id, { color });
                  setPalette(null);
                }}
              >
                {note.color === color && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </article>
    );
  }

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <button
            className="icon-button menu-button"
            aria-label="Toggle navigation"
            onClick={() => setSidebar(!sidebar)}
          >
            <Menu size={21} />
          </button>
          <div className="logo">
            <Lightbulb size={25} strokeWidth={1.8} />
          </div>
          <span>
            Keep<span className="brand-dot">.</span>
          </span>
        </div>
        <label className="search">
          <Search size={19} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your notes"
            aria-label="Search notes"
          />
          <span className="search-hint">A little less searching.</span>
          {query && (
            <button
              className="icon-button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <div className="header-actions">
          <span className="save-state">
            <span />
            {saveError ? "Not saved" : "All changes saved"}
          </span>
          <button
            className="icon-button"
            title={dark ? "Light mode" : "Dark mode"}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="avatar" title="Local notebook">
            Y
          </div>
        </div>
      </header>
      {sidebar && (
        <button
          className="sidebar-shade"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className={`sidebar ${sidebar ? "open" : ""}`}>
        <div className="nav-main">
          {[
            [Lightbulb, "Notes"],
            [Bell, "Reminders"],
          ].map(([Icon, name]) => (
            <button
              key={name}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => {
                setPage(name);
                setSidebar(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Notes" && (
                <small>
                  {notes.filter((n) => !n.deleted && !n.archived).length}
                </small>
              )}
            </button>
          ))}
        </div>
        <div className="nav-heading">YOUR LABELS</div>
        {["Personal", "Work", "Inspiration"].map((name, index) => (
          <button
            key={name}
            className={`nav-item ${page === name ? "active" : ""}`}
            onClick={() => {
              setPage(name);
              setSidebar(false);
            }}
          >
            <span className={`label-dot dot-${index}`} />
            <span>{name}</span>
          </button>
        ))}
        <div className="nav-divider" />
        {[
          [Archive, "Archive"],
          [Trash2, "Trash"],
          [Gamepad2, "Memory break"],
        ].map(([Icon, name]) => (
          <button
            key={name}
            className={`nav-item ${page === name ? "active" : ""}`}
            onClick={() => {
              setPage(name);
              setSidebar(false);
              if (name === "Memory break" && !cards.length) startGame();
            }}
          >
            <Icon size={19} />
            <span>{name}</span>
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="little-flower">✳</div>
          <p>
            A little clarity.
            <br />A little more possibility.
          </p>
          <span>Your thoughts, in a good place.</span>
          <div className="local-label">
            <span /> STORED ON THIS DEVICE
          </div>
        </div>
      </aside>
      <main>
        <div className="page-heading">
          <div>
            <div className="eyebrow">A LITTLE SPACE FOR YOUR MIND</div>
            <h1>{page === "Notes" ? "Good ideas start here." : page}</h1>
            <p>
              {page === "Notes"
                ? "Make room for a thought. Keep what matters."
                : page === "Reminders"
                  ? "A gentle nudge. Due reminders are highlighted here while Keep is open."
                  : page === "Memory break"
                    ? "Clear your mind. Find the matching pairs."
                    : page === "Trash"
                      ? "Changed your mind? Your notes can come back."
                      : "All your thoughts, a little more organized."}
            </p>
          </div>
          {page !== "Memory break" && (
            <div className="view-controls">
              <button
                aria-label="Grid view"
                className={`icon-button ${!listView ? "selected" : ""}`}
                onClick={() => setListView(false)}
              >
                <Grid2X2 size={18} />
              </button>
              <button
                aria-label="List view"
                className={`icon-button ${listView ? "selected" : ""}`}
                onClick={() => setListView(true)}
              >
                <List size={20} />
              </button>
            </div>
          )}
        </div>
        {page === "Memory break" ? (
          <section className="game">
            <div className="game-heading">
              <h2>
                {won
                  ? "A perfect little reset. You won! ✨"
                  : "A moment of focus"}
              </h2>
              <span>
                {moves} moves · {matched.length / 2}/6 pairs
              </span>
            </div>
            <div className="game-grid">
              {cards.map((card, index) => (
                <button
                  key={index}
                  className={`memory-card ${matched.includes(index) ? "matched" : ""}`}
                  aria-label={
                    flipped.includes(index) || matched.includes(index)
                      ? `Card ${index + 1}: ${card}`
                      : `Flip card ${index + 1}`
                  }
                  disabled={
                    matched.includes(index) ||
                    flipped.includes(index) ||
                    flipped.length === 2
                  }
                  onClick={() => {
                    setFlipped([...flipped, index]);
                    if (flipped.length === 1) setMoves(moves + 1);
                  }}
                >
                  {flipped.includes(index) || matched.includes(index) ? (
                    card
                  ) : (
                    <Lightbulb size={26} />
                  )}
                </button>
              ))}
            </div>
            <button className="primary-button" onClick={startGame}>
              <RotateCcw size={16} />
              New game
            </button>
          </section>
        ) : (
          <>
            {!["Archive", "Trash"].includes(page) && (
              <div className="composer">
                <button className="composer-trigger" onClick={() => newNote()}>
                  <Plus size={21} />
                  <span>Take a note. Capture a little inspiration…</span>
                </button>
                <button
                  className="icon-button"
                  title="New checklist"
                  aria-label="New checklist"
                  onClick={() => newNote(true)}
                >
                  <CheckSquare size={21} />
                </button>
                <div className="composer-divider" />
                <span className="composer-hint">Let it out.</span>
              </div>
            )}
            {saveError && (
              <p role="alert" className="error">
                Your browser could not save changes. Keep this tab open and free
                up browser storage.
              </p>
            )}
            {query && (
              <div className="results">
                {visible.length} {visible.length === 1 ? "note" : "notes"}{" "}
                matching “{query}”
              </div>
            )}
            {visible.length === 0 ? (
              <div className="empty">
                <Lightbulb size={45} strokeWidth={1} />
                <h2>
                  {query
                    ? "No thoughts found."
                    : "A little room for something new."}
                </h2>
                <p>
                  {query
                    ? "Try a different search."
                    : "Your notes will show up here."}
                </p>
              </div>
            ) : (
              <div className={listView ? "notes-area list-view" : "notes-area"}>
                {pinned.length > 0 && (
                  <section>
                    <h2 className="section-label">
                      <Pin size={12} />
                      PINNED <span>{pinned.length}</span>
                    </h2>
                    <div className="notes-grid">{pinned.map(renderNote)}</div>
                  </section>
                )}
                {others.length > 0 && (
                  <section>
                    <h2 className="section-label">
                      {pinned.length ? "EVERYTHING ELSE" : "YOUR NOTES"}
                      <span>{others.length}</span>
                    </h2>
                    <div className="notes-grid">{others.map(renderNote)}</div>
                  </section>
                )}
              </div>
            )}
            <footer>
              <span className="footer-flower">✳</span> A clear space. A creative
              mind.
            </footer>
          </>
        )}
      </main>
      <dialog
        ref={dialog}
        className={`editor-dialog ${dark ? "dark" : ""}`}
        onCancel={() => setDraft(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDraft(null);
        }}
      >
        {draft && (
          <form
            className={`editor color-${draft.color}`}
            onSubmit={saveNote}
            aria-label={draft.id ? "Edit note" : "Create note"}
          >
            <div className="editor-heading">
              <span>
                {draft.id
                  ? "A thought worth keeping"
                  : "Something on your mind?"}
              </span>
              <button
                type="button"
                className="icon-button"
                aria-label="Close editor"
                onClick={() => setDraft(null)}
              >
                <X size={20} />
              </button>
            </div>
            <input
              className="title-input"
              placeholder="Title"
              aria-label="Note title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              autoFocus
            />
            <textarea
              placeholder={
                draft.checklist
                  ? "One item per line…"
                  : "Let your thoughts out…"
              }
              aria-label={draft.checklist ? "Checklist items" : "Note text"}
              value={draft.checklist ? draft.checklistText : draft.body}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [draft.checklist ? "checklistText" : "body"]: e.target.value,
                })
              }
              rows={6}
            />
            <div className="editor-options">
              <label>
                <Tag size={15} />
                Label
                <select
                  value={draft.label || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, label: e.target.value })
                  }
                >
                  <option value="">No label</option>
                  <option>Personal</option>
                  <option>Work</option>
                  <option>Inspiration</option>
                </select>
              </label>
              <label>
                <Bell size={15} />
                Reminder
                <input
                  type="datetime-local"
                  aria-label="Reminder date and time"
                  value={draft.reminder || ""}
                  onInput={(e) =>
                    setDraft((current) => ({ ...current, reminder: e.target.value }))
                  }
                  onChange={(e) =>
                    setDraft({ ...draft, reminder: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="editor-footer">
              <div className="color-options">
                {colors.map((color) => (
                  <button
                    type="button"
                    className={`swatch color-${color}`}
                    key={color}
                    aria-label={`Choose ${color}`}
                    onClick={() => setDraft({ ...draft, color })}
                  >
                    {draft.color === color && <Check size={14} />}
                  </button>
                ))}
              </div>
              <button type="submit" className="primary-button">
                {draft.id ? "Save changes" : "Add note"}
                <Plus size={16} />
              </button>
            </div>
            {notice && (
              <p role="status" className="editor-notice">
                {notice}
              </p>
            )}
          </form>
        )}
      </dialog>
      {notice && !draft && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
