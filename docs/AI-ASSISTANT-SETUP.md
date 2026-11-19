# Setting up the Assistant (connecting Apps Script to Claude)

The Assistant runs inside your Google Apps Script. It talks to Claude through the **Anthropic API**, using a key
that you create once and store in Apps Script. The key never goes into the app, the Sheet, or this repo.

> **Important:** the API is billed separately from a Claude.ai (Pro/Max) subscription. A Claude chat subscription
> does not include API access. You create an API key in the Anthropic Console and add a small amount of credit.
> Usage here is light (a few short requests a day), so a few dollars of credit typically lasts a long time.

## What you need

- Your Momnie Family Google Sheet with the Apps Script already installed (the latest `apps-script/Code.gs`).
- An Anthropic Console account at <https://console.anthropic.com> (sign in with the Google account you like; it is
  a separate account from Claude.ai).
- About 10 minutes.

## Step 1. Create an API key

1. Sign in at <https://console.anthropic.com>.
2. Add billing: **Settings → Billing**, add a card and buy some credit (for example $10). Optionally turn on a
   monthly spend limit there so it can never run away.
3. Go to **Settings → API keys** and choose **Create key**. Name it something like `Momnie app`.
4. Copy the key right away (it starts with `sk-ant-`). You can't see it again later.

Menu names in the Console change from time to time; look for "API keys" and "Billing" if yours differ.

## Step 2. Store the key in Apps Script (not in the code)

1. Open your Sheet, then **Extensions → Apps Script**.
2. In the left sidebar choose **Project Settings** (the gear icon).
3. Scroll to **Script Properties** and choose **Add script property**.
4. Property: `ANTHROPIC_API_KEY`  Value: paste your key. Save script properties.

That's the only required setting. Never paste the key into `Code.gs`, the Sheet, a chat, or GitHub.

Optional property: `AI_MODEL`. The Assistant uses `claude-opus-5-5` by default. To use a different (for example
cheaper or faster) model, add `AI_MODEL` with that model's ID. Leave it out to use the default.

## Step 3. Update the script and approve its permissions

1. Paste the latest `apps-script/Code.gs` over the old one and save.
2. Choose **Deploy → Manage deployments → pencil (edit) → Version: New version → Deploy**.
   Every time `Code.gs` changes, you need a new version for the app to see it.
3. The script already reaches out to the internet for the weather, so Google usually won't ask for anything new.
   If it does ask you to authorize (for example after an update adds a permission), pick any function in the
   editor's function menu and press **Run**, then **Review permissions → your account → Advanced → Go to
   (project) → Allow**, and deploy a new version again.

## Step 4. Turn the Assistant on in the app

Only Paul sees these settings.

1. In the app: **Home → Settings → Assistant → Change**.
2. Turn on the assistant. Then choose:
   - **Who sees the AI posts**, and **Topics** and **Post after** for the daily notes.
   - **Who gets the AI Today card**, and **Who can use the Assistant button** (it starts as just you; add Shana
     when you're ready).
   - **Turn settled conversations into plans**, if you want it reading conversations.
3. Save.

## Step 5. Test it

1. In the app, go to **Home → Settings → Assistant** and tap **Run the assistant now**. This runs everything at
   once: the Feed notes, the AI Today cards, and the conversation check. After a few seconds a message says what it
   did, the page shows the result in **Last run** (for example "2 notes (run by hand)"), and any notes appear in the
   Feed. You can also run it from the Sheet: **Family app → Run the assistant now**.
2. Tap the sparkle at the top of any tab and type something like "Dentist for Clara next Tuesday at 3:30". An
   Assistant card should appear in the Feed.

## If something goes wrong

The **Last run** line on the Assistant settings page tells you what happened.

| What you see | What it means | Fix |
| --- | --- | --- |
| `no API key` / "No API key yet" | The Script property is missing or misspelled | Step 2. The name must be exactly `ANTHROPIC_API_KEY`. |
| `Claude API error 401` | The key is wrong, revoked or has extra spaces | Create a new key and paste it again. |
| `Claude API error 402` or a billing/credit message | No credit left | Add credit in the Console under Billing. |
| `Claude API error 429` | Too many requests too quickly | Wait a minute and try again. |
| `Claude API error 404` about the model | `AI_MODEL` names a model that doesn't exist for your account | Remove `AI_MODEL`, or fix the ID. |
| "The assistant is not turned on for you" | You're not on the **Who can use the Assistant button** list | Step 4 (Paul can add you). |
| Nothing happens and no error | The new script version wasn't deployed | Step 3: Deploy → New version. |
| Google asks for permission again | A new feature needs a new permission | Review permissions and allow. |

To see detailed errors: in Apps Script open **Executions** in the left sidebar and click a failed run.

## What gets sent to Claude (privacy)

- A short plain-text summary of your plans: dinners, to-dos and bills due, school runs, activities, events, house
  upkeep, upcoming birthdays, and the text of recent posts and conversations the Assistant is asked to read.
- **Gift ideas are never sent**, not their names or details. For a kid's birthday the Assistant only gets a count
  of how many ideas are saved.
- Your passcodes and the API key are never sent. Claude's answers are checked by the script (only names, dates,
  times and options that exist in your app are accepted) before anything is saved.

## Rotating or removing the key

- **Replace it:** create a new key in the Console, update `ANTHROPIC_API_KEY` in Script Properties, then delete
  the old key in the Console.
- **Turn the Assistant off:** in the app, **Home → Settings → Assistant → Change** and turn it off (nothing is
  sent to Claude while it's off). To remove access completely, delete the Script property and the key in the
  Console.

## Cost control

- The daily notes, the AI Today card, and reading conversations only call Claude when there is something to do.
- You can lower cost in the Console with a monthly spend limit, or by setting `AI_MODEL` to a smaller model.

## How often the assistant runs

- **Every two hours** from 5 AM until 1 AM (there is no setting for this), it reviews the plans, checks your
  rules, refreshes the AI Today cards and reads recent conversations. It posts at most 3 general notes a day, and
  rule notes as they apply.
- **Right after** anyone uses the Assistant button, answers a question, or uses Fill it in, it does a quick extra
  review (several requests close together share one).
- **By hand** any time: Home → Settings → Assistant → Run the assistant now, or Family app → Run the assistant now
  in the Sheet.

It only talks to Claude when the assistant is on, and it reads conversations only when something new was said.

## The assistant tidies up after itself

Each review the assistant checks its own recent notes and open questions against the current plan and clears the
ones that are out of date (for example, a "who is making dinner?" note once someone is set to cook). Cleared posts
leave the Feed but stay in the Assistant page's request log. If someone settles a question in a post or reply (for
example "I'll cook tonight"), the assistant updates the plan and clears the question. General notes expire after 3
days and unanswered questions after 7.
