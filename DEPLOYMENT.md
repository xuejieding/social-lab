# Deployment choices

## 1. Simplest: GitHub Pages + unlisted URL

Good for: you and Matthias, low sensitivity, easy sharing.

- Keep content generic.
- Optionally turn on the `link-key` gate in `app.js`.
- Use a long random repository name and long random key.

This feels "link-only" in practice, but is not secure access control.

## 2. Real private access

Good for: private scenarios, personal notes, confidential workplace material.

Recommended architecture:

- private GitHub repository
- deploy through a host or access gateway that requires authentication
- optionally allow only specific email addresses

GitHub Enterprise Cloud organizations can use private GitHub Pages with repository read-access controls.

## 3. Do not do this

Do not place:
- real workplace secrets
- private HR/legal details
- health information
- children's identifying information
- passwords/API keys

inside a normal publicly deployed GitHub Pages bundle.
