const STORE_KEY = "fifa15_turnieje_v3";
const PALETTE = [
  "#ffd166", "#ff5c7a", "#5aa9ff", "#3ddc97", "#b28dff", "#ff9f43",
  "#4ecdc4", "#f78fb3", "#a0e7e5", "#f6e58d", "#c56cf0", "#ff7979",
];
const GAMES = [
  "FIFA 14", "FIFA 15", "FIFA 16", "FIFA 17", "FIFA 18", "FIFA 19",
  "FIFA 20", "FIFA 21", "FIFA 22", "FIFA 23",
  "EA SPORTS FC 24", "EA SPORTS FC 25", "EA SPORTS FC 26",
];
const DEFAULT_GAME = "FIFA 15";
const DEFAULT_ROSTER = ["Adi", "Maciek", "Mati", "Mikołaj"];
const LEGACY_KEYS = ["fifa15_turnieje_v2", "fifaTurniej4"];

/* ---------- stan ---------- */
let state = load() || defaultState();

function uid() { return Math.random().toString(36).slice(2, 9); }

function defaultState() {
  const tour = {
    id: uid(),
    name: "FIFA 15",
    game: DEFAULT_GAME,
    date: "2026-10-13",
    players: ["Maciek", "Mati", "Mikołaj", "Adi"],
    round1: [
      { h: "Maciek", a: "Mati", hs: 5, as: 4 },
      { h: "Adi", a: "Mikołaj", hs: 1, as: 3 },
      { h: "Mati", a: "Mikołaj", hs: null, as: null },
      { h: "Maciek", a: "Adi", hs: null, as: null },
      { h: "Adi", a: "Mati", hs: null, as: null },
      { h: "Mikołaj", a: "Maciek", hs: null, as: null },
    ],
    round2: [],
    drawn: false,
    final: { hs: null, as: null },
    third: { hs: null, as: null },
  };
  const colors = {};
  tour.players.forEach((p, i) => colors[p] = PALETTE[i % PALETTE.length]);
  return { tournaments: [tour], currentId: tour.id, colors, roster: DEFAULT_ROSTER.slice() };
}

function safeParse(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch (e) { return null; }
}

function countPlayed(s) {
  let n = 0;
  (s.tournaments || []).forEach(t => {
    [...(t.round1 || []), ...(t.round2 || [])].forEach(m => { if (m && m.hs != null && m.as != null) n++; });
    if (t.final && t.final.hs != null && t.final.as != null) n++;
    if (t.third && t.third.hs != null && t.third.as != null) n++;
  });
  return n;
}

function ensureColors(s) {
  if (!s.colors) s.colors = {};
  const add = p => { if (p && !s.colors[p]) s.colors[p] = PALETTE[Object.keys(s.colors).length % PALETTE.length]; };
  (s.tournaments || []).forEach(t => (t.players || []).forEach(add));
  (s.roster || []).forEach(add);
  return s;
}

function normalizeState(s) {
  if (!s) return s;
  (s.tournaments || []).forEach(t => {
    if (!t.game) t.game = DEFAULT_GAME;
    if (!t.final) t.final = { hs: null, as: null };
    if (!t.third) t.third = { hs: null, as: null };
    (t.round1 || []).forEach(m => { if (m.hs === undefined) m.hs = null; if (m.as === undefined) m.as = null; });
    (t.round2 || []).forEach(m => { if (m.hs === undefined) m.hs = null; if (m.as === undefined) m.as = null; });
  });
  if (!s.tournaments.some(t => t.id === s.currentId)) s.currentId = s.tournaments[0] && s.tournaments[0].id;
  if (!Array.isArray(s.roster) || !s.roster.length) {
    const set = [];
    (s.tournaments || []).forEach(t => (t.players || []).forEach(p => { if (!set.includes(p)) set.push(p); }));
    s.roster = set.length ? set : DEFAULT_ROSTER.slice();
  }
  return ensureColors(s);
}

function convertLegacy(s) {
  if (!s) return null;
  if (Array.isArray(s.tournaments) && s.tournaments.length) {
    return normalizeState(JSON.parse(JSON.stringify({ tournaments: s.tournaments, currentId: s.currentId, colors: s.colors })));
  }
  if (Array.isArray(s.round1)) {
    const players = [];
    s.round1.forEach(m => { if (!players.includes(m.h)) players.push(m.h); if (!players.includes(m.a)) players.push(m.a); });
    const id = Math.random().toString(36).slice(2, 9);
    const tour = {
      id, name: "FIFA 15", game: DEFAULT_GAME, date: "2026-10-13", players,
      round1: s.round1.map(m => ({ h: m.h, a: m.a, hs: m.hs ?? null, as: m.as ?? null })),
      round2: (s.round2 || []).map(m => ({ h: m.h, a: m.a, hs: m.hs ?? null, as: m.as ?? null })),
      drawn: !!s.drawn,
      final: { hs: (s.final && s.final.hs) ?? null, as: (s.final && s.final.as) ?? null },
      third: { hs: null, as: null },
    };
    return normalizeState({ tournaments: [tour], currentId: id, colors: {} });
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

function recoverLegacy() {
  const lg = bestLegacy();
  if (lg.state && lg.played > countPlayed(state)) {
    state = lg.state;
    save();
    renderAll();
    return true;
  }
  return false;
}

function load() {
  const current = safeParse(STORE_KEY);
  if (current && Array.isArray(current.tournaments) && current.tournaments.length) {
    normalizeState(current);
    const curPlayed = countPlayed(current);
    const lg = bestLegacy();
    if (lg.state && lg.played > curPlayed && curPlayed <= 2) return lg.state;
    return current;
  }
  const lg = bestLegacy();
  return lg.state || defaultState();
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

function T() { return state.tournaments.find(t => t.id === state.currentId) || state.tournaments[0]; }

function colorOf(name) {
  if (!state.colors[pname(name)]) {
    const used = Object.keys(state.colors).length;
    state.colors[pname(name)] = PALETTE[used % PALETTE.length];
  }
  return state.colors[pname(name)];
}
function pname(p) { return String(p).trim(); }

/* ---------- generowanie terminarza ---------- */
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
    arr.splice(1, 0, arr.pop());
  }
  return pairs;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function doDraw(t) {
  const pairs = t.round1.map(m => ({ h: m.a, a: m.h }));
  t.round2 = shuffle(pairs).map(({ h, a }) => ({ h, a, hs: null, as: null }));
  t.drawn = true;
  t.final = { hs: null, as: null };
  t.third = { hs: null, as: null };
  save();
}

function doDrawR1(t) {
  const pairs = roundRobin(t.players).map(p => Math.random() < 0.5 ? [p[0], p[1]] : [p[1], p[0]]);
  t.round1 = shuffle(pairs).map(([h, a]) => ({ h, a, hs: null, as: null }));
  t.r1Drawn = true;
  t.round2 = [];
  t.drawn = false;
  t.final = { hs: null, as: null };
  t.third = { hs: null, as: null };
  save();
}

/* ---------- obliczenia ---------- */
function isPlayed(m) { return m && m.hs != null && m.as != null; }

function leagueMatches(t) { return [...t.round1, ...t.round2]; }

function emptyStat(name) {
  return { name, m: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
}

function addMatch(st, m) {
  if (!isPlayed(m)) return;
  const H = st[m.h], A = st[m.a];
  if (!H || !A) return;
  H.m++; A.m++;
  H.gf += m.hs; H.ga += m.as;
  A.gf += m.as; A.ga += m.hs;
  if (m.hs > m.as) { H.w++; A.l++; H.pts += 3; }
  else if (m.hs < m.as) { A.w++; H.l++; A.pts += 3; }
  else { H.d++; A.d++; H.pts++; A.pts++; }
}

function h2h(t, p1, p2) {
  const r = { pts1: 0, d1: 0, gf1: 0, ga1: 0, pts2: 0, d2: 0, gf2: 0, ga2: 0 };
  leagueMatches(t).forEach(m => {
    if (!isPlayed(m)) return;
    if (m.h === p1 && m.a === p2) {
      r.gf1 += m.hs; r.ga1 += m.as; r.gf2 += m.as; r.ga2 += m.hs;
      if (m.hs > m.as) r.pts1 += 3; else if (m.hs < m.as) r.pts2 += 3; else { r.pts1++; r.pts2++; }
    } else if (m.h === p2 && m.a === p1) {
      r.gf2 += m.hs; r.ga2 += m.as; r.gf1 += m.as; r.ga1 += m.hs;
      if (m.hs > m.as) r.pts2 += 3; else if (m.hs < m.as) r.pts1 += 3; else { r.pts1++; r.pts2++; }
    }
  });
  r.d1 = r.gf1 - r.ga1; r.d2 = r.gf2 - r.ga2;
  return r;
}

function computeTable(t) {
  const st = {};
  t.players.forEach(p => st[p] = emptyStat(p));
  leagueMatches(t).forEach(m => addMatch(st, m));
  const rows = Object.values(st);
  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const da = a.gf - a.ga, db = b.gf - b.ga;
    if (db !== da) return db - da;
    const h = h2h(t, a.name, b.name);
    if (h.pts2 !== h.pts1) return h.pts2 - h.pts1;
    if (h.d2 !== h.d1) return h.d2 - h.d1;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name, "pl");
  });
  return rows;
}

function roundComplete(list) { return list.length > 0 && list.every(isPlayed); }
function leagueComplete(t) { return t.drawn && roundComplete(t.round1) && roundComplete(t.round2); }

function championOf(t) {
  const rows = computeTable(t);
  if (!leagueComplete(t)) return null;
  const f = t.final, s = t.third;
  const h1 = rows[0] && rows[0].name, h2 = rows[1] && rows[1].name;
  const out = { champion: null, runnerUp: null, third: null, fourth: null };
  if (isPlayed(f)) {
    if (f.hs > f.as) { out.champion = h1; out.runnerUp = h2; }
    else if (f.as > f.hs) { out.champion = h2; out.runnerUp = h1; }
    else { out.champion = "remis"; out.runnerUp = "remis"; }
  }
  if (isPlayed(s) && t.players.length >= 4) {
    if (s.hs > s.as) { out.third = rows[2].name; out.fourth = rows[3].name; }
    else if (s.as > s.hs) { out.third = rows[3].name; out.fourth = rows[2].name; }
    else { out.third = "remis"; out.fourth = "remis"; }
  }
  return out;
}

function allTimeStats() {
  return playerStats("");
}

/* wszystkie mecze turnieju: liga + faza pucharowa (z rozwiązaniem uczestników) */
function matchList(t) {
  const list = [
    ...t.round1.map(m => ({ ...m, stage: "K1" })),
    ...t.round2.map(m => ({ ...m, stage: "RW" })),
  ];
  if (leagueComplete(t)) {
    const rows = computeTable(t);
    if (isPlayed(t.final))
      list.push({ h: rows[0].name, a: rows[1].name, hs: t.final.hs, as: t.final.as, stage: "Finał" });
    if (t.players.length >= 4 && isPlayed(t.third))
      list.push({ h: rows[2].name, a: rows[3].name, hs: t.third.hs, as: t.third.as, stage: "o 3. m." });
  }
  return list;
}

function playerStats(game) {
  const st = {};
  const ensure = n => st[n] || (st[n] = Object.assign(emptyStat(n), { titles: 0, tours: 0 }));
  const tours = state.tournaments.filter(t => !game || t.game === game);
  tours.forEach(t => t.players.forEach(ensure));
  (state.roster || []).forEach(ensure);
  tours.forEach(t => {
    const seen = new Set();
    t.players.forEach(p => { if (!seen.has(p)) { ensure(p).tours++; seen.add(p); } });
    matchList(t).forEach(m => addMatch(st, m));
    const c = championOf(t);
    if (c && c.champion && c.champion !== "remis") ensure(c.champion).titles++;
  });
  const rows = Object.values(st);
  rows.forEach(p => {
    p.gd = p.gf - p.ga;
    p.winPct = p.m ? Math.round((p.w / p.m) * 100) : 0;
    p.avg = p.m ? (p.gf / p.m) : 0;
  });
  rows.sort((a, b) =>
    b.titles - a.titles || b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name, "pl")
  );
  return rows;
}

function perGameMatrix() {
  const games = GAMES.filter(g => state.tournaments.some(t => t.game === g));
  const players = playerStats("").map(p => p.name);
  const data = players.map(name => {
    const cells = games.map(g => {
      const p = playerStats(g).find(x => x.name === name);
      return p && p.m > 0 ? p : null;
    });
    return { name, cells };
  });
  return { games, players, data };
}

function h2hStats2(a, b, game) {
  const r = { a, b, m: 0, wa: 0, d: 0, wb: 0, gfa: 0, gfb: 0, games: [] };
  state.tournaments.forEach(t => {
    if (game && t.game !== game) return;
    matchList(t).forEach(m => {
      if (!isPlayed(m)) return;
      const isAB = m.h === a && m.a === b, isBA = m.h === b && m.a === a;
      if (!isAB && !isBA) return;
      r.m++;
      const aGoals = isAB ? m.hs : m.as;
      const bGoals = isAB ? m.as : m.hs;
      r.gfa += aGoals; r.gfb += bGoals;
      if (aGoals > bGoals) r.wa++; else if (aGoals < bGoals) r.wb++; else r.d++;
      r.games.push({ tour: t.name, date: t.date, stage: m.stage, a: aGoals, b: bGoals });
    });
  });
  return r;
}

function recentMatches(name, limit) {
  const out = [];
  state.tournaments.forEach(t => {
    matchList(t).forEach(m => {
      if (!isPlayed(m)) return;
      if (m.h !== name && m.a !== name) return;
      const gf = m.h === name ? m.hs : m.as;
      const ga = m.h === name ? m.as : m.hs;
      out.push({ tour: t.name, game: t.game, date: t.date, stage: m.stage,
        opp: m.h === name ? m.a : m.h, gf, ga,
        res: gf > ga ? "W" : gf < ga ? "P" : "R" });
    });
  });
  out.sort((x, y) => (y.date || "").localeCompare(x.date || ""));
  return out.slice(0, limit || 12);
}

function gamesPresent() {
  return GAMES.filter(g => state.tournaments.some(t => t.game === g));
}

function fillGameSelect(sel, selected) {
  sel.innerHTML = GAMES.map(g => `<option ${g === (selected || DEFAULT_GAME) ? "selected" : ""}>${esc(g)}</option>`).join("");
}

/* ---------- render ---------- */
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function color(p) { return state.colors[p] || "#8899cc"; }
function avatar(name) { return `<span class="avatar" style="background:${color(name)}">${esc(name[0] || "?")}</span>`; }

let activeTour = () => state.tournaments.find(t => t.id === state.currentId);

function matchHTML(m, round, i) {
  const played = isPlayed(m);
  return `
    <div class="match ${played ? "played" : ""}">
      <div class="m-idx">
        <span>Mecz ${i + 1} · Kolejka ${round}</span>
        ${played ? `<span>${m.hs}:${m.as}</span>` : ""}
      </div>
      <div class="player home">${esc(m.h)} ${avatar(m.h)}</div>
      <div class="score-cell">
        <input class="score" type="number" min="0" max="99" data-r="${round}" data-i="${i}" data-s="h" value="${m.hs ?? ""}" placeholder="-">
        <span class="vs">:</span>
        <input class="score" type="number" min="0" max="99" data-r="${round}" data-i="${i}" data-s="a" value="${m.as ?? ""}" placeholder="-">
      </div>
      <div class="player">${avatar(m.a)} ${esc(m.a)}</div>
    </div>`;
}

function renderRounds() {
  const t = activeTour();
  const h1 = document.getElementById("round1Header");
  const r1done = t.r1Drawn || t.round1.some(isPlayed);
  h1.innerHTML = `<span class="msg">${r1done ? `${t.round1.length} meczów wylosowanych.` : "Pary jeszcze nie wylosowane."}</span>
    <button class="btn ${r1done ? "btn-ghost" : "btn-gold"} btn-sm" id="btnDrawR1">${r1done ? "🔁 Przelosuj" : "🎲 Losuj"}</button>`;
  document.getElementById("round1List").innerHTML = t.round1.map((m, i) => matchHTML(m, 1, i)).join("");
  document.getElementById("btnDrawR1").onclick = () => openDraw(1);
  const hdr = document.getElementById("round2Header");
  const list = document.getElementById("round2List");
  if (!t.drawn) {
    hdr.innerHTML = `<span class="msg">Rewanże nie wylosowane.</span>
      <button class="btn btn-gold btn-sm" id="btnDrawInline">🎲 Losuj</button>`;
    list.innerHTML = `<div class="note">Kliknij „Losuj", aby wylosować kolejność ${t.round1.length} meczów rewanżowych (miejscówki odwrócone).</div>`;
    document.getElementById("btnDrawInline").onclick = () => openDraw(2);
  } else {
    hdr.innerHTML = `<span class="msg">Kolejność rewanżów (${t.round2.length} meczów).</span>
      <button class="btn btn-ghost btn-sm" id="btnRedraw">🔁 Przelosuj</button>`;
    list.innerHTML = t.round2.map((m, i) => matchHTML(m, 2, i)).join("");
    document.getElementById("btnRedraw").onclick = () => {
      if (confirm("Przelosować rewanże? Wyniki 2. kolejki zostaną usunięte.")) { doDraw(t); renderAll(); }
    };
  }
}

function renderTable() {
  const t = activeTour();
  const rows = computeTable(t);
  document.getElementById("tblName").textContent = t.name;
  document.getElementById("standingsBody").innerHTML = rows.map((p, i) => `
    <tr class="${i < 2 ? "qual" : ""}">
      <td>${i + 1}</td>
      <td class="name">${avatar(p.name)} ${esc(p.name)}</td>
      <td>${p.m}</td><td>${p.w}</td><td>${p.d}</td><td>${p.l}</td>
      <td>${p.gf}:${p.ga}</td>
      <td>${p.gf - p.ga > 0 ? "+" : ""}${p.gf - p.ga}</td>
      <td><span class="pill pts">${p.pts}</span></td>
    </tr>`).join("");
  return rows;
}

function bm(m, label) {
  if (!m) return `<div class="bm"><div class="row">${label}</div><div class="row lose">—</div></div>`;
  const played = isPlayed(m);
  const hWin = played && m.hs > m.as, aWin = played && m.as > m.hs;
  return `
    <div class="bm">
      <div class="tag">${label}</div>
      <div class="row ${played ? (hWin ? "win" : "lose") : ""}"><span>${esc(m.h)}</span><b>${m.hs ?? "-"}</b></div>
      <div class="row ${played ? (aWin ? "win" : "lose") : ""}"><span>${esc(m.a)}</span><b>${m.as ?? "-"}</b></div>
    </div>`;
}

function knockoutInput(m, key, cls) {
  return `
    <div class="row ${isPlayed(m) && m.hs > m.as ? "win" : ""}">
      <span>${esc(m.h)}</span>
      <input class="score" type="number" min="0" max="99" data-r="${key}" data-i="0" data-s="h" value="${m.hs ?? ""}" placeholder="-">
    </div>
    <div class="row ${isPlayed(m) && m.as > m.hs ? "win" : ""}">
      <span>${esc(m.a)}</span>
      <input class="score" type="number" min="0" max="99" data-r="${key}" data-i="0" data-s="a" value="${m.as ?? ""}" placeholder="-">
    </div>`;
}

function renderBracket() {
  const t = activeTour();
  const rows = computeTable(t);
  const done = leagueComplete(t);
  document.getElementById("brName").textContent = t.name;

  document.getElementById("bracketR1").innerHTML = t.round1.map((m, i) => bm(m, `M${i + 1}`)).join("");
  document.getElementById("bracketR2").innerHTML = t.drawn
    ? t.round2.map((m, i) => bm(m, `RW${i + 1}`)).join("")
    : `<div class="bm"><div class="row">Brak losowania</div></div>`;

  const h1 = rows[0] ? rows[0].name : "1. miejsce";
  const h2 = rows[1] ? rows[1].name : "2. miejsce";
  const h3 = rows[2] ? rows[2].name : "3. miejsce";
  const h4 = rows[3] ? rows[3].name : "4. miejsce";

  const fm = { h: h1, a: h2, hs: t.final.hs, as: t.final.as };
  const tm = { h: h3, a: h4, hs: t.third.hs, as: t.third.as };

  const ae = document.activeElement;
  const focusKey = ae && ae.dataset ? ae.dataset.r : null;

  const finalEl = document.getElementById("bracketFinal");
  if (focusKey !== "f") {
    finalEl.innerHTML = `
      <div class="bm ${done ? "bm-live" : ""}">
        <div class="tag">${done ? "FINAŁ" : "Awansują 1. i 2. miejsce z tabeli"}</div>
        ${knockoutInput(fm, "f")}
        <div class="tag" style="margin-top:6px">${finalStatus(t, fm)}</div>
      </div>`;
    finalEl.querySelectorAll(".score").forEach(el => el.disabled = !done);
  }

  const thirdEl = document.getElementById("bracketThird");
  if (focusKey !== "t") {
    if (t.players.length >= 4) {
      thirdEl.innerHTML = `
        <div class="bm">
          <div class="tag">${done ? "MECZ O 3. MIEJSCE" : "Awansują 3. i 4. miejsce z tabeli"}</div>
          ${knockoutInput(tm, "t")}
          <div class="tag" style="margin-top:6px">${thirdStatus(t, tm)}</div>
        </div>`;
      thirdEl.querySelectorAll(".score").forEach(el => el.disabled = !done);
    } else {
      thirdEl.innerHTML = `<div class="bm"><div class="row">Mecz o 3. miejsce wymaga min. 4 graczy</div></div>`;
    }
  }
}

function finalStatus(t, fm) {
  if (!(isPlayed(t.final))) return "Wpisz wynik finału";
  if (fm.hs > fm.as) return `🏆 Mistrz: ${esc(fm.h)}`;
  if (fm.as > fm.hs) return `🏆 Mistrz: ${esc(fm.a)}`;
  return "Remis — dogrywka/karne!";
}
function thirdStatus(t, tm) {
  if (!(isPlayed(t.third))) return "";
  if (tm.hs > tm.as) return `🥉 3. miejsce: ${esc(tm.h)}`;
  if (tm.as > tm.hs) return `🥉 3. miejsce: ${esc(tm.a)}`;
  return "Remis — dogrywka/karne!";
}

function renderTours() {
  const t = activeTour();
  const wrap = document.getElementById("tourSelect");
  wrap.innerHTML = state.tournaments.map(x =>
    `<option value="${x.id}" ${x.id === state.currentId ? "selected" : ""}>${esc(x.name)} · ${esc(x.date)}</option>`
  ).join("");

  document.getElementById("brandGame").textContent = t.game || DEFAULT_GAME;
  document.getElementById("brandDate").textContent = t.date;
  document.getElementById("tourSub").textContent =
    `${t.name} · ${t.players.length} graczy`;

  renderTournamentRows();
}

function tournamentRow(t) {
  const c = championOf(t) || {};
  const done = leagueComplete(t);
  return `
    <tr class="${t.id === state.currentId ? "qual" : ""}">
      <td class="name">${esc(t.name)}</td>
      <td><span class="badge">${esc(t.game || DEFAULT_GAME)}</span></td>
      <td>${esc(t.date)}</td>
      <td>${t.players.length}</td>
      <td>${c.champion ? esc(c.champion) : "—"}</td>
      <td>${c.runnerUp ? esc(c.runnerUp) : "—"}</td>
      <td>${c.third ? esc(c.third) : "—"}</td>
      <td>${done ? "<span class='badge badge-live'>zakończony</span>" : "<span class='badge'>w trakcie</span>"}</td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-xs" data-open="${t.id}">Otwórz</button>
        <button class="btn btn-ghost btn-xs" data-edit="${t.id}">✏️ Edytuj</button>
        <button class="btn btn-red btn-xs" data-del="${t.id}">Usuń</button>
      </td>
    </tr>`;
}

function renderTournamentRows() {
  const tbody = document.getElementById("tourRows");
  if (!tbody) return;
  tbody.innerHTML = state.tournaments.map(tournamentRow).join("");
  tbody.querySelectorAll("[data-open]").forEach(b => b.onclick = () => {
    state.currentId = b.dataset.open; save(); hideHistory(); switchTab("kolejki"); renderAll();
  });
  tbody.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openEditTour(b.dataset.edit));
  tbody.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
    if (state.tournaments.length === 1) { alert("Musi istnieć co najmniej jeden turniej."); return; }
    if (confirm("Usunąć ten turniej na stałe?")) {
      state.tournaments = state.tournaments.filter(t => t.id !== b.dataset.del);
      if (!state.tournaments.find(t => t.id === state.currentId)) state.currentId = state.tournaments[0].id;
      save(); renderAll();
    }
  });
}

function renderAll() {
  renderTours();
  renderRounds();
  renderTable();
  renderBracket();
  renderPlayers();
  save();
}

/* ---------- zakładka GRACZE ---------- */
function fillGameFilter(sel, includeAll) {
  const games = gamesPresent();
  const cur = sel.value;
  let html = includeAll ? `<option value="">Wszystkie gry</option>` : "";
  html += games.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
  sel.innerHTML = html || `<option value="">Brak gier</option>`;
  if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
}

function renderPlayers() {
  const filter = document.getElementById("pgFilter");
  fillGameFilter(filter, true);
  const game = filter.value;

  document.getElementById("pgBadge").textContent = game || "Wszystkie gry";
  const rows = playerStats(game);
  document.getElementById("pgCount").textContent = rows.length ? `${rows.length} zawodników` : "";
  document.getElementById("playersBody").innerHTML = rows.length ? rows.map((p, i) => `
    <tr class="${i === 0 && p.titles > 0 ? "qual" : ""}">
      <td>${i + 1}</td>
      <td class="name player-link" data-player="${esc(p.name)}">${avatar(p.name)} ${esc(p.name)}</td>
      <td>${p.tours}</td>
      <td><span class="pill ${p.titles ? "pts" : ""}">${p.titles}</span></td>
      <td>${p.m}</td><td>${p.w}</td><td>${p.d}</td><td>${p.l}</td>
      <td>${p.gf}:${p.ga}</td>
      <td>${p.gd > 0 ? "+" : ""}${p.gd}</td>
      <td>${p.pts}</td>
      <td>${p.winPct}%</td>
      <td>${p.avg.toFixed(2)}</td>
    </tr>`).join("") : `<tr><td colspan="13" class="note">Brak danych.</td></tr>`;

  document.querySelectorAll("#playersBody .player-link").forEach(el =>
    el.onclick = () => openProfile(el.dataset.player)
  );

  renderPerGame();
  renderH2H();
  renderRoster();
}

function renderRoster() {
  const box = document.getElementById("rosterList");
  if (!box) return;
  const badge = document.getElementById("rosterBadge");
  if (badge) badge.textContent = `${(state.roster || []).length}`;
  box.innerHTML = (state.roster || []).map(p => `
    <span class="chip" style="border-color:${color(p)}">
      <span class="avatar" style="background:${color(p)}">${esc(p[0] || "?")}</span>
      <span class="chip-name" data-name="${esc(p)}" title="Pokaż profil">${esc(p)}</span>
      <button class="chip-x" data-name="${esc(p)}" title="Usuń z listy stałej">✕</button>
    </span>`).join("") || `<span class="note">Brak stałych graczy.</span>`;
}

function renderPerGame() {
  const { games, data } = perGameMatrix();
  const head = document.getElementById("perGameHead");
  const body = document.getElementById("perGameBody");
  if (!games.length) {
    head.innerHTML = "";
    body.innerHTML = `<tr><td class="note" colspan="2">Brak danych.</td></tr>`;
    return;
  }
  head.innerHTML = `<tr><th>Zawodnik</th>${games.map(g => `<th>${esc(g)}</th>`).join("")}</tr>`;
  body.innerHTML = data.map(row => {
    const cells = row.cells.map(c => {
      if (!c) return `<td class="muted">—</td>`;
      const title = c.titles ? ` · 🏆${c.titles}` : "";
      return `<td><b>${c.w}-${c.d}-${c.l}</b><span class="mini">${c.pts} pkt${title}</span></td>`;
    }).join("");
    return `<tr><td class="name">${avatar(row.name)} ${esc(row.name)}</td>${cells}</tr>`;
  }).join("");
}

function renderH2H() {
  const a = document.getElementById("h2hA"), b = document.getElementById("h2hB");
  const players = playerStats("").map(p => p.name);
  const ca = a.value, cb = b.value;
  a.innerHTML = players.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join("");
  b.innerHTML = players.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join("");
  const res = document.getElementById("h2hResult");
  if (players.length < 2) { res.innerHTML = `<p class="note">Potrzeba min. 2 graczy.</p>`; return; }
  if (players.includes(ca)) a.value = ca;
  if (players.includes(cb)) b.value = cb;
  if (!a.value) a.value = players[0];
  if (!b.value || b.value === a.value) b.value = players.find(p => p !== a.value) || players[0];

  const game = document.getElementById("pgFilter").value;
  const r = h2hStats2(a.value, b.value, game);
  res.innerHTML = `
    <div class="h2h-board">
      <div class="h2h-side"><span class="avatar" style="background:${color(a.value)}">${esc(a.value[0])}</span> ${esc(a.value)}<b>${r.wa}</b><span class="mini">zwycięstwa</span></div>
      <div class="h2h-mid"><b>${r.gfa}:${r.gfb}</b><span class="mini">bramki · mecze: ${r.m} · remisy: ${r.d}</span></div>
      <div class="h2h-side">${esc(b.value)} <span class="avatar" style="background:${color(b.value)}">${esc(b.value[0])}</span><b>${r.wb}</b></div>
    </div>`;
  if (!r.games.length) { res.innerHTML += `<p class="note">Brak rozegranych meczów między tymi graczami${game ? " w " + esc(game) : ""}.</p>`; return; }
  res.innerHTML += `<div class="table-wrap"><table class="standings mini-table">
    <thead><tr><th>Data</th><th>Turniej</th><th>Faza</th><th>Wynik</th></tr></thead>
    <tbody>${r.games.map(g => `
      <tr><td>${esc(g.date)}</td><td>${esc(g.tour)}</td><td>${esc(g.stage)}</td>
      <td class="${g.a > g.b ? "res-w" : g.a < g.b ? "res-l" : "res-d"}">${g.a}:${g.b}</td></tr>`).join("")}
    </tbody></table></div>`;
}

function openProfile(name) {
  const all = playerStats("").find(p => p.name === name);
  if (!all) return;
  const gamesList = gamesPresent();
  const perGame = gamesList.map(g => ({ g, p: playerStats(g).find(x => x.name === name) })).filter(x => x.p && x.p.m > 0);
  const recent = recentMatches(name, 12);
  document.getElementById("profileContent").innerHTML = `
    <h2><span class="avatar big" style="background:${color(name)}">${esc(name[0])}</span> ${esc(name)}</h2>
    <div class="profile-grid">
      <div><span>Tytuły</span><b>${all.titles}</b></div>
      <div><span>Turnieje</span><b>${all.tours}</b></div>
      <div><span>Mecze</span><b>${all.m}</b></div>
      <div><span>Z-R-P</span><b>${all.w}-${all.d}-${all.l}</b></div>
      <div><span>Bramki</span><b>${all.gf}:${all.ga}</b></div>
      <div><span>Bilans</span><b>${all.gd > 0 ? "+" : ""}${all.gd}</b></div>
      <div><span>Punkty</span><b>${all.pts}</b></div>
      <div><span>% zwycięstw</span><b>${all.winPct}%</b></div>
      <div><span>Śr. bramek</span><b>${all.avg.toFixed(2)}</b></div>
    </div>
    ${perGame.length ? `<h3 class="sect">Per gra</h3>
      <div class="table-wrap"><table class="standings mini-table">
        <thead><tr><th>Gra</th><th>M</th><th>Z-R-P</th><th>Bramki</th><th>Pkt</b></th><th>🏆</th></tr></thead>
        <tbody>${perGame.map(x => `<tr>
          <td class="name">${esc(x.g)}</td><td>${x.p.m}</td>
          <td>${x.p.w}-${x.p.d}-${x.p.l}</td><td>${x.p.gf}:${x.p.ga}</td>
          <td>${x.p.pts}</td><td>${x.p.titles || ""}</td></tr>`).join("")}
      </tbody></table></div>` : ""}
    <h3 style="margin:16px 0 8px">Ostatnie mecze</h3>
    ${recent.length ? `<div class="recent">${recent.map(m => `
      <div class="recent-row">
        <span class="rb rb-${m.res}">${m.res}</span>
        <span class="opp">${esc(m.opp)}</span>
        <b>${m.gf}:${m.ga}</b>
        <span class="meta">${esc(m.game)} · ${esc(m.tour)} · ${esc(m.stage)}</span>
      </div>`).join("")}</div>` : `<p class="note">Brak rozegranych meczów.</p>`}
  `;
  document.getElementById("profileOverlay").classList.remove("hidden");
}

/* ---------- interakcje ---------- */
document.addEventListener("input", (e) => {
  if (!e.target.classList.contains("score")) return;
  const { r, i, s } = e.target.dataset;
  const v = e.target.value === "" ? null : Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0));
  const t = activeTour();
  const key = s === "h" ? "hs" : "as";
  if (r === "1") t.round1[+i][key] = v;
  else if (r === "2") t.round2[+i][key] = v;
  else if (r === "f") t.final[key] = v;
  else if (r === "t") t.third[key] = v;
  save();
  renderTable();
  if (r === "f" || r === "t") {
    const el = document.getElementById(r === "f" ? "bracketFinal" : "bracketThird");
    el && (el.querySelectorAll(".score").forEach(x => x.disabled = !leagueComplete(t)));
    updateKnockoutText(r);
  } else {
    renderBracket();
  }
  renderTournamentRows();
  renderPlayers();
});

function updateKnockoutText(r) {
  const t = activeTour();
  const rows = computeTable(t);
  const isFinal = r === "f";
  const m = isFinal ? t.final : t.third;
  const el = document.getElementById(isFinal ? "bracketFinal" : "bracketThird");
  if (!el) return;
  const rowEls = el.querySelectorAll(".bm .row");
  const played = isPlayed(m);
  if (rowEls[0]) rowEls[0].classList.toggle("win", played && m.hs > m.as);
  if (rowEls[1]) rowEls[1].classList.toggle("win", played && m.as > m.hs);
  const tag = el.querySelector(".bm .tag:last-child");
  if (tag) {
    const fm = { h: rows[0] && rows[0].name, a: rows[1] && rows[1].name };
    const tm = { h: rows[2] && rows[2].name, a: rows[3] && rows[3].name };
    tag.textContent = isFinal ? finalStatus(t, fm) : thirdStatus(t, tm);
  }
}

/* tabs */
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(x => x.classList.toggle("active", x.id === name));
}
document.querySelectorAll(".tab").forEach(t => t.onclick = () => switchTab(t.dataset.tab));
document.getElementById("tourSelect").onchange = (e) => {
  state.currentId = e.target.value;
  save();
  renderAll();
};

/* losowanie */
const overlay = document.getElementById("drawOverlay");
function showDraw(matches, title, hint) {
  document.getElementById("drawTitle").textContent = `🎰 Losowanie — ${title}`;
  document.getElementById("drawHint").textContent = hint;
  const cards = document.getElementById("drawCards");
  cards.innerHTML = matches.map((m, i) => `
    <div class="draw-card" data-i="${i}">
      <div class="draw-inner">
        <div class="draw-face draw-front">🎲</div>
        <div class="draw-face draw-back">
          <span class="num">Mecz ${i + 1}</span>
          ${esc(m.h)} — ${esc(m.a)}
        </div>
      </div>
    </div>`).join("");
  overlay.classList.remove("hidden");
  const els = [...cards.querySelectorAll(".draw-card")];
  els.forEach((c, i) => setTimeout(() => c.classList.add("revealed"), 300 + i * 300));
  setTimeout(renderAll, 300 + els.length * 300);
}

function openDraw(round) {
  const t = activeTour();
  if (round === 1) {
    if (t.round1.some(isPlayed) && !confirm("Przelosować kolejkę 1? Wyniki 1. kolejki zostaną usunięte.")) return;
    doDrawR1(t);
    showDraw(t.round1, "Kolejka 1", "Wylosowane pary 1. kolejki (mecze między graczami)");
    return;
  }
  if (t.drawn && t.round2.some(isPlayed) && !confirm("Przelosować? Wyniki rewanżów zostaną usunięte.")) return;
  doDraw(t);
  showDraw(t.round2, "Rewanże", "Wylosowana kolejność meczów rewanżowych (miejscówki odwrócone)");
}
document.getElementById("btnDraw").onclick = () => openDraw(2);
document.getElementById("btnDrawClose").onclick = () => overlay.classList.add("hidden");
overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.add("hidden"); };

/* nowy turniej */
const newOverlay = document.getElementById("newTourOverlay");
function playerRow(val) {
  const div = document.createElement("div");
  div.className = "nt-player";
  div.innerHTML = `<input type="text" value="${val ? esc(val) : ""}" placeholder="Imię gracza">
    <button type="button" class="btn btn-red btn-xs">✕</button>`;
  div.querySelector("button").onclick = () => div.remove();
  return div;
}
function openNewTour() {
  document.getElementById("ntName").value = "";
  document.getElementById("ntError").classList.add("hidden");
  const d = document.getElementById("ntDate");
  d.value = new Date().toISOString().slice(0, 10);
  const g = document.getElementById("ntGame");
  g.innerHTML = GAMES.map(x => `<option ${x === DEFAULT_GAME ? "selected" : ""}>${esc(x)}</option>`).join("");
  const box = document.getElementById("ntPlayers");
  box.innerHTML = "";
  const seeds = (state.roster && state.roster.length) ? state.roster.slice() : ["", "", "", ""];
  seeds.forEach(v => box.appendChild(playerRow(v)));
  newOverlay.classList.remove("hidden");
}
document.getElementById("btnNewTour").onclick = openNewTour;
document.getElementById("ntCancel").onclick = () => newOverlay.classList.add("hidden");
document.getElementById("ntAddPlayer").onclick = () => document.getElementById("ntPlayers").appendChild(playerRow(""));
newOverlay.onclick = (e) => { if (e.target === newOverlay) newOverlay.classList.add("hidden"); };

document.getElementById("ntCreate").onclick = () => {
  const name = document.getElementById("ntName").value.trim() || "Turniej";
  const game = document.getElementById("ntGame").value || DEFAULT_GAME;
  const date = document.getElementById("ntDate").value || new Date().toISOString().slice(0, 10);
  const players = [...document.querySelectorAll("#ntPlayers input")]
    .map(i => i.value.trim()).filter(Boolean);
  const err = document.getElementById("ntError");
  if (players.length < 2) { err.textContent = "Podaj co najmniej 2 graczy."; err.classList.remove("hidden"); return; }
  if (new Set(players).size !== players.length) { err.textContent = "Imiona graczy muszą być unikalne."; err.classList.remove("hidden"); return; }

  const pairs = roundRobin(players);
  const tour = {
    id: uid(), name, game, date, players,
    round1: pairs.map(([h, a]) => ({ h, a, hs: null, as: null })),
    round2: [], drawn: false,
    final: { hs: null, as: null }, third: { hs: null, as: null },
  };
  players.forEach((p, i) => { if (!state.colors[p]) state.colors[p] = PALETTE[i % PALETTE.length]; });
  state.tournaments.push(tour);
  state.currentId = tour.id;
  save();
  newOverlay.classList.add("hidden");
  switchTab("kolejki");
  renderAll();
};

/* edycja turnieju (nazwa / gra / data) */
const editOverlay = document.getElementById("editTourOverlay");
let editTourId = null;
function openEditTour(id) {
  const t = state.tournaments.find(x => x.id === id);
  if (!t) return;
  editTourId = id;
  document.getElementById("etName").value = t.name;
  document.getElementById("etDate").value = t.date || "";
  const g = document.getElementById("etGame");
  g.innerHTML = GAMES.map(x => `<option ${x === (t.game || DEFAULT_GAME) ? "selected" : ""}>${esc(x)}</option>`).join("");
  editOverlay.classList.remove("hidden");
}
document.getElementById("etCancel").onclick = () => editOverlay.classList.add("hidden");
editOverlay.onclick = (e) => { if (e.target === editOverlay) editOverlay.classList.add("hidden"); };
document.getElementById("etSave").onclick = () => {
  const t = state.tournaments.find(x => x.id === editTourId);
  if (!t) { editOverlay.classList.add("hidden"); return; }
  t.name = document.getElementById("etName").value.trim() || t.name;
  t.game = document.getElementById("etGame").value || DEFAULT_GAME;
  t.date = document.getElementById("etDate").value || t.date;
  save(); renderAll();
  editOverlay.classList.add("hidden");
};

/* gracze: filtry / H2H / profil */
document.getElementById("pgFilter").onchange = renderPlayers;
document.getElementById("h2hA").onchange = renderH2H;
document.getElementById("h2hB").onchange = renderH2H;
const profileOverlay = document.getElementById("profileOverlay");
document.getElementById("btnProfileClose").onclick = () => profileOverlay.classList.add("hidden");
profileOverlay.onclick = (e) => { if (e.target === profileOverlay) profileOverlay.classList.add("hidden"); };

/* gracze stali (roster) */
const rosterInput = document.getElementById("rosterInput");
const rosterList = document.getElementById("rosterList");
document.getElementById("btnRosterAdd").onclick = () => {
  const msg = document.getElementById("rosterMsg");
  const name = (rosterInput.value || "").trim();
  if (!name) { msg.textContent = "Podaj imię."; return; }
  if ((state.roster || []).includes(name)) { msg.textContent = "Taki gracz już jest na liście."; return; }
  state.roster.push(name);
  if (!state.colors[name]) state.colors[name] = PALETTE[Object.keys(state.colors).length % PALETTE.length];
  rosterInput.value = "";
  msg.textContent = `Dodano: ${name}.`;
  save();
  renderAll();
};
rosterInput.onkeydown = (e) => { if (e.key === "Enter") document.getElementById("btnRosterAdd").click(); };
rosterList.onclick = (e) => {
  const x = e.target.closest(".chip-x");
  if (x) {
    const name = x.dataset.name;
    if (confirm(`Usunąć ${name} z listy stałych graczy? Statystyki z turniejów pozostaną zapisane.`)) {
      state.roster = (state.roster || []).filter(p => p !== name);
      save();
      renderAll();
    }
    return;
  }
  const n = e.target.closest(".chip-name");
  if (n) openProfile(n.dataset.name);
};

/* odzyskiwanie danych ze starszej wersji */
const btnRecover = document.getElementById("btnRecover");
if (btnRecover) btnRecover.onclick = () => {
  const lg = bestLegacy();
  const msg = document.getElementById("recoverMsg");
  if (!lg.state) { msg.textContent = "Nie znaleziono danych z poprzedniej wersji."; return; }
  if (lg.played <= countPlayed(state)) {
    msg.textContent = `Brak nowych wyników (poprzednia wersja: ${lg.played} rozegranych meczów).`;
    return;
  }
  if (confirm(`Znaleziono turniej z ${lg.played} rozegranymi meczami. Zastąpić obecne dane?`)) {
    state = lg.state;
    save();
    renderAll();
    msg.textContent = "Odzyskano wyniki.";
  }
};

/* ekran startowy + ekran statystyk/historii */
const intro = document.getElementById("intro");
const historyScreen = document.getElementById("historyScreen");
const hideIntro = () => intro.classList.add("hidden");
const showIntro = () => intro.classList.remove("hidden");
const openHistory = () => { renderAll(); intro.classList.add("hidden"); historyScreen.classList.remove("hidden"); };
const hideHistory = () => historyScreen.classList.add("hidden");
const closeHistory = () => { hideHistory(); showIntro(); };

document.querySelector(".brand").onclick = showIntro;
document.getElementById("introNew").onclick = () => { hideIntro(); openNewTour(); };
document.getElementById("introStats").onclick = openHistory;
document.getElementById("introContinue").onclick = () => { hideIntro(); switchTab("kolejki"); };
document.getElementById("btnHistoryBack").onclick = closeHistory;

renderAll();
