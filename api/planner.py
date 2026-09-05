from urllib.parse import quote

from .utils import normalize_title


def get_official_skill_badges(syllabus: dict) -> list[dict]:
    skill_badges = syllabus.get("skill_badges") or {}
    badges: list[dict] = []
    for level_key in ("beginner", "intermediate", "advanced"):
        badges.extend(skill_badges.get(level_key) or [])
    return badges


def skill_badge_names_match(official_badge: dict, completed_badge_name: str) -> bool:
    aliases = official_badge.get("aliases") if isinstance(official_badge.get("aliases"), list) else []
    candidate_names = [official_badge.get("name", ""), *aliases]
    return normalize_title(completed_badge_name) in {normalize_title(name) for name in candidate_names}


def build_arcade_game_targets(syllabus: dict, matched_arcade_games: list[dict]) -> list[dict]:
    matched_ids = {game.get("id") for game in matched_arcade_games}
    return [
        {
            "id": game.get("id"),
            "name": game.get("name"),
            "code": game.get("code"),
            "url": game.get("url") or None,
            "release_month": game.get("release_month") or "2026-07",
            "aliases": game.get("aliases") or [],
            "completed": game.get("id") in matched_ids,
        }
        for game in syllabus.get("arcade_games", [])
    ]


def build_skill_badge_targets(
    syllabus: dict,
    completed_count: int,
    completed_badges: list[dict] | None = None,
) -> list[dict]:
    completed_badges = completed_badges or []
    remaining_completed = completed_count
    completed_names = {normalize_title(badge.get("name", "")) for badge in completed_badges if badge.get("name")}
    should_match_by_name = len(completed_names) > 0
    targets: list[dict] = []

    for badge in get_official_skill_badges(syllabus):
        if should_match_by_name:
            completed = any(skill_badge_names_match(badge, completed_badge.get("name", "")) for completed_badge in completed_badges)
        else:
            completed = remaining_completed > 0
            if completed:
                remaining_completed -= 1

        targets.append(
            {
                "id": badge.get("id"),
                "name": badge.get("name"),
                "level": badge.get("level"),
                "url": badge.get("url") or build_skill_badge_catalog_url(badge.get("name", "")),
                "completed": completed,
            }
        )

    return targets


def build_skill_badge_catalog_url(badge_name: str) -> str:
    return f"https://www.skills.google/catalog?skill-badge%5B%5D=skill-badge&keywords={quote(badge_name)}"
