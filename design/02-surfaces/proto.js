// Shared machinery for the navigation prototypes: a 1280×800 app scaled to fit the window, rect helpers in app
// coordinates, controls that show only while the pointer moves, and a tour that plays when the URL ends in #tour.
(() => {
  const app = document.querySelector(".app");
  let scale = 1;

  function fit() {
    scale = Math.min(innerWidth / 1280, innerHeight / 800);
    app.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  addEventListener("resize", fit);
  fit();

  // A rect in unscaled app coordinates.
  function rect(el) {
    const a = app.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (r.left - a.left) / scale, y: (r.top - a.top) / scale, w: r.width / scale, h: r.height / scale };
  }

  // The transform that makes an element laid out at `to` appear at `from` (transform-origin 0 0).
  function from(fromRect, toRect) {
    return `translate(${fromRect.x - toRect.x}px, ${fromRect.y - toRect.y}px) scale(${fromRect.w / toRect.w}, ${fromRect.h / toRect.h})`;
  }

  // Controls in focus: visible while the pointer moves, gone shortly after it rests.
  let idle;
  app.addEventListener("pointermove", () => {
    app.classList.add("moving");
    clearTimeout(idle);
    idle = setTimeout(() => app.classList.remove("moving"), 1400);
  });

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Tour: each step is [ms to wait before, fn]. A fake pointer press makes clicks visible in recordings.
  async function tour(steps) {
    if (location.hash !== "#tour") return;
    await wait(800);
    for (const [ms, fn] of steps) { await wait(ms); fn(); }
  }

  // Docked conversation beside an open sheet. It slides from the right edge and pushes the sheet narrower.
  // Every move starts from where things are now, so a second press mid-flight reverses smoothly.
  const docked = document.createElement("aside");
  docked.className = "docked";
  docked.innerHTML = window.Surfaces.dock();
  app.append(docked);
  let docking = false;
  function dock(sheet, rest) {
    docking = !docking;
    const { move } = window.Motion;
    const now = getComputedStyle(docked).transform;
    const d = move(docked, [{ transform: now }, { transform: docking ? "none" : "translateX(100%)" }], "paper");
    d.finished.then(() => { d.commitStyles(); d.cancel(); }).catch(() => {});
    if (!sheet) return;
    const to = docking ? { left: "20px", width: `${1280 - 340 - 40}px` } : { left: rest.x + "px", width: rest.w + "px" };
    const s = sheet.animate([{ left: sheet.style.left, width: sheet.style.width }, to], { ...window.Motion.spring(window.Motion.springs.paper) });
    Object.assign(sheet.style, to);
    return s;
  }
  // Slide the dock away when the sheet it served closes.
  function undock() {
    if (!docking) return;
    docking = false;
    window.Motion.move(docked, [{ transform: getComputedStyle(docked).transform }, { transform: "translateX(100%)" }], "paper")
        .finished.then(() => { docked.style.transform = "translateX(100%)"; }).catch(() => {});
  }

  // Anything that opens is a button to the keyboard too: focusable, and Enter or Space opens it.
  function openable(el, fn) {
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.onclick = (e) => { e.stopPropagation(); fn(); };
    el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } };
  }

  window.Proto = { app, rect, from, wait, tour, dock, undock, openable, get docking() { return docking; }, get scale() { return scale; } };
})();
