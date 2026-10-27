// The six surfaces, drawn once. Each navigation prototype arranges and moves these, so the directions differ only
// in space and motion, never in content. Every template returns markup for a fixed-size surface.

const agent = (letter, state = "", tone = "#dcdad5") =>
  `<span class="agent" ${state ? `data-state="${state}"` : ""} style="--tone:${tone}">${letter}</span>`;
const chief = `<span class="agent" style="--tone:#1b1b1a;color:#fff">C</span>`;
const glyph = (type) => `<span class="glyph"><svg class="i"><use href="#${type}"/></svg></span>`;
const seal = `<span class="seal"><svg class="i"><use href="#check"/></svg></span>`;

const item = ({ type, title, who, when = "", fresh = false, extra = "", id = "" }) => `
  <div class="card item${fresh ? " fresh" : ""}" ${id ? `data-open="${id}"` : ""}>
    ${glyph(type)}<span class="title">${title}</span>
    <span class="meta">${who} <span class="when">${when}</span></span>${extra}
  </div>`;

const pile = ({ type, title, count, who }) => `
  <div class="stack">
    <div class="under"></div><div class="under"></div>
    ${item({ type, title, who: `${count} items`, when: who })}
  </div>`;

const mission = ({ title, at, of, steps, status, faces, id = "" }) => `
  <div class="card mission" ${id ? `data-open="${id}"` : ""}>
    <div class="top"><span class="title">${title}</span><span class="meta num">${at} of ${of}</span></div>
    <div class="track">${steps.map((s) => `<i class="${s}"></i>`).join("")}</div>
    <div class="bottom"><span class="meta">${status}</span><span class="facepile">${faces}</span></div>
  </div>`;

const record = (title, sub, when) =>
  `<div class="record">${seal}<span class="title">${title} <span>${sub}</span></span><span class="meta">${when}</span></div>`;

window.Surfaces = {
  // 1. Attention: the deciding home. The log, with the first item showing the thing itself.
  attention: () => `
    <section class="surface attention" data-surface="attention">
      <div class="log-col">
        ${item({ type: "problem", title: "Typecheck fails on the slice", who: "Builder", when: "12m", fresh: true })}
        ${item({ type: "decision", title: "Which Markdown renderer?", who: "Researcher", when: "2h", fresh: true, id: "space",
          extra: `<div class="extra chips"><span class="chip">markdown-it</span><span class="chip">remark</span><span class="chip">marked</span></div>` })}
        ${pile({ type: "review", title: "Interface design", count: 3, who: "Designer" })}
        ${item({ type: "idea", title: "Rebuild the back end around missions", who: "Chief of staff", when: "From Tuesday" })}
        <div class="log-rule"><span class="later"><svg class="i sm"><use href="#later"/></svg><span class="num">2</span></span></div>
        <div class="recent">
          ${record("Local merges, no pull requests", "Quality", "Mon")}
          ${record("The chief of staff never builds", "Chief", "Sun")}
          ${record("Inter for all interface text", "Design", "Sat")}
        </div>
      </div>
    </section>`,

  // 2. Overview: the overseeing home. Missions in motion, what changed, who is doing what.
  overview: () => `
    <section class="surface overview" data-surface="overview">
      <div class="ov-col">
        <h3 class="group">In motion</h3>
        ${mission({ title: "Conversation slice", at: 3, of: 5, steps: ["done", "done", "now", "", ""], status: "Reviewing", faces: agent("B", "working") + agent("Q", "", "#e2e0db"), id: "mission" })}
        ${mission({ title: "Quality mission", at: 1, of: 4, steps: ["now", "", "", ""], status: "Building", faces: agent("B", "working") })}
        ${mission({ title: "Markdown renderer research", at: 2, of: 2, steps: ["done", "you"], status: "Waiting on you", faces: agent("R", "waiting", "#d3d6d9") })}
        ${mission({ title: "Design surfaces", at: 2, of: 3, steps: ["done", "now", ""], status: "Wireframing", faces: agent("D", "working", "#d8d4d9") })}
      </div>
      <div class="ov-col">
        <h3 class="group">Changes</h3>
        <div class="changes">
          <div class="day meta">Today</div>
          <div class="change">${agent("B", "", "#dcdad5")}<span>Hid harness bookkeeping in conversations</span><span class="meta">Slice</span></div>
          <div class="change">${agent("Q", "", "#e2e0db")}<span>Fixed composer focus ring</span><span class="meta">Unasked</span></div>
          <div class="change">${agent("B", "", "#dcdad5")}<span>Explained why sending is blocked</span><span class="meta">Slice</span></div>
          <div class="day meta">Yesterday</div>
          <div class="change">${agent("D", "", "#d8d4d9")}<span>Grammar and layer wireframes</span><span class="meta">Design</span></div>
          <div class="change">${agent("Q", "", "#e2e0db")}<span>Removed unused gateway route</span><span class="meta">Unasked</span></div>
        </div>
      </div>
      <div class="ov-col narrow">
        <h3 class="group">Agents</h3>
        <div class="agents">
          <div class="agent-row">${chief}<span>Chief of staff</span></div>
          <div class="agent-row">${agent("B", "working")}<span>Builder</span></div>
          <div class="agent-row">${agent("R", "waiting", "#d3d6d9")}<span>Researcher</span></div>
          <div class="agent-row">${agent("D", "working", "#d8d4d9")}<span>Designer</span></div>
          <div class="agent-row">${agent("Q", "idle", "#e2e0db")}<span>Quality</span></div>
        </div>
      </div>
    </section>`,

  // 3. Mission: the step track grown into a vertical path. The gate waiting on you is the only colour.
  mission: () => `
    <section class="surface sheet mission-sheet" data-surface="mission">
      <header class="sheet-head"><span class="sheet-title">Conversation slice</span><span class="facepile">${agent("B", "working")}${agent("Q", "", "#e2e0db")}</span></header>
      <ol class="path">
        <li class="done"><i></i><span>Survey the built-in interface</span><span class="meta">Researcher</span></li>
        <li class="done"><i></i><span>Build the conversation view</span><span class="meta">Builder</span></li>
        <li class="now"><i></i><span>Review</span><span class="meta">Quality</span>
          <div class="step-detail"><div class="lines"><b></b><b style="width:70%"></b></div></div></li>
        <li><i></i><span>Maggie approves</span><span class="meta">Gate</span></li>
        <li><i></i><span>Merge</span><span class="meta">Builder</span></li>
      </ol>
      <div class="made">
        <div class="thumb" data-open="document"><b style="width:40%"></b><b></b><b style="width:80%"></b></div>
        <div class="thumb"><b style="width:55%"></b><b></b><b style="width:65%"></b></div>
      </div>
    </section>`,

  // 4. Conversation with the chief: what you said on the left, what became of it on the right.
  conversation: () => `
    <section class="surface sheet convo-sheet" data-surface="conversation">
      <div class="convo-main">
        <header class="sheet-head">${chief}<span class="sheet-title">Chief of staff</span></header>
        <div class="msgs">
          <p class="you">I think we built the back end the wrong way. Missions should be the core, not conversations.</p>
          <div class="said">${chief}<p>Logged as an idea. A researcher will map what would move. I'll bring it back when the slice lands.</p></div>
          <p class="you">And I want scheduled design reviews.</p>
          <div class="said">${chief}<p>That one needs your design brief first. I've set it aside until you've written it.</p></div>
        </div>
        <div class="composer"><span class="placeholder">Message the chief</span><button class="icon-btn" aria-label="Send"><svg class="i"><use href="#send"/></svg></button></div>
      </div>
      <aside class="became">
        ${item({ type: "idea", title: "Missions at the core", who: "Preparing" })}
        ${item({ type: "idea", title: "Scheduled design reviews", who: "Set aside" })}
      </aside>
    </section>`,

  // 5. Thinking space: one question, its own interface. Sheets on open ground, conversation docked.
  space: () => `
    <section class="surface space-surface" data-surface="space">
      <div class="space-ground">
        <div class="sheet s-doc">
          <div class="sheet-title">Which Markdown renderer?</div>
          <div class="compare">
            <div></div><div class="h">markdown-it</div><div class="h">remark</div><div class="h">marked</div>
            <div class="k">Size</div><div>Small</div><div>Large</div><div>Smallest</div>
            <div class="k">Plugins</div><div>Many</div><div>Most</div><div>Few</div>
            <div class="k">Raw HTML</div><div>Off</div><div>Plugin</div><div>On</div>
          </div>
          <div class="focus-actions"><button class="btn primary">Choose markdown-it</button></div>
        </div>
        <div class="sheet s-render"><div class="render-pane"><b class="h1"></b><b></b><b style="width:80%"></b><i></i></div><div class="render-pane alt"><b class="h1"></b><b></b><b style="width:60%"></b><i></i></div></div>
        <div class="sheet s-bench"><div class="bars"><span style="height:40%"></span><span style="height:90%"></span><span style="height:28%"></span></div></div>
      </div>
      <aside class="dock">
        <header class="sheet-head">${agent("R", "waiting", "#d3d6d9")}<span class="sheet-title">Researcher</span></header>
        <div class="msgs"><p class="you">Why not remark?</p><div class="said">${agent("R", "", "#d3d6d9")}<p>Four times the size, and we'd use none of its plugins.</p></div></div>
        <div class="composer"><span class="placeholder">Reply</span><button class="icon-btn" aria-label="Send"><svg class="i"><use href="#send"/></svg></button></div>
      </aside>
    </section>`,

  // A document: what a mission made. Opens a level deeper than the mission.
  document: () => `
    <section class="surface sheet doc-sheet" data-surface="document">
      <div class="doc-body">
        <div class="sheet-title">Survey of the built-in interface</div>
        <div class="lines"><b></b><b style="width:94%"></b><b style="width:88%"></b><b style="width:60%"></b></div>
        <div class="lines"><b style="width:96%"></b><b></b><b style="width:72%"></b></div>
        <div class="thumb" style="height:120px"><b style="width:30%"></b><b></b><b style="width:70%"></b></div>
        <div class="lines"><b></b><b style="width:84%"></b><b style="width:40%"></b></div>
      </div>
    </section>`,

  // 6. Explore: find anything. One field; results grouped by concept, each with its own shape.
  explore: () => `
    <section class="surface explore" data-surface="explore">
      <div class="find"><svg class="i"><use href="#search"/></svg><span class="typed-q">markdown</span></div>
      <div class="results">
        <div class="res-group"><h3 class="group">Decisions</h3>${record("markdown-it", "Which Markdown renderer?", "Today")}</div>
        <div class="res-group"><h3 class="group">Documents</h3>
          <div class="res-row"><svg class="i"><use href="#doc"/></svg><span>Markdown renderers compared</span><span class="meta">Researcher</span></div>
          <div class="res-row"><svg class="i"><use href="#doc"/></svg><span>Survey of the built-in interface</span><span class="meta">Researcher</span></div></div>
        <div class="res-group"><h3 class="group">Missions</h3>
          ${mission({ title: "Markdown renderer research", at: 2, of: 2, steps: ["done", "done"], status: "Done", faces: agent("R", "idle", "#d3d6d9") })}</div>
        <div class="res-group"><h3 class="group">Changes</h3>
          <div class="change">${agent("B", "", "#dcdad5")}<span>Render agent messages as Markdown</span><span class="meta">Oct 12</span></div></div>
      </div>
    </section>`,
};
