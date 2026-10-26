// Layers page: explodes the stack, then plays the attention-and-focus sequence. Both replay.
const { move } = window.Motion;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const byId = (id) => document.getElementById(id);

/* Exploded stack: planes rise off the ground one after another. */
function explode() {
  document.querySelectorAll(".plane").forEach((p, i) => {
    move(p, [{ transform: "translateZ(0)" }, { transform: `translateZ(${i * 74}px)` }], "paper", { delay: i * 90 });
  });
}
document.querySelector(".exploded .replay").onclick = explode;

/* Prototype. Each run starts from the app's original markup, so replay is always clean. */
const app = byId("app");
const original = app.innerHTML;
let run = 0;

const steps = [...document.querySelectorAll(".steps li")];
function mark(n) {
  steps.forEach((li, i) => li.className = i < n ? "done" : i === n ? "now" : "");
}

// The FLIP transform that makes the focus sheet look like it is still the card.
function asCard(card, sheet) {
  const c = card.getBoundingClientRect(), o = sheet.getBoundingClientRect();
  return `translate(${c.left - o.left}px, ${c.top - o.top}px) scale(${c.width / o.width}, ${c.height / o.height})`;
}

async function play() {
  const me = ++run;
  const alive = () => me === run;
  app.innerHTML = original;
  app.classList.remove("focused");
  const log = byId("log"), motion = byId("motion"), target = byId("target");
  const focus = byId("focus"), bar = byId("bar"), side = byId("side"), slip = byId("slip");

  // 0 Overview. The new item isn't there yet.
  mark(0);
  const next = target.nextElementSibling;
  target.remove();
  await wait(1200); if (!alive()) return;

  // 1 Raise
  mark(1);
  const before = next.getBoundingClientRect();
  next.before(target);
  target.classList.add("fresh");
  const after = next.getBoundingClientRect();
  move(next, [{ transform: `translateY(${before.top - after.top}px)` }, { transform: "none" }], "paper");
  move(target, [
    { transform: "translateY(-18px) scale(1.04)", opacity: 0, boxShadow: "var(--lift-4)" },
    { transform: "none", opacity: 1, boxShadow: "var(--lift-2)" },
  ], "card");
  byId("researcher").dataset.state = "waiting";
  await wait(1800); if (!alive()) return;

  // 2 Focus: the card becomes the sheet; the overview slides away and the table empties.
  mark(2);
  focus.style.visibility = "visible";
  const from = asCard(target, focus);
  target.style.visibility = "hidden";
  app.classList.add("focused");
  move(log, [{ transform: "none", opacity: 1 }, { transform: "translateX(-60px)", opacity: 0 }], "paper");
  move(motion, [{ transform: "none", opacity: 1 }, { transform: "translateX(60px)", opacity: 0 }], "paper");
  move(focus, [{ transform: from, borderRadius: "40px / 60px" }, { transform: "none", borderRadius: "16px" }], "paper");
  move(focus.querySelector(".focus-body"), [{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], "paper");
  await wait(900);
  // Pointer moves: controls appear, then fade when it rests.
  bar.classList.add("show");
  await wait(1400); if (!alive()) return;

  // 3 Talk: the conversation slides in and the sheet makes room for it.
  mark(3);
  move(byId("talk"), [{ transform: "scale(1)" }, { transform: "scale(0.9)" }, { transform: "scale(1)" }], "flick");
  move(side, [{ transform: "translateX(calc(100% + 24px))" }, { transform: "none" }], "paper");
  move(focus, [{ transform: "none" }, { transform: "translateX(-136px)" }], "paper");
  await wait(600);
  bar.classList.remove("show");
  await wait(1800); if (!alive()) return;

  // 4 Attention arrives: one movement, then stillness.
  mark(4);
  slip.style.left = "234px"; // centred under the sheet, which the conversation pushed left
  move(slip, [{ transform: "translate(-50%, 100%)" }, { transform: "translate(-50%, 28px)" }], "card");
  await wait(2000); if (!alive()) return;

  // 5 Glance: the pointer comes near; the slip rises far enough to read.
  mark(5);
  move(slip, [{ transform: "translate(-50%, 28px)" }, { transform: "translate(-50%, 12px)" }], "card");
  slip.classList.add("open");
  await wait(2000); if (!alive()) return;
  slip.classList.remove("open");
  move(slip, [{ transform: "translate(-50%, 12px)" }, { transform: "translate(-50%, 28px)" }], "card");
  await wait(700); if (!alive()) return;

  // 6 Step back: the panel leaves, the sheet folds back into its card, the overview returns.
  mark(6);
  move(side, [{ transform: "none" }, { transform: "translateX(calc(100% + 24px))" }], "paper");
  await move(focus, [{ transform: "translateX(-136px)" }, { transform: "none" }], "paper").finished;
  if (!alive()) return;
  app.classList.remove("focused");
  move(log, [{ transform: "translateX(-60px)", opacity: 0 }, { transform: "none", opacity: 1 }], "paper");
  move(motion, [{ transform: "translateX(60px)", opacity: 0 }, { transform: "none", opacity: 1 }], "paper");
  move(focus.querySelector(".focus-body"), [{ opacity: 1 }, { opacity: 0 }], "flick");
  await move(focus, [{ transform: "none", borderRadius: "16px" }, { transform: asCard(target, focus), borderRadius: "40px / 60px" }], "paper").finished;
  if (!alive()) return;
  focus.style.visibility = "hidden";
  target.style.visibility = "visible";
  // Back on the overview, the slip settles into the log as an ordinary item.
  await move(slip, [{ transform: "translate(-50%, 28px)" }, { transform: "translate(-50%, 100%)" }], "paper").finished;
  if (!alive()) return;
  const problem = document.createElement("div");
  problem.className = "card item fresh";
  problem.innerHTML = `<span class="glyph"><svg class="i"><use href="#problem"/></svg></span><span class="title">Typecheck fails on the slice</span><span class="meta">Builder <span class="when">now</span></span>`;
  const first = log.firstElementChild, was = first.getBoundingClientRect();
  log.prepend(problem);
  const now = first.getBoundingClientRect();
  move(first, [{ transform: `translateY(${was.top - now.top}px)` }, { transform: "none" }], "paper");
  move(problem, [
    { transform: "translateY(-18px) scale(1.04)", opacity: 0, boxShadow: "var(--lift-4)" },
    { transform: "none", opacity: 1, boxShadow: "var(--lift-2)" },
  ], "card");
  mark(7);
}

byId("replay-app").onclick = play;

// Start each part when it scrolls into view.
const once = (el, fn) => new IntersectionObserver(([e], obs) => {
  if (e.isIntersecting) { fn(); obs.disconnect(); }
}, { threshold: 0.5 }).observe(el);
once(document.querySelector(".exploded"), explode);
once(byId("app"), play);
