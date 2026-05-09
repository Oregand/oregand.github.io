---
layout: post
title: "Shipping the Task API at GitHub Scale: A Success Story in Agentic APIs"
date: 2026-05-01
categories: ai engineering-leadership copilot
description: "How we designed, built and released the Task API behind GitHub Copilot's agent — and what it taught us about running an agentic API at the scale of GitHub."
image: https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
---

## The thing nobody warns you about agentic APIs

You can stand up an "agent" in a weekend. A loop, a tool list, a model. It works. You demo it. People clap.

Then someone asks the question that ends the party:

> "Cool — can we expose this as an API?"

That is where the real work starts, and that is the story I want to tell. Over the last several months our team shipped the **Task API** behind GitHub Copilot's coding agent — the API that lets a developer (or another agent) hand off a unit of work, walk away, and come back to a result. It is now serving real customer traffic at GitHub scale, and the journey to get there reshaped how I think about API design, observability, and what "production-ready" even means in an agentic world.

This post is the lessons-learned writeup. No marketing. The things I would tell a friend's team if they were about to start the same project.

## What the Task API actually is

A `task` is the unit of asynchronous agent work. You `POST` one with a prompt and some context, you get back a `task_id`, and you poll (or subscribe to) it until the agent is done. Underneath, that single id stitches together:

- a **session** with the model
- a **plan** the agent is working through
- zero or more **pull requests, commits, comments and check runs** the agent produces along the way
- a **billing event** for premium request accounting
- a **telemetry trail** that has to survive restarts, retries, model timeouts and the occasional human stepping in mid-run

A traditional REST resource it is not.

## Lesson 1: Your resource model is a lie until you decouple the agent from its output

Our first version made the same mistake almost everyone makes: we conflated **the task** with **the pull request the task produced**. It felt natural. The agent's job was to open a PR, so why not key everything off the PR id?

It worked until it didn't. Sessions that the agent reopened. Tasks that completed without ever producing a PR. Customers who renamed a task and expected the rename to stick across the PR boundary. A whole class of UI bugs where "the panel diverged" because two different surfaces were keying off two different ids for what the user thought was the same thing.

The fix was a quiet but expensive refactor: **the task is the resource. The PR is an artifact of the task.** Once we made that distinction in the data model — and exposed it cleanly in the API (`PATCH /agents/tasks/{task_id}` for renames, `GET` returning a task whether or not a PR exists yet) — entire categories of bugs evaporated.

> If you remember one thing from this post: **never let the side-effect of an agent become the primary key of the agent's work.** The agent might not produce that side-effect this time. Or it might produce three.

## Lesson 2: Error UX is product UX when the user is partly an LLM

Standard wisdom: API errors are for developers, so a status code and a message is enough.

That breaks the moment your API is being called by another agent. Now your error message is a prompt. A cryptic 403 doesn't just frustrate a human — it teaches the calling LLM the wrong lesson and watches it retry the same broken thing in slightly different wording for the next ten minutes.

So we did something that felt almost embarrassing in its obviousness: we added a structured `error_code` field to every public API 403, on top of the human message. Now both readers — the human debugging at 2am and the agent that hit the wall — have something deterministic to branch on.

The same principle applied to rate limits, idempotency conflicts, and "you've used this session id for something incompatible already" errors. Every error message in the Task API now has **two readers**, and we design for both.

## Lesson 3: SLOs for agent work are not SLOs for HTTP requests

Our first dashboard was beautiful and useless. P50 latency? Sub-second. P99? Sub-second. Availability? Five nines. Customer satisfaction? Falling.

The reason: the API was healthy. The **agent** was not. Tasks were "succeeding" by the API's definition (200 OK, task accepted, session created) and failing by the customer's definition (the PR was wrong, or empty, or the agent gave up halfway).

We replaced the SLO. The new one tags every result — `succeeded`, `failed`, `cancelled`, `timed_out`, `noop` — and counts the ratio that matters: **of the tasks a customer asked us to do, what fraction produced something they would consider a win.** The number was lower than the old one. It was also true, which made it the first SLO we could actually defend.

If you are building anything agentic, write down what "success" means **for the user's intent**, not for the HTTP transaction. If you cannot measure it, you cannot ship it confidently.

## Lesson 4: Idempotency in a non-deterministic system is mostly about state, not about retries

Classic idempotency is "the same request twice gives the same answer." With an agent, the same request twice will literally never give the same answer, and you have to be okay with that. The piece you can — and must — make idempotent is the **state transitions**, not the outputs.

Concretely: when an event arrives saying a session was `requested`, and a later event arrives saying it was `completed`, but a duplicate `requested` shows up in between, the system has to know which timeline is real. We instrumented every duplicate, every out-of-order pair, and every session that was reset because the events lied. Then we wrote the rules:

- `requested` followed by `completed` followed by another `requested` → reset, do not double-bill.
- duplicate `*.completed` for the same `task_id` → drop the second one, but emit telemetry so we know it happened.
- a `*.requested` after a terminal state → start a new session, link the prior one as the parent.

None of that is glamorous. All of it is the difference between a billing system you trust and one you do not.

## Lesson 5: Blast radius is a first-class API concern

Every behavior change to the Task API ships behind one of three things:

1. **A feature flag** — for behavior changes that are safe to dark-launch and revert per-tenant.
2. **A circuit breaker default** — for behavior we want on globally with a per-app exemption escape hatch (turning compatibility behavior off by default while letting noisy integrators opt back in for one release cycle).
3. **A fast rollback path** — for behavior changes that cannot be flagged because the new and old code paths cannot coexist safely.

The choice between those three is a design conversation, not an implementation detail. We talk about blast radius **before** we write code, not after we read the incident retro. And once a behavior has soaked, we **rip the flag out** — dead flags are technical debt with a sharper edge in agent systems, because they hide the real production behavior from the next person on call.

## Lesson 6: Disaster recovery for an agent service is its own discipline

Standard DR runbooks assume you can replay the request log and converge on the same state. Agent services break that assumption: replaying a prompt against a different model snapshot can produce a different plan, which produces a different PR, which means "recovery" needs to mean something other than "rerun the request."

We wrote new runbooks. They cover things classic playbooks do not:

- How to **freeze** in-flight tasks without losing the session state.
- How to **migrate** a session to a new agent runtime version mid-flight when we have to.
- How to **refund** premium requests for tasks the system, not the user, killed.
- How to **communicate** with customers whose task is in a partial state — a half-written PR is more confusing than no PR.

If your team is shipping anything agentic to a paid customer base, write these runbooks **before** you need them. The first incident is a bad place to discover that your DR doc was written for a stateless service.

## What I would tell my past self

A short list, no padding:

1. **Decouple the agent from its artifacts on day one.** Tasks are the resource. PRs, comments, runs are outputs. Do not key your data model off the outputs.
2. **Design error responses for two readers.** Add structured codes, not just messages.
3. **Pick an SLO that measures intent, not transport.** If your dashboard is green and your customers are unhappy, the dashboard is wrong.
4. **Make state transitions idempotent, not outputs.** Then instrument every duplicate and every out-of-order event so you can see the lies in your event stream.
5. **Decide blast-radius posture per-change.** Flag, breaker, or rollback — pick one explicitly.
6. **Write the agent-shaped DR runbook now.** Not after the incident.

## The success story, in one number

The Task API is in production. It serves real customers. The success-rate SLO — the honest one — is up and to the right. The on-call rotation is sustainable. The next set of features is being shipped by other teams against a stable API contract, which is the point.

Building an agent is the easy part. Releasing one as an API at the scale of GitHub is the work. I am very proud of what the team shipped, and I am writing this post mostly so the next team — yours, maybe — gets to skip a few of the lessons we paid for in incidents.

If you are working on an agentic API and any of this resonates, find me on [LinkedIn](https://www.linkedin.com/in/oregand7/) or [GitHub](https://github.com/Oregand). I would love to compare notes.
