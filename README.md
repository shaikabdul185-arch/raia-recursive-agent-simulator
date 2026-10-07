# RAIA — Recursive AI Agent Simulator

A visual simulation of an autonomous agent with **recursive control layers**. It notices when its own policy is wrong, diagnoses why, and rewrites its policy, within a fixed self-modification budget and hard safety rules.

The scenario: RAIA is an on-call software agent. Checkout errors spike, its standard policy rolls back the last deploy, the rollback fails, and the meta layer works out that its belief ("recent code caused this") was wrong. It rewrites the policy to check database health first, restarts the connection pool, and the incident resolves.

## The four layers

| Layer | Role | What it does in the scenario |
|---|---|---|
| **L0 Actuator** | Perception and action | Reads metrics, calls rollback and restart APIs |
| **L1 Policy** | Rule selection | Matches state to rules (P1–P4) and picks an action |
| **L2 Evaluator** | Outcome checking | Sees the rollback didn't help and flags a *model/belief failure* |
| **L3 Meta-control** | Self-modification | Rewrites P1, adds P4, spends 15 of 100 budget points, keeps the safety rules |

## Features

- **Step-by-step or auto-run:** step through 10 stages, or let it play at one step every 3 seconds
- **Live world model:** beliefs, goals, constraints and assumptions update as the agent learns
- **Policy diff:** modified and new rules are highlighted
- **Self-modification budget:** a meter that drains with each self-edit, so changes stay bounded
- **Failure taxonomy:** action, policy, belief and meta-control failures, each with its recovery strategy
- **Optional Gemini monologue:** with an API key, each layer's "inner monologue" is generated live by Gemini. Without one, the built-in script runs.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · lucide-react · Google Gen AI SDK (`gemini-3-flash-preview`)

## Run locally

Requires Node.js 18+.

```bash
git clone https://github.com/shaikabdul185-arch/raia-recursive-agent-simulator.git
cd raia-recursive-agent-simulator
npm install
cp .env.example .env.local   # optional: add your Gemini API key
npm run dev
```

Open http://localhost:3000. The simulator works without a key; the key only enables live AI-generated monologues.

Build for production with `npm run build` (output in `dist/`).

## Project structure

```
App.tsx                      Simulation loop, controls, layout
constants.ts                 Scenario steps, initial policies, world model, failure taxonomy
types.ts                     Layer, failure and state types
components/LayerCard.tsx     One card per control layer
components/WorldModelPanel.tsx  Beliefs, goals, constraints, policies, budget
components/LogTerminal.tsx   Scrolling system log
services/geminiService.ts    Optional live monologue generation
```

## A note on API keys

The key is bundled into the browser code at build time. That's fine for running on your own machine, but don't deploy a public build with your personal key in it.
