# Launch and editing checklist

## 1. Enable GitHub Pages immediately after the replacement is pushed

Open https://github.com/AhmadAnasweh/AhmadAnasweh.github.io/settings/pages.
Under **Build and deployment**, select **Deploy from a branch**, choose **main**
and **/(root)**, then Save. Under **Custom domain**, enter `ahmad.anasweh.com`
and Save. The old site's Pages settings do not carry over to the replacement.

Wait for the domain check and certificate provisioning, then enable **Enforce HTTPS**.
The public site can work before CMS authentication is configured.
DNS at GoDaddy does not need to change: the repository has the same name and the
existing CNAME still points to `AhmadAnasweh.github.io`.

`.nojekyll` bypasses Jekyll and preserves underscore-prefixed files. There is no
custom GitHub Action, dependency installation, or site build. GitHub still performs
its normal Pages publishing/deployment operation. `.github/` is intentionally empty
locally; Git does not track empty directories.

## 2. Set up a separate OAuth service

OAuth lets GitHub authorize the editor to save notes to your repository.
The GitHub backend requires a server to exchange credentials; GitHub Pages cannot
run it. Creating an OAuth App alone is insufficient.

Choose a host that can run a Decap-compatible OAuth service over HTTPS. One concrete
implementation is https://github.com/vencax/netlify-cms-github-oauth-provider.
Deploy that separate project using its hosting instructions. It needs a Node-capable
service host; this notes website itself has no Node dependency. Obtain the service's
HTTPS URL, for example `https://YOUR-PROVIDER-HOST` using the host's supplied domain.
Do not use that literal placeholder or change your existing GoDaddy DNS.

## 3. Create the GitHub OAuth App

In your personal GitHub settings, open **Developer settings → OAuth Apps → New OAuth App**
at https://github.com/settings/applications/new. For the example provider above use:

- **Application name:** `Ahmad's Notes CMS`
- **Homepage URL:** `https://ahmad.anasweh.com`
- **Application description:** `Browser editor for Ahmad's Notes` (optional)
- **Authorization callback URL:** `https://YOUR-PROVIDER-HOST/callback`, replacing
  the host with the actual service URL from step 2. This is the OAuth server, not `/admin/`.
- Leave **Enable Device Flow** unchecked.

Click **Register application**, copy the **Client ID**, then click **Generate a new
client secret**. Save both in the OAuth service host's private environment settings:

```text
OAUTH_CLIENT_ID=<your GitHub OAuth App Client ID>
OAUTH_CLIENT_SECRET=<your GitHub OAuth App Client Secret>
NODE_ENV=production
ORIGINS=ahmad\.anasweh\.com
REDIRECT_URL=https://YOUR-PROVIDER-HOST/callback
```

The ORIGINS value above is a regular expression with literal dots, as expected by
this provider. Restart/redeploy the OAuth service after setting its environment.
Do not paste the secret into the CMS config, browser code, notes, or GitHub commits.
If you choose another Decap-compatible provider, follow its exact callback path,
origin format, and environment variable names instead.

## 4. Connect the editor

Edit `admin/config.yml` on GitHub. Replace `backend.base_url` with the actual HTTPS
OAuth service origin, without a trailing slash. For the example provider, keep
`auth_endpoint: auth`. Commit the change to main and wait for Pages to publish.

Visit https://ahmad.anasweh.com/admin/, click **Login with GitHub**, and authorize
your OAuth App while signed in as AhmadAnasweh (or an account with push access).
Create a note, optionally attach a file, and publish. Verify the note and attachment
in the public site after deployment. OAuth login cannot be tested until the real
provider is deployed and configured.

## 5. Maintain navigation

After publishing a note, edit `_sidebar.md` using GitHub's browser editor and add
`- [Note title](/notes/note-title.md)` using the actual filename. Commit to main.
Update/remove links when renaming/deleting notes. Docsify does not enumerate a static
directory; search discovers notes through these sidebar links.

## References

- https://decapcms.org/docs/github-backend/
- https://decapcms.org/docs/backends-overview/
- https://github.com/vencax/netlify-cms-github-oauth-provider
- https://docsify.js.org/#/more-pages
