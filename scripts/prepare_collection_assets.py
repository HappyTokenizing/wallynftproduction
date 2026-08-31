from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from PIL import Image


PROJECT = Path(__file__).resolve().parents[1]
PLAN = Path(
    "/Users/herwig/Documents/Codex/2026-08-29/are/work/"
    "nft_rarity_workbook/mint-plan.json"
)
COLLECTION = Path(
    "/Users/herwig/Desktop/WALLY NFT final pngs high resolution/Draft Collection 3"
)
OUTPUT = PROJECT / "public" / "collection"


def choose_diverse(rows: list[dict], tier: str, count: int, chosen: list[dict]) -> list[dict]:
    candidates = [row for row in rows if row["Overall Tier"] == tier]
    selected: list[dict] = []
    seen = {
        "Color": {row.get("Color") for row in chosen},
        "Hat": {row.get("Hat") for row in chosen},
        "Tusk": {row.get("Tusk") for row in chosen},
    }
    while candidates and len(selected) < count:
        def diversity(row: dict) -> tuple[int, int, int]:
            new_traits = sum(row[key] not in seen[key] for key in seen)
            return (new_traits, int(row["Rarity Score"]), -int(row["Token ID"]))

        winner = max(candidates, key=diversity)
        candidates.remove(winner)
        selected.append(winner)
        for key in seen:
            seen[key].add(winner[key])
    return selected


def main() -> None:
    rows = json.loads(PLAN.read_text(encoding="utf-8"))["rows"]
    chosen = rows

    ranking = sorted(
        rows,
        key=lambda row: (
            row["Type"] == "1 of 1",
            int(row["Rarity Score"]),
            int(row["Rare+ Trait Count"]),
            -int(row["Token ID"]),
        ),
        reverse=True,
    )
    rank_by_id = {int(row["Token ID"]): rank for rank, row in enumerate(ranking, start=1)}

    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = []
    for row in sorted(chosen, key=lambda item: int(item["Token ID"])):
        token_id = int(row["Token ID"])
        source = COLLECTION / f"{token_id:04d}.png"
        with Image.open(source) as image:
            image = image.convert("RGB")
            image.thumbnail((560, 560), Image.Resampling.LANCZOS)
            destination = OUTPUT / f"{token_id:04d}.webp"
            image.save(destination, "WEBP", quality=86, method=6)

        one_of_one = row["Type"] == "1 of 1"
        records.append(
            {
                "id": token_id,
                "number": f"{token_id:04d}",
                "name": row["One of One"] if one_of_one else f"Wally #{token_id:04d}",
                "image": f"/collection/{token_id:04d}.webp",
                "tier": row["Overall Tier"],
                "rank": rank_by_id[token_id],
                "score": int(row["Rarity Score"]),
                "color": None if one_of_one else row["Color"],
                "hat": None if one_of_one else row["Hat"],
                "tusk": None if one_of_one else row["Tusk"],
                "oneOfOne": one_of_one,
            }
        )

    payload = {
        "totalSupply": 1000,
        "previewCount": len(records),
        "distribution": [
            {"tier": "Common", "count": 388, "percent": 38.8, "color": "#d8e3dc"},
            {"tier": "Uncommon", "count": 473, "percent": 47.3, "color": "#8de0a6"},
            {"tier": "Rare", "count": 129, "percent": 12.9, "color": "#71c8ff"},
            {"tier": "Epic", "count": 6, "percent": 0.6, "color": "#c990ff"},
            {"tier": "1 of 1", "count": 4, "percent": 0.4, "color": "#f0bf54"},
        ],
        "items": records,
    }
    (PROJECT / "public" / "collection.json").write_text(
        json.dumps(payload, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Prepared all {len(records)} collection records in {OUTPUT}")


if __name__ == "__main__":
    main()
