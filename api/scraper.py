import json
import re
from datetime import datetime, timezone
from pathlib import Path

import httpx
from lxml import html as lxml_html

from .planner import (
    build_arcade_game_targets,
    build_skill_badge_targets,
    get_official_skill_badges,
    skill_badge_names_match,
)
from .utils import decode_html, escape_regexp, normalize_text, normalize_title


SYLLABUS_PATH = Path(__file__).resolve().parent.parent / "data" / "syllabus-assertions.json"
SYLLABUS = json.loads(SYLLABUS_PATH.read_text(encoding="utf-8"))
SKILL_BADGE_TEXT_PATTERN = re.compile(
    r"\b(skill badge|badge keahlian|completion badge|completed badge|google cloud skill badge)\b",
    re.IGNORECASE,
)
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
    )
}


def extract_earned_badges(html: str) -> list[dict]:
    document = _parse_html(html)
    _remove_non_content_nodes(document)

    lines = [decode_html(line).strip() for line in document.text_content().splitlines()]
    lines = [line for line in lines if line]
    badges: list[dict] = []

    for index, line in enumerate(lines):
        earned_match = re.match(r"^Earned\s+(.+)$", line, re.IGNORECASE)
        previous_line = lines[index - 1] if index > 0 else None
        if earned_match and previous_line and not re.match(r"^Earned\s+", previous_line, re.IGNORECASE):
            badges.append(
                {
                    "name": previous_line,
                    "earned_at_label": earned_match.group(1),
                    "url": None,
                }
            )

    return _dedupe_by_name(badges)


def scrape_profile_html(html: str, syllabus: dict | None = None) -> dict:
    syllabus = syllabus or SYLLABUS
    document = _parse_html(html)
    _remove_non_content_nodes(document)

    text = normalize_text(document.text_content())
    earned_badges = extract_earned_badges(html)
    arcade_game_matches = _find_completed_july_arcade_games(html, text, syllabus.get("arcade_games", []))
    official_badges = get_official_skill_badges(syllabus)
    completed_skill_badges = _enrich_completed_skill_badges(
        [badge for badge in earned_badges if not _is_arcade_badge_title(badge.get("name", ""))],
        official_badges,
    )
    skill_badge_count = len(completed_skill_badges) if completed_skill_badges else _count_skill_badges_from_html(html)
    target_arcade_games = build_arcade_game_targets(syllabus, arcade_game_matches)
    skill_badge_targets = build_skill_badge_targets(syllabus, skill_badge_count, completed_skill_badges)

    return {
        "arcade_games_completed": len(arcade_game_matches),
        "skill_badges_completed": skill_badge_count,
        "completed_skill_badges": completed_skill_badges,
        "matched_arcade_games": arcade_game_matches,
        "completed_arcade_games": [game for game in target_arcade_games if game.get("completed")],
        "missing_arcade_games": [game for game in target_arcade_games if not game.get("completed")],
        "target_arcade_games": target_arcade_games,
        "skill_badge_targets": skill_badge_targets,
        "completed_skill_badge_targets": [badge for badge in skill_badge_targets if badge.get("completed")],
        "missing_skill_badge_targets": [badge for badge in skill_badge_targets if not badge.get("completed")],
    }


def scrape_profile_url(profile_url: str) -> dict:
    try:
        response = httpx.get(profile_url, headers=DEFAULT_HEADERS, timeout=30, follow_redirects=True)
        response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise RuntimeError("Request ke profil Google Skills timeout.") from exc
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Gagal mengambil profil Google Skills: {exc}") from exc

    html = response.text
    document = _parse_html(html)
    _remove_non_content_nodes(document)
    links = [
        {
            "text": " ".join(anchor.text_content().split()),
            "href": anchor.get("href") or "",
        }
        for anchor in document.xpath("//a")
    ]
    combined_html = "\n".join(
        [
            html,
            document.text_content(),
            "\n".join(f"{link['text']} {link['href']}" for link in links),
        ]
    )
    parsed = scrape_profile_html(combined_html, SYLLABUS)

    return {
        "source_url": profile_url,
        "scraped_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "arcade_games_completed": parsed["arcade_games_completed"],
        "skill_badges_completed": parsed["skill_badges_completed"],
        "completed_skill_badges": parsed["completed_skill_badges"],
        "matched_arcade_games": [
            {
                "id": game.get("id"),
                "name": game.get("name"),
                "code": game.get("code"),
                "url": game.get("url"),
                "release_month": game.get("release_month") or "2026-07",
            }
            for game in parsed["matched_arcade_games"]
        ],
        "completed_arcade_games": parsed["completed_arcade_games"],
        "missing_arcade_games": parsed["missing_arcade_games"],
        "target_arcade_games": parsed["target_arcade_games"],
        "skill_badge_targets": parsed["skill_badge_targets"],
        "completed_skill_badge_targets": parsed["completed_skill_badge_targets"],
        "missing_skill_badge_targets": parsed["missing_skill_badge_targets"],
        "diagnostics": {
            "page_title": _get_page_title(document),
            "link_count": len(links),
            "body_text_length": len(document.text_content()),
            "parser": "lxml",
        },
    }


def _is_arcade_badge_title(title: str) -> bool:
    return re.search(r"\barcade\b", title or "", re.IGNORECASE) is not None


def _dedupe_by_name(items: list[dict]) -> list[dict]:
    seen: set[str] = set()
    deduped: list[dict] = []
    for item in items:
        key = normalize_title(item.get("name", ""))
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped


def _enrich_completed_skill_badges(badges: list[dict], official_badges: list[dict]) -> list[dict]:
    enriched: list[dict] = []
    for badge in badges:
        matched_badge = next(
            (official_badge for official_badge in official_badges if skill_badge_names_match(official_badge, badge.get("name", ""))),
            None,
        )
        enriched.append({**badge, "official_id": matched_badge.get("id")} if matched_badge else badge)
    return enriched


def _find_completed_july_arcade_games(html: str, normalized_text: str, arcade_games: list[dict]) -> list[dict]:
    matches: list[dict] = []
    for game in arcade_games:
        game_id = game.get("id")
        code = game.get("code", "")
        name = game.get("name", "")
        game_url_pattern = re.compile(rf"(?:/games/|games%2F){escape_regexp(str(game_id))}(?:\D|$)", re.IGNORECASE)
        code_pattern = re.compile(escape_regexp(code), re.IGNORECASE)
        name_pattern = re.compile(rf"\b{escape_regexp(name)}\b", re.IGNORECASE)
        if game_url_pattern.search(html or "") or code_pattern.search(html or "") or name_pattern.search(normalized_text or ""):
            matches.append(game)
    return matches


def _count_skill_badges_from_html(html: str) -> int:
    document = _parse_html(html)
    _remove_non_content_nodes(document)
    labels: set[str] = set()
    for node in document.xpath("//a | //article | //li | //div | //section"):
        node_text = normalize_text(node.text_content())
        if SKILL_BADGE_TEXT_PATTERN.search(node_text) and not re.search(r"\barcade\b", node_text, re.IGNORECASE):
            labels.add(node_text)
    if labels:
        return len(labels)

    matches = SKILL_BADGE_TEXT_PATTERN.findall(normalize_text(html or ""))
    return len(matches)


def _parse_html(content: str):
    return lxml_html.fromstring(content or "<html></html>")


def _remove_non_content_nodes(document) -> None:
    for node in document.xpath("//script | //style"):
        node.getparent().remove(node)


def _get_page_title(document) -> str:
    titles = document.xpath("//title/text()")
    return " ".join(titles[0].split()) if titles else ""
