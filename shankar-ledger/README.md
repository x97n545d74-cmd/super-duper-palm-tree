# Shankar Medicos: ledger checker (खाता मिलान)

A page for the shop. Put in two papers:

1. **Our ledger**: the party's account exported from Tally or Busy (PDF, Excel or a photo of the printout).
2. **The party's statement**: what the supplier sent by mail or WhatsApp (PDF, photo, Excel).

It reads both, matches every bill and payment, and says in Hindi, Punjabi or English (on screen and by voice)
whether the accounts agree, what each side says is due, and which entries cause the difference.
The result can be sent on WhatsApp or printed.

## How it works

- **Reading** (`lib/extract.js`): Claude copies the rows off the paper into a table. It does no matching and no sums.
- **Matching** (`public/match.js`): plain code. Their debit is our credit. It pairs by bill number, then by amount and
  nearest date, then one-cheque-for-several-bills, and lists what is left. Same input, same answer every time.
- **Self-check**: opening balance plus every row must equal the closing balance printed on the paper.
  If it does not, the screen says that paper was not read fully instead of showing a wrong result quietly.

## Run it

Needs Node 20 or newer.

```bash
cd shankar-ledger
npm install
cp .env.example .env      # then put ANTHROPIC_API_KEY and APP_PIN in .env
npm start                 # http://localhost:8080
```

Without a key, the "sample" button still works, so you can see the result screen.

- **On the shop PC**: run `npm start` and open `http://localhost:8080`.
- **On the phone, same Wi-Fi**: open `http://<PC's IP address>:8080`.
- **From anywhere**: host it online (next section).

## Put it on the Android phone

The phone cannot run the reader itself, so the app is hosted online and opened like an app.

1. Sign up at render.com with the GitHub account that owns this repo.
2. New → Blueprint → pick this repo. Render reads `render.yaml` at the repo root.
3. When it asks, type the two secrets: `ANTHROPIC_API_KEY` and `APP_PIN`. They stay in Render, not in this repo.
4. After the deploy, Render shows an address like `https://shankar-ledger.onrender.com`.
5. On the phone, open that address in Chrome → menu (⋮) → **Add to Home screen**. It opens full screen from the icon.
6. The first time, it asks for the shop PIN once.

The free plan sleeps when unused, so the first open after a break can take up to a minute.
Eight wrong PIN tries from one address (40 overall) lock PIN checks for an hour.
`render.yaml` has not been deployed yet; if Render rejects a field, fix it in the dashboard.

## Settings (`.env`)

| Name | What it does |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key from console.anthropic.com |
| `APP_PIN` | PIN typed once on each device |
| `LEDGER_MODEL` | Model that reads the papers. Default `claude-opus-5-5` |
| `LEDGER_EFFORT` | `low`, `medium` (default) or `high` |
| `READS_PER_HOUR` | Limit per device address. Default 40 |

## Privacy

Uploaded papers go to the Claude API to be read and are not written to disk or logged by this app.
**This repository is public: never commit a real ledger or statement.** `private/` and `uploads/` are ignored by git.
The files in `samples/` are made up (`python3 tools/make_samples.py` recreates them).

## Tests

```bash
npm test        # the matching rules
```

## Not built yet

- Fixing a misread row by hand on the screen.
- Pulling statements straight from the Gmail inbox (today: download the attachment, then choose the file).
- Keeping a history of past checks per party.
