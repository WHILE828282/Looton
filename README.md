# Looton Mini App MVP

MVP scaffold for Telegram Mini App marketplace with mock data, localStorage persistence, and role-gated staff arbitration routes.

## Local run

```bash
npm install
npm run dev
```

## Notes

- If `npm install` fails with `403`, the environment has registry restrictions.
- Current repository has local commits only unless a remote is configured and pushed.

## GitHub Desktop sync

1. Open this folder in GitHub Desktop.
2. Ensure current branch includes latest commits.
3. Publish repository or set remote.
4. Push origin to sync commits.

## Git push troubleshooting (Windows)

If GitHub shows no updates, run these commands in **PowerShell** inside the repo folder:

```powershell
cd C:\Users\user\Documents\GitHub\Looton
git rev-parse --show-toplevel
git status
git fetch origin
git log --oneline origin/main..main
git log --oneline main..origin/main
```

How to read results:

- `origin/main..main` has commits → you have local commits to push.
- `main..origin/main` has commits → remote is ahead, run `git pull --rebase origin main` then push.
- both are empty + `working tree clean` → there is nothing new to publish.

If push still fails with account mismatch (403), reset saved credentials and sign in again:

```powershell
git config --global credential.helper manager
cmdkey /list | findstr git:https://github.com
```

Then remove old GitHub entries in **Windows Credential Manager** and retry `git push origin main`.


## Deployment (configured)

- Production URL: `https://looton.vercel.app`
- TON Connect manifest: `https://looton.vercel.app/tonconnect-manifest.json`

Make sure the following files/routes exist on deploy target:
- `/tonconnect-manifest.json`
- `/icon.svg` (or update `iconUrl` in manifest)
- `/terms` and `/privacy` (or update/remove those URLs)


## Latest UX updates

- Added order status badges and timeline in order screens.
- Improved staff case anonymity by showing short order reference only.
- Added clearer visual states for order statuses (ok/warn/danger).


## Vercel SPA routing fix

- Added `vercel.json` rewrite so client-side routes (e.g. `/orders`, `/offer/:id`) resolve to the SPA entry instead of returning 404.
- Added `public/icon.svg` and simplified TON manifest to only required fields for stable wallet initialization.

<!-- touch: sync marker -->
