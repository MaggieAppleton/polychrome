# Polychrome: vision

First draft, 2026-10-26. Written from a spoken ramble; to be refined.

Polychrome is a software factory built on Fractal's primitives. A person's attention goes only to decisions, problems and deep thinking. Agents do everything else.

## The attention queue

When I come back to the laptop with free attention, whatever time of day that is, Polychrome has prepared what I need to decide or think through about whatever I'm building, with research done and artifacts made to help me decide. Today that's Polychrome itself; for someone else it's their own product or project.

### Focus on one thing, then related things

The queue is grouped by subject. If twelve things need me and three are about interface design, those three come together as a set. I shouldn't jump from a back-end decision to an interface decision to a CI failure. Once I've loaded up context on one thing, Polychrome keeps me there.

### What fills the queue

1. **Decisions missions need.** A running mission hits something only I can decide. Fractal calls these alerts.
2. **Findings from scheduled missions.** Reviewers run on their own: design and QA daily, security weekly, quality on every merge. When something is plainly wrong, they fix it without asking me. When it needs judgment, it goes into the queue.
3. **My own ideas.** These come in through the chief of staff.

### The chief of staff

I have one free-flowing place to talk: a chief-of-staff agent. I can say "I think we built the back end the wrong way" or "I want this new feature" without working it out first. The chief of staff turns that into an item, does useful research or prototyping, and brings it back when its time comes, with things for me to react to. It gives me a reflective surface to develop the idea on.

### Ideas wait until their time

When I don't have the energy or headspace to think something through, I hand it off and move on. Polychrome works on it in the background: gathers context, sets up an environment, prepares an interface. When the idea's time comes, because it's become important or urgent, it comes to the front, ready for me to engage with.

How Polychrome decides what to prepare, and when an idea's time has come, is still open.

## Each problem gets its own interface

The shape of the interface follows the problem:

- **Visual design:** a canvas where I can draw and mock things up, and an agent makes designs and iterates with me on them.
- **Architecture:** diagrams, and a back-and-forth with an agent.
- **Small decisions,** like choosing a Markdown renderer: research, a comparison of pros and cons, and a recommendation.
- **Design jigs:** interactive prototypes I can touch and play with.

These are bespoke artifacts, made for one decision or problem.

## Decisions are first-class

Once I decide, the decision is committed and saved somewhere traceable, so I can review past decisions and why I made them.

## The factory builds what I decided

A committed decision becomes a mission, or joins one. The factory builds it, reviews it for quality, security and design, tests it, and merges it. My attention stays on vision, strategy and high-level decisions.

## Two views

1. **Deciding:** deep work on one decision or problem, with rich context and a bespoke interface.
2. **Overseeing:** a dashboard of what the agents have done, what's merged, and the status of work in progress. It includes a changelog of the app written from what agents changed, including the fixes they made without asking me.
