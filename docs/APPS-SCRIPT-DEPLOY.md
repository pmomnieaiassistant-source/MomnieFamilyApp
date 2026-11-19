# Automatic Apps Script deploy

When `apps-script/Code.gs` changes on `main`, GitHub pushes it to the Apps Script project and makes a new version of the existing web app deployment (same web address). Workflow: `.github/workflows/deploy-apps-script.yml`.

## One-time setup

The project has two files, `Code.gs` and `Push.js` (iPhone push notifications). Both must be in `apps-script/` in the repo. The deploy copies the repo over the project and removes anything not in the repo, so it refuses to run until `apps-script/Push.js` and `apps-script/appsscript.json` exist.

1. **Turn on the Apps Script API.** Go to https://script.google.com/home/usersettings and switch on "Google Apps Script API".

2. **Get the project ID.** Open the project at script.google.com, then Project Settings (gear). Copy the **Script ID**.

3. **Get the deployment ID.** Deploy → Manage deployments. Copy the **Deployment ID** of the web app (starts with `AKfycb…`).

4. **Sign in with clasp.** In Google Cloud Shell (shell.cloud.google.com) or any terminal:
   ```
   npm install -g @google/clasp@2
   clasp login --no-localhost
   ```
   Then open the project folder: `clasp clone <Script ID>` and then `clasp pull`. This creates `appsscript.json` (time zone, scopes). Copy that file into `apps-script/appsscript.json` in the repo and commit it. The deploy is skipped until this file exists, so the project's time zone is never overwritten.

5. **Store the secrets in GitHub.** Repo → Settings → Secrets and variables → Actions → New repository secret:
   - `CLASP_RC`: the full contents of `~/.clasprc.json` (created by `clasp login`). This signs in as your Google account, so treat it like a password. Don't paste it in chat or commit it.
   - `APPS_SCRIPT_ID`: the Script ID from step 2.
   - `APPS_SCRIPT_DEPLOYMENT_ID`: the Deployment ID from step 3.

## After that

Every merge to `main` that changes `apps-script/` deploys automatically. Check the run under the repo's Actions tab. To deploy without a change, run "Deploy Apps Script" from the Actions tab.

If the login ever stops working (Google revokes it, or you change your password), run `clasp login --no-localhost` again and update the `CLASP_RC` secret.
