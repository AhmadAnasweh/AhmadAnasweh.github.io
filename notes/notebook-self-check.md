---
title: Notebook self-check
file: /notes/files/notebook-check.txt
---
A repeatable check for this public notebook. This note and its harmless text attachment were published through the Decap editor during the September 2026 audit.

## Reading and navigation

Open Home, follow a sidebar link, and refresh a note directly. On a phone, use the menu button to open navigation.

## Search and code copying

Search for notebook validation. Check that the result opens this note. Copy this command and compare it with the original:

\`\`\`powershell
Get-FileHash -Algorithm SHA256 .\notebook-check.txt
\`\`\`

## Attachments

Use Download attachment below. The file contains only a short validation message, with no incident evidence or credentials.

## Editing

Sign in at /admin/, change a lab note, and publish. Add new note links to _sidebar.md on GitHub. Wait for Pages deployment, then refresh.

## Authentication boundary

The audit used an existing authenticated GitHub CLI token in an isolated browser to test CMS reading, uploads, and publishing. This does not prove the user-interactive GitHub OAuth popup flow; that must also complete in your own browser.
