// Rail: places in a docked rail, in vertical order; deeper replaces the sheet, with a breadcrumb back.
const { move } = window.Motion;
const { rect, from, tour } = window.Proto;
const $ = (id) => document.getElementById(id);
const content = $("content"), column = $("column"), crumbs = $("crumbs"), side = $("side");
const NAMES = ["Attention", "Overview"];

document.querySelectorAll("[data-place]").forEach((p) => (p.innerHTML = Surfaces[p.dataset.place]()));

function go(el, transform, kind = "paper") {
  const start = getComputedStyle(el).transform;
  const a = move(el, [{ transform: start === "none" ? "none" : start }, { transform }], kind);
  a.finished.then(() => { a.commitStyles(); a.cancel(); }).catch(() => {});
  return a;
}

/* Places sit one above another, matching the rail's order, so moving down the rail moves the content up. */
let place = 0;
function goPlace(n) {
  while (trail.length) close(true);
  place = n;
  go(column, `translateY(${-800 * n}px)`);
  go($("ind"), `translateY(${38 * n}px)`, "card");
  document.querySelectorAll("[data-go]").forEach((b) => b.toggleAttribute("aria-current", +b.dataset.go === n));
  $("mark").classList.toggle("on", n !== 0);
  showCrumbs();
}
document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => goPlace(+b.dataset.go)));

/* Deeper: one sheet fills the content area. Going deeper again replaces it; the breadcrumb holds the way back. */
const trail = [];
const area = () => ({ x: 0, y: 0, w: content.clientWidth, h: 800 });

function open(id, origin, title) {
  const layer = document.createElement("div");
  layer.className = "layer";
  Object.assign(layer.style, { left: "12px", top: "44px", right: "12px", bottom: "12px", zIndex: `calc(var(--z-sheet) + ${trail.length})` });
  layer.innerHTML = Surfaces[id]();
  content.append(layer);
  const box = rect(layer), o = rect(origin);
  const grow = move(layer, [{ transform: from(o, box), opacity: 1 }, { transform: "none", opacity: 1 }], "paper");
  grow.finished.then(() => grow.cancel());
  move(layer.lastElementChild, [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], "paper");
  // The sheet underneath is replaced, not piled: it fades as the new one arrives.
  const below = trail.at(-1);
  if (below) move(below.layer, [{ opacity: 1 }, { opacity: 0 }], "paper");
  trail.push({ layer, origin, title });
  wire(layer);
  showCrumbs();
}

async function close(instant = false) {
  const top = trail.pop();
  if (!top) return;
  const below = trail.at(-1);
  if (below) move(below.layer, [{ opacity: 0 }, { opacity: 1 }], "paper");
  showCrumbs();
  if (instant) return top.layer.remove();
  move(top.layer.lastElementChild, [{ opacity: 1 }, { opacity: 0 }], "flick");
  const to = top.origin.isConnected && top.origin.getClientRects().length ? from(rect(top.origin), rect(top.layer)) : "translateY(24px)";
  await move(top.layer, [{ transform: "none", opacity: 1 }, { transform: to, opacity: top.origin.isConnected ? 1 : 0 }], "paper").finished;
  top.layer.remove();
}

function showCrumbs() {
  const parts = [NAMES[place], ...trail.map((t) => t.title)];
  crumbs.innerHTML = parts.map((p, i) => (i === parts.length - 1 ? `<b>${p}</b>` : `<button data-depth="${i}">${p}</button><svg class="i"><use href="#back"/></svg>`)).join("");
  crumbs.querySelectorAll("[data-depth]").forEach((s) => (s.onclick = () => { while (trail.length > +s.dataset.depth) close(); }));
  move(crumbs, [{ opacity: crumbs.style.opacity || 0 }, { opacity: trail.length ? 1 : 0 }], "flick");
  crumbs.style.opacity = trail.length ? 1 : 0;
}

const TITLES = { space: "Which Markdown renderer?", mission: "Conversation slice", document: "Survey", explore: "Find" };
// Find is a verb, not a place: it grows a sheet from its button wherever you are.
$("find").onclick = () => open("explore", $("find"), TITLES.explore);
function wire(root) {
  root.querySelectorAll("[data-open]").forEach((el) => window.Proto.openable(el, () => open(el.dataset.open, el, TITLES[el.dataset.open])));
}
wire(column);
addEventListener("keydown", (e) => e.key === "Escape" && close());

/* The chief docks on the right and pushes the content narrower. */
let talking = false;
function talk() {
  talking = !talking;
  // Start from the width it has now, so pressing again mid-flight turns it around.
  const now = getComputedStyle(side).width;
  side.getAnimations().forEach((a) => a.cancel());
  side.style.width = talking ? "341px" : "0px";
  side.animate([{ width: now }, { width: side.style.width }], Motion.spring(Motion.springs.paper));
}
$("talk").onclick = talk;
addEventListener("keydown", (e) => {
  if (e.key === "1" || e.key === "2") goPlace(+e.key - 1);
  if (e.key === "/") { e.preventDefault(); $("find").click(); }
  if (e.key === "c") talk();
});

const q = (sel) => document.querySelector(sel);
tour([
  [1200, () => open("space", q('[data-open="space"]'), TITLES.space)],
  [2400, () => close()],
  [1000, () => goPlace(1)],
  [1400, () => open("mission", q('[data-open="mission"]'), TITLES.mission)],
  [1600, () => open("document", q('.layer [data-open="document"]'), TITLES.document)],
  [2000, () => close()],
  [900, () => close()],
  [1000, () => $("find").click()],
  [1800, () => close()],
  [900, () => goPlace(0)],
  [1000, talk],
  [2200, talk],
]);
