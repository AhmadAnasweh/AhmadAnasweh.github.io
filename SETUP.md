# Setup status and editor login

## Already completed

- Public repository: https://github.com/AhmadAnasweh/AhmadAnasweh.github.io
- Website: https://ahmad.anasweh.com
- GitHub Pages publishes main, root folder; custom domain and Enforce HTTPS enabled.
- Netlify authentication project: ahmad-anasweh-notes-auth
- Netlify project ID: 98e15a73-c6e9-4ba0-ba02-b7dfbf1c5f3d
- Decap uses Netlify's managed OAuth service at https://api.netlify.com.
- The public website remains on GitHub Pages. GoDaddy DNS needs no changes.

No custom OAuth server, site build, or Node dependency is needed to run the website.
Netlify stores the OAuth credentials privately and handles the authentication exchange.
The authentication project does not need to publish a copy of the notes website.

## 1. Register your GitHub OAuth App

Open https://github.com/settings/applications/new and enter:

| Field | Value |
| --- | --- |
| Application name | Ahmad's Notes CMS |
| Homepage URL | https://ahmad.anasweh.com |
| Description | Browser editor for Ahmad's Notes (optional) |
| Authorization callback URL | https://api.netlify.com/auth/done |

Leave Enable Device Flow unchecked. Click Register application.
Copy the Client ID. Click Generate a new client secret.

## 2. Save the credentials in Netlify

Open https://app.netlify.com/projects/ahmad-anasweh-notes-auth/configuration/access.
Find OAuth, then Authentication Providers, and click Install provider.
Choose GitHub, enter the Client ID and Client Secret from step 1, and save.
These values go in the provider form, not environment variables or the repository.
Do not paste the secret into chat or commit it to GitHub.

The CMS configuration already selects this Netlify project using backend.site_domain.
No further config.yml changes are needed.

## 3. Test the editor

Visit https://ahmad.anasweh.com/admin/ and click Login with GitHub.
Authorize your OAuth App while signed in as AhmadAnasweh (or an account with push access).
Create a note, optionally attach a file, and publish. Wait for Pages deployment.
Login and publishing remain unverified until the OAuth App credentials are configured.

## Maintain navigation

After publishing a note, edit _sidebar.md using GitHub's browser editor and add:

```markdown
- [Note title](/notes/note-title.md)
```

Use the actual filename. Update/remove links when renaming/deleting notes.
Docsify cannot enumerate a static directory; search discovers notes from sidebar links.

## Hosting notes

.nojekyll bypasses Jekyll and preserves underscore-prefixed files. There is no custom
GitHub Action or site build. GitHub still performs its normal Pages deployment.
.github/ is intentionally empty locally; Git does not track empty directories.

## References

- https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/
- https://decapcms.org/docs/backends-overview/
- https://decapcms.org/docs/github-backend/
