#!/usr/bin/env python3
"""
sync_strava.py
==============
Fetches Glen Striders club activity data from the Strava API and rewrites
content/pages/challenges.md with fresh leaderboard tables.

Usage
-----
    python scripts/sync_strava.py [--dry-run]

Required environment variables
--------------------------------
    STRAVA_CLIENT_ID      – Strava API application client ID
    STRAVA_CLIENT_SECRET  – Strava API application client secret
    STRAVA_REFRESH_TOKEN  – A valid OAuth refresh token for a club-member account

See STRAVA_SYNC_SETUP.md for step-by-step instructions on obtaining these.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("ERROR: 'requests' is not installed. Run: pip install requests")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = Path(__file__).resolve().parent / "challenge_config.json"
CHALLENGES_MD = REPO_ROOT / "content" / "pages" / "challenges.md"

# ---------------------------------------------------------------------------
# Strava API
# ---------------------------------------------------------------------------
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/clubs/{club_id}/activities"


def refresh_access_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    """Exchange a Strava refresh token for a short-lived access token."""
    resp = requests.post(
        STRAVA_TOKEN_URL,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    new_refresh = data.get("refresh_token", "")
    if new_refresh and new_refresh != refresh_token:
        print(
            "INFO: Strava returned a new refresh token. "
            "Update the STRAVA_REFRESH_TOKEN secret to keep access working long-term."
        )
    return data["access_token"]


# Strava Club Activities endpoint returns ClubActivity objects without start_date,
# so there is no date-based early-exit available.  10 pages × 200 per_page = 2,000
# activities, which comfortably covers several weeks of activity for any club.
MAX_PAGES = 10


def fetch_club_activities(
    access_token: str,
    club_id: int,
    period_start: str,
    period_end: str,
    activity_types: list | None = None,
) -> list:
    """
    Fetch all club activities that fall within [period_start, period_end].

    Note: The Strava Club Activities endpoint returns ClubActivity objects
    which do NOT include start_date.  Date filtering is applied only when
    a date is present; otherwise the activity is included.  Pagination stops
    when the API returns an empty page or when an activity with a known date
    predates the period start, up to a maximum of MAX_PAGES pages.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    url = STRAVA_ACTIVITIES_URL.format(club_id=club_id)

    start_dt = datetime.fromisoformat(period_start).replace(tzinfo=timezone.utc)
    end_dt = (
        datetime.fromisoformat(period_end)
        .replace(tzinfo=timezone.utc)
        .replace(hour=23, minute=59, second=59)
    )

    collected = []
    page = 1

    while page <= MAX_PAGES:
        resp = requests.get(
            url,
            headers=headers,
            params={"page": page, "per_page": 200},
            timeout=30,
        )
        resp.raise_for_status()
        page_data = resp.json()

        if not page_data:
            break  # No more activities

        reached_before_period = False
        for act in page_data:
            raw_date = act.get("start_date") or act.get("start_date_local", "")
            # ClubActivity objects returned by the Strava Club Activities endpoint
            # do not include start_date.  When no date is present we include the
            # activity; date filtering is applied only when a date IS available.
            if raw_date:
                act_dt = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))

                if act_dt < start_dt:
                    reached_before_period = True
                    break  # Activities are sorted desc; everything after is older

                if act_dt > end_dt:
                    continue  # Activity after the period window

            act_type = act.get("sport_type") or act.get("type", "")
            if activity_types and act_type not in activity_types:
                continue

            collected.append(act)

        if reached_before_period:
            break

        page += 1

    return collected


# ---------------------------------------------------------------------------
# Leaderboard computation
# ---------------------------------------------------------------------------

def _athlete_name(act: dict) -> str:
    """Return a display name like 'Alice M.' from an activity record."""
    athlete = act.get("athlete") or {}
    first = (athlete.get("firstname") or "").strip()
    last = (athlete.get("lastname") or "").strip()
    if last:
        return f"{first} {last[0]}."
    return first


def compute_leaderboard(activities: list, challenge_type: str) -> list:
    """
    Aggregate activity data per athlete and return a ranked list of dicts.

    Supported challenge types
    -------------------------
    elevation              – most total elevation gain (sum, metres)
    distance               – most total distance (sum, km)
    single_activity_distance – longest single activity (max, km)
    activities             – most activities logged (count)
    """
    totals: dict[str, dict] = {}

    for act in activities:
        name = _athlete_name(act)
        if not name:
            continue

        dist_km = round((act.get("distance") or 0) / 1000, 2)
        elev_m = round(act.get("total_elevation_gain") or 0)

        raw_date = act.get("start_date") or act.get("start_date_local", "")
        act_dt = datetime.fromisoformat(raw_date.replace("Z", "+00:00")) if raw_date else None

        if name not in totals:
            totals[name] = {
                "name": name,
                "activities": 0,
                "distance_km": 0.0,
                "elevation_m": 0,
                "best_distance_km": 0.0,
                "best_distance_date": "",
            }

        totals[name]["activities"] += 1
        totals[name]["distance_km"] += dist_km
        totals[name]["elevation_m"] += elev_m

        if dist_km > totals[name]["best_distance_km"]:
            totals[name]["best_distance_km"] = dist_km
            totals[name]["best_distance_date"] = (
                str(act_dt.day) + act_dt.strftime(" %b") if act_dt else ""
            )

    # Round totals for display
    for entry in totals.values():
        entry["distance_km"] = round(entry["distance_km"], 1)

    sort_key = {
        "elevation": lambda x: x["elevation_m"],
        "distance": lambda x: x["distance_km"],
        "single_activity_distance": lambda x: x["best_distance_km"],
        "activities": lambda x: (x["activities"], x["distance_km"]),
    }.get(challenge_type, lambda x: x["distance_km"])

    return sorted(totals.values(), key=sort_key, reverse=True)


# ---------------------------------------------------------------------------
# Markdown formatting
# ---------------------------------------------------------------------------

def _fmt_num(value) -> str:
    """Format a number with thousands commas."""
    if isinstance(value, float):
        return f"{value:,.1f}"
    return f"{int(value):,}"


def leaderboard_to_markdown(ranked: list, challenge_type: str) -> str:
    """Convert a ranked list into a Markdown table string."""
    if challenge_type == "elevation":
        header = "| Rank | Athlete | Elevation (m) | Activities |"
        sep    = "|------|---------|---------------|------------|"
        rows = [
            f"| {i + 1} | {a['name']} | {_fmt_num(a['elevation_m'])} | {a['activities']} |"
            for i, a in enumerate(ranked)
        ]
    elif challenge_type == "distance":
        header = "| Rank | Athlete | Distance (km) | Activities |"
        sep    = "|------|---------|---------------|------------|"
        rows = [
            f"| {i + 1} | {a['name']} | {_fmt_num(a['distance_km'])} | {a['activities']} |"
            for i, a in enumerate(ranked)
        ]
    elif challenge_type == "single_activity_distance":
        header = "| Rank | Athlete | Best Distance (km) | Date |"
        sep    = "|------|---------|-------------------|------|"
        rows = [
            f"| {i + 1} | {a['name']} | {_fmt_num(a['best_distance_km'])} | {a['best_distance_date']} |"
            for i, a in enumerate(ranked)
        ]
    elif challenge_type == "activities":
        header = "| Rank | Athlete | Activities | Distance (km) |"
        sep    = "|------|---------|------------|---------------|"
        rows = [
            f"| {i + 1} | {a['name']} | {a['activities']} | {_fmt_num(a['distance_km'])} |"
            for i, a in enumerate(ranked)
        ]
    else:
        header = "| Rank | Athlete | Value |"
        sep    = "|------|---------|-------|"
        rows = [f"| {i + 1} | {a['name']} | – |" for i, a in enumerate(ranked)]

    return "\n".join([header, sep] + rows)


def rows_to_markdown(rows: list, challenge_type: str) -> str:
    """Convert a list of raw row arrays (from config) into a Markdown table."""
    if challenge_type == "elevation":
        header = "| Rank | Athlete | Elevation (m) | Activities |"
        sep    = "|------|---------|---------------|------------|"
    elif challenge_type == "distance":
        header = "| Rank | Athlete | Distance (km) | Activities |"
        sep    = "|------|---------|---------------|------------|"
    elif challenge_type == "single_activity_distance":
        header = "| Rank | Athlete | Best Distance (km) | Date |"
        sep    = "|------|---------|-------------------|------|"
    elif challenge_type == "activities":
        header = "| Rank | Athlete | Activities | Distance (km) |"
        sep    = "|------|---------|------------|---------------|"
    else:
        header = "| Rank | Athlete | Value |"
        sep    = "|------|---------|-------|"

    row_lines = [
        "| " + " | ".join(str(c) for c in row) + " |" for row in rows
    ]
    return "\n".join([header, sep] + row_lines)


def _fmt_period(period_start: str, period_end: str) -> str:
    """Return a human-readable period string, e.g. 'February 1 – February 28, 2026'."""
    s = datetime.fromisoformat(period_start)
    e = datetime.fromisoformat(period_end)
    # Strip leading zero from day in a cross-platform way
    s_str = s.strftime("%B ") + str(s.day)
    e_str = e.strftime("%B ") + str(e.day) + e.strftime(", %Y")
    return f"{s_str} – {e_str}"


def build_challenge_section(challenge: dict, table_md: str) -> str:
    """Render a single ##-level challenge section."""
    period = _fmt_period(challenge["period_start"], challenge["period_end"])
    type_display = challenge.get("type_display") or challenge["type"].replace("_", " ").title()
    status_display = challenge["status"].capitalize()

    lines = [
        f"## {challenge['name']}",
        "",
        f"**Challenge Period:** {period}",
        "",
        f"**Goal:** {challenge['goal']}",
        "",
        f"**Type:** {type_display}",
        "",
        f"**Status:** {status_display}",
        "",
        table_md,
    ]
    return "\n".join(lines)


def generate_challenges_md(config: dict, live_tables: dict) -> str:
    """Assemble the full challenges.md content."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    header = (
        f"Title: Challenges\n"
        f"Date: {today}\n"
        f"Slug: challenges\n"
        f"Template: page_challenges\n"
        f"Status: published\n"
        f"Description: Glen Striders monthly running challenges and leaderboards. "
        f"Each month we set a unique named challenge – compete with fellow club members for glory!\n"
    )

    sections = []
    for challenge in config["challenges"]:
        name = challenge["name"]
        ctype = challenge["type"]
        status = challenge["status"].lower()

        if status == "current" and name in live_tables:
            table_md = live_tables[name]
        elif "rows" in challenge and challenge["rows"]:
            table_md = rows_to_markdown(challenge["rows"], ctype)
        else:
            table_md = "_No leaderboard data available yet._"

        sections.append(build_challenge_section(challenge, table_md))

    return header + "\n" + "\n\n".join(sections) + "\n"


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sync Strava club activity data into the challenges leaderboard."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the generated markdown instead of writing to disk.",
    )
    args = parser.parse_args()

    # Load challenge config
    with open(CONFIG_FILE, encoding="utf-8") as fh:
        config = json.load(fh)

    club_id = config.get("strava_club_id", 1275990)

    # Strava credentials from environment
    client_id = os.environ.get("STRAVA_CLIENT_ID", "").strip()
    client_secret = os.environ.get("STRAVA_CLIENT_SECRET", "").strip()
    refresh_token = os.environ.get("STRAVA_REFRESH_TOKEN", "").strip()

    if not all([client_id, client_secret, refresh_token]):
        sys.exit(
            "ERROR: Missing Strava credentials.\n"
            "Set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REFRESH_TOKEN "
            "as environment variables.\n"
            "See STRAVA_SYNC_SETUP.md for instructions."
        )

    # Obtain a fresh access token
    print("Refreshing Strava access token…")
    access_token = refresh_access_token(client_id, client_secret, refresh_token)
    print("Access token obtained.")

    # Fetch activities and compute leaderboards for current challenges
    live_tables: dict[str, str] = {}

    for challenge in config["challenges"]:
        if challenge["status"].lower() != "current":
            continue

        name = challenge["name"]
        print(f"\nFetching activities for: {name}")

        activities = fetch_club_activities(
            access_token,
            club_id,
            challenge["period_start"],
            challenge["period_end"],
            challenge.get("activity_types"),
        )

        print(f"  → {len(activities)} qualifying activit{'y' if len(activities) == 1 else 'ies'} found")

        if activities:
            ranked = compute_leaderboard(activities, challenge["type"])
            live_tables[name] = leaderboard_to_markdown(ranked, challenge["type"])
            print(f"  → Leaderboard has {len(ranked)} athlete(s)")
        else:
            live_tables[name] = "_No activities recorded yet for this challenge period. Check back soon!_"

    # Generate updated markdown
    new_md = generate_challenges_md(config, live_tables)

    if args.dry_run:
        print("\n" + "=" * 60)
        print("DRY RUN — challenges.md would be updated to:")
        print("=" * 60)
        print(new_md)
        return

    CHALLENGES_MD.write_text(new_md, encoding="utf-8")
    print(f"\nUpdated: {CHALLENGES_MD}")


if __name__ == "__main__":
    main()
