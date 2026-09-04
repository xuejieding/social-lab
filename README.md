# Social Lab v2

A static, privacy-friendly social consequence simulator.

## What changed in v2

- 20 scenarios across five levels
- recurring characters
- relationship memory across scenarios
- delayed consequences
- relationship map
- perspective replay
- goal ranking before each response
- free-text responses
- local heuristic analysis
- long-run pattern report
- mobile-responsive interface
- browser-local storage only
- optional "link-key" gate

## Run locally

Just open `index.html`.

For best behavior, you can also serve the folder locally:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages

1. Create a new repository.
2. Upload these files to the repository root.
3. In GitHub: Settings → Pages.
4. Deploy from the `main` branch / root.
5. GitHub will provide a `github.io` URL.

## Important privacy note about GitHub Pages

A private GitHub repository does **not** make an ordinary GitHub Pages site private.
For personal GitHub accounts, treat a normal Pages deployment as publicly reachable.

### Option A — "Only people with the link" (low-friction, NOT strong security)

This build includes a client-side link key.

In `app.js`:

```js
const CONFIG = {
  ACCESS_MODE: "link-key",
  ACCESS_KEY: "replace-with-a-long-random-string"
};
```

Then share:

```
https://YOURNAME.github.io/YOURREPO/?key=replace-with-a-long-random-string
```

The site stores successful access for the browser session.

**Limit:** this is obscurity, not real authentication. Anyone who can inspect the published JavaScript can recover the key. Use only when the site contains no genuinely sensitive information.

### Option B — real access control

For genuine restricted access, keep the GitHub repository private and deploy behind a host/access layer that supports authentication (for example an access gateway, password-protected deployment, or GitHub Enterprise Cloud private Pages).

If you use GitHub Enterprise Cloud in an organization, private Pages can be restricted to users who have read access to the repository.

## Data/privacy

The app does not send responses to a server. Progress, responses-derived metrics and relationship memory are stored only in the browser's `localStorage`.

Do not put private personal data, credentials, API keys or confidential company information directly into a public static deployment.
