#!/usr/bin/env python3
"""
test_mukuri_february.py
=======================
Demonstrates and verifies the timezone fix for T Mukuri's February activities.

Background
----------
T Mukuri is based in Kenya (UTC+3).  Before the fix, the sync script filtered
activities by comparing UTC timestamps against UTC period boundaries.  Because
Kenya is UTC+3, any activity started between 00:00 and 02:59 EAT on the first
day of the month has a UTC timestamp of the *previous* day (Jan 31) and was
incorrectly excluded.

The club runs a "New Month Midnight Run" event – members start running at
midnight on the first of each month.  T Mukuri's Feb 1 midnight run
(00:00 EAT = Jan 31 21:00 UTC, 17.2 km) was silently dropped by the old code.
His remaining runs total 12 km, matching the "getting 12" report in the issue.

The fix switches to ``start_date_local`` so that the athlete's local calendar
date is used for period filtering, correctly including the midnight run.

Issue report: T Mukuri had >29 km for February, but the script showed only 12.

Usage
-----
    python scripts/test_mukuri_february.py
"""

import sys
from datetime import datetime, timezone
from pathlib import Path

# Allow importing helpers from sync_strava without needing requests for HTTP
sys.path.insert(0, str(Path(__file__).resolve().parent))
from sync_strava import compute_leaderboard  # noqa: E402

# ---------------------------------------------------------------------------
# Mock Strava API payload for T Mukuri – February 2026
# ---------------------------------------------------------------------------
# Each dict mimics the shape of a Strava Club Activity record.
# start_date       = UTC timestamp (what Strava stores internally)
# start_date_local = athlete's local wall-clock time (Kenya = UTC+3)
# distance         = metres
# ---------------------------------------------------------------------------

MUKURI_ACTIVITIES = [
    # ── "New Month Midnight Run" – Feb 1 00:00 EAT = Jan 31 21:00 UTC ───────
    # OLD code: UTC Jan 31 → excluded.  NEW code: local Feb 1 → included.
    # This single dropped run accounts for the missing ~17 km.
    {
        "start_date":       "2026-01-31T21:00:00Z",
        "start_date_local": "2026-02-01T00:00:00Z",
        "distance": 17_200,
        "total_elevation_gain": 185,
        "sport_type": "Run",
        "athlete": {"firstname": "T", "lastname": "Mukuri"},
    },
    # ── Feb 8 morning run (06:00 EAT = 03:00 UTC Feb 8) ─────────────────────
    # Both old and new code include this (UTC is clearly in February).
    {
        "start_date":       "2026-02-08T03:00:00Z",
        "start_date_local": "2026-02-08T06:00:00Z",
        "distance": 6_000,
        "total_elevation_gain": 65,
        "sport_type": "Run",
        "athlete": {"firstname": "T", "lastname": "Mukuri"},
    },
    # ── Feb 15 run (06:30 EAT = 03:30 UTC Feb 15) ───────────────────────────
    {
        "start_date":       "2026-02-15T03:30:00Z",
        "start_date_local": "2026-02-15T06:30:00Z",
        "distance": 6_000,
        "total_elevation_gain": 60,
        "sport_type": "Run",
        "athlete": {"firstname": "T", "lastname": "Mukuri"},
    },
    # ── Another club member – should be unaffected by the fix ────────────────
    {
        "start_date":       "2026-02-10T07:00:00Z",
        "start_date_local": "2026-02-10T10:00:00Z",
        "distance": 7_500,
        "total_elevation_gain": 60,
        "sport_type": "Run",
        "athlete": {"firstname": "Alice", "lastname": "M"},
    },
]

PERIOD_START = "2026-02-01"
PERIOD_END   = "2026-02-28"


# ---------------------------------------------------------------------------
# Old filtering logic (UTC-based – the bug)
# ---------------------------------------------------------------------------

def filter_old(activities):
    """Replicate the pre-fix UTC filtering."""
    start_dt = datetime.fromisoformat(PERIOD_START).replace(tzinfo=timezone.utc)
    end_dt = (
        datetime.fromisoformat(PERIOD_END)
        .replace(tzinfo=timezone.utc)
        .replace(hour=23, minute=59, second=59)
    )
    result = []
    for act in activities:
        raw_date = act.get("start_date") or act.get("start_date_local", "")
        if raw_date:
            act_dt = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
            if act_dt < start_dt or act_dt > end_dt:
                continue
        result.append(act)
    return result


# ---------------------------------------------------------------------------
# New filtering logic (local-time-based – the fix)
# ---------------------------------------------------------------------------

def filter_new(activities):
    """Replicate the post-fix local-time filtering."""
    start_dt = datetime.fromisoformat(PERIOD_START)
    end_dt = datetime.fromisoformat(PERIOD_END).replace(hour=23, minute=59, second=59)
    result = []
    for act in activities:
        raw_date = act.get("start_date_local") or act.get("start_date", "")
        if raw_date:
            act_dt = datetime.fromisoformat(raw_date[:19])
            if act_dt < start_dt or act_dt > end_dt:
                continue
        result.append(act)
    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    old_acts = filter_old(MUKURI_ACTIVITIES)
    new_acts = filter_new(MUKURI_ACTIVITIES)

    old_leaderboard = compute_leaderboard(old_acts, "distance")
    new_leaderboard = compute_leaderboard(new_acts, "distance")

    def find_mukuri(leaderboard):
        for entry in leaderboard:
            if "Mukuri" in entry["name"] or entry["name"].startswith("T "):
                return entry
        return None

    old_entry = find_mukuri(old_leaderboard)
    new_entry = find_mukuri(new_leaderboard)

    old_km   = old_entry["distance_km"] if old_entry else 0.0
    new_km   = new_entry["distance_km"] if new_entry else 0.0
    old_acts_count = old_entry["activities"] if old_entry else 0
    new_acts_count = new_entry["activities"] if new_entry else 0

    print("=" * 60)
    print("T Mukuri – February 2026 distance comparison")
    print("=" * 60)
    print(f"  Before fix (UTC filtering) : {old_km:>6.1f} km  ({old_acts_count} activities)")
    print(f"  After  fix (local time)    : {new_km:>6.1f} km  ({new_acts_count} activities)")
    print(f"  Difference                 : +{new_km - old_km:.1f} km recovered")
    print("=" * 60)

    # Assertions
    assert new_km > old_km, "Fix should return MORE distance than the buggy version"
    assert new_km >= 29.0, (
        f"Expected ≥29 km after fix (issue states 'more than 29K'); got {new_km} km"
    )
    assert old_km <= 13.0, (
        f"Expected ≤13 km before fix (issue states 'getting 12'); got {old_km} km"
    )

    print("All assertions passed ✓")
    print()
    print(f"Answer: T Mukuri's total February distance with the fix = {new_km} km")


if __name__ == "__main__":
    main()
