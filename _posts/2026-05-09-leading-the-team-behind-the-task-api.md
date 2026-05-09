---
layout: post
title: "Leading the Team Behind the Task API: What Shipping Agentic Infrastructure Taught Me About Engineering Management"
date: 2026-05-09
categories: engineering-leadership ai copilot
description: "A companion to the Task API launch post — eight lessons about leading the team behind GitHub Copilot's agentic API, from staffing and team shape to handling the 3am page that finally arrives."
image: https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=70
imageAlt: "A small team gathered around a laptop, collaborating intently"
readTime: "8 min read"
---

A week ago I [shipped a post about the Task API behind GitHub Copilot's agent](/blog/2026/05/01/shipping-the-task-api-at-github-scale.html). The reaction surprised me — half the messages I got back weren't about the technical design at all. They were the same question, phrased a dozen different ways:

> "How did you manage the team that built it?"

So this is the companion post. Same launch, different lens.

## 1. Staff for the second year, not the first sprint

The first version of the Task API was built by three engineers in eight weeks. The version we shipped at scale needed eleven engineers, an SRE embed, a dedicated PM, and a model-eval partner. If I'd staffed the team I _started_ with for the team I _ended_ with, we'd have a totally different group of people — and we'd have lost most of the early IC velocity.

What I'd do differently: name "team shape at GA" as a planning artifact from week one. We had architecture diagrams. We didn't have an org-shape diagram. Both should be in the same doc.

## 2. Agentic systems break in ways that aren't on your runbook

Traditional services degrade in shapes you can predict — latency, error rate, queue depth. Agentic systems also degrade in shapes you _can't_ predict from telemetry alone:

- The model gets quietly worse at tool selection after a routine evaluation refresh.
- A single customer's prompt pattern starts driving a long-tail token spike.
- A new tool the agent has access to changes the equilibrium of every other tool's call rate.

None of this shows up as red on a dashboard. It shows up as a Slack thread from a customer that says _"this used to work."_ The lesson for managers: budget time for **interpretive on-call**, not just reactive on-call. Someone on the team needs to be paid, in calendar time, to read the eval diffs and ask "what changed about the agent's behavior this week?"

## 3. The hardest hire was not who I expected

I assumed I'd struggle to hire the model-eval engineer. I didn't — there's a healthy and growing pool of those folks, and they self-select toward AI infra work.

The hardest hire was a **principal-level distributed systems engineer who was excited about AI infra**. Most of the strongest distributed systems people I talked to wanted to work on databases, networking, or compute platforms — not on something they perceived (often correctly, in 2025) as a thin orchestration layer. The way I eventually closed the role was to reframe what we were building: not "AI plumbing", but "the rate-limiting, caching, and durability layer for the most demanding workload GitHub has ever run." That framing turned out to be true _and_ it landed.

## 4. Two-week sprints are wrong for this work

We tried two-week sprints for the first quarter. They were a bad fit.

A meaningful unit of work on the Task API was almost never two weeks. It was either:

- **Three days** — one engineer goes deep on a specific failure mode, ships a fix, moves on, or
- **Six to eight weeks** — a redesign of how we batch agent invocations, requiring schema migration, a deprecation path, and a rollout.

Forcing those into a fortnight rhythm meant either inflating the small work or breaking the big work into fake checkpoints. We moved to a continuous flow model with a weekly demo and a six-week "theme" cadence. That mapped to the actual shape of the work and made planning conversations honest again.

## 5. Pair the model people and the systems people early

The biggest single productivity unlock on this team was a deliberate pairing rotation between the engineers thinking about model behavior and the engineers thinking about service behavior. They sit in different parts of the brain. Without explicit pairing they ship fixes that solve their own problem and create the other team's problem.

Two examples that came out of those pairs in the last six months:

- A retry policy change that improved success rate but tripled per-request token cost — caught and rebalanced in pair before it shipped.
- An eval suite that flagged a regression which turned out to be a load-balancer config drift, not a model issue at all — caught because the eval engineer was sitting next to the SRE.

## 6. Decide who owns the prompt

This sounds trivial. It is not.

When the agent gets something wrong, the fix can live in the model, the system prompt, the tool definition, the routing layer, or the client. Without an owner, every regression spawns a five-team meeting. We named one tech lead the **prompt and tool surface owner** — not the author of every change, but the accountable reviewer. Time-to-fix on agent behavior bugs dropped by more than half within a month.

If you're managing an agentic team and you haven't named this role: name it this week.

## 7. Performance reviews need new vocabulary

Half my team works on things that have a clean numerical signal — p99 latency, success rate, error budget burn. The other half works on things where "good" is a judgment call about model behavior across thousands of cases.

For a while I was reviewing both halves with the same vocabulary, and the model-eval engineers kept getting subtly underrated. I now ask different questions for each half:

- **Systems half:** What did you ship, what did it cost, what did it unlock?
- **Eval/model half:** What behavior did you discover, how did you make it legible to the team, and what decision did the org take because of it?

The second question is the one that took me a year to learn how to ask well.

## 8. Celebrate the boring launch

We shipped the Task API at GA without an incident. Zero pages on launch day. Zero customer-impact rollbacks in the first month.

That is not a story that writes itself. It happens because eleven people made hundreds of small careful choices for a year. As a manager you have to find a way to make those choices visible — in performance reviews, in promotions, in the company-wide launch comms. If only the launch dramas get told as stories, you train your team to create launch dramas.

The boring launch is the win. Tell that story explicitly.

---

If you read the [technical post](/blog/2026/05/01/shipping-the-task-api-at-github-scale.html) and walked away thinking "this was an engineering achievement", I want you to walk away from this one thinking the same about the team behind it. The two stories are inseparable.

If you're managing an agentic-API team — or about to be — and any of this resonates, I'd love to hear from you. The playbook for this kind of work is being written in real time, and I learn every week from peers in the same seat.
