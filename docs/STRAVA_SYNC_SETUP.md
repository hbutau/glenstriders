# Strava Auto-Sync Setup Guide

This guide explains how to connect the Glen Striders website to the Strava API so that challenge leaderboards are updated automatically twice a week.

---

## Does Strava Allow This?

**Yes.** Strava provides a public API and explicitly supports club-management tools of this kind. Here is a clear summary of what is and is not permitted.

### ✅ What Strava's API allows

| What we do | Why it is permitted |
|---|---|
| Fetch club activity data via `GET /clubs/{id}/activities` | Strava provides this endpoint specifically for club applications. The authenticated user must be a club member. |
| Display first name + last initial (e.g. "Alice M.") and activity metrics | The club activities endpoint intentionally returns only this limited, non-sensitive data by design. |
| Compute and display leaderboards on the club website | This is a core intended use case for the endpoint. |
| Cache the results in a Markdown file and rebuild the site twice a week | Short-term display caching for a non-commercial club site is permitted. |

### ⚠️ Requirements you must follow

| Requirement | How we meet it |
|---|---|
| **"Powered by Strava" attribution** (required) | A "Powered by Strava" badge with the official Strava logo and a link to strava.com is displayed on the challenges page. |
| **Rate limits** (100 req / 15 min; 1,000 req / day) | The sync script makes fewer than 20 API requests per run and runs at most twice a week. Nowhere near the limit. |
| **Respect user privacy settings** | The API only returns activities the member has set to *public* or *followers-only*. Private activities are never exposed — this is enforced server-side by Strava. |
| **Non-commercial use** | The Glen Striders website is a non-profit community club site. No data is sold or used for advertising. |

### ❌ What you must NOT do

- Display detailed GPS routes, heart-rate data, or split times — the club endpoint does not return these, so this is automatically prevented.
- Store individual athlete data in a database or share it with third parties.
- Use the data for commercial gain (selling it, using it for advertising, etc.).
- Exceed Strava's rate limits or attempt to scrape data outside the API.
- Remove or hide the "Powered by Strava" attribution.

### 📋 Applicable Strava policies

- [Strava API Agreement](https://www.strava.com/legal/api)
- [Strava Brand Guidelines](https://developers.strava.com/guidelines/)

> **In short:** Using the official Strava API to power a club leaderboard on a non-commercial club website is exactly what the API was designed for. The key obligations are displaying the "Powered by Strava" attribution (already implemented on the page) and respecting rate limits (easily met by our twice-a-week schedule).

---

## How It Works

1. A GitHub Actions workflow runs on **Monday and Thursday at 06:00 UTC** (and can be triggered manually at any time).
2. The workflow runs `scripts/sync_strava.py`, which:
   - Fetches recent club member activities from the Strava API for the active challenge period.
   - Computes the leaderboard rankings based on the challenge type (elevation, distance, etc.).
   - Rewrites `content/pages/challenges.md` with fresh data.
3. If the file changed, the workflow commits and pushes the update automatically.
4. Your existing build/deploy pipeline picks up the change and publishes the new leaderboard.

---

## Step 1 – Create a Strava API Application

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api) (must be logged in as a **club member** account).
2. Click **"Create & Manage Your App"**.
3. Fill in the form:
   - **Application Name**: e.g. *Glen Striders Website*
   - **Category**: *Club Administration*
   - **Website**: `https://glenstriders.co.zw`
   - **Authorization Callback Domain**: `localhost` (only needed for the one-time setup below)
4. Click **Create** and note down:
   - **Client ID** → save as `STRAVA_CLIENT_ID`
   - **Client Secret** → save as `STRAVA_CLIENT_SECRET`

---

## Step 2 – Get a Refresh Token (one-time)

Strava uses OAuth 2.0. You need to authorize the app once to get a refresh token.

### 2a. Open the authorization URL

Replace `YOUR_CLIENT_ID` and paste this URL into your browser:

```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read
```

Log in if prompted, click **Authorize**, then copy the `code=` value from the redirect URL in your browser's address bar. It looks like:

```
http://localhost/?state=&code=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&scope=read,activity:read
```

Copy the value after `code=` (and before `&scope`).

### 2b. Exchange the code for tokens

Run this in a terminal (replace the placeholders):

```bash
curl -X POST https://www.strava.com/oauth/token \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F code=THE_CODE_FROM_STEP_2A \
  -F grant_type=authorization_code
```

The JSON response contains `"refresh_token"`. Copy that value → save as `STRAVA_REFRESH_TOKEN`.

> **Note:** Strava may issue a new `refresh_token` each time the token is refreshed. If the sync ever stops working, repeat step 2b or check the GitHub Actions run logs for a "new refresh token" notice and update the secret.

---

## Step 3 – Add Secrets to GitHub

1. Go to your repository on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** and add these three secrets:

| Secret name            | Value                          |
|------------------------|--------------------------------|
| `STRAVA_CLIENT_ID`     | Your Strava app Client ID      |
| `STRAVA_CLIENT_SECRET` | Your Strava app Client Secret  |
| `STRAVA_REFRESH_TOKEN` | The refresh token from Step 2b |

---

## Step 4 – Test It Manually

1. Go to **Actions** → **Sync Strava Challenges** → **Run workflow**.
2. Watch the logs. You should see activity counts and a confirmation that `challenges.md` was updated (or "No changes" if no activities yet).

---

## Managing Challenges

All challenge definitions live in **`scripts/challenge_config.json`**.

### Starting a New Month's Challenge

1. Open `scripts/challenge_config.json`.
2. Change the **current** challenge's `"status"` to `"past"` and add the final `"rows"` array (copy from `challenges.md`).
3. Add a new object at the **top** of the `"challenges"` array with `"status": "current"`.
4. Commit and push. The next scheduled sync will pick it up automatically.

### Challenge Types

| `"type"` value             | Ranks by                          | Strava field used            |
|----------------------------|-----------------------------------|------------------------------|
| `"elevation"`              | Total elevation gain (metres)     | `total_elevation_gain` (sum) |
| `"distance"`               | Total distance (km)               | `distance` (sum)             |
| `"single_activity_distance"` | Best single-activity distance (km) | `distance` (max)           |
| `"activities"`             | Number of activities logged       | count                        |

### Filtering by Activity Type

Set `"activity_types"` to a list of Strava sport types to include. Leave it `null` or omit it to include all activity types.

Common Strava sport types: `"Run"`, `"TrailRun"`, `"Walk"`, `"Hike"`, `"VirtualRun"`, `"Ride"`.

---

## Running Locally (optional)

```bash
pip install requests
export STRAVA_CLIENT_ID=...
export STRAVA_CLIENT_SECRET=...
export STRAVA_REFRESH_TOKEN=...

# Preview without writing to disk:
python scripts/sync_strava.py --dry-run

# Update challenges.md for real:
python scripts/sync_strava.py
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `401 Unauthorized` from Strava | Your refresh token has expired or been revoked. Repeat Step 2 to get a new one and update the secret. |
| `403 Forbidden` from club endpoint | The authenticated user must be a **member** of the Glen Striders Strava club. |
| Activities appear in Strava but not in the leaderboard | Check the `activity_types` filter in `challenge_config.json`. The activity sport type must be in the list. |
| Workflow runs but `challenges.md` doesn't change | The Strava club activities endpoint only returns activities members have set as **public** or **followers-only**. Private activities are excluded. |
| "New refresh token" notice in logs | Update `STRAVA_REFRESH_TOKEN` secret with the value printed in the logs. |
