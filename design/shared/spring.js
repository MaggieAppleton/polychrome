// Damped-spring easing for the Web Animations API, sampled into a CSS linear() curve.
// Plain script (not a module) so pages open from file://.
// Every moving thing in the wireframes uses one of three springs so motion feels like one material.

(() => {
const springs = {
  paper: { stiffness: 260, damping: 30, mass: 1 }, // sheets and panels: settles without overshoot
  card: { stiffness: 380, damping: 26, mass: 1 },  // cards: a small, felt overshoot
  flick: { stiffness: 600, damping: 38, mass: 1 }, // presses and small toggles
};

function spring({ stiffness, damping, mass }) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = w0 * Math.sqrt(Math.max(0, 1 - zeta * zeta));
  const x = (t) =>
    zeta < 1
      ? 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
      : 1 - Math.exp(-w0 * t) * (1 + w0 * t);

  // Duration: until the spring stays within 0.1% of rest.
  let duration = 0;
  for (let t = 0; t < 3; t += 1 / 120) if (Math.abs(1 - x(t)) > 0.001) duration = t;
  duration = Math.max(duration, 0.12);

  const points = [];
  for (let i = 0; i <= 40; i++) points.push(+x((duration * i) / 40).toFixed(4));
  return { easing: `linear(${points.join(", ")})`, duration: Math.round(duration * 1000) };
}

function move(el, keyframes, kind = "paper", extra = {}) {
  const { easing, duration } = spring(springs[kind]);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  return el.animate(keyframes, { easing, duration: reduce ? 1 : duration, fill: "both", ...extra });
}

window.Motion = { springs, spring, move };
})();
