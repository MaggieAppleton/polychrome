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

  window.Proto = { app, rect, from, wait, tour, get scale() { return scale; } };
})();
