---
title: Sample SOC investigation walkthrough
category: incident-response
status: tested
tags: [windows, splunk, edr]
updated: 2026-09-17T13:41:51Z
created: 2026-09-17T15:46:50+03:00
---
This is a sanitized example you can copy when starting a new investigation note.

## Case question

What happened, which systems may be affected, and what evidence would confirm or reject the current hypothesis?

## Scope and context

- **Timezone:** Record the source timezone and the time range you are investigating.
- **Systems:** List the hostnames, users, cloud accounts, or network segments in scope.
- **Data sources:** Record logs, telemetry, ticket IDs, and their retention limits.

## Evidence to collect

| Source | What to look for | Status |
| --- | --- | --- |
| Identity logs | Sign-ins, MFA events, privilege changes | Pending |
| Endpoint telemetry | Process tree, persistence, network connections | Pending |
| Network logs | Connections, DNS, proxy requests | Pending |

## Timeline

| Time (UTC) | Observation | Evidence |
| --- | --- | --- |
| Add time | Describe the event | Link or identifier |

## Findings

Separate confirmed facts from hypotheses. State what is still unknown and which evidence could change the conclusion.

## Next actions

1. Preserve the relevant evidence.
2. Assign an owner and due time for each follow-up.
3. Record the outcome and update the timeline.
