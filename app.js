/* =========================================================================
   GRZYBOWIT FIFA CUP — logika aplikacji (vanilla JS, bez build-stepu)
   Widoki: Start · Mecze · Tabela · Drabinka · Gracze · Turnieje · Dane
   Dane: localStorage (fifa15_turnieje_v3) + opcjonalny sync textdb.online
   ========================================================================= */
"use strict";

/* ============================ STAŁE ============================ */
const STORE_KEY = "fifa15_turnieje_v3";
const LAST_SAVE_KEY = "fifa15_last_save_v1";
const LEGACY_KEYS = ["fifa15_turnieje_v2", "fifaTurniej4"];
const DEFAULT_GAME = "FIFA 15";
const DEFAULT_ROSTER = ["Adi", "Maciek", "Mati", "Mikołaj"];
const PALETTE = [
  "#ffd166", "#ff5c7a", "#5aa9ff", "#3ddc97", "#b28dff", "#ff9f43",
  "#4ecdc4", "#f78fb3", "#a0e7e5", "#f6e58d", "#c56cf0", "#ff7979"
];
const FIFA_SERIES = ["FIFA 10", "FIFA 11", "FIFA 12", "FIFA 13", "FIFA 14",
  "FIFA 15", "FIFA 16", "FIFA 17", "FIFA 18", "FIFA 19", "FIFA 20",
  "FIFA 21", "FIFA 22", "FIFA 23"];
const FC_SERIES = ["EA SPORTS FC 24", "EA SPORTS FC 25", "EA SPORTS FC 26", "EA SPORTS FC 27"];
const FORMAT_LABEL = { league: "Liga", "league+cup": "Liga + puchar", cup: "Drabinka pucharowa" };
const STAGE_R1 = "Kolejka 1";
const STAGE_R2 = "Rewanże";
const STAGE_FINAL = "Finał";
const STAGE_THIRD = "o 3. miejsce";

const $ = id => document.getElementById(id);
const $$ = sel => Array.prototype.slice.call(document.querySelectorAll(sel));

/* ============================ IKONY ============================ */
const ICONS = {
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 4H5v3a3 3 0 0 0 3 3"/><path d="M16 4h3v3a3 3 0 0 1-3 3"/><path d="M12 12v5"/><path d="M8 21h8"/><path d="M9.5 21c0-2 1-4 2.5-4s2.5 2 2.5 4"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18"/><path d="M8 3v3M16 3v3"/></svg>',
  table: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M3 14.5h18M9.5 4v16"/></svg>',
  bracket: '<svg viewBox="0 0 24 24"><path d="M4 4h5v6H6"/><path d="M4 20h5v-6H6"/><path d="M9 7h4a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2h3"/><path d="M15 7h4M15 17h4"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.5"/><path d="M22 20v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.9-6.5"/><path d="M3 3.5v5h5"/><path d="M12 8v4.5l3 1.8"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5l12 7.5-12 7.5z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3.6 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.8z"/></svg>',
  activity: '<svg viewBox="0 0 24 24"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7"/><path d="M3 20h18"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  swords: '<svg viewBox="0 0 24 24"><path d="M14.5 3.5h6v6L10 20"/><path d="M9.5 3.5h-6v6L14 20"/><path d="M4 20l2.5-2.5M20 20l-2.5-2.5"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M7 4v14M7 18l-3-3M7 18l3-3"/><path d="M17 20V6M17 6l-3 3M17 6l3 3"/></svg>',
  user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path d="M7 19a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.5 1.4A3.5 3.5 0 0 1 17 19z"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M7 3v6h9"/><path d="M8 14h8v7H8z"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v13"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M19 6H5M10 3h4l1 3H9z"/><path d="M6.5 6l1 15h9l1-15"/><path d="M10 11v6M14 11v6"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v5h-5"/></svg>',
  dice: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.3"/><circle cx="15.5" cy="8.5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="8.5" cy="15.5" r="1.3"/><circle cx="15.5" cy="15.5" r="1.3"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  gamepad: '<svg viewBox="0 0 24 24"><path d="M7 12h4M9 10v4"/><circle cx="15.5" cy="11" r="1"/><circle cx="17.5" cy="13.5" r="1"/><rect x="2" y="6" width="20" height="12" rx="5"/></svg>',
  medal: '<svg viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"/><path d="M8.5 10.5 6 3h5l2 6"/><path d="M15.5 10.5 18 3h-5"/></svg>',
  trash2: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>'
};
function ic(name) { return ICONS[name] || ""; }
function hydrateIcons(root) {
  (root || document).querySelectorAll("[data-ico]").forEach(el => {
    const n = el.getAttribute("data-ico");
    if (ICONS[n] && el.getAttribute("data-ico-done") !== n) {
      el.innerHTML = ICONS[n];
      el.setAttribute("data-ico-done", n);
    }
  });
}

/* ============================ POMOCNICZE ============================ */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function pname(p) { return String(p == null ? "" : p).trim(); }
function uid() { return Math.random().toString(36).slice(2, 10); }
function clampInt(v, min, max) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}
function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function fmtDate(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? (m[3] + "." + m[2] + "." + m[1]) : (iso || "—");
}
function initials(name) {
  const s = pname(name);
  if (!s) return "?";
  const parts = s.split(/\s+/);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (s.length === 1) return s.toUpperCase();
  return (s[0] + s[Math.floor(s.length / 2)]).toUpperCase();
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (n === 1) return one;
  if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return few;
  return many;
}
function csvEscape(v) {
  const s = String(v == null ? "" : v);
  return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function toCsv(rows) {
  return "\uFEFF" + rows.map(r => r.map(csvEscape).join(";")).join("\r\n");
}
function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function uniquePush(arr, v) { if (v && arr.indexOf(v) === -1) arr.push(v); }

/* ============================ STAN / MIGRACJA ============================ */
function knownFirstTour(id) {
  return {
    id: id || uid(),
    name: "FIFA 15",
    game: DEFAULT_GAME,
    date: "2026-10-13",
    players: ["Maciek", "Mati", "Mikołaj", "Adi"],
    format: "league+cup",
    points: { win: 3, draw: 1 },
    round1: [
      { h: "Maciek", a: "Mati", hs: 5, as: 4 },
      { h: "Adi", a: "Mikołaj", hs: 1, as: 3 },
      { h: "Mati", a: "Mikołaj", hs: 3, as: 1 },
      { h: "Maciek", a: "Adi", hs: 1, as: 4 },
      { h: "Adi", a: "Mati", hs: 2, as: 1 },
      { h: "Mikołaj", a: "Maciek", hs: 4, as: 5 }
    ],
    round2: [
      { h: "Maciek", a: "Mikołaj", hs: 0, as: 2 },
      { h: "Adi", a: "Maciek", hs: 5, as: 3 },
      { h: "Mikołaj", a: "Mati", hs: 7, as: 1 },
      { h: "Mati", a: "Maciek", hs: 6, as: 2 },
      { h: "Mikołaj", a: "Adi", hs: 2, as: 1 },
      { h: "Mati", a: "Adi", hs: 3, as: 2 }
    ],
    drawn: true,
    round1Drawn: true,
    final: { hs: 2, as: 3, pen: null },
    third: { hs: 4, as: 3, pen: null },
    cupRounds: null,
    cupThird: null
  };
}
function defaultState() {
  const tour = knownFirstTour();
  const colors = {};
  tour.players.forEach((p, i) => { colors[p] = PALETTE[i % PALETTE.length]; });
  return { tournaments: [tour], currentId: tour.id, colors: colors, roster: DEFAULT_ROSTER.slice(), games: [] };
}
function safeParse(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch (e) { return null; }
}
function emptyStat(name) {
  return { name: pname(name), m: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, gd: 0, winPct: 0, avgGf: 0, avgGa: 0, titles: 0, tours: 0 };
}
function fixMatch(m) {
  if (!m) return m;
  if (m.h === undefined) m.h = null;
  if (m.a === undefined) m.a = null;
  if (m.hs === undefined) m.hs = null;
  if (m.as === undefined) m.as = null;
  if (m.pen === undefined) m.pen = null;
  return m;
}
function ensureColors(s) {
  if (!s.colors || typeof s.colors !== "object") s.colors = {};
  const add = p => {
    const n = pname(p);
    if (n && !s.colors[n]) s.colors[n] = PALETTE[Object.keys(s.colors).length % PALETTE.length];
  };
  (s.tournaments || []).forEach(t => (t.players || []).forEach(add));
  (s.roster || []).forEach(add);
  return s;
}
function normalizeState(s) {
  if (!s || typeof s !== "object") return s;
  if (!Array.isArray(s.tournaments)) s.tournaments = [];
  if (!Array.isArray(s.games)) s.games = [];
  s.tournaments.forEach(t => {
    if (!t.id) t.id = uid();
    if (!t.game) t.game = DEFAULT_GAME;
    if (!t.date) t.date = todayISO();
    if (typeof t.name !== "string" || !t.name.trim()) t.name = "Turniej";
    if (!Array.isArray(t.players)) t.players = [];
    if (t.format !== "league" && t.format !== "league+cup" && t.format !== "cup") {
      t.format = (Array.isArray(t.cupRounds) && t.cupRounds.length) ? "cup" : "league+cup";
    }
    if (!t.points || typeof t.points.win !== "number" || typeof t.points.draw !== "number") {
      t.points = { win: 3, draw: 1 };
    }
    if (!Array.isArray(t.round1)) t.round1 = [];
    if (!Array.isArray(t.round2)) t.round2 = [];
    t.round1.forEach(fixMatch);
    t.round2.forEach(fixMatch);
    if (!t.final) t.final = { h: null, a: null, hs: null, as: null, pen: null };
    fixMatch(t.final);
    if (!t.third) t.third = { h: null, a: null, hs: null, as: null, pen: null };
    fixMatch(t.third);
    if (Array.isArray(t.cupRounds)) {
      t.cupRounds.forEach(r => {
        if (!r || typeof r !== "object") return;
        if (typeof r.name !== "string") r.name = "";
        if (!Array.isArray(r.matches)) r.matches = [];
        r.matches.forEach(fixMatch);
      });
    } else { t.cupRounds = null; }
    if (t.cupThird) fixMatch(t.cupThird); else t.cupThird = null;
    if (t.format === "cup" && (!t.cupRounds || !t.cupRounds.length) && t.players.length >= 2) {
      t.cupRounds = buildCup(t.players);
      t.cupRounds.forEach(fixMatch);
    }
  });
  if (s.tournaments.length && !s.tournaments.some(t => t.id === s.currentId)) {
    s.currentId = s.tournaments[0].id;
  }
  if (!Array.isArray(s.roster) || !s.roster.length) {
    const set = [];
    s.tournaments.forEach(t => (t.players || []).forEach(p => uniquePush(set, pname(p))));
    s.roster = set.length ? set : DEFAULT_ROSTER.slice();
  } else {
    s.roster = s.roster.map(pname).filter(Boolean);
  }
  return ensureColors(s);
}
function countPlayed(s) {
  let n = 0;
  (s.tournaments || []).forEach(t => allMatches(t).forEach(m => { if (isPlayed(m)) n++; }));
  return n;
}
function convertLegacy(s) {
  if (!s || typeof s !== "object") return null;
  if (Array.isArray(s.tournaments) && s.tournaments.length) {
    return normalizeState({
      tournaments: s.tournaments,
      currentId: s.currentId,
      colors: s.colors,
      roster: s.roster,
      games: s.games
    });
  }
  const r1 = s.round1 || s.round1List || null;
  if (Array.isArray(r1)) {
    const players = [];
    const r2 = s.round2 || s.round2List || [];
    r1.concat(r2).forEach(m => {
      if (!m) return;
      uniquePush(players, pname(m.h));
      uniquePush(players, pname(m.a));
    });
    if (!players.length) return null;
    const id = uid();
    const tour = {
      id: id,
      name: s.name || "FIFA 15",
      game: s.game || DEFAULT_GAME,
      date: s.date || "2026-10-13",
      players: players,
      format: "league+cup",
      points: { win: 3, draw: 1 },
      round1: r1.map(m => ({ h: pname(m.h), a: pname(m.a), hs: m.hs == null ? null : m.hs, as: m.as == null ? null : m.as })),
      round2: r2.map(m => ({ h: pname(m.h), a: pname(m.a), hs: m.hs == null ? null : m.hs, as: m.as == null ? null : m.as })),
      drawn: !!s.drawn,
      round1Drawn: true,
      final: { hs: (s.final && s.final.hs) == null ? null : s.final.hs, as: (s.final && s.final.as) == null ? null : s.final.as, pen: null },
      third: { hs: (s.third && s.third.hs) == null ? null : s.third.hs, as: (s.third && s.third.as) == null ? null : s.third.as, pen: null },
      cupRounds: null,
      cupThird: null
    };
    return normalizeState({ tournaments: [tour], currentId: id, colors: {}, roster: players, games: [] });
  }
  return null;
}
function bestLegacy() {
  let best = null, bestCount = 0;
  LEGACY_KEYS.forEach(key => {
    const conv = convertLegacy(safeParse(key));
    if (!conv) return;
    const c = countPlayed(conv);
    if (c > bestCount) { best = conv; bestCount = c; }
  });
  return { state: best, played: bestCount };
}
function restoreKnownFirst(s) {
  let changed = false;
  (s.tournaments || []).forEach(t => {
    if (t.name !== "FIFA 15" || t.date !== "2026-10-13") return;
    const played = (t.round1 || []).concat(t.round2 || []).filter(isPlayed).length;
    if (played > 2) return;
    const fixed = knownFirstTour(t.id);
    t.players = fixed.players.slice();
    t.round1 = fixed.round1;
    t.round2 = fixed.round2;
    t.format = "league+cup";
    t.points = fixed.points;
    t.drawn = true;
    if (!t.final || (t.final.hs == null && t.final.as == null)) t.final = fixed.final;
    if (!t.third || (t.third.hs == null && t.third.as == null)) t.third = fixed.third;
    changed = true;
  });
  return changed;
}
function load() {
  const current = safeParse(STORE_KEY);
  if (current && Array.isArray(current.tournaments)) {
    normalizeState(current);
    restoreKnownFirst(current);
    const curPlayed = countPlayed(current);
    const lg = bestLegacy();
    if (lg.state && lg.played > curPlayed) return lg.state;
    return current;
  }
  const lg = bestLegacy();
  return lg.state || defaultState();
}

let state = load();
let syncApplying = false;

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    localStorage.setItem(LAST_SAVE_KEY, String(Date.now()));
  } catch (e) { /* brak miejsca / tryb prywatny */ }
  updateLastSaved();
  if (!syncApplying) cloudMarkDirty();
}
function T() {
  if (!state.tournaments.length) return null;
  return state.tournaments.filter(t => t.id === state.currentId)[0] || state.tournaments[0];
}
function colorOf(name) {
  const n = pname(name);
  if (!n) return PALETTE[0];
  if (!state.colors[n]) state.colors[n] = PALETTE[Object.keys(state.colors).length % PALETTE.length];
  return state.colors[n];
}
function avatar(name, big) {
  const n = pname(name);
  return '<span class="avatar' + (big ? " big" : "") + '" style="background:' + colorOf(n) + '">' + esc(initials(n)) + "</span>";
}
function avatarBox(name, cls) {
  const n = pname(name);
  return '<span class="' + cls + '" style="background:' + colorOf(n) + '">' + esc(initials(n)) + "</span>";
}
function ptsOf(t) {
  if (t && t.points && typeof t.points.win === "number") return t.points;
  return { win: 3, draw: 1 };
}
function isRoster(name) { return (state.roster || []).indexOf(pname(name)) !== -1; }
function allPlayers() {
  const set = [];
  (state.roster || []).forEach(p => uniquePush(set, pname(p)));
  state.tournaments.forEach(t => (t.players || []).forEach(p => uniquePush(set, pname(p))));
  return set;
}
function gamesUsed() {
  const set = [];
  state.tournaments.forEach(t => uniquePush(set, t.game));
  return set.filter(Boolean);
}
function gameList() {
  const set = gamesUsed();
  (state.games || []).forEach(g => uniquePush(set, pname(g)));
  return set;
}

/* ============================ TERMINARZ / PUCHAR ============================ */
function roundRobin(players) {
  const list = players.slice();
  if (list.length % 2) list.push(null);
  const n = list.length;
  const pairs = [];
  const arr = list.slice();
  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a && b) pairs.push([a, b]);
    }
    if (n > 2) arr.splice(1, 0, arr.pop());
  }
  return pairs;
}
function leagueSchedule(players) {
  const pairs = roundRobin(players).map(p => (Math.random() < 0.5 ? [p[0], p[1]] : [p[1], p[0]]));
  const r1 = shuffle(pairs);
  const r2 = shuffle(r1.map(p => [p[1], p[0]]));
  const mk = p => ({ h: p[0], a: p[1], hs: null, as: null, pen: null });
  return { round1: r1.map(mk), round2: r2.map(mk) };
}
function bracketOrder(size) {
  let arr = [1, 2];
  while (arr.length < size) {
    const next = [];
    const total = arr.length * 2 + 1;
    arr.forEach(s => { next.push(s); next.push(total - s); });
    arr = next;
  }
  return arr;
}
function cupRoundLabel(matches) {
  if (matches >= 16) return "1/" + (matches * 2) + " finału";
  if (matches === 8) return "1/8 finału";
  if (matches === 4) return "Ćwierćfinały";
  if (matches === 2) return "Półfinały";
  return "Finał";
}
function buildCup(players) {
  const list = shuffle(players.slice());
  let size = 2;
  while (size < list.length) size *= 2;
  const order = bracketOrder(size);
  const bySeed = {};
  list.forEach((p, i) => { bySeed[i + 1] = p; });
  const matches = [];
  for (let k = 0; k < order.length; k += 2) {
    matches.push({ h: bySeed[order[k]] || null, a: bySeed[order[k + 1]] || null, hs: null, as: null, pen: null });
  }
  const rounds = [{ name: cupRoundLabel(matches.length), matches: matches }];
  let cnt = matches.length;
  while (cnt > 1) {
    cnt = cnt / 2;
    rounds.push({
      name: cupRoundLabel(cnt),
      matches: Array.apply(null, Array(cnt)).map(() => ({ h: null, a: null, hs: null, as: null, pen: null }))
    });
  }
  return rounds;
}
function cupWinnerOf(m) {
  if (!isPlayed(m) || !m.h || !m.a) return null;
  if (m.hs > m.as) return m.h;
  if (m.as > m.hs) return m.a;
  if (m.pen === "h") return m.h;
  if (m.pen === "a") return m.a;
  return null;
}
function cupLoserOf(m) {
  if (!isPlayed(m) || !m.h || !m.a) return null;
  if (m.hs > m.as) return m.a;
  if (m.as > m.hs) return m.h;
  if (m.pen === "h") return m.a;
  if (m.pen === "a") return m.h;
  return null;
}
function pairWinner(pair) {
  if (!pair || !pair.h || !pair.a) return null;
  const m = pair.m;
  if (!isPlayed(m)) return null;
  if (m.hs > m.as) return pair.h;
  if (m.as > m.hs) return pair.a;
  if (m.pen === "h") return pair.h;
  if (m.pen === "a") return pair.a;
  return null;
}
function pairLoser(pair) {
  const w = pairWinner(pair);
  if (!w) return null;
  return w === pair.h ? pair.a : pair.h;
}
function advanceCup(t) {
  if (!t || !Array.isArray(t.cupRounds)) return;
  for (let ri = 1; ri < t.cupRounds.length; ri++) {
    const prev = t.cupRounds[ri - 1].matches;
    const cur = t.cupRounds[ri].matches;
    for (let i = 0; i < cur.length; i++) {
      const h = prev[i * 2] ? cupWinnerOf(prev[i * 2]) : null;
      const a = prev[i * 2 + 1] ? cupWinnerOf(prev[i * 2 + 1]) : null;
      const m = cur[i];
      if (m.h !== h || m.a !== a) {
        if (m.h != null || m.a != null) { m.hs = null; m.as = null; m.pen = null; }
        m.h = h; m.a = a;
      }
    }
  }
  let semi = null;
  t.cupRounds.forEach(r => { if (r.matches.length === 2) semi = r.matches; });
  if (semi && t.cupRounds.length > 1) {
    const h = semi[0] ? cupLoserOf(semi[0]) : null;
    const a = semi[1] ? cupLoserOf(semi[1]) : null;
    if (!t.cupThird) t.cupThird = { h: null, a: null, hs: null, as: null, pen: null };
    if (t.cupThird.h !== h || t.cupThird.a !== a) {
      if (t.cupThird.h != null || t.cupThird.a != null) { t.cupThird.hs = null; t.cupThird.as = null; t.cupThird.pen = null; }
      t.cupThird.h = h; t.cupThird.a = a;
    }
  }
}
function cupSignature(t) {
  if (!t || !t.cupRounds) return "";
  let s = t.cupRounds.map(r => r.matches.map(m => (m.h || "-") + "|" + (m.a || "-")).join(",")).join("/");
  if (t.cupThird) s += "|" + (t.cupThird.h || "") + "|" + (t.cupThird.a || "");
  return s;
}

/* ============================ OBLICZENIA ============================ */
function isPlayed(m) { return !!m && m.hs != null && m.as != null; }
function isCupFormat(t) { return !!t && (t.format === "cup" || t.format === "league+cup"); }
function isLeagueStage(stage) { return stage === STAGE_R1 || stage === STAGE_R2; }
function leagueMatches(t) { return (t.round1 || []).concat(t.round2 || []); }
function roundComplete(list) { return list.length > 0 && list.every(isPlayed); }
function leagueComplete(t) { return !!t && roundComplete(t.round1 || []) && roundComplete(t.round2 || []); }
function playoffPair(t) {
  const rows = t.format === "cup" ? [] : computeTable(t, "h2h");
  return {
    final: { h: rows[0] ? rows[0].name : null, a: rows[1] ? rows[1].name : null, m: t.final },
    third: { h: rows[2] ? rows[2].name : null, a: rows[3] ? rows[3].name : null, m: t.third }
  };
}

function addMatch(st, m, pw, pd) {
  if (!isPlayed(m)) return;
  const H = st[m.h], A = st[m.a];
  if (!H || !A) return;
  H.m++; A.m++;
  H.gf += m.hs; H.ga += m.as;
  A.gf += m.as; A.ga += m.hs;
  if (m.hs > m.as) { H.w++; A.l++; H.pts += pw; }
  else if (m.hs < m.as) { A.w++; H.l++; A.pts += pw; }
  else { H.d++; A.d++; H.pts += pd; A.pts += pd; }
}
function h2hPair(t, p1, p2) {
  const r = { pts1: 0, gd1: 0, gf1: 0, pts2: 0, gd2: 0, gf2: 0 };
  const pw = ptsOf(t).win, pd = ptsOf(t).draw;
  leagueMatches(t).forEach(m => {
    if (!isPlayed(m)) return;
    let gf1 = null, ga1 = null;
    if (m.h === p1 && m.a === p2) { gf1 = m.hs; ga1 = m.as; }
    else if (m.h === p2 && m.a === p1) { gf1 = m.as; ga1 = m.hs; }
    else return;
    r.gf1 += gf1; r.gd1 += gf1 - ga1; r.gf2 += ga1; r.gd2 += ga1 - gf1;
    if (gf1 > ga1) r.pts1 += ptsOf(t).win;
    else if (gf1 < ga1) r.pts2 += ptsOf(t).win;
    else { r.pts1 += pd; r.pts2 += pd; }
  });
  return r;
}
function h2hPairWith(t, a, b) { return h2hPair(t, a.name, b.name); }

function computeTable(t, crit) {
  crit = crit || "h2h";
  const st = {};
  (t.players || []).forEach(p => { st[p] = emptyStat(p); });
  const pw = ptsOf(t).win, pd = ptsOf(t).draw;
  leagueMatches(t).forEach(m => addMatch(st, m, pw, pd));
  const rows = Object.keys(st).map(k => st[k]);
  rows.forEach(p => {
    p.gd = p.gf - p.ga;
    p.winPct = p.m ? Math.round((p.w / p.m) * 100) : 0;
  });
  const norm = (crit === "h2h-fifa") ? "gd" : crit;
  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (norm === "played") {
      if (b.gf !== a.gf) return b.gf - a.gf;
    } else if (norm === "gd") {
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
    } else {
      if (b.gd !== a.gd) return b.gd - a.gd;
      const h = h2hPair(t, a.name, b.name);
      if (h.pts2 !== h.pts1) return h.pts2 - h.pts1;
      if (h.gd2 !== h.gd1) return h.gd2 - h.gd1;
      if (b.gf !== a.gf) return b.gf - a.gf;
    }
    return a.name.localeCompare(b.name, "pl");
  });
  return rows;
}

function allMatches(t) {
  if (!t) return [];
  if (t.format === "cup") {
    const list = [];
    (t.cupRounds || []).forEach((r, ri) => {
      (r.matches || []).forEach((m, mi) => {
        list.push({ h: m.h, a: m.a, hs: m.hs, as: m.as, pen: m.pen, stage: r.name, cup: true, r: "mc", round: ri, i: mi });
      });
    });
    if (t.cupThird) list.push({ h: t.cupThird.h, a: t.cupThird.a, hs: t.cupThird.hs, as: t.cupThird.as, pen: t.cupThird.pen, stage: STAGE_THIRD, cup: true });
    return list;
  }
  const list = (t.round1 || []).map(m => ({ h: m.h, a: m.a, hs: m.hs, as: m.as, pen: m.pen, stage: STAGE_R1, cup: false }))
    .concat((t.round2 || []).map(m => ({ h: m.h, a: m.a, hs: m.hs, as: m.as, pen: m.pen, stage: STAGE_R2, cup: false })));
  if (t.format === "league+cup") {
    const pp = playoffPair(t);
    if (pp.final.h && pp.final.a) {
      list.push({ h: pp.final.h, a: pp.final.a, hs: pp.final.m.hs, as: pp.final.m.as, pen: pp.final.m.pen, stage: STAGE_FINAL, cup: true });
    }
    if (pp.final.h && pp.final.a && pp.third.h && pp.third.a) {
      list.push({ h: pp.third.h, a: pp.third.a, hs: pp.third.m.hs, as: pp.third.m.as, pen: pp.third.m.pen, stage: STAGE_THIRD, cup: true });
    }
  }
  return list;
}
function championOf(t) {
  const out = { champion: null, second: null, third: null, fourth: null };
  if (!t) return out;
  if (t.format === "cup") {
    const rounds = t.cupRounds || [];
    const fin = rounds.length ? rounds[rounds.length - 1].matches[0] : null;
    out.champion = cupWinnerOf(fin);
    out.second = cupLoserOf(fin);
    if (t.cupThird) { out.third = cupWinnerOf(t.cupThird); out.fourth = cupLoserOf(t.cupThird); }
    return out;
  }
  if (t.format === "league") {
    if (leagueComplete(t)) {
      const rows = computeTable(t, "h2h");
      out.champion = rows[0] ? rows[0].name : null;
      out.second = rows[1] ? rows[1].name : null;
      out.third = rows[2] ? rows[2].name : null;
      out.fourth = rows[3] ? rows[3].name : null;
    }
    return out;
  }
  const pp = playoffPair(t);
  out.champion = pairWinner(pp.final);
  out.second = pairLoser(pp.final);
  out.third = pairWinner(pp.third);
  out.fourth = pairLoser(pp.third);
  return out;
}
function isComplete(t) {
  if (!t) return false;
  if (t.format === "cup") return !!championOf(t).champion;
  if (t.format === "league") return leagueComplete(t);
  return leagueComplete(t) && isPlayed(t.final);
}
function progress(t) {
  if (!t) return { played: 0, total: 0 };
  const ready = allMatches(t).filter(m => m.h && m.a);
  return { played: ready.filter(isPlayed).length, total: ready.length };
}
function nextMatch(t) {
  const list = allMatches(t);
  for (let i = 0; i < list.length; i++) {
    if (!isPlayed(list[i]) && list[i].h && list[i].a) return list[i];
  }
  return null;
}

function matchPasses(t, m, opts) {
  if (!m.h || !m.a) return false;
  if (opts.stage === "liga" && m.cup) return false;
  if (opts.stage === "puchar" && !m.cup) return false;
  const d = t.date || "";
  if (opts.from && d && d < opts.from) return false;
  if (opts.to && d && d > opts.to) return false;
  return true;
}
function playerStats(opts) {
  opts = opts || {};
  const st = {};
  const ensure = n => {
    const k = pname(n);
    if (!st[k]) st[k] = emptyStat(k);
    return st[k];
  };
  const tours = state.tournaments.filter(t => (!opts.game || t.game === opts.game) && (!opts.tourId || t.id === opts.tourId));
  (state.roster || []).forEach(ensure);
  tours.forEach(t => (t.players || []).forEach(ensure));
  tours.forEach(t => {
    const seen = {};
    (t.players || []).forEach(p => { const k = pname(p); if (!seen[k]) { ensure(k).tours++; seen[k] = 1; } });
    allMatches(t).forEach(m => {
      if (!matchPasses(t, m, opts)) return;
      addMatch(st, m, ptsOf(t).win, ptsOf(t).draw);
    });
    const c = championOf(t);
    if (c.champion) ensure(c.champion).titles++;
  });
  const rows = Object.keys(st).map(k => st[k]);
  rows.forEach(p => {
    p.gd = p.gf - p.ga;
    p.winPct = p.m ? Math.round((p.w / p.m) * 100) : 0;
    p.avgGf = p.m ? p.gf / p.m : 0;
    p.avgGa = p.m ? p.ga / p.m : 0;
  });
  rows.sort((a, b) => (b.titles - a.titles) || (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf) || a.name.localeCompare(b.name, "pl"));
  return rows;
}
function h2hStats2(a, b, opts) {
  opts = opts || {};
  const r = { a: a, b: b, m: 0, wa: 0, d: 0, wb: 0, gfa: 0, gfb: 0, games: [] };
  state.tournaments.forEach(t => {
    if (opts.game && t.game !== opts.game) return;
    if (opts.tourId && t.id !== opts.tourId) return;
    allMatches(t).forEach(m => {
      if (!isPlayed(m)) return;
      if (opts.stage === "liga" && !isLeagueStage(m.stage)) return;
      if (opts.stage === "puchar" && isLeagueStage(m.stage)) return;
      const d = t.date || "";
      if (opts.from && d && d < opts.from) return;
      if (opts.to && d && d > opts.to) return;
      const isAB = m.h === a && m.a === b, isBA = m.h === b && m.a === a;
      if (!isAB && !isBA) return;
      r.m++;
      const ga = isAB ? m.hs : m.as, gb = isAB ? m.as : m.hs;
      r.gfa += ga; r.gfb += gb;
      if (ga > gb) r.wa++; else if (ga < gb) r.wb++; else r.d++;
      r.games.push({ date: t.date, tour: t.name, game: t.game, stage: m.stage, a: ga, b: gb });
    });
  });
  r.games.sort((x, y) => String(x.date || "").localeCompare(String(y.date || "")));
  return r;
}
function recentMatches(name, limit, opts) {
  opts = opts || {};
  const out = [];
  state.tournaments.forEach(t => {
    if (opts.game && t.game !== opts.game) return;
    allMatches(t).forEach(m => {
      if (!isPlayed(m)) return;
      if (m.h !== name && m.a !== name) return;
      const gf = m.h === name ? m.hs : m.as;
      const ga = m.h === name ? m.as : m.hs;
      out.push({
        date: t.date, tour: t.name, game: t.game, stage: m.stage,
        opp: m.h === name ? m.a : m.h, gf: gf, ga: ga,
        res: gf > ga ? "W" : (gf < ga ? "P" : "R")
      });
    });
  });
  out.sort((x, y) => String(y.date || "").localeCompare(String(x.date || "")));
  return out.slice(0, limit || 12);
}
function currentForm(name, n) {
  return recentMatches(name, n || 5).slice().reverse().map(m => m.res);
}
function streakOf(name) {
  const rec = recentMatches(name, 50);
  if (!rec.length) return { res: null, len: 0 };
  const res = rec[0].res;
  let len = 1;
  for (let i = 1; i < rec.length; i++) { if (rec[i].res === res) len++; else break; }
  return { res: res, len: len };
}
function playerTourHistory(name) {
  const out = [];
  state.tournaments.forEach(t => {
    if ((t.players || []).indexOf(name) === -1) return;
    const rows = t.format === "cup" ? [] : computeTable(t, "h2h");
    let pos = null;
    for (let i = 0; i < rows.length; i++) if (rows[i].name === name) pos = i + 1;
    const champ = championOf(t);
    const tmp = {};
    tmp[name] = emptyStat(name);
    allMatches(t).forEach(m => {
      if (m.h !== name && m.a !== name) return;
      addMatch(tmp, m, ptsOf(t).win, ptsOf(t).draw);
    });
    const s = tmp[name];
    out.push({
      id: t.id, name: t.name, game: t.game, date: t.date, format: t.format,
      pos: pos, champion: champ.champion === name,
      m: s.m, w: s.w, d: s.d, l: s.l, gf: s.gf, ga: s.ga, pts: s.pts
    });
  });
  out.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  return out;
}
function perGameFor(name) {
  return gamesUsed().map(g => {
    const p = playerStats({ game: g }).filter(x => x.name === name)[0];
    return { game: g, p: p };
  }).filter(x => x.p && x.p.m > 0);
}
function sortRows(rows, key, dir, fields) {
  if (!key || !fields[key]) return rows.slice();
  const f = fields[key];
  const idx = {};
  rows.forEach((r, i) => { idx[i] = r; });
  const order = {};
  rows.forEach((r, i) => { order[r.name + "#" + i] = i; });
  const base = rows.map((r, i) => ({ r: r, i: i }));
  base.sort((A, B) => {
    const va = f(A.r), vb = f(B.r);
    let c;
    if (typeof va === "string" || typeof vb === "string") c = String(va).localeCompare(String(vb), "pl");
    else c = (va || 0) - (vb || 0);
    if (c === 0) return A.i - B.i;
    return c * dir;
  });
  return base.map(x => x.r);
}

/* ============================ UI: TOAST / MODALE ============================ */
let toastTimer = null;
function toast(msg, kind) {
  const el = $("toast");
  if (!el) return;
  el.className = "toast " + (kind || "info");
  el.textContent = msg;
  el.classList.remove("hidden");
  void el.offsetWidth;
  el.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("show");
    toastTimer = setTimeout(() => el.classList.add("hidden"), 260);
  }, 2600);
}
let confirmResolver = null;
function askConfirm(text, okLabel, title) {
  const ov = $("confirmOverlay");
  if (!ov) return Promise.resolve(window.confirm(text));
  $("confirmTitle").textContent = title || "Potwierdź";
  $("confirmText").textContent = text;
  $("confirmOk").textContent = okLabel || "Potwierdź";
  ov.classList.remove("hidden");
  return new Promise(res => { confirmResolver = res; });
}
function closeConfirm(v) {
  const ov = $("confirmOverlay");
  if (ov) ov.classList.add("hidden");
  if (confirmResolver) { const r = confirmResolver; confirmResolver = null; r(v); }
}
function openOverlay(id) { const el = $(id); if (el) el.classList.remove("hidden"); }
function closeOverlay(id) { const el = $(id); if (el) el.classList.add("hidden"); }
function openOverlays() { return $$(".overlay").filter(o => !o.classList.contains("hidden")); }

/* ============================ NAWIGACJA ============================ */
let currentView = "home";
function switchView(name) {
  currentView = name;
  $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.getAttribute("data-view") === name));
  if (name === "players") renderPlayers();
  if (name === "tournaments") renderTournaments();
  if (name === "matches") renderMatches();
  if (name === "standings") renderStandings();
  if (name === "bracket") renderBracket();
  if (name === "home") renderHome();
  try { window.scrollTo({ top: 0, behavior: "auto" }); } catch (e) { window.scrollTo(0, 0); }
}
function renderAll() {
  renderTopbar();
  populateFilters();
  renderHome();
  renderMatches();
  renderStandings();
  renderBracket();
  renderPlayers();
  renderTournaments();
  updateLastSaved();
  hydrateIcons(document);
}

/* ============================ RENDER: TOPBAR ============================ */
function renderTopbar() {
  const t = T();
  const sel = $("tourSelect");
  if (sel) {
    sel.innerHTML = state.tournaments.length
      ? state.tournaments.map(x => '<option value="' + esc(x.id) + '"' + (x.id === state.currentId ? " selected" : "") + ">" + esc(x.name) + " · " + esc(fmtDate(x.date)) + "</option>").join("")
      : '<option value="">— brak turniejów —</option>';
  }
  const bg = $("brandGame");
  if (bg) bg.textContent = t ? (t.game || DEFAULT_GAME) : "GRZYBOWIT FIFA CUP";
  const bd = $("brandDate");
  if (bd) bd.textContent = t ? fmtDate(t.date) : "";
  const st = $("tourStatus");
  if (st) {
    const done = t && isComplete(t);
    st.textContent = t ? (done ? "Zakończony" : "W trakcie") : "—";
    st.className = "badge" + (done ? " badge-live" : "");
  }
  const sub = $("tourSub");
  if (sub) {
    if (t) {
      const pr = progress(t);
      sub.textContent = (t.game || DEFAULT_GAME) + " · " + (t.players || []).length + " graczy · " + (FORMAT_LABEL[t.format] || "Liga") + " · meczów " + pr.played + "/" + pr.total;
    } else {
      sub.textContent = "Brak turniejów — utwórz pierwszy, aby zacząć.";
    }
  }
}

/* ============================ RENDER: START ============================ */
function setTxt(id, v) { const el = $(id); if (el) el.textContent = v; }

function renderHome() {
  const t = T();
  const empty = $("homeEmpty");
  const content = $("homeContent");
  if (!t) {
    if (empty) empty.classList.remove("hidden");
    if (content) content.classList.add("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  if (content) content.classList.remove("hidden");

  let totalMatches = 0;
  state.tournaments.forEach(x => { totalMatches += allMatches(x).filter(isPlayed).length; });
  const playerSet = [];
  state.tournaments.forEach(x => (x.players || []).forEach(p => uniquePush(playerSet, pname(p))));
  (state.roster || []).forEach(p => uniquePush(playerSet, pname(p)));
  const titles = state.tournaments.filter(x => !!championOf(x).champion).length;

  setTxt("statTours", state.tournaments.length);
  setTxt("statMatches", totalMatches);
  setTxt("statPlayers", playerSet.length);
  setTxt("statTitles", titles);

  setTxt("heroGame", t.game || DEFAULT_GAME);
  setTxt("heroTourName", t.name);
  setTxt("heroTourStatus", isComplete(t) ? "Zakończony" : "W trakcie");

  const pr = progress(t);
  const champ = championOf(t);
  const rows = t.format === "cup" ? [] : computeTable(t, "h2h");

  setTxt("homeStatus", isComplete(t) ? "Zakończony" : "W trakcie");
  setTxt("homeName", t.name);
  setTxt("homeMeta", (t.game || DEFAULT_GAME) + " · " + fmtDate(t.date) + " · " + (FORMAT_LABEL[t.format] || "Liga"));
  setTxt("homePlayers", (t.players || []).length);
  setTxt("homePlayed", pr.played + " / " + pr.total);
  setTxt("homeLeader", rows.length ? rows[0].name : "—");
  setTxt("homeChamp", champ.champion || "—");

  const nx = $("homeNext");
  if (nx) {
    if (isComplete(t)) {
      nx.innerHTML = "<b>Turniej zakończony</b> — mistrz: <b>" + esc(champ.champion || "—") + "</b> 🏆";
    } else {
      const m = nextMatch(t);
      nx.innerHTML = m
        ? "Następny mecz: <b>" + esc((m.h || "?") + " vs " + (m.a || "?")) + "</b> · " + esc(m.stage || "")
        : "Wszystkie mecze rozegrane — czekamy na dalszy etap.";
    }
  }
  renderHOF();
  renderRecent();
  renderHomeTop();
}
function renderHOF() {
  const box = $("hofBody");
  const badge = $("hofBadge");
  if (!box) return;
  const rows = playerStats({}).filter(p => p.m > 0 || p.titles > 0);
  if (badge) badge.textContent = rows.length ? (rows.length + " " + plural(rows.length, "gracz", "graczy", "graczy")) : "—";
  if (!rows.length) {
    box.innerHTML = '<div class="hof-empty">Brak rozegranych meczów — zagraj pierwszy turniej, aby zobaczyć Hall of Fame.</div>';
    return;
  }
  const medals = ["🥇", "🥈", "🥉"];
  box.innerHTML = '<div class="hof-grid">' + rows.slice(0, 3).map((p, i) => (
    '<div class="hof-card' + (i === 0 ? " champ" : "") + '" data-player="' + esc(p.name) + '" role="button" tabindex="0">' +
      '<span class="hof-medal">' + medals[i] + "</span>" +
      avatarBox(p.name, "hof-ava") +
      '<b class="hof-name">' + esc(p.name) + "</b>" +
      '<div class="hof-rank">' + p.pts + "</div>" +
      '<span class="hof-tag">' + p.titles + " " + plural(p.titles, "tytuł", "tytuły", "tytułów") + "</span>" +
    "</div>"
  )).join("") + "</div>";
}
function renderRecent() {
  const box = $("homeRecent");
  const badge = $("homeRecentBadge");
  if (!box) return;
  const list = [];
  state.tournaments.forEach(t => {
    allMatches(t).forEach(m => {
      if (!isPlayed(m)) return;
      list.push({ date: t.date, tour: t.name, game: t.game, stage: m.stage, h: m.h, a: m.a, hs: m.hs, as: m.as });
    });
  });
  list.sort((x, y) => String(y.date || "").localeCompare(String(x.date || "")));
  const recent = list.slice(0, 8);
  if (badge) badge.textContent = recent.length ? ("ostatnie " + recent.length) : "";
  if (!recent.length) {
    box.innerHTML = '<div class="empty-inline">Brak rozegranych meczów.</div>';
    return;
  }
  box.innerHTML = recent.map(m => {
    const hw = m.hs > m.as, aw = m.as > m.hs;
    return '<div class="recent-row">' +
      '<span class="rb ' + (hw ? "rb-W" : aw ? "rb-P" : "rb-R") + '">' + (hw ? "Z" : aw ? "P" : "R") + "</span>" +
      '<span class="opp">' + esc(m.h) + " <b>" + m.hs + "</b> : <b>" + m.as + "</b> " + esc(m.a) + "</span>" +
      '<span class="pill soft">' + esc(m.game || "") + "</span>" +
      '<span class="meta">' + esc(m.tour) + " · " + esc(m.stage) + " · " + esc(fmtDate(m.date)) + "</span>" +
    "</div>";
  }).join("");
}
function renderHomeTop() {
  const body = $("homeTop");
  if (!body) return;
  const rows = playerStats({}).filter(p => p.m > 0 || p.titles > 0).slice(0, 8);
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="10" class="note">Brak danych — wpisz pierwsze wyniki.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((p, i) => (
    '<tr class="' + (i === 0 ? "qual" : "") + '">' +
      "<td>" + (i + 1) + "</td>" +
      '<td class="name player-link" data-player="' + esc(p.name) + '">' + avatar(p.name) + " " + esc(p.name) + "</td>" +
      "<td>" + (p.titles ? '<span class="pill pts">' + p.titles + "</span>" : "0") + "</td>" +
      "<td>" + p.m + '</td><td class="res-w">' + p.w + "</td>" +
      '<td class="res-d">' + p.d + '</td><td class="res-l">' + p.l + "</td>" +
      "<td>" + p.gf + ":" + p.ga + "</td>" +
      '<td><span class="pill pts">' + p.pts + "</span></td>" +
      "<td>" + p.winPct + "%</td>" +
    "</tr>"
  )).join("");
}


/* ============================ RENDER: MECZE ============================ */
function cardBox(title, badgeHTML, body, extra) {
  return '<div class="card"><div class="card-head"><h2>' + title + "</h2>" + (badgeHTML || "") + "</div>" + (extra || "") + body + "</div>";
}
function penControlsHTML(m, r, i, round) {
  if (!m || !m.h || !m.a || !isPlayed(m) || m.hs !== m.as) return "";
  const key = r + "|" + (round == null ? "" : round) + "|" + i;
  const h = '<button class="btn btn-xs ' + (m.pen === "h" ? "btn-gold" : "btn-ghost") + '" data-pen="' + key + '|h" type="button">' + esc(m.h) + "</button>";
  const a = '<button class="btn btn-xs ' + (m.pen === "a" ? "btn-gold" : "btn-ghost") + '" data-pen="' + key + '|a" type="button">' + esc(m.a) + "</button>";
  return 'rzuty karne: ' + h + a;
}
function matchRowHTML(m, r, i, round, label) {
  const played = isPlayed(m);
  const ready = !!(m.h && m.a);
  const dis = !ready;
  const key = r + "|" + (round == null ? "" : round) + "|" + i;
  const hcls = played ? (m.hs > m.as ? "win" : "lose") : "";
  const acls = played ? (m.as > m.hs ? "win" : "lose") : "";
  return '<div class="match ' + (played ? "played" : "") + '" data-match="' + esc(key) + '">' +
    '<div class="player home ' + hcls + '"><span class="nm">' + esc(m.h || "—") + "</span>" + (m.h ? avatar(m.h) : "") + "</div>" +
    '<div class="score-cell">' +
      '<input class="score" type="number" inputmode="numeric" min="0" max="99" data-r="' + r + '" data-i="' + i + '" data-round="' + (round == null ? "" : round) + '" data-s="h" value="' + (m.hs == null ? "" : m.hs) + '" data-orig="' + (m.hs == null ? "" : m.hs) + '" ' + (dis ? "disabled" : "") + ' aria-label="Gole gospodarza">' +
      '<span class="vs">:</span>' +
      '<input class="score" type="number" inputmode="numeric" min="0" max="99" data-r="' + r + '" data-i="' + i + '" data-round="' + (round == null ? "" : round) + '" data-s="a" value="' + (m.as == null ? "" : m.as) + '" data-orig="' + (m.as == null ? "" : m.as) + '" ' + (dis ? "disabled" : "") + ' aria-label="Gole gościa">' +
    "</div>" +
    '<div class="player ' + acls + '">' + (m.a ? avatar(m.a) : "") + '<span class="nm">' + esc(m.a || "—") + "</span></div>" +
    '<div class="m-idx"><span>' + esc(label) + '</span><span class="m-meta"></span></div>' +
  "</div>";
}
function getMatch(r, i, round) {
  const t = T();
  if (!t) return null;
  const n = parseInt(i, 10);
  if (r === "m1") return t.round1[n] || null;
  if (r === "m2") return t.round2[n] || null;
  if (r === "f") return t.final;
  if (r === "t") return t.third;
  if (r === "mc") {
    const ri = parseInt(round, 10);
    if (!t.cupRounds || !t.cupRounds[ri]) return null;
    return t.cupRounds[ri].matches[n] || null;
  }
  if (r === "mcT") return t.cupThird;
  return null;
}
function cupSignatureOf(t) {
  let s = "";
  (t.cupRounds || []).forEach(r => r.matches.forEach(m => { s += (m.h || "") + "|" + (m.a || "") + ";"; }));
  if (t.cupThird) s += (t.cupThird.h || "") + "|" + (t.cupThird.a || "");
  return s;
}
function renderMatches() {
  const area = $("matchesArea");
  if (!area) return;
  const t = T();
  if (!t) {
    area.innerHTML = '<div class="card"><div class="empty-inline">Brak turnieju. Utwórz turniej, aby wpisywać wyniki.</div></div>';
    return;
  }
  const pr = progress(t);
  const head = '<div class="card-head"><h2>' + ic("calendar") + " " + esc(t.name) + '</h2><span class="badge">' + pr.played + " / " + pr.total + " meczów</span></div>";

  if (t.format === "cup") {
    let html = "";
    (t.cupRounds || []).forEach((r, ri) => {
      const done = r.matches.filter(isPlayed).length;
      const badge = '<span class="badge" data-badge="cup-' + ri + '">' + done + " / " + r.matches.length + "</span>";
      const body = '<div class="matches">' + r.matches.map((m, mi) => matchRowHTML(m, "mc", mi, ri, r.name + " · mecz " + (mi + 1))).join("") + "</div>";
      html += cardBox(ic("bracket") + " " + esc(r.name), badge, body);
    });
    if (t.cupThird) {
      const badge = '<span class="badge" data-badge="cup3">' + (isPlayed(t.cupThird) ? "rozegrany" : "oczekuje") + "</span>";
      html += cardBox(ic("medal") + " Mecz o 3. miejsce", badge,
        '<div class="matches">' + matchRowHTML(t.cupThird, "mcT", 0, "", STAGE_THIRD) + "</div>");
    }
    area.innerHTML = html;
    hydrateIcons(area);
    return;
  }

  const r1 = t.round1 || [], r2 = t.round2 || [];
  const badge1 = '<span class="badge" data-badge="r1">' + r1.filter(isPlayed).length + " / " + r1.length + '</span> <button class="btn btn-ghost btn-sm" data-redraw="1" type="button">' + ic("dice") + " Losuj</button>";
  const badge2 = '<span class="badge" data-badge="r2">' + r2.filter(isPlayed).length + " / " + r2.length + "</span>";
  let html = cardBox(ic("calendar") + " " + STAGE_R1, badge1,
    '<div class="matches">' + r1.map((m, i) => matchRowHTML(m, "m1", i, 1, "Mecz " + (i + 1))).join("") + "</div>");
  html += cardBox(ic("refresh") + " " + STAGE_R2, badge2,
    '<div class="matches">' + r2.map((m, i) => matchRowHTML(m, "m2", i, 2, "Rewanż " + (i + 1))).join("") + "</div>");

  if (t.format === "league+cup") {
    const ready = leagueComplete(t);
    const pp = playoffPair(t);
    const fm = { h: pp.final.h, a: pp.final.a, hs: t.final.hs, as: t.final.as };
    const tm = { h: pp.third.h, a: pp.third.a, hs: t.third.hs, as: t.third.as };
    const finDone = isPlayed(t.final);
    const badgeF = '<span class="badge' + (finDone ? " badge-live" : "") + '" data-badge="fin">' + (finDone ? "rozegrana" : "oczekuje") + "</span>";
    const extra = ready ? "" : '<div class="empty-inline">Finał i mecz o 3. miejsce odblokują się po rozegraniu wszystkich meczów ligowych.</div>';
    const body = '<div class="matches">' +
      matchRowHTML({ h: ready ? fm.h : null, a: ready ? fm.a : null, hs: fm.hs, as: t.final.as }, "f", 0, "", STAGE_FINAL) +
      matchRowHTML({ h: ready ? tm.h : null, a: tm.a, hs: tm.hs, as: t.third.as }, "t", 0, "", STAGE_THIRD) +
      "</div>";
    html += cardBox(ic("trophy") + " Faza finałowa", badgeF, '<div class="matches">' +
      matchRowHTML(ready ? fm : { h: null, a: null, hs: t.final.hs, as: t.final.as }, "f", 0, "", STAGE_FINAL) +
      matchRowHTML(ready ? tm : { h: null, a: null, hs: t.third.hs, as: t.third.as }, "t", 0, "", STAGE_THIRD) +
      "</div>", extra);
  }
  area.innerHTML = html;
  hydrateIcons(area);
  refreshAllPenMeta();
}
function refreshAllPenMeta() {
  const area = $("matchesArea");
  if (!area) return;
  area.querySelectorAll(".match").forEach(row => {
    const key = row.getAttribute("data-match").split("|");
    const m = getMatch(key[0], key[1], key[2]);
    const meta = row.querySelector(".m-meta");
    if (meta && m) meta.innerHTML = penControlsHTML(m, key[0], key[1], key[2]);
  });
}
function updateMatchBadges(t) {
  const area = $("matchesArea");
  if (!area || !t) return;
  area.querySelectorAll("[data-badge]").forEach(el => {
    const k = el.getAttribute("data-badge");
    if (k === "r1") el.textContent = (t.round1 || []).filter(isPlayed).length + " / " + (t.round1 || []).length;
    else if (k === "r2") el.textContent = (t.round2 || []).filter(isPlayed).length + " / " + (t.round2 || []).length;
    else if (k === "cup3") el.textContent = isPlayed(t.cupThird) ? "rozegrany" : "oczekuje";
    else if (k === "fin") {
      const done = isPlayed(t.final);
      el.textContent = done ? "rozegrana" : "oczekuje";
      el.className = "badge" + (done ? " badge-live" : "");
    } else if (k.indexOf("cup-") === 0) {
      const r = (t.cupRounds || [])[parseInt(k.slice(4), 10)];
      if (r) el.textContent = r.matches.filter(isPlayed).length + " / " + r.matches.length;
    }
  });
}

/* ============================ RENDER: TABELA ============================ */
let tableSort = { key: null, dir: -1 };
function renderStandings() {
  const t = T();
  const nameEl = $("tblName");
  const body = $("standingsBody");
  const note = $("tblNote");
  if (!body) return;
  if (nameEl) nameEl.textContent = t ? t.name : "—";
  if (!t) { body.innerHTML = '<tr><td colspan="11" class="note">Brak turnieju.</td></tr>'; return; }
  if (t.format === "cup") {
    body.innerHTML = '<tr><td colspan="11" class="note">Ten turniej rozgrywany jest w formacie drabinki — wyniki znajdziesz w widoku „Mecze", a drabinkę w „Drabinka".</td></tr>';
    applyTableSortMarkers();
    return;
  }
  const sel = $("tbTiebreak");
  const crit = sel ? sel.value : "h2h";
  const rows = computeTable(t, crit);
  const champ = championOf(t).champion;
  const fields = {
    pos: p => rows.indexOf(p), name: p => p.name, m: p => p.m, w: p => p.w, d: p => p.d, l: p => p.l,
    gf: p => p.gf, ga: p => p.ga, gd: p => p.gd, pts: p => p.pts, winPct: p => p.winPct
  };
  const view = tableSort.key ? sortRows(rows, tableSort.key, tableSort.dir, fields) : rows;
  body.innerHTML = view.map(p => {
    const rank = rows.indexOf(p) + 1;
    const isChamp = !!champ && champ === p.name;
    const cls = isChamp ? "champion" : (rank === 1 ? "qual" : "");
    return '<tr class="' + cls + '">' +
      "<td>" + rank + "</td>" +
      '<td class="name player-link" data-player="' + esc(p.name) + '">' + avatar(p.name) + " " + esc(p.name) + "</td>" +
      "<td>" + p.m + "</td>" +
      '<td class="res-w">' + p.w + "</td>" +
      '<td class="res-d">' + p.d + "</td>" +
      '<td class="res-l">' + p.l + "</td>" +
      "<td>" + p.gf + "</td><td>" + p.ga + "</td>" +
      "<td>" + (p.gd > 0 ? "+" : "") + p.gd + "</td>" +
      '<td><span class="pill pts">' + p.pts + "</span></td>" +
      "<td>" + p.winPct + "%</td>" +
    "</tr>";
  }).join("");
  if (note) note.textContent = ptsOf(t).win + " pkt za zwycięstwo · " + ptsOf(t).draw + " pkt za remis. Kliknij nagłówek kolumny, aby posortować.";
  applyTableSortMarkers();
}
function applyTableSortMarkers() {
  const tbl = $("standingsTable");
  if (!tbl) return;
  tbl.querySelectorAll("th").forEach(th => th.classList.remove("sorted-asc", "sorted-desc"));
  if (!tableSort.key) return;
  const th = tbl.querySelector('th[data-sort="' + tableSort.key + '"]');
  if (th) th.classList.add(tableSort.dir === 1 ? "sorted-asc" : "sorted-desc");
}

/* ============================ RENDER: DRABINKA ============================ */
function bmReadOnly(m, label, live) {
  if (!m || (!m.h && !m.a)) {
    return '<div class="bm"><div class="tag">' + esc(label) + '</div><div class="row lose"><span>—</span><b>—</b></div><div class="row lose"><span>—</span><b>—</b></div></div>';
  }
  const played = isPlayed(m);
  const hw = played && (m.hs > m.as || (m.hs === m.as && m.pen === "h"));
  const aw = played && (m.as > m.hs || (m.hs === m.as && m.pen === "a"));
  const tie = played && m.hs === m.as && !m.pen;
  let pen = "";
  if (played && m.hs === m.as) {
    pen = '<div class="tag">' + (m.pen ? "karne: " + esc(m.pen === "h" ? m.h : m.a) : "rzuty karne — wskaż zwycięzcę w widoku Mecze") + "</div>";
  }
  return '<div class="bm' + (played ? " done" : "") + (tie ? " tie" : "") + (live ? " bm-live" : "") + '">' +
    '<div class="tag">' + esc(label) + "</div>" +
    '<div class="row ' + (hw ? "win" : played ? "lose" : "") + '"><span>' + esc(m.h || "?") + "</span><b>" + (m.hs == null ? "-" : m.hs) + "</b></div>" +
    '<div class="row ' + (aw ? "win" : played ? "lose" : "") + '"><span>' + esc(m.a || "?") + "</span><b>" + (m.as == null ? "-" : m.as) + "</b></div>" +
    pen +
  "</div>";
}
function renderBracket() {
  const area = $("bracketArea");
  const nameEl = $("brName");
  if (!area) return;
  const t = T();
  if (nameEl) nameEl.textContent = t ? t.name : "—";
  if (!t) { area.innerHTML = '<div class="empty-inline">Brak turnieju.</div>'; return; }

  if (t.format === "cup") {
    const next = nextMatch(t);
    const cols = (t.cupRounds || []).map((r, ri) => {
      const matches = r.matches.map((m, i) => {
        const live = next && next.stage === r.name && next.h === m.h && next.a === m.a && m.h && m.a;
        return bmReadOnly(m, "Mecz " + (i + 1), live);
      }).join("");
      return '<div class="bracket-col"><h3>' + esc(r.name) + "</h3><div class=\"bracket-matches\">" + matches + "</div></div>";
    });
    if (t.cupThird) {
      cols.push('<div class="bracket-col"><h3>' + STAGE_THIRD + '</h3><div class="bracket-matches">' + bmReadOnly(t.cupThird, STAGE_THIRD, false) + "</div></div>");
    }
    const champ = championOf(t).champion;
    const banner = champ ? '<div class="next-match">🏆 Mistrz: <b>' + esc(champ) + "</b></div>" : "";
    area.innerHTML = banner + '<div class="bracket">' + cols.join("") + "</div>";
    return;
  }
  if (t.format === "league+cup") {
    const pp = playoffPair(t);
    const ready = !!(pp.final.h && pp.final.a);
    const note = ready ? "" : '<div class="empty-inline">Uczestnicy finału i meczu o 3. miejsce wyłonią się po zakończeniu fazy ligowej.</div>';
    const fin = { h: pp.final.h, a: pp.final.a, hs: t.final.hs, as: t.final.as, pen: t.final.pen };
    const th = { h: pp.third.h, a: pp.third.a, hs: t.third.hs, as: t.third.as, pen: t.third.pen };
    area.innerHTML = note +
      '<div class="bracket">' +
        '<div class="bracket-col"><h3>' + STAGE_FINAL + '</h3><div class="bracket-matches">' + bmReadOnly(fin, STAGE_FINAL, false) + "</div></div>" +
        (ready ? '<div class="bracket-col"><h3>' + STAGE_THIRD + '</h3><div class="bracket-matches">' + bmReadOnly(th, STAGE_THIRD, false) + "</div></div>" : "") +
      "</div>";
    return;
  }
  area.innerHTML = '<div class="empty-inline">Format „tylko liga" nie ma fazy pucharowej — tabela jest w widoku <b>Tabela</b>.</div>';
}

/* ============================ RENDER: GRACZE ============================ */
let playersView = "table";
let playerSort = { key: null, dir: -1 };
let h2hPick = { a: null, b: null };
function pgOpts() {
  const g = $("pgFilter"), tour = $("pgTour"), st = $("pgStage"), f = $("pgFrom"), to = $("pgTo");
  return {
    game: g ? g.value : "", tourId: tour ? tour.value : "", stage: st ? st.value : "",
    from: f ? f.value : "", to: to ? to.value : ""
  };
}
function filtersActive(o) { return !!(o.game || o.tourId || o.stage || o.from || o.to); }
function populateFilters() {
  const games = gameList();
  const gsel = $("pgFilter");
  if (gsel) {
    const cur = gsel.value;
    gsel.innerHTML = '<option value="">Wszystkie gry</option>' + games.map(g => '<option value="' + esc(g) + '">' + esc(g) + "</option>").join("");
    gsel.value = cur;
    if (!gsel.value) gsel.value = "";
  }
  const tsel = $("pgTour");
  if (tsel) {
    const cur = tsel.value;
    tsel.innerHTML = '<option value="">Wszystkie turnieje</option>' + state.tournaments.map(t => '<option value="' + esc(t.id) + '">' + esc(t.name) + " · " + esc(fmtDate(t.date)) + "</option>").join("");
    tsel.value = cur;
    if (!tsel.value) tsel.value = "";
  }
  const fg = $("tourFilterGame");
  if (fg) {
    const cur = fg.value;
    fg.innerHTML = '<option value="">Wszystkie</option>' + games.map(g => '<option value="' + esc(g) + '">' + esc(g) + "</option>").join("");
    fg.value = cur;
    if (!fg.value) fg.value = "";
  }
  const players = allPlayers();
  ["h2hA", "h2hB"].forEach((id, k) => {
    const el = $(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = players.map(p => '<option value="' + esc(p) + '">' + esc(p) + "</option>").join("");
    const def = players[k] || players[0] || "";
    el.value = (cur && players.indexOf(cur) !== -1) ? cur : def;
  });
}
function renderPlayers() {
  const opts = pgOpts();
  const active = filtersActive(opts);
  let rows = playerStats(opts);
  if (active) rows = rows.filter(p => p.m > 0 || p.titles > 0);
  else rows = rows.filter(p => p.m > 0 || p.titles > 0 || isRoster(p.name));

  const badge = $("pgBadge");
  if (badge) badge.textContent = rows.length + " " + plural(rows.length, "gracz", "graczy", "graczy");
  const totalMatches = rows.reduce((s, p) => s + p.m, 0) / 2;
  const count = $("pgCount");
  if (count) count.textContent = rows.length + " " + plural(rows.length, "gracz", "graczy", "graczy") + " · " + Math.round(totalMatches) + " " + plural(Math.round(totalMatches), "mecz", "mecze", "meczów");

  const mismatch = $("statsMismatch");
  if (mismatch) {
    if (!rows.length && active) {
      mismatch.textContent = "Brak danych dla wybranych filtrów. Zmień filtry albo użyj przycisku „Wyczyść filtry”.";
      mismatch.classList.remove("hidden");
    } else {
      mismatch.classList.add("hidden");
    }
  }

  renderPlayersTable(rows);
  renderPlayerCards(rows);
  renderCharts(rows);
  renderPerGame(rows);
  renderH2H();
  renderRoster();
  const wrap = $("playersTableWrap");
  const cards = $("playerCards");
  if (wrap) wrap.classList.toggle("hidden", playersView !== "table");
  if (cards) cards.classList.toggle("hidden", playersView !== "cards");
  $$("#pgViewToggle button").forEach(b => b.classList.toggle("active", b.getAttribute("data-pgview") === playersView));
}

function renderPlayersTable(rows) {
  const body = $("playersBody");
  if (!body) return;
  const fields = {
    pos: p => rows.indexOf(p), name: p => p.name, tours: p => p.tours, titles: p => p.titles,
    m: p => p.m, w: p => p.w, d: p => p.d, l: p => p.l, gf: p => p.gf, ga: p => p.ga,
    gd: p => p.gd, pts: p => p.pts, winPct: p => p.winPct, avgGf: p => p.avgGf, avgGa: p => p.avgGa
  };
  const view = playerSort.key ? sortRows(rows, playerSort.key, playerSort.dir, fields) : rows;
  if (!view.length) { body.innerHTML = '<tr><td colspan="15" class="note">Brak danych.</td></tr>'; return; }
  body.innerHTML = view.map(p => {
    const rank = rows.indexOf(p) + 1;
    return '<tr class="' + (rank === 1 ? "qual" : "") + '">' +
      "<td>" + rank + "</td>" +
      '<td class="name player-link" data-player="' + esc(p.name) + '">' + avatar(p.name) + " " + esc(p.name) + "</td>" +
      "<td>" + p.tours + "</td>" +
      "<td>" + (p.titles ? '<span class="pill pts">' + p.titles + "</span>" : "0") + "</td>" +
      "<td>" + p.m + "</td>" +
      '<td class="res-w">' + p.w + "</td>" +
      '<td class="res-d">' + p.d + "</td>" +
      '<td class="res-l">' + p.l + "</td>" +
      "<td>" + p.gf + "</td><td>" + p.ga + "</td>" +
      "<td>" + (p.gd > 0 ? "+" : "") + p.gd + "</td>" +
      '<td><span class="pill pts">' + p.pts + "</span></td>" +
      "<td>" + p.winPct + "%</td>" +
      "<td>" + p.avgGf.toFixed(2) + "</td><td>" + p.avgGa.toFixed(2) + "</td>" +
    "</tr>";
  }).join("");
  const tbl = $("playersTable");
  if (tbl) {
    tbl.querySelectorAll("th").forEach(th => th.classList.remove("sorted-asc", "sorted-desc"));
    if (playerSort.key) {
      const th = tbl.querySelector('th[data-psort="' + playerSort.key + '"]');
      if (th) th.classList.add(playerSort.dir === 1 ? "sorted-asc" : "sorted-desc");
    }
  }
}
function renderPlayerCards(rows) {
  const box = $("playerCards");
  if (!box) return;
  if (!rows.length) { box.innerHTML = '<div class="empty-inline">Brak danych.</div>'; return; }
  box.innerHTML = rows.map(p => {
    const form = currentForm(p.name, 5);
    const formHTML = form.length
      ? form.map(fmtForm).join("")
      : '<span class="muted">brak meczów</span>';
    return '<div class="player-card' + (p.titles ? " champ" : "") + '" data-player="' + esc(p.name) + '" role="button" tabindex="0">' +
      '<div class="pc-top">' +
        avatarBox(p.name, "pc-ava") +
        '<div class="pc-id"><b>' + esc(p.name) + "</b><span>" + p.titles + " " + plural(p.titles, "tytuł", "tytuły", "tytułów") + " · " + p.tours + " " + plural(p.tours, "turniej", "turnieje", "turniejów") + "</span></div>" +
        '<span class="pill pts">' + p.pts + "</span>" +
      "</div>" +
      '<div class="pc-grid">' +
        pcCell("Mecze", p.m) + pcCell("Zwycięstwa", p.w) + pcCell("Porażki", p.l) +
        pcCell("Bilans", (p.gd > 0 ? "+" : "") + p.gd) + pcCell("%Z", p.winPct + "%") + pcCell("Śr. GZ", p.avgGf.toFixed(1)) +
      "</div>" +
      '<div class="pc-form"><span>Forma:</span>' + formHTML + "</div>" +
    "</div>";
  }).join("");
}
function pcCell(label, val) {
  return '<div class="pc-cell"><span>' + esc(label) + "</span><b>" + esc(val) + "</b></div>";
}
function fmtForm(res) { return '<span class="form-dot fd-' + res + '">' + (res === "W" ? "Z" : res === "R" ? "R" : "P") + "</span>"; }
function renderCharts(rows) {
  const withData = rows.filter(p => p.m > 0);
  const badge = $("chartsBadge");
  if (badge) badge.textContent = withData.length ? (withData.length + " " + plural(withData.length, "zawodnik", "zawodników", "zawodników")) : "brak danych";
  renderBarChart($("chartWins"), withData, p => p.w, "", p => p.w);
  renderGoalsChart($("chartGoals"), withData);
  renderBarChart($("chartTitles"), withData, p => p.titles, "b", p => p.titles);
  renderBarChart($("chartPts"), withData, p => p.pts, "v", p => p.pts);
}
function renderBarChart(el, rows, getVal, cls, fmt) {
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<div class="chart-empty">Brak danych dla wybranych filtrów.</div>'; return; }
  const max = Math.max.apply(null, rows.map(getVal).concat([1]));
  el.innerHTML = rows.map(p => {
    const v = getVal(p);
    const w = Math.round((v / max) * 100);
    return '<div class="chart-row">' +
      '<span class="cl">' + avatar(p.name) + esc(p.name) + "</span>" +
      '<span class="cb-wrap"><span class="cb ' + cls + '" data-w="' + w + '" style="width:0"></span></span>' +
      '<span class="cv">' + (fmt ? fmt(v) : v) + "</span>" +
    "</div>";
  }).join("");
  animateBars(el);
}
function renderGoalsChart(el, rows) {
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<div class="chart-empty">Brak danych dla wybranych filtrów.</div>'; return; }
  const max = Math.max.apply(null, rows.map(p => Math.max(p.gf, p.ga)).concat([1]));
  el.innerHTML = rows.map(p => {
    const wg = Math.round((p.gf / max) * 100);
    const ws = Math.round((p.ga / max) * 100);
    return '<div class="chart-row">' +
      '<span class="cl">' + avatar(p.name) + esc(p.name) + "</span>" +
      '<span class="cb-wrap goals">' +
        '<span class="gbar gz"><i data-w="' + wg + '" style="width:0"></i></span>' +
        '<span class="gbar gs"><i data-w="' + ws + '" style="width:0"></i></span>' +
      "</span>" +
      '<span class="cv">' + p.gf + ":" + p.ga + "</span>" +
    "</div>";
  }).join("");
  animateBars(el);
}
function animateBars(el) {
  const apply = () => {
    el.querySelectorAll("[data-w]").forEach(b => { b.style.width = b.getAttribute("data-w") + "%"; });
  };
  if (window.requestAnimationFrame) requestAnimationFrame(apply); else setTimeout(apply, 30);
}
function renderPerGame(rows) {
  const head = $("perGameHead");
  const body = $("perGameBody");
  if (!head || !body) return;
  const games = gameList();
  if (!games.length) { head.innerHTML = ""; body.innerHTML = '<tr><td class="note">Brak danych.</td></tr>'; return; }
  head.innerHTML = "<tr><th>Zawodnik</th>" + games.map(g => "<th>" + esc(g) + "</th>").join("") + "</tr>";
  body.innerHTML = rows.map(p => {
    const cells = games.map(g => {
      const s = playerStats({ game: g }).filter(x => x.name === p.name)[0];
      if (!s || !s.m) return '<td class="muted">—</td>';
      return '<td><span class="res-w">' + s.w + '</span>-<span class="res-d">' + s.d + '</span>-<span class="res-l">' + s.l + "</span></td>";
    }).join("");
    return '<tr><td class="name player-link" data-player="' + esc(p.name) + '">' + avatar(p.name) + " " + esc(p.name) + "</td>" + cells + "</tr>";
  }).join("");
}
function renderH2H() {
  const aEl = $("h2hA"), bEl = $("h2hB"), box = $("h2hResult");
  if (!box) return;
  let a = aEl ? aEl.value : "", b = bEl ? bEl.value : "";
  if (!a || !b) { box.innerHTML = '<div class="chart-empty">Wybierz dwóch zawodników.</div>'; return; }
  if (a === b) { box.innerHTML = '<div class="chart-empty">Wybierz dwóch różnych zawodników.</div>'; return; }
  const opts = pgOpts();
  const r = h2hStats2(a, b, opts);
  if (!r.m) {
    box.innerHTML = '<div class="h2h-panel"><div class="chart-empty">Brak bezpośrednich meczów ' + esc(a) + " vs " + esc(b) + " dla wybranych filtrów.</div></div>";
    return;
  }
  const wa = Math.round((r.wa / r.m) * 100);
  const dr = Math.round((r.d / r.m) * 100);
  const wb = Math.max(0, 100 - wa - dr);
  const score = a + " " + r.wa + " : " + r.wb + " " + b;
  const rowsHtml = r.games.slice().reverse().map(g => {
    const res = g.a > g.b ? "W" : g.a < g.b ? "P" : "R";
    return "<tr>" +
      "<td>" + esc(fmtDate(g.date)) + "</td>" +
      '<td class="name">' + esc(g.tour) + "</td>" +
      "<td>" + esc(g.stage) + "</td>" +
      "<td><b>" + g.a + " : " + g.b + "</b></td>" +
      '<td class="res-' + (res === "W" ? "w" : res === "P" ? "l" : "d") + '">' + (res === "W" ? "Zwycięstwo" : res === "P" ? "Porażka" : "Remis") + "</td>" +
    "</tr>";
  }).join("");
  box.innerHTML =
    '<div class="h2h-panel">' +
      '<div class="h2h-top">' +
        '<div class="h2h-side">' + avatarBox(a, "avatar big") + esc(a) + "</div>" +
        '<div class="h2h-center"><div class="h2h-score">' + r.wa + " : " + r.wb + '</div><div class="h2h-lbl">' + r.m + " " + plural(r.m, "mecz", "mecze", "meczów") + "</div></div>" +
        '<div class="h2h-side right">' + esc(b) + avatarBox(b, "avatar big") + "</div>" +
      "</div>" +
      '<div class="h2h-bar">' +
        '<i class="b-wa" style="width:' + wa + '%"></i>' +
        '<i class="b-d" style="width:' + dr + '%"></i>' +
        '<i class="b-wb" style="width:' + wb + '%"></i>' +
      "</div>" +
      '<div class="h2h-legend"><span>' + esc(a) + ": " + r.wa + " Z</span><span>Remisy: " + r.d + "</span><span>" + esc(b) + ": " + r.wb + " Z</span></div>" +
      '<div class="h2h-avg">' +
        "<span>Gole " + esc(a) + ": <b>" + r.gfa + "</b> (śr. " + (r.gfa / r.m).toFixed(2) + ")</span>" +
        "<span>Gole " + esc(b) + ": <b>" + r.gfb + "</b> (śr. " + (r.gfb / r.m).toFixed(2) + ")</span>" +
      "</div>" +
    "</div>" +
    '<div class="sect">Historia spotkań</div>' +
    '<div class="table-wrap"><table class="standings compact"><thead><tr><th>Data</th><th>Turniej</th><th>Faza</th><th>Wynik</th><th>Rezultat</th></tr></thead><tbody>' + rowsHtml + "</tbody></table></div>";
}
function renderRoster() {
  const list = $("rosterList");
  const badge = $("rosterBadge");
  if (!list) return;
  const q = $("rosterSearch") ? $("rosterSearch").value.trim().toLowerCase() : "";
  const players = allPlayers();
  if (badge) badge.textContent = players.length + " " + plural(players.length, "gracz", "graczy", "graczy");
  const shown = players.filter(p => !q || p.toLowerCase().indexOf(q) !== -1);
  if (!shown.length) { list.innerHTML = '<div class="empty-inline">Brak graczy.</div>'; return; }
  list.innerHTML = shown.map(p => (
    '<span class="chip">' + avatar(p) +
      '<span class="chip-name" data-player="' + esc(p) + '">' + esc(p) + "</span>" +
      '<button class="chip-edit" data-edit-player="' + esc(p) + '" title="Edytuj gracza" type="button">✎</button>' +
      '<button class="chip-x" data-del-player="' + esc(p) + '" title="Usuń z listy stałych" type="button">✕</button>' +
    "</span>"
  )).join("");
}

/* ============================ RENDER: TURNIEJE ============================ */
function renderTournaments() {
  const body = $("tourRows");
  if (!body) return;
  const q = $("tourSearch") ? $("tourSearch").value.trim().toLowerCase() : "";
  const fg = $("tourFilterGame") ? $("tourFilterGame").value : "";
  const fs = $("tourFilterStatus") ? $("tourFilterStatus").value : "";
  const sort = $("tourSort") ? $("tourSort").value : "date-desc";
  let list = state.tournaments.slice();
  if (q) list = list.filter(t => (t.name + " " + t.game + " " + (t.players || []).join(" ")).toLowerCase().indexOf(q) !== -1);
  if (fg) list = list.filter(t => t.game === fg);
  if (fs === "done") list = list.filter(isComplete);
  if (fs === "active") list = list.filter(t => !isComplete(t));
  list.sort((a, b) => {
    if (sort === "date-asc") return String(a.date || "").localeCompare(String(b.date || ""));
    if (sort === "players-desc") return (b.players || []).length - (a.players || []).length;
    if (sort === "name-asc") return String(a.name || "").localeCompare(String(b.name || ""), "pl");
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
  if (!list.length) {
    body.innerHTML = '<tr><td colspan="9" class="note">Brak turniejów spełniających kryteria.</td></tr>';
    return;
  }
  body.innerHTML = list.map(t => {
    const c = championOf(t);
    const done = isComplete(t);
    const cur = t.id === state.currentId;
    const badge = done ? '<span class="badge badge-live">Zakończony</span>' : '<span class="badge">W trakcie</span>';
    return "<tr>" +
      '<td class="name player-link" data-tour="' + esc(t.id) + '">' + esc(t.name) + (cur ? ' <span class="badge badge-gold">aktywny</span>' : "") + "</td>" +
      "<td>" + esc(t.game || "") + "</td>" +
      "<td>" + esc(fmtDate(t.date)) + "</td>" +
      "<td>" + (t.players || []).length + "</td>" +
      "<td>" + (c.champion ? esc(c.champion) : "—") + "</td>" +
      "<td>" + (c.second ? esc(c.second) : "—") + "</td>" +
      "<td>" + (c.third ? esc(c.third) : "—") + "</td>" +
      "<td>" + badge + "</td>" +
      '<td><div class="row-actions">' +
        '<button class="btn btn-ghost btn-xs" data-tour="' + esc(t.id) + '" type="button">Szczegóły</button>' +
        '<button class="btn btn-ghost btn-xs" data-tour-edit="' + esc(t.id) + '" type="button">Edytuj</button>' +
        '<button class="btn btn-red btn-xs" data-tour-del="' + esc(t.id) + '" type="button">Usuń</button>' +
      "</div></td>" +
    "</tr>";
  }).join("");
}

/* ============================ RENDER: DANE ============================ */
function updateLastSaved() {
  const el = $("lastSaved");
  if (!el) return;
  let t = 0;
  try { t = parseInt(localStorage.getItem(LAST_SAVE_KEY), 10) || 0; } catch (e) { t = 0; }
  el.textContent = t ? ("Ostatni zapis: " + new Date(t).toLocaleString("pl-PL")) : "Ostatni zapis: —";
}

/* ============================ WYBÓR GRY ============================ */
let gameTarget = "nt";
function openGamePicker(target) {
  gameTarget = target;
  const cur = target === "nt" ? ($("ntGame") ? $("ntGame").getAttribute("data-value") : "") : ($("etGame") ? $("etGame").getAttribute("data-value") : "");
  const s = $("gpSearch");
  if (s) s.value = "";
  renderGamePicker("");
  openOverlay("gamePickerOverlay");
  markSelectedGame(cur);
}
function markSelectedGame(cur) {
  $$("#gpSections .game-tile").forEach(t => t.classList.toggle("sel", t.getAttribute("data-game") === cur));
}
function renderGamePicker(filter) {
  const box = $("gpSections");
  if (!box) return;
  const f = String(filter || "").trim().toLowerCase();
  const used = gamesUsed();
  const custom = (state.games || []).filter(g => used.indexOf(g) === -1);
  const match = g => !f || g.toLowerCase().indexOf(f) !== -1;
  const sec = (title, items) => {
    const list = items.filter(match);
    if (!list.length) return "";
    return '<div class="game-sec"><h4>' + esc(title) + '</h4><div class="game-grid">' +
      list.map(g => '<button class="game-tile" data-game="' + esc(g) + '" type="button"><span class="gt-ico">' + esc(g.replace(/[^0-9A-Za-z]/g, "").slice(0, 2).toUpperCase() || "FC") + "</span><span>" + esc(g) + "</span></button>").join("") +
      "</div></div>";
  };
  box.innerHTML =
    sec("Ostatnio używane", used) +
    sec("FIFA", FIFA_SERIES) +
    sec("EA SPORTS FC", FC_SERIES) +
    sec("Moje gry", custom) +
    '<div class="game-sec"><h4>Własna gra</h4><div class="game-add"><input id="gpCustom" placeholder="Nazwa gry" maxlength="40"><button class="btn btn-gold btn-sm" id="gpAdd" type="button">Dodaj</button></div></div>';
  markSelectedGame(gameTarget === "nt" ? ($("ntGame") ? $("ntGame").getAttribute("data-value") : "") : ($("etGame") ? $("etGame").getAttribute("data-value") : ""));
}
function setGame(target, value) {
  const v = pname(value);
  if (!value) return;
  if (target === "nt") {
    const el = $("ntGame");
    if (el) { el.setAttribute("data-value", value); el.textContent = value; }
  } else {
    const el = $("etGame");
    if (el) { el.setAttribute("data-value", value); el.textContent = value; }
  }
  if (FIFA_SERIES.indexOf(value) === -1 && FC_SERIES.indexOf(value) === -1) uniquePush(state.games, v);
}

/* ============================ NOWY TURNIEJ ============================ */
function ntPlayerRow(value) {
  const div = document.createElement("div");
  div.className = "nt-player";
  div.innerHTML = '<input type="text" value="' + esc(value || "") + '" placeholder="Imię gracza"><button class="icon-btn" type="button" data-nt-del="1" aria-label="Usuń">✕</button>';
  return div;
}
function openNewTour() {
  const nameEl = $("ntName");
  const err = $("ntError");
  if (nameEl) nameEl.value = "";
  if (err) err.classList.add("hidden");
  const dateEl = $("ntDate");
  if (dateEl) dateEl.value = todayISO();
  const fmt = $("ntFormat");
  if (fmt) fmt.value = "league+cup";
  const win = $("ntWin"), draw = $("ntDraw");
  if (win) win.value = "3";
  if (draw) draw.value = "1";
  const ng = $("ntGame");
  if (ng) { ng.setAttribute("data-value", DEFAULT_GAME); ng.textContent = DEFAULT_GAME; }
  const wrap = $("ntPlayers");
  if (wrap) {
    wrap.innerHTML = "";
    (state.roster.length ? state.roster : DEFAULT_ROSTER).forEach(p => wrap.appendChild(ntPlayerRow(p)));
  }
  updateNtHint();
  openOverlay("newTourOverlay");
}
function updateNtHint() {
  const hint = $("ntPlayersHint");
  const fmt = $("ntFormat");
  if (!hint || !fmt) return;
  hint.textContent = fmt.value === "cup"
    ? "Drabinka: najlepiej 4, 8 lub 16 graczy. Przy innej liczbie wolne losy przechodzą dalej automatycznie."
    : "Wpisz od 2 do 16 graczy. Terminarz ligowy (2 rundy) ułoży się sam.";
}
function createTour() {
  const err = $("ntError");
  const fail = msg => { if (err) { err.textContent = msg; err.classList.remove("hidden"); } };
  const players = [];
  $$("#ntPlayers .nt-player input").forEach(inp => {
    const n = pname(inp.value);
    if (n && players.indexOf(n) === -1) players.push(n);
  });
  const format = $("ntFormat") ? $("ntFormat").value : "league+cup";
  if (players.length < 2) return fail("Podaj co najmniej 2 graczy (różne imiona).");
  if (players.length > 16) return fail("Maksymalnie 16 graczy.");
  const game = $("ntGame") ? ($("ntGame").getAttribute("data-value") || DEFAULT_GAME) : DEFAULT_GAME;
  const date = ($("ntDate") && $("ntDate").value) || todayISO();
  const win = clampInt($("ntWin") ? $("ntWin").value : 3, 1, 10);
  const draw = clampInt($("ntDraw") ? $("ntDraw").value : 1, 0, 10);
  let name = $("ntName") ? $("ntName").value.trim() : "";
  if (!name) name = game + " · " + fmtDate(date);
  const id = uid();
  const tour = {
    id: id, name: name, game: game, date: date, players: players,
    format: format, points: { win: win == null ? 3 : win, draw: draw == null ? 1 : draw },
    round1: [], round2: [], drawn: true, round1Drawn: true,
    final: { h: null, a: null, hs: null, as: null, pen: null },
    third: { h: null, a: null, hs: null, as: null, pen: null },
    cupRounds: null, cupThird: null
  };
  if (format !== "cup") {
    const sch = leagueSchedule(players);
    tour.round1 = sch.round1;
    tour.round2 = sch.round2;
  }
  if (format !== "league") {
    tour.cupRounds = format === "cup" ? buildCup(players) : null;
  }
  players.forEach(p => { if (!state.colors[p]) state.colors[p] = PALETTE[Object.keys(state.colors).length % PALETTE.length]; });
  state.tournaments.push(tour);
  state.currentId = id;
  save();
  closeOverlay("newTourOverlay");
  renderAll();
  switchView("matches");
  toast("Turniej utworzony — wpisz wyniki.", "ok");
}
async function deleteTour(id) {
  const t = state.tournaments.filter(x => x.id === id)[0];
  if (!t) return;
  const ok = await askConfirm("Usunąć turniej „" + t.name + "“? Tej operacji nie można cofnąć.", "Usuń", "Usunąć turniej?");
  if (!ok) return;
  state.tournaments = state.tournaments.filter(x => x.id !== id);
  if (state.currentId === id) state.currentId = state.tournaments.length ? state.tournaments[0].id : null;
  save();
  renderAll();
  toast("Turniej usunięty.", "ok");
}

/* ============================ EDYCJA TURNIEJU ============================ */
let editTourId = null;
function openEditTour(id) {
  const t = state.tournaments.filter(x => x.id === id)[0];
  if (!t) return;
  editTourId = id;
  if ($("etName")) $("etName").value = t.name;
  if ($("etDate")) $("etDate").value = t.date || todayISO();
  if ($("etGame")) { $("etGame").setAttribute("data-value", t.game || DEFAULT_GAME); $("etGame").textContent = t.game || DEFAULT_GAME; }
  if ($("etWin")) $("etWin").value = ptsOf(t).win;
  if ($("etDraw")) $("etDraw").value = ptsOf(t).draw;
  if ($("etError")) $("etError").classList.add("hidden");
  openOverlay("editTourOverlay");
}
function saveEditTour() {
  const t = state.tournaments.filter(x => x.id === editTourId)[0];
  if (!t) return;
  const err = $("etError");
  const name = $("etName") ? $("etName").value.trim() : "";
  if (!name) { err.textContent = "Podaj nazwę turnieju."; err.classList.remove("hidden"); return; }
  t.name = name;
  t.game = $("etGame") ? ($("etGame").getAttribute("data-value") || DEFAULT_GAME) : t.game;
  t.date = ($("etDate") && $("etDate").value) || t.date;
  const win = clampInt($("etWin") ? $("etWin").value : 3, 1, 10);
  const draw = clampInt($("etDraw") ? $("etDraw").value : 1, 0, 10);
  t.points = { win: win == null ? 3 : win, draw: draw == null ? 1 : draw };
  save();
  closeOverlay("editTourOverlay");
  renderAll();
  toast("Turniej zapisany.", "ok");
}

/* ============================ SZCZEGÓŁY TURNIEJU + CSV ============================ */
function roMatchHTML(m) {
  const played = isPlayed(m);
  const hw = played && (m.hs > m.as || (m.hs === m.as && m.pen === "h"));
  const aw = played && (m.as > m.hs || (m.hs === m.as && m.pen === "a"));
  return '<div class="match ' + (played ? "played" : "") + '">' +
    '<div class="player home ' + (hw ? "win" : played ? "lose" : "") + '"><span class="nm">' + esc(m.h || "—") + '</span></div>' +
    '<div class="score-cell"><span class="vs"><b style="color:var(--text);font-size:16px">' + (m.hs == null ? "-" : m.hs) + "</b> : <b style=\"color:var(--text);font-size:16px\">" + (m.as == null ? "-" : m.as) + '</b></span></div>' +
    '<div class="player ' + (aw ? "win" : played ? "lose" : "") + '"><span class="nm">' + esc(m.a || "—") + "</span></div>" +
    '<div class="m-idx"><span>' + esc(m.stage || "") + (played && m.hs === m.as && m.pen ? " · karne: " + esc(m.pen === "h" ? m.h : m.a) : "") + "</span></div>" +
  "</div>";
}
function openTourDetail(id) {
  const t = state.tournaments.filter(x => x.id === id)[0];
  if (!t) return;
  const c = championOf(t);
  const pr = progress(t);
  if ($("tdTitle")) $("tdTitle").textContent = t.name;
  let html = '<div class="profile-grid">' +
    '<div><span>Format</span><b style="font-size:13px">' + esc(FORMAT_LABEL[t.format] || t.format) + "</b></div>" +
    "<div><span>Gra</span><b style=\"font-size:13px\">" + esc(t.game || "") + "</b></div>" +
    "<div><span>Data</span><b style=\"font-size:13px\">" + esc(fmtDate(t.date)) + "</b></div>" +
    "<div><span>Gracze</span><b>" + (t.players || []).length + "</b></div>" +
    "<div><span>Mecze</span><b>" + pr.played + "/" + pr.total + "</b></div>" +
    "<div><span>Mistrz</span><b style=\"font-size:13px\">" + esc(c.champion || "—") + "</b></div>" +
  "</div>";
  if (c.champion) {
    html += '<div class="next-match">🏆 Mistrz: <b>' + esc(c.champion) + "</b>" +
      (c.second ? " · 2. miejsce: <b>" + esc(c.second) + "</b>" : "") +
      (c.third ? " · 3. miejsce: <b>" + esc(c.third) + "</b>" : "") + "</div>";
  }
  if (t.format !== "cup") {
    const rows = computeTable(t, "h2h");
    html += '<div class="sect">Tabela</div><div class="table-wrap"><table class="standings compact"><thead><tr><th>#</th><th>Zawodnik</th><th>M</th><th>Z</th><th>R</th><th>P</th><th>GZ</th><th>GS</th><th>Pkt</th></tr></thead><tbody>' +
      rows.map((p, i) => "<tr" + (i === 0 ? ' class="qual"' : "") + "><td>" + (i + 1) + '</td><td class="name">' + esc(p.name) + "</td><td>" + p.m + "</td><td>" + p.w + "</td><td>" + p.d + "</td><td>" + p.l + "</td><td>" + p.gf + "</td><td>" + p.ga + '</td><td><b>' + p.pts + "</b></td></tr>").join("") +
      "</tbody></table></div>";
  }
  html += '<div class="sect">Wyniki</div><div class="matches">' + allMatches(t).map(roMatchHTML).join("") + "</div>";
  if ($("tourDetailContent")) $("tourDetailContent").innerHTML = html;
  openOverlay("tourDetailOverlay");
}
function tourCsv(t) {
  const rows = [["Turniej", "Gra", "Data", "Faza", "Gospodarz", "Gość", "Gole gosp.", "Goście", "Karne"]];
  allMatches(t).forEach(m => {
    const pen = isPlayed(m) && m.hs === m.as && m.pen ? (m.pen === "h" ? m.h : m.a) : "";
    rows.push([t.name, t.game || "", fmtDate(t.date), m.stage || "", m.h || "", m.a || "", m.hs == null ? "" : m.hs, m.as == null ? "" : m.as, pen]);
  });
  return toCsv(rows);
}
function tournamentsCsv() {
  const rows = [["Turniej", "Gra", "Data", "Format", "Gracze", "Mistrz", "2. miejsce", "3. miejsce", "Status"]];
  state.tournaments.forEach(t => {
    const c = championOf(t);
    rows.push([t.name, t.game || "", fmtDate(t.date), FORMAT_LABEL[t.format] || t.format, (t.players || []).join(", "), c.champion || "", c.second || "", c.third || "", isComplete(t) ? "Zakończony" : "W trakcie"]);
  });
  return toCsv(rows);
}
function standingsCsv() {
  const t = T();
  if (!t || t.format === "cup") return "";
  const rows = computeTable(t, "h2h");
  const out = [["#", "Zawodnik", "M", "Z", "R", "P", "GZ", "GS", "Bilans", "Pkt", "%Z"]];
  rows.forEach((p, i) => out.push([i + 1, p.name, p.m, p.w, p.d, p.l, p.gf, p.ga, (p.gd > 0 ? "+" : "") + p.gd, p.pts, p.winPct + "%"]));
  return toCsv(out);
}

/* ============================ PROFIL GRACZA ============================ */
function openProfile(name) {
  const box = $("profileContent");
  if (!box) return;
  const rows = playerStats({});
  let p = rows.filter(x => x.name === name)[0];
  if (!p) p = emptyStat(name);
  const form = currentForm(name, 5);
  const hist = playerTourHistory(name);
  const perGame = perGameFor(name);
  const recent = recentMatches(name, 8);
  const streak = streakOf(name);
  let html =
    '<div class="h2h-top" style="margin-bottom:8px">' +
      '<div class="h2h-side">' + avatarBox(name, "avatar big") + "<b>" + esc(name) + "</b></div>" +
      '<div class="h2h-center"><div class="h2h-lbl">' + (isRoster(name) ? "gracz stały" : "gracz turniejowy") + "</div></div>" +
      '<div class="h2h-side right"><button class="btn btn-ghost btn-sm" data-edit-player="' + esc(name) + '" type="button">Edytuj</button></div>' +
    "</div>" +
    '<div class="profile-grid">' +
      "<div><span>Tytuły</span><b>" + p.titles + "</b></div>" +
      "<div><span>Mecze</span><b>" + p.m + "</b></div>" +
      "<div><span>Z-R-P</span><b>" + p.w + "-" + p.d + "-" + p.l + "</b></div>" +
      "<div><span>Bilans</span><b>" + (p.gd > 0 ? "+" : "") + p.gd + "</b></div>" +
      "<div><span>GZ</span><b>" + p.gf + "</b></div>" +
      "<div><span>GS</span><b>" + p.ga + "</b></div>" +
      "<div><span>Punkty</span><b>" + p.pts + "</b></div>" +
      "<div><span>% Zwycięstw</span><b>" + p.winPct + "%</b></div>" +
    "</div>" +
    '<div class="sect">Forma (ostatnie 5)</div><div class="pc-form">' +
      (form.length ? form.map(fmtForm).join("") : '<span class="muted">brak meczów</span>') +
      (streak.res ? ' <span class="note">seria: ' + streak.len + " × " + (streak.res === "W" ? "Z" : streak.res === "R" ? "R" : "P") + "</span>" : "") +
    "</div>";
  html += '<div class="sect">Historia turniejów</div>';
  if (hist.length) {
    html += '<div class="table-wrap"><table class="standings compact"><thead><tr><th>Turniej</th><th>Gra</th><th>Data</th><th>Miejsce</th><th>M</th><th>Wynik</th><th>Pkt</th></tr></thead><tbody>' +
      hist.map(h => "<tr><td class=\"name\">" + esc(h.name) + (h.champion ? " 🏆" : "") + "</td><td>" + esc(h.game) + "</td><td>" + esc(fmtDate(h.date)) + "</td><td>" + (h.pos ? h.pos + "." : "—") + "</td><td>" + h.m + '</td><td><span class="res-w">' + h.w + '</span>-<span class="res-d">' + h.d + '</span>-<span class="res-l">' + h.l + "</span></td><td>" + h.pts + "</td></tr>").join("") +
      "</tbody></table></div>";
  } else {
    html += '<div class="empty-inline">Brak turniejów z tym graczem.</div>';
  }
  html += '<div class="sect">Bilans per gra</div>';
  if (perGame.length) {
    html += '<div class="table-wrap"><table class="standings compact"><thead><tr><th>Gra</th><th>M</th><th>Z</th><th>R</th><th>P</th><th>GZ:GS</th><th>Pkt</th></tr></thead><tbody>' +
      perGame.map(x => "<tr><td class=\"name\">" + esc(x.game) + "</td><td>" + x.p.m + "</td><td>" + x.p.w + "</td><td>" + x.p.d + "</td><td>" + x.p.l + "</td><td>" + x.p.gf + ":" + x.p.ga + "</td><td>" + x.p.pts + "</td></tr>").join("") +
      "</tbody></table></div>";
  } else {
    html += '<div class="empty-inline">Brak danych.</div>';
  }
  html += '<div class="sect">Ostatnie mecze</div>';
  if (recent.length) {
    html += '<div class="table-wrap"><table class="standings compact"><thead><tr><th>Data</th><th>Turniej</th><th>Przeciwnik</th><th>Wynik</th></tr></thead><tbody>' +
      recent.map(m => "<tr><td>" + esc(fmtDate(m.date)) + "</td><td>" + esc(m.tour) + "</td><td>" + esc(m.opp) + '</td><td class="res-' + (m.res === "W" ? "w" : m.res === "P" ? "l" : "d") + '">' + m.gf + " : " + m.ga + "</td></tr>").join("") +
      "</tbody></table></div>";
  } else {
    html += '<div class="empty-inline">Brak rozegranych meczów.</div>';
  }
  box.innerHTML = html;
  openOverlay("profileOverlay");
}
function openEditPlayer(name) {
  const ep = $("epName");
  if (ep) { ep.value = name; ep.setAttribute("data-old", name); }
  if ($("epError")) $("epError").classList.add("hidden");
  const row = $("epColors");
  if (row) {
    const cur = colorOf(name);
    row.innerHTML = PALETTE.map(c => '<span class="color-swatch' + (c === cur ? " sel" : "") + '" data-color="' + c + '" style="background:' + c + '"></span>').join("");
  }
  openOverlay("editPlayerOverlay");
}
function saveEditPlayer() {
  const err = $("epError");
  const nameEl = $("epName");
  const oldName = nameEl ? (nameEl.getAttribute("data-old") || "") : "";
  const newName = nameEl ? pname(nameEl.value) : "";
  const n = pname(newName);
  if (!n) { err.textContent = "Podaj imię gracza."; err.classList.remove("hidden"); return; }
  if (n !== oldName && allPlayers().indexOf(n) !== -1) { err.textContent = "Taki gracz już istnieje."; err.classList.remove("hidden"); return; }
  const sw = document.querySelector("#epColors .color-swatch.sel");
  const picked = sw ? sw.getAttribute("data-color") : null;
  if (picked) { state.colors[n] = picked; if (oldName && oldName !== n) delete state.colors[oldName]; }
  renamePlayer(oldName, n);
}
function renamePlayer(oldName, newName) {
  const err = $("epError");
  const n = pname(newName);
  if (!n) { err.textContent = "Podaj imię gracza."; err.classList.remove("hidden"); return; }
  if (n !== oldName && allPlayers().indexOf(n) !== -1) { err.textContent = "Taki gracz już istnieje."; err.classList.remove("hidden"); return; }
  if (n !== oldName) {
    state.roster = (state.roster || []).map(x => (x === oldName ? n : x));
    if (state.colors[oldName] && !state.colors[n]) { state.colors[n] = state.colors[oldName]; delete state.colors[oldName]; }
    const swap = v => (v === oldName ? n : v);
    state.tournaments.forEach(t => {
      t.players = (t.players || []).map(swap);
      [t.round1, t.round2].forEach(arr => (arr || []).forEach(m => { m.h = swap(m.h); m.a = swap(m.a); }));
      (t.cupRounds || []).forEach(r => (r.matches || []).forEach(m => { m.h = swap(m.h); m.a = swap(m.a); }));
      if (t.cupThird) { t.cupThird.h = swap(t.cupThird.h); t.cupThird.a = swap(t.cupThird.a); }
    });
  }
  save();
  closeOverlay("editPlayerOverlay");
  renderAll();
  toast("Gracz zapisany.", "ok");
}

/* ============================ REDRAW (LOSOWANIE) ============================ */
function openDraw(title, hint, pairs) {
  if ($("drawTitle")) $("drawTitle").innerHTML = ic("dice") + " " + esc(title);
  if ($("drawHint")) $("drawHint").textContent = hint;
  const box = $("drawCards");
  if (!box) return;
  box.innerHTML = pairs.map((p, i) => (
    '<div class="draw-card" data-i="' + i + '">' +
      '<div class="draw-inner">' +
        '<div class="draw-face draw-front">⚽</div>' +
        '<div class="draw-face draw-back"><span class="num">Mecz ' + (i + 1) + "</span>" + esc(p[0]) + " vs " + esc(p[1]) + "</div>" +
      "</div>" +
    "</div>"
  )).join("");
  openOverlay("drawOverlay");
  const cards = box.querySelectorAll(".draw-card");
  Array.prototype.forEach.call(cards, (c, i) => setTimeout(() => c.classList.add("revealed"), 120 + i * 110));
}
async function redrawRound() {
  const t = T();
  if (!t || t.format === "cup") return;
  const played = leagueMatches(t).filter(isPlayed).length;
  if (played) {
    const ok = await askConfirm("W turnieju są już wpisane wyniki (" + played + "). Ponowne losowanie usunie je wszystkie. Kontynuować?", "Losuj ponownie", "Losowanie od nowa");
    if (!ok) return;
  }
  const sch = leagueSchedule(t.players || []);
  t.round1 = sch.round1;
  t.round2 = sch.round2;
  t.drawn = true;
  save();
  renderMatches();
  renderBracket();
  renderStandings();
  openDraw("Losowanie terminarza", "Nowa kolejność meczów (Kolejka 1)", sch.round1.map(m => [m.h, m.a]));
}

/* ============================ DANE: EKSPORT / IMPORT / RESET ============================ */
function exportJson() {
  const payload = { app: "turniej-fifa", v: 1, exportedAt: Date.now(), state: state };
  const d = new Date();
  const stamp = d.toISOString().slice(0, 10);
  download("grzybowit-fifa-cup-" + stamp + ".json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  toast("Kopia zapasowa pobrana.", "ok");
}
function importJsonFile(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    let data;
    try { data = JSON.parse(String(reader.result)); }
    catch (e) { toast("Nie udało się odczytać pliku JSON.", "err"); return; }
    const st = (data && data.state) ? data.state : data;
    if (!st || !Array.isArray(st.tournaments)) { toast("Plik nie zawiera danych turnieju.", "err"); return; }
    const ok = await askConfirm("Import nadpisze obecne dane (" + state.tournaments.length + " turniejów). Kontynuować?", "Nadpisz", "Import danych");
    if (!ok) return;
    state = normalizeState(st);
    save();
    renderAll();
    toast("Dane zaimportowane.", "ok");
  };
  reader.readAsText(file);
}
async function resetAll() {
  const ok1 = await askConfirm("Wyczyścić WSZYSTKIE turnieje, wyniki i statystyki z tej przeglądarki?", "Dalej", "Wyczyścić dane?");
  if (!ok1) return;
  const ok2 = await askConfirm("Na pewno? Najpierw zrób kopię zapasową (Eksport). To ostatnie ostrzeżenie.", "Tak, wyczyść", "Potwierdź usunięcie");
  if (!ok2) return;
  state = { tournaments: [], currentId: null, colors: {}, roster: DEFAULT_ROSTER.slice(), games: [] };
  save();
  renderAll();
  switchView("home");
  toast("Dane wyczyszczone.", "ok");
}
function recoverLegacy() {
  const msg = $("recoverMsg");
  const found = [];
  LEGACY_KEYS.forEach(k => {
    const conv = convertLegacy(safeParse(k));
    if (!conv || !conv.tournaments) return;
    conv.tournaments.forEach(t => {
      const dup = state.tournaments.some(x => x.name === t.name && x.date === t.date);
      if (!dup) found.push(t);
    });
  });
  const first = knownFirstTour();
  if (!state.tournaments.some(x => x.name === first.name && x.date === first.date)) found.push(first);
  if (!found.length) { if (msg) msg.textContent = "Nie znaleziono dodatkowych zapisanych danych."; return; }
  found.forEach(t => state.tournaments.push(normalizeState({ tournaments: [t], roster: state.roster }).tournaments[0]));
  if (!state.currentId) state.currentId = state.tournaments[0].id;
  save();
  renderAll();
  if (msg) msg.textContent = "Dodano " + found.length + " " + plural(found.length, "turniej", "turnieje", "turniejów") + " z kopii.";
  toast("Odzyskano dane.", "ok");
}

/* ============================ WSPÓŁDZIELONE WYNIKI (textdb.online) ============================ */
const CLOUD_BASE = "https://textdb.online";
const SYNC_STORE = "fifa15_sync_v1";
const SYNC_POLL_MS = 10000;
const SYNC_PAGES_FALLBACK = "https://dzeppettto.github.io/turniej-fifa/";
const SYNC_DOT = { off: "off", connecting: "wait", saving: "wait", saved: "on", empty: "on", error: "err" };
const SYNC_TEXT = {
  off: "Brak synchronizacji — wyniki tylko w tej przeglądarce.",
  connecting: "Łączenie…",
  saving: "Zapisywanie…",
  saved: "Zsynchronizowane.",
  empty: "Kod gotowy — wpisz wyniki.",
  error: "Błąd połączenia — wyniki są w tej przeglądarce, spróbuję ponownie."
};
const SYNC_CHIP = { off: "Lokalnie", connecting: "Łączenie…", saving: "Zapisywanie…", saved: "Online", empty: "Online", error: "Błąd" };
let syncKey = null, syncUpdatedAt = 0, syncPending = null, syncLastSent = null;
let syncPushTimer = null, syncPollTimer = null, syncBusy = false, syncStatus = "off";

function syncClock() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}
function syncSetStatus(st) {
  syncStatus = st;
  const dotCls = SYNC_DOT[st] || "off";
  document.querySelectorAll(".sync-dot").forEach(d => { d.className = "sync-dot " + dotCls; });
  const chipText = $("syncChipText");
  if (chipText) chipText.textContent = SYNC_CHIP[st] || "Lokalnie";
  const boxText = $("syncStatusText");
  if (boxText) boxText.textContent = (SYNC_TEXT[st] || "") + (st === "saved" ? " · " + syncClock() : "");
  const dataText = $("dataSyncText");
  if (dataText) dataText.textContent = SYNC_TEXT[st] || "";
}
function syncReadMeta() { try { return JSON.parse(localStorage.getItem(SYNC_STORE) || "{}") || {}; } catch (e) { return {}; } }
function syncWriteMeta(key, updatedAt) { try { localStorage.setItem(SYNC_STORE, JSON.stringify({ key: key || "", updatedAt: updatedAt || 0 })); } catch (e) { } }
function syncNormalizeKey(v) {
  let s = String(v || "").trim();
  const m = s.match(/[?&]sync=([^&\s]+)/);
  if (m) s = decodeURIComponent(m[1]);
  return /^[0-9A-Za-z_-]{6,80}$/.test(s) ? s : "";
}
function syncNewKey() {
  const alpha = "0123456789abcdefghijklmnopqrstuvwxyz";
  let out = "";
  if (window.crypto && crypto.getRandomValues) {
    const a = new Uint8Array(20);
    crypto.getRandomValues(a);
    for (let i = 0; i < 20; i++) out += alpha[a[i] % alpha.length];
  } else {
    for (let i = 0; i < 20; i++) out += alpha[Math.floor(Math.random() * alpha.length)];
  }
  return "fifa-turniej-" + out;
}
function syncShareLink() {
  const base = (location.protocol === "http:" || location.protocol === "https:")
    ? location.origin + location.pathname : SYNC_PAGES_FALLBACK;
  return base + "?sync=" + encodeURIComponent(syncKey || "");
}
function cloudWrite(value) {
  const body = "key=" + encodeURIComponent(syncKey) + "&value=" + encodeURIComponent(value);
  return fetch(CLOUD_BASE + "/update", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
    .then(r => (r.ok ? r.json().catch(() => ({})) : Promise.reject(new Error("HTTP " + r.status))))
    .then(() => true)
    .catch(() => {
      const url = CLOUD_BASE + "/update?key=" + encodeURIComponent(syncKey) + "&value=" + encodeURIComponent(value);
      if (url.length > 8000) throw new Error("too large");
      return fetch(url).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return true; });
    });
}
function cloudPush() {
  if (!syncKey || !syncPending) return;
  if (syncBusy) { if (syncPushTimer) clearTimeout(syncPushTimer); syncPushTimer = setTimeout(cloudPush, 900); return; }
  const json = syncPending;
  const keyAtStart = syncKey;
  const payload = JSON.stringify({ app: "turniej-fifa", v: 1, updatedAt: syncUpdatedAt, state: JSON.parse(json) });
  syncBusy = true;
  syncSetStatus("saving");
  cloudWrite(payload)
    .then(() => { if (keyAtStart !== syncKey) return; syncLastSent = json; if (syncPending === json) syncPending = null; syncSetStatus("saved"); })
    .catch(() => syncSetStatus("error"))
    .finally(() => { syncBusy = false; });
}
function cloudMarkDirty() {
  if (!syncKey) return;
  let json; try { json = JSON.stringify(state); } catch (e) { return; }
  if (json === syncLastSent) return;
  syncPending = json;
  syncUpdatedAt = Date.now();
  syncWriteMeta(syncKey, syncUpdatedAt);
  if (syncPushTimer) clearTimeout(syncPushTimer);
  syncPushTimer = setTimeout(cloudPush, 1200);
}
function syncFetchRemote() {
  if (!syncKey) return Promise.resolve({ ok: false });
  const keyAtStart = syncKey;
  return fetch(CLOUD_BASE + "/" + encodeURIComponent(keyAtStart), { cache: "no-store" })
    .then(r => (r.ok ? r.text() : Promise.reject(new Error("HTTP " + r.status))))
    .then(txt => {
      if (keyAtStart !== syncKey) return { ok: false };
      const raw = (txt || "").trim();
      if (!raw) return { ok: true, payload: null };
      let p; try { p = JSON.parse(raw); } catch (e) { return { ok: true, payload: null }; }
      if (!p || !p.state || !Array.isArray(p.state.tournaments) || !p.state.tournaments.length) return { ok: true, payload: null };
      return { ok: true, payload: p };
    })
    .catch(() => ({ ok: false }));
}
function syncApplyRemote(remote) {
  syncApplying = true;
  try {
    const keepId = state && state.currentId;
    state = normalizeState(remote.state);
    if (keepId && state.tournaments.some(t => t.id === keepId)) state.currentId = keepId;
    syncUpdatedAt = remote.updatedAt || Date.now();
    syncLastSent = JSON.stringify(state);
    syncPending = null;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { }
    syncWriteMeta(syncKey, syncUpdatedAt);
    renderAll();
  } finally { syncApplying = false; }
  syncSetStatus("saved");
}
function cloudPull() {
  if (!syncKey || syncBusy) return;
  syncFetchRemote().then(res => {
    if (!syncKey || syncBusy) return;
    if (!res.ok) { syncSetStatus("error"); return; }
    const remote = res.payload;
    if (!remote) {
      if (syncPending) { cloudPush(); return; }
      if (countPlayed(state) > 0) {
        syncPending = JSON.stringify(state);
        syncUpdatedAt = Date.now();
        syncWriteMeta(syncKey, syncUpdatedAt);
        cloudPush();
        return;
      }
      syncSetStatus("empty");
      return;
    }
    const remoteAt = remote.updatedAt || 0;
    if (remoteAt > syncUpdatedAt) syncApplyRemote(remote);
    else if (syncUpdatedAt > remoteAt) { if (!syncPending) syncPending = JSON.stringify(state); cloudPush(); }
    else syncSetStatus("saved");
  });
}
function syncStartPolling() {
  if (syncPollTimer) clearInterval(syncPollTimer);
  syncPollTimer = setInterval(() => { if (!document.hidden) cloudPull(); }, SYNC_POLL_MS);
}
function syncStopPolling() { if (syncPollTimer) clearInterval(syncPollTimer); syncPollTimer = null; }
function syncConnect(key, opts) {
  opts = opts || {};
  const prevKey = syncNormalizeKey(syncReadMeta().key || "");
  syncKey = key;
  syncPending = null;
  syncLastSent = null;
  if (opts.seed) syncUpdatedAt = Date.now();
  else if (prevKey !== key) syncUpdatedAt = 0;
  syncWriteMeta(syncKey, syncUpdatedAt);
  syncSetStatus("connecting");
  syncRenderUI();
  if (opts.seed) { syncPending = JSON.stringify(state); cloudPush(); }
  else { try { syncLastSent = JSON.stringify(state); } catch (e) { syncLastSent = null; } cloudPull(); }
  syncStartPolling();
}
async function syncDisconnect(silent) {
  if (!silent) {
    const ok = await askConfirm("Rozłączyć współdzielenie? Wyniki zostaną w tej przeglądarce, ale przestaną się synchronizować.", "Rozłącz", "Rozłączyć?");
    if (!ok) return;
  }
  syncStopPolling();
  syncKey = null; syncPending = null; syncLastSent = null;
  syncWriteMeta("", 0);
  syncSetStatus("off");
  syncRenderUI();
}
function syncRenderUI() {
  const on = !!syncKey;
  if ($("syncConnected")) $("syncConnected").classList.toggle("hidden", !syncKey);
  if ($("syncDisconnected")) $("syncDisconnected").classList.toggle("hidden", !!syncKey);
  if (syncKey) {
    if ($("syncCodeOut")) $("syncCodeOut").value = syncKey;
    if ($("syncLinkOut")) $("syncLinkOut").value = syncShareLink();
  }
  syncSetStatus(syncStatus);
}
function syncError(msg) {
  const el = $("syncError");
  if (!el) return;
  if (!msg) { el.classList.add("hidden"); el.textContent = ""; return; }
  el.textContent = msg; el.classList.remove("hidden");
}
function syncCopy(text, okMsg) {
  const msg = $("syncMsg");
  const done = () => { if (msg) msg.textContent = okMsg || "Skopiowano!"; };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => syncCopyFallback(text, done));
  } else syncCopyFallback(text, done);
}
function syncCopyFallback(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch (e) { }
  ta.remove();
}
function openSync() {
  syncRenderUI();
  const e = $("syncError"); if (e) e.classList.add("hidden");
  const m = $("syncMsg"); if (m) m.textContent = "";
  openOverlay("syncOverlay");
}

/* ============================ START APLIKACJI ============================ */
function on(id, ev, fn) { const el = $(id); if (el) el.addEventListener(ev, fn); }

function wire() {
  $$(".nav-item").forEach(b => b.addEventListener("click", () => switchView(b.getAttribute("data-view"))));
  on("brandHome", "click", () => switchView("home"));
  on("btnNewTour", "click", openNewTour);
  on("homeNew", "click", openNewTour);
  on("homeCreate", "click", openNewTour);
  on("homeContinue", "click", () => switchView("matches"));
  on("homeGoMatches", "click", () => switchView("matches"));
  on("homeGoTable", "click", () => switchView("standings"));
  on("tourSelect", "change", e => { state.currentId = e.target.value; save(); renderAll(); });
  on("tbExport", "click", () => { const csv = standingsCsv(); if (!csv) { toast("Ta tabela jest niedostępna dla formatu drabinki.", "err"); return; } download("tabela.csv", csv, "text/csv;charset=utf-8"); });

  /* mecze: wpisywanie wyników */
  const area = $("matchesArea");
  if (area) {
    area.addEventListener("change", e => { if (e.target.classList.contains("score")) onScoreChange(e.target); });
    area.addEventListener("click", e => {
      const pen = e.target.closest("[data-pen]");
      if (pen) { onPenClick(pen.getAttribute("data-pen")); return; }
      const rd = e.target.closest("[data-redraw]");
      if (rd) redrawRound();
    });
  }

  /* tabela: sortowanie */
  const stbl = $("standingsTable");
  if (stbl) stbl.addEventListener("click", e => {
    const th = e.target.closest("th[data-sort]");
    if (!th) return;
    const k = th.getAttribute("data-sort");
    if (tableSort.key === k) tableSort.dir = -tableSort.dir;
    else { tableSort.key = k; tableSort.dir = (k === "name" || k === "pos") ? 1 : -1; }
    renderStandings();
  });
  on("tbTiebreak", "change", renderStandings);

  /* gracze: filtry, widok, sortowanie, H2H */
  const ptbl = $("playersTable");
  if (ptbl) ptbl.addEventListener("click", e => {
    const th = e.target.closest("th[data-psort]");
    if (!th) return;
    const k = th.getAttribute("data-psort");
    if (playerSort.key === k) playerSort.dir = -playerSort.dir;
    else { playerSort.key = k; playerSort.dir = (k === "name" || k === "pos") ? 1 : -1; }
    renderPlayers();
  });
  on("pgViewToggle", "click", e => {
    const b = e.target.closest("[data-pgview]");
    if (!b) return;
    playersView = b.getAttribute("data-pgview");
    renderPlayers();
  });
  ["pgFilter", "pgTour", "pgStage", "pgFrom", "pgTo"].forEach(id => on(id, "change", renderPlayers));
  on("pgReset", "click", () => {
    ["pgFilter", "pgTour", "pgStage", "pgFrom", "pgTo"].forEach(id => { const el = $(id); if (el) el.value = ""; });
    renderPlayers();
  });
  ["h2hA", "h2hB"].forEach(id => on(id, "change", renderH2H));
  on("h2hSwap", "click", () => {
    const a = $("h2hA"), b = $("h2hB");
    if (a && b) { const t = a.value; a.value = b.value; b.value = t; }
    renderH2H();
  });
  on("btnRosterAdd", "click", addRosterPlayer);
  on("rosterInput", "keydown", e => { if (e.key === "Enter") addRosterPlayer(); });
  on("rosterSearch", "input", renderRoster);

  /* turnieje */
  ["tourSearch", "tourFilterGame", "tourFilterStatus", "tourSort"].forEach(id => on(id, "input", renderTournaments));
  on("tourFilterStatus", "change", renderTournaments);
  on("tourFilterGame", "change", renderTournaments);
  on("tourExportCsv", "click", () => download("turnieje.csv", tournamentsCsv(), "text/csv;charset=utf-8"));
  on("btnRecover", "click", recoverLegacy);

  /* dane */
  on("btnExport", "click", exportJson);
  on("btnImport", "click", () => { const f = $("importFile"); if (f) f.click(); });
  on("importFile", "change", e => { const f = e.target.files[0]; if (f) importJsonFile(f); e.target.value = ""; });
  on("btnResetView", "click", resetAll);

  /* modale */
  on("confirmOk", "click", () => closeConfirm(true));
  on("confirmCancel", "click", () => closeConfirm(false));
  on("ntAddPlayer", "click", () => { const w = $("ntPlayers"); if (w) w.appendChild(ntPlayerRow("")); });
  on("ntCancel", "click", () => closeOverlay("newTourOverlay"));
  on("ntCreate", "click", createTour);
  on("ntFormat", "change", updateNtHint);
  on("etCancel", "click", () => closeOverlay("editTourOverlay"));
  on("etSave", "click", saveEditTour);
  on("tdClose", "click", () => closeOverlay("tourDetailOverlay"));
  on("tdCsv", "click", () => { const t = T(); if (t) download("turniej-" + t.name.replace(/[^\w]+/g, "-") + ".csv", tourCsv(t), "text/csv;charset=utf-8"); });
  on("tdPrint", "click", () => window.print());
  on("epCancel", "click", () => closeOverlay("editPlayerOverlay"));
  on("epSave", "click", saveEditPlayer);
  on("btnDrawClose", "click", () => closeOverlay("drawOverlay"));

  /* wybór gry */
  on("ntGame", "click", () => openGamePicker("nt"));
  on("etGame", "click", () => openGamePicker("et"));
  on("gpSearch", "input", e => renderGamePicker(e.target.value));
  const gp = $("gpSections");
  if (gp) gp.addEventListener("click", e => {
    const tile = e.target.closest("[data-game]");
    if (tile) { setGame(gameTarget, tile.getAttribute("data-game")); closeOverlay("gamePickerOverlay"); return; }
    const add = e.target.closest(".game-add button");
    if (add) {
      const inp = document.querySelector("#gpSections .game-add input");
      const val = inp ? inp.value.trim() : "";
      if (!val) return;
      setGame(gameTarget, val);
      renderGamePicker(inp.value);
      closeOverlay("gamePickerOverlay");
    }
  });

  /* sync */
  on("syncChip", "click", openSync);
  on("dataSyncOpen", "click", openSync);
  on("btnSyncCreate", "click", () => {
    syncConnect(syncNewKey(), { seed: true });
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(syncShareLink()).catch(() => { });
    const m = $("syncMsg"); if (m) m.textContent = "Kod utworzony — wyślij link znajomym (skopiowany do schowka).";
  });
  on("btnSyncJoin", "click", () => {
    const inp = $("syncJoinInput");
    const key = syncNormalizeKey(inp ? inp.value : "");
    const e = $("syncError");
    if (!key) { if (e) { e.textContent = "Nieprawidłowy kod. Wklej kod albo cały link."; e.classList.remove("hidden"); } return; }
    if (e) e.classList.add("hidden");
    syncConnect(key, { seed: false });
    const m = $("syncMsg"); if (m) m.textContent = "Połączono — pobieram wyniki…";
  });
  on("btnCopyLink", "click", () => syncCopy(syncShareLink(), "Link skopiowany."));
  on("btnCopyCode", "click", () => syncCopy(syncKey || "", "Kod skopiowany."));
  on("btnSyncNow", "click", () => { if (syncPending) cloudPush(); cloudPull(); });
  on("btnSyncLeave", "click", () => syncDisconnect(false));

  /* zamykanie nakładek */
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-close]");
    if (c) { closeOverlay(c.getAttribute("data-close")); return; }
    const ov = e.target.classList && e.target.classList.contains("overlay") ? e.target : null;
    if (ov) { if (ov.id === "confirmOverlay") closeConfirm(false); else ov.classList.add("hidden"); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      const open = openOverlays();
      if (open.length) { const top = open[open.length - 1]; if (top.id === "confirmOverlay") closeConfirm(false); else top.classList.add("hidden"); return; }
    }
    if (e.key === "Enter" && e.target && (e.target.classList.contains("hof-card") || e.target.classList.contains("player-card"))) {
      const pl = e.target.getAttribute("data-player");
      if (pl) openProfile(pl);
    }
  });

  /* globalne kliknięcia: profil / edycja / usuwanie / szczegóły turnieju */
  document.addEventListener("click", e => {
    const del = e.target.closest("[data-del-player]");
    if (del) { removeRosterPlayer(del.getAttribute("data-del-player")); return; }
    const edp = e.target.closest("[data-edit-player]");
    if (edp) { openEditPlayer(edp.getAttribute("data-edit-player")); return; }
    const td = e.target.closest("[data-tour-del]");
    if (td) { deleteTour(td.getAttribute("data-tour-del")); return; }
    const te = e.target.closest("[data-tour-edit]");
    if (te) { openEditTour(te.getAttribute("data-tour-edit")); return; }
    const tr = e.target.closest("[data-tour]");
    if (tr) { openTourDetail(tr.getAttribute("data-tour")); return; }
    const pl = e.target.closest("[data-player]");
    if (pl) { openProfile(pl.getAttribute("data-player")); return; }
  });

  /* ntPlayers usuwanie wiersza */
  const ntw = $("ntPlayers");
  if (ntw) ntw.addEventListener("click", e => { const b = e.target.closest("[data-nt-del]"); if (b) { const row = b.closest(".nt-player"); if (row) row.remove(); } });

  const epc = $("epColors");
  if (epc) epc.addEventListener("click", e => {
    const sw = e.target.closest(".color-swatch");
    if (!sw) return;
    epc.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("sel"));
    sw.classList.add("sel");
  });

  document.addEventListener("visibilitychange", () => { if (!document.hidden) cloudPull(); });
}

function onScoreChange(input) {
  const r = input.getAttribute("data-r"), i = input.getAttribute("data-i");
  const round = input.getAttribute("data-round"), s = input.getAttribute("data-s");
  const m = getMatch(r, i, round);
  if (!m) return;
  const raw = input.value.trim();
  let v = null;
  if (raw !== "") {
    v = clampInt(raw, 0, 99);
    if (v === null) { toast("Wpisz liczbę od 0 do 99.", "err"); input.value = input.getAttribute("data-orig") || ""; return; }
  }
  const field = s === "h" ? "hs" : "as";
  const old = m[field];
  const apply = () => {
    const t0 = T();
    const wasLeagueComplete = t0 ? leagueComplete(t0) : false;
    m[field] = v;
    if (m.hs == null || m.as == null || m.hs !== m.as) m.pen = null;
    input.setAttribute("data-orig", v == null ? "" : String(v));
    commitResult(wasLeagueComplete);
  };
  if (old != null && v !== null && old !== v) {
    askConfirm("Nadpisać wynik? Poprzednio " + old + " → teraz " + v + ".", "Nadpisz", "Nadpisać wynik?").then(ok => {
      if (ok) apply(); else input.value = String(old);
    });
  } else apply();
}
function commitResult(wasLeagueComplete) {
  const t = T();
  if (!t) return;
  const before = t.format === "cup" ? cupSignatureOf(t) : null;
  if (typeof wasLeagueComplete !== "boolean") wasLeagueComplete = leagueComplete(t);
  if (t.format === "cup") advanceCup(t);
  save();
  const structural = (t.format === "cup" && before !== cupSignatureOf(t)) || (t.format === "league+cup" && !wasLeagueComplete && leagueComplete(t));
  if (structural) {
    renderMatches();
  } else {
    refreshAllPenMeta();
    updateMatchBadges(t);
    const area = $("matchesArea");
    if (area) area.querySelectorAll(".match[data-match]").forEach(row => {
      const k = row.getAttribute("data-match").split("|");
      const mm = getMatch(k[0], k[1], k[2]);
      if (mm) row.classList.toggle("played", isPlayed(mm));
    });
  }
  renderTopbar();
  renderHome();
  renderStandings();
  renderBracket();
  const champion = championOf(t);
  if (champion.champion && isComplete(t)) toast("Mistrz: " + champion.champion + " 🏆", "ok");
}
function onPenClick(key) {
  const parts = key.split("|");
  const r = parts[0], round = parts[1], i = parts[2], side = parts[3];
  const m = getMatch(r, i, round);
  if (!m) return;
  if (!isPlayed(m) || m.hs !== m.as) { toast("Rzuty karne wskazujesz tylko przy remisie.", "err"); return; }
  m.pen = (m.pen === side) ? null : side;
  commitResult();
  refreshAllPenMeta();
}
function addRosterPlayer() {
  const inp = $("rosterInput");
  const msg = $("rosterMsg");
  const name = inp ? pname(inp.value) : "";
  if (!name) { if (msg) msg.textContent = "Wpisz imię gracza."; return; }
  if (allPlayers().indexOf(name) !== -1) { if (msg) msg.textContent = "Taki gracz już istnieje."; return; }
  state.roster.push(name);
  colorOf(name);
  if (inp) inp.value = "";
  if (msg) msg.textContent = "Dodano gracza " + name + ".";
  save();
  renderPlayers();
}
async function removeRosterPlayer(name) {
  const ok = await askConfirm("Usunąć „" + name + "“ z listy stałych graczy? Historia meczów zostanie zachowana.", "Usuń", "Usunąć gracza?");
  if (!ok) return;
  state.roster = (state.roster || []).filter(x => x !== name);
  save();
  renderPlayers();
  toast("Gracz usunięty z listy stałych.", "ok");
}

function init() {
  hydrateIcons(document);
  const dateEl = $("ntDate");
  if (dateEl) dateEl.value = todayISO();
  wire();
  populateFilters();
  renderAll();
  switchView("home");
  /* połączenie z ?sync=... */
  const fromUrl = (function () { const m = location.search.match(/[?&]sync=([^&\s]+)/); return m ? decodeURIComponent(m[1]) : ""; })();
  const meta = syncReadMeta();
  const key = syncNormalizeKey(fromUrl || meta.key || "");
  if (key) {
    if (fromUrl) { try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) { } }
    syncConnect(key, { seed: false });
  } else {
    syncUpdatedAt = meta.updatedAt || 0;
    syncSetStatus("off");
    syncRenderUI();
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
