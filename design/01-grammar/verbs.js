// Each stage plays its verb when it scrolls into view. Replay restores the stage's original markup and plays again.
const { move } = window.Motion;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (stage, sel) => stage.querySelector(sel);

// FLIP: animate an element from where it was to where layout now puts it.
function flip(el, before, kind = "card") {
  const after = el.getBoundingClientRect();
  const dy = before.top - after.top;
  if (dy) move(el, [{ transform: `translateY(${dy}px)` }, { transform: "none" }], kind);
}

const verbs = {
  async raise(s) {
    const item = $(s, "[data-new]");
    const below = item.nextElementSibling;
    item.remove();
    await wait(500);
    const before = below.getBoundingClientRect();
    below.before(item);
    item.classList.add("fresh");
    flip(below, before, "paper");
    move(item, [
      { transform: "translateY(-18px) scale(1.04)", opacity: 0, boxShadow: "var(--lift-4)" },
      { transform: "none", opacity: 1, boxShadow: "var(--lift-2)" },
    ], "card");
    await wait(250);
    $(s, ".raise-agent .agent").dataset.state = "waiting";
  },

  async gather(s) {
    const flyer = $(s, ".flyer");
    const top = $(s, ".stack > .item");
    const stageBox = s.getBoundingClientRect();
    const target = top.getBoundingClientRect();
    const x = target.left - stageBox.left, y = target.top - stageBox.top;
    flyer.style.visibility = "visible";
    await wait(400);
    await move(flyer, [
      { transform: `translate(${stageBox.width}px, ${y + 60}px) rotate(6deg)` },
      { transform: `translate(${x}px, ${y + 14}px) rotate(0deg) scale(0.98)` },
    ], "card").finished;
    // Slide under: it shrinks behind the pile and becomes its bottom sheet.
    flyer.style.zIndex = 0;
    await move(flyer, [
      { transform: `translate(${x}px, ${y + 14}px) scale(0.98)`, opacity: 1 },
      { transform: `translate(${x}px, ${y + 15}px) scale(0.88)`, opacity: 0 },
    ], "paper").finished;
    flyer.style.visibility = "hidden";
    const third = document.createElement("div");
    third.className = "under third";
    $(s, ".stack").prepend(third);
    move($(s, ".stack"), [{ transform: "translateY(2px)" }, { transform: "none" }], "card");
    $(s, ".stack .n").textContent = "3";
  },

  async open(s) {
    const card = $(s, "[data-target]");
    const sheet = $(s, ".opened");
    const back = async () => {
      const c = card.getBoundingClientRect(), o = sheet.getBoundingClientRect();
      move(s.querySelector(".dimmable"), [{ opacity: 0.35, transform: "scale(0.97)" }, { opacity: 1, transform: "none" }], "paper");
      await move(sheet, [
        { transform: "none", borderRadius: "14px" },
        { transform: `translate(${c.left - o.left}px, ${c.top - o.top}px) scale(${c.width / o.width}, ${c.height / o.height})`, borderRadius: "40px / 30px" },
      ], "paper").finished;
      sheet.style.visibility = "hidden";
      card.style.visibility = "visible";
    };
    sheet.querySelector('[aria-label="Back"]').onclick = back;
    await wait(500);
    sheet.style.visibility = "visible";
    const c = card.getBoundingClientRect(), o = sheet.getBoundingClientRect();
    card.style.visibility = "hidden";
    move(s.querySelector(".dimmable"), [{ opacity: 1, transform: "none" }, { opacity: 0.35, transform: "scale(0.97)" }], "paper");
    move(sheet, [
      { transform: `translate(${c.left - o.left}px, ${c.top - o.top}px) scale(${c.width / o.width}, ${c.height / o.height})`, borderRadius: "40px / 30px" },
      { transform: "none", borderRadius: "14px" },
    ], "paper");
    move(sheet.querySelector(".opened-body"), [{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], "paper");
    await wait(2200);
    if (sheet.isConnected && sheet.style.visibility === "visible") await back();
  },

  async decide(s) {
    const card = $(s, "[data-target]");
    const chip = $(s, "[data-pick]");
    const rec = $(s, ".history [data-new]");
    const next = rec.nextElementSibling;
    rec.remove();
    await wait(600);
    await move(chip, [{ transform: "scale(1)" }, { transform: "scale(0.93)" }], "flick").finished;
    chip.classList.add("picked");
    move(chip, [{ transform: "scale(0.93)" }, { transform: "scale(1)" }], "flick");
    await wait(450);
    const c = card.getBoundingClientRect(), n = next.getBoundingClientRect();
    const shrink = move(card, [
      { transform: "none", opacity: 1 },
      { transform: `translateY(${n.top - c.top - c.height / 2 + 16}px) scale(0.9, 0.35)`, opacity: 0 },
    ], "paper");
    await wait(160);
    const before = next.getBoundingClientRect();
    next.before(rec);
    flip(next, before, "paper");
    move(rec, [{ transform: "translateY(-14px) scale(1.03)", opacity: 0 }, { transform: "none", opacity: 1 }], "card");
    // Once it's filed, the history closes up over the space the open card took.
    await shrink.finished;
    const below = [$(s, ".col hr"), $(s, ".history")];
    const rects = below.map((el) => el.getBoundingClientRect());
    card.style.display = "none";
    below.forEach((el, i) => flip(el, rects[i], "paper"));
  },

  async defer(s) {
    const card = $(s, "[data-target]");
    const btn = $(s, ".later-btn");
    await wait(700);
    await move(btn, [{ transform: "scale(1)" }, { transform: "scale(0.88)" }], "flick").finished;
    move(btn, [{ transform: "scale(0.88)" }, { transform: "scale(1)" }], "flick");
    const c = card.getBoundingClientRect(), p = $(s, ".later-pile").getBoundingClientRect();
    await move(card, [
      { transform: "none", opacity: 1 },
      { transform: `translate(${p.left - c.left - 120}px, ${p.top - c.top}px) rotate(-4deg) scale(0.4)`, opacity: 0 },
    ], "paper").finished;
    const rest = card.nextElementSibling, before = rest.getBoundingClientRect();
    card.style.display = "none";
    flip(rest, before, "paper");
    $(s, ".later-pile .n").textContent = "3";
    move($(s, ".later-pile"), [{ transform: "scale(1.08)" }, { transform: "scale(1)" }], "card");
  },

  async say(s) {
    const typed = $(s, ".typed"), line = $(s, ".said-line");
    const idea = $(s, ".say-log [data-new]");
    const next = idea.nextElementSibling;
    idea.remove();
    const text = "I think missions should be the core, not conversations.";
    await wait(500);
    for (const ch of text) { typed.textContent += ch; await wait(26); }
    await wait(300);
    typed.textContent = "";
    line.textContent = text;
    move(line, [{ transform: "translateY(12px)", opacity: 0 }, { transform: "none", opacity: 1 }], "card");
    await wait(900);
    // The idea lifts off what was said and travels to the log.
    const l = line.getBoundingClientRect();
    const before = next.getBoundingClientRect();
    next.before(idea);
    flip(next, before, "paper");
    const i = idea.getBoundingClientRect();
    move(idea, [
      { transform: `translate(${l.left - i.left}px, ${l.top - i.top}px) scale(0.92)`, opacity: 0, boxShadow: "var(--lift-4)" },
      { transform: `translate(${(l.left - i.left) * 0.6}px, ${(l.top - i.top) * 0.6 - 20}px) scale(1.02)`, opacity: 1, offset: 0.3 },
      { transform: "none", opacity: 1, boxShadow: "var(--lift-2)" },
    ], "paper", { duration: 900 });
  },

  async peek(s) {
    const panel = $(s, ".peek-panel"), scrim = $(s, ".scrim");
    const out = [{ transform: "translateX(calc(100% + 20px))" }, { transform: "none" }];
    await wait(600);
    move(scrim, [{ opacity: 0 }, { opacity: 1 }], "paper");
    await move(panel, out, "paper").finished;
    await wait(1600);
    move(scrim, [{ opacity: 1 }, { opacity: 0 }], "paper");
    move(panel, [...out].reverse(), "paper");
  },
};

for (const stage of document.querySelectorAll(".stage")) {
  const original = stage.innerHTML;
  const play = () => {
    stage.innerHTML = original;
    stage.querySelector(".replay").onclick = play;
    verbs[stage.dataset.verb](stage);
  };
  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { play(); obs.disconnect(); }
  }, { threshold: 0.6 }).observe(stage);
}
