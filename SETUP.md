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

The CMS configuration selects this Netlify project using backend.site_domain:
ahmad.anasweh.com. This domain is also registered as the Netlify project's custom
domain so the OAuth popup can return its result to the editor's actual origin.
DNS continues pointing to GitHub Pages; do not switch DNS to Netlify.
No further config.yml changes are needed.

## 3. Test the editor

Visit https://ahmad.anasweh.com/admin/ and click Login with GitHub.
Authorize your OAuth App while signed in as AhmadAnasweh (or an account with push access).
Create or edit a note. Paste a full article into Body to convert its HTML to Markdown;
the text after embedded images stays in place. Paste or add an image to insert it at
the cursor. Use the dark preview pane to check the result.

The editor saves unsaved changes as an unpublished draft every five minutes and
shortly after adding an image. **Save** also saves a draft immediately. Drafts live
in GitHub branches and pull requests and are visible in this public repository,
but do not appear on the website until **Publish** is clicked. You can find them
under **Workflow** in the editor. Keep the browser open until the editor says
**Changes saved** before leaving the page.

When the note is ready, click **Publish** and wait for Pages deployment.
The provider is configured and redirects to GitHub. CMS reading, uploading, and
publishing were verified with an existing authenticated GitHub session during the
audit. The interactive OAuth popup must also finish in your browser; the audit
does not claim that a CLI token tests GitHub's OAuth code exchange.

## Maintain navigation

After publishing a note, refresh the public website after GitHub Pages deploys it.
The sidebar automatically reads published Markdown notes from the public GitHub
repository and groups them by the Category field. Search uses the same published
note index, so no `_sidebar.md` edit is required. Set Category, Status, Tags, and
Last updated in the editor to keep navigation, filtering, labels, and the homepage
recent-notes section useful.

## Hosting notes

.nojekyll bypasses Jekyll and preserves underscore-prefixed files. There is no custom
GitHub Action or site build. GitHub still performs its normal Pages deployment.
.github/ is intentionally empty locally; Git does not track empty directories.

## References

- https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/
- https://decapcms.org/docs/backends-overview/
- https://decapcms.org/docs/github-backend/
