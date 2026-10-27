// Stack: places side by side on one long table; deeper means another sheet laid on top.
const { move } = window.Motion;
const { app, rect, from, wait, tour } = window.Proto;
const $ = (id) => document.getElementById(id);
const ground = $("ground"), table = $("table"), layers = $("layers"), scrim = $("scrim"), bar = $("bar");

document.querySelectorAll("[data-place]").forEach((p) => (p.innerHTML = Surfaces[p.dataset.place]()));

// Animate from wherever an element is now to a new transform, then keep it there.
function go(el, transform, kind = "paper", extra = {}) {
  const start = getComputedStyle(el).transform;
  const a = move(el, [{ transform: start === "none" ? "none" : start }, { transform }], kind, extra);
  a.finished.then(() => { a.commitStyles(); a.cancel(); }).catch(() => {});
  return a;
}

/* Places: the long table slides under the bar. */
let place = 0;
function goPlace(n) {
  if (stack.length) return;
  place = n;
  go(table, `translateX(${-1280 * n}px)`);
  go($("ind"), `translateX(${34 * n}px)`, "card");
  document.querySelectorAll("[data-go]").forEach((b) => b.toggleAttribute("aria-current", +b.dataset.go === n));
}
document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => goPlace(+b.dataset.go)));

/* The stack. Each entry remembers the element it grew from, so it can return there. */
const stack = [];
const FOCUS = { x: 72, y: 20, w: 1136, h: 760 };

function restack() {
  // Lower sheets step back to the left, so their edges show like a pile of paper.
  stack.forEach(({ layer }, i) => {
    const d = stack.length - 1 - i;
    go(layer, d ? `translateX(${-34 * d}px) scale(${1 - 0.025 * d})` : "none");
    layer.style.setProperty("--shade", d ? 0.35 : 0);
  });
  const deep = stack.length > 0;
  go(ground, deep ? "scale(0.97)" : "none");
  move(scrim, [{ opacity: deep ? 0 : 1 }, { opacity: deep ? 1 : 0 }], "paper");
  scrim.classList.toggle("on", deep);
  go(bar, deep ? "translate(-50%, 90px)" : "translateX(-50%)");
}

function open(id, origin) {
  const layer = document.createElement("div");
  layer.className = "layer";
  Object.assign(layer.style, { left: FOCUS.x + "px", top: FOCUS.y + "px", width: FOCUS.w + "px", height: FOCUS.h + "px" });
  layer.innerHTML = `<div class="layer-bar"><button class="icon-btn" aria-label="Back"><svg class="i"><use href="#back"/></svg></button></div>` + Surfaces[id]();
  layer.querySelector('[aria-label="Back"]').onclick = back;
  layer.style.zIndex = 10 + stack.length;
  layers.append(layer);
  stack.push({ layer, origin });
  restack();
  // Grow from where it came from.
  move(layer, [{ transform: from(rect(origin), FOCUS), borderRadius: "40px" }, { transform: "none", borderRadius: "16px" }], "paper");
  move(layer.lastElementChild, [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], "paper");
  wire(layer);
}

async function back() {
  const top = stack.pop();
  if (!top) return;
  restack();
  const { layer, origin } = top;
  move(layer.lastElementChild, [{ opacity: 1 }, { opacity: 0 }], "flick");
  const to = origin.isConnected ? from(rect(origin), FOCUS) : "translateX(110%)";
  await move(layer, [{ transform: "none", borderRadius: "16px" }, { transform: to, borderRadius: "40px" }], "paper").finished;
  layer.remove();
}

function wire(root) {
  root.querySelectorAll("[data-open]").forEach((el) => (el.onclick = (e) => { e.stopPropagation(); open(el.dataset.open, el); }));
}
wire(ground);
scrim.onclick = back;
addEventListener("keydown", (e) => e.key === "Escape" && back());
$("find").onclick = () => open("explore", $("find"));
$("ask").onclick = () => open("conversation", $("ask"));

// In focus the bar is gone; bring the pointer to the bottom edge and it rises back.
app.addEventListener("pointermove", (e) => {
  if (!stack.length) return;
  const near = rect(app).h - (e.clientY - app.getBoundingClientRect().top) / window.Proto.scale < 70;
  if (near !== bar.classList.contains("near")) {
    bar.classList.toggle("near", near);
    go(bar, near ? "translateX(-50%)" : "translate(-50%, 90px)", "card");
  }
});

const q = (sel) => document.querySelector(sel);
tour([
  [1200, () => open("space", q('[data-open="space"]'))],
  [2600, back],
  [1000, () => goPlace(1)],
  [1400, () => open("mission", q('[data-open="mission"]'))],
  [1600, () => open("document", q('.layer [data-open="document"]'))],
  [2200, back],
  [900, back],
  [1000, () => open("explore", $("find"))],
  [2000, back],
  [900, () => goPlace(0)],
  [1000, () => open("conversation", $("ask"))],
  [2200, back],
]);
