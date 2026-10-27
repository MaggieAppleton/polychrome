// Table: one continuous world and a camera. Places are regions; deeper is moving closer; find is stepping back.
const { move } = window.Motion;
const { app, rect, from, tour } = window.Proto;
const $ = (id) => document.getElementById(id);
const world = $("world"), layers = $("layers"), scrim = $("scrim");

document.querySelectorAll("[data-place]").forEach((p) => (p.innerHTML = Surfaces[p.dataset.place]()));
const rec = (t, s, w) => `<div class="record"><span class="seal"><svg class="i"><use href="#check"/></svg></span><span class="title">${t} <span>${s}</span></span><span class="meta">${w}</span></div>`;
document.querySelector('[data-region="archive"]').innerHTML = `<div class="archive"><h3 class="group">Decided</h3>
  ${rec("Agents are discs", "Design", "Oct 26")}${rec("One accent means it needs you", "Design", "Oct 26")}
  ${rec("Local merges, no pull requests", "Quality", "Oct 20")}${rec("The chief of staff never builds", "Chief", "Oct 19")}
  ${rec("Inter for all interface text", "Design", "Oct 18")}${rec("Fractal as the back end", "Architecture", "Oct 12")}</div>`;

// Camera positions: the world point at the centre of the screen, and the zoom.
const VIEWS = {
  archive: { x: 640, y: 400, s: 1, name: "Decided" },
  attention: { x: 1940, y: 400, s: 1, name: "Attention" },
  overview: { x: 3200, y: 400, s: 1, name: "Overview" },
  all: { x: 1900, y: 520, s: 0.31, name: "Everything" },
};
let cam = VIEWS.attention, view = "attention";
const camera = (c) => `translate(${640 - c.x * c.s}px, ${400 - c.y * c.s}px) scale(${c.s})`;
world.style.transform = camera(cam);

function fly(to, kind = "paper") {
  const a = move(world, [{ transform: camera(cam) }, { transform: camera(to) }], kind);
  cam = to;
  a.finished.then(() => { world.style.transform = camera(to); a.cancel(); }).catch(() => {});
  return a;
}

function goView(name) {
  if (stack.length) return;
  view = name;
  fly(VIEWS[name]);
  $("where").textContent = VIEWS[name].name;
  app.classList.toggle("far", name === "all");
  document.querySelectorAll("[data-go]").forEach((b) => b.toggleAttribute("aria-current", b.dataset.go === name));
  document.querySelector('[data-go="attention"]').classList.toggle("waiting", name !== "attention");
  // Finding is spatial: matches stay lit where they live, everything else fades.
  const query = $("findFloat").textContent.trim().toLowerCase();
  document.querySelectorAll(".world .card, .world .record, .world .change").forEach((el) => {
    const hit = el.textContent.toLowerCase().includes(query);
    el.style.transition = "opacity 400ms";
    el.style.opacity = name === "all" && !hit ? 0.18 : "";
  });
  const ff = $("findFloat");
  move(ff, [{ transform: getComputedStyle(ff).transform, opacity: getComputedStyle(ff).opacity },
    name === "all" ? { transform: "translate(-50%, 0)", opacity: 1 } : { transform: "translate(-50%, -80px)", opacity: 0 }], "card");
}
document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => goView(b.dataset.go)));

/* Deeper: the camera moves toward the card while it grows into a sheet, so you travel to it. */
const stack = [];
const FOCUS = { x: 72, y: 20, w: 1136, h: 760 };
function open(id, origin) {
  const o = rect(origin);
  // Move closer: centre the camera on the card and zoom in.
  const wx = cam.x + (o.x + o.w / 2 - 640) / cam.s, wy = cam.y + (o.y + o.h / 2 - 400) / cam.s;
  stack.push({ origin, back: cam, start: o });
  fly({ x: wx, y: wy, s: cam.s * 2.4 });
  move(scrim, [{ opacity: 0 }, { opacity: 1 }], "paper");
  scrim.classList.add("on");
  world.inert = true;
  const layer = document.createElement("div");
  layer.className = "layer";
  Object.assign(layer.style, { left: FOCUS.x + "px", top: FOCUS.y + "px", width: FOCUS.w + "px", height: FOCUS.h + "px", zIndex: "var(--z-sheet)" });
  layer.innerHTML = Surfaces[id]();
  layers.append(layer);
  stack.at(-1).layer = layer;
  const grow = move(layer, [{ transform: from(o, FOCUS), opacity: 0 }, { transform: "none", opacity: 1 }], "paper");
  grow.finished.then(() => grow.cancel());
}

async function back() {
  const top = stack.pop();
  if (!top) return;
  if (window.Proto.docking) { window.Proto.undock(); Object.assign(top.layer.style, { left: FOCUS.x + "px", width: FOCUS.w + "px" }); }
  fly(top.back);
  move(scrim, [{ opacity: 1 }, { opacity: 0 }], "paper");
  scrim.classList.remove("on");
  world.inert = false;
  // Exit mirrors entry: the camera pulls back and the sheet shrinks into the card it grew from.
  await move(top.layer, [{ transform: "none", opacity: 1 }, { transform: from(top.start, FOCUS), opacity: 0 }], "paper").finished;
  top.layer.remove();
}

document.querySelectorAll("[data-open]").forEach((el) => window.Proto.openable(el, () => open(el.dataset.open, el)));
scrim.onclick = back;
addEventListener("keydown", (e) => {
  if (e.key === "Escape") return stack.length ? back() : view === "all" && goView("attention");
  if (e.key === "-") goView("all");
});
// Pinch or ctrl-scroll out to see everything; in again to return.
app.addEventListener("wheel", (e) => {
  if (!e.ctrlKey || stack.length) return;
  e.preventDefault();
  if (e.deltaY > 0 && view !== "all") goView("all");
  if (e.deltaY < 0 && view === "all") goView("attention");
}, { passive: false });
// The chief: a conversation sheet on the bare table, docked beside a sheet when one is open.
function talk() {
  if (!stack.length) return open("conversation", $("ask"));
  window.Proto.dock(stack.at(-1).layer, FOCUS);
}
$("ask").onclick = talk;
addEventListener("keydown", (e) => {
  const keys = { 1: "attention", 2: "overview", 3: "archive" };
  if (keys[e.key]) goView(keys[e.key]);
  if (e.key === "/") { e.preventDefault(); goView("all"); }
  if (e.key === "c") talk();
});

const q = (sel) => document.querySelector(sel);
tour([
  [1200, () => open("space", q('[data-open="space"]'))],
  [2400, back],
  [1200, () => goView("overview")],
  [1600, () => open("mission", q('[data-open="mission"]'))],
  [2200, back],
  [1200, () => goView("all")],
  [2400, () => goView("archive")],
  [1800, () => goView("attention")],
]);
