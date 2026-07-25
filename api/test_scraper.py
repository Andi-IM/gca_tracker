import json
from pathlib import Path

from api.scraper import extract_earned_badges, scrape_profile_html


SYLLABUS_PATH = Path(__file__).resolve().parent.parent / "data" / "syllabus-assertions.json"
SYLLABUS = json.loads(SYLLABUS_PATH.read_text(encoding="utf-8"))


def test_extract_earned_badges():
    earned_badges = extract_earned_badges(
        """
        Build a Data Warehouse with BigQuery
        Earned Jul 21, 2026 WIB
        Arcade Basecamp
        Earned Jul 22, 2026 WIB
        """
    )

    assert [badge["name"] for badge in earned_badges] == ["Build a Data Warehouse with BigQuery", "Arcade Basecamp"]


def test_scrape_profile_html_counts_targets():
    scraped = scrape_profile_html(
        """
        <main>
          <a href="https://www.skills.google/games/7314">Low Code</a>
          <a href="https://www.skills.google/games/7315">Bucket</a>
          <article>Skill Badge: Build a Data Warehouse</article>
          <article>Skill Badge: Set Up an App Dev Environment</article>
          <article>Badge Keahlian: Cloud Run Functions</article>
        </main>
        """,
        SYLLABUS,
    )

    assert scraped["arcade_games_completed"] == 2
    assert scraped["skill_badges_completed"] == 3
    assert len(scraped["target_arcade_games"]) == 6
    assert len(scraped["skill_badge_targets"]) == 51
    assert len(scraped["completed_arcade_games"]) == 2
    assert len(scraped["missing_arcade_games"]) == 4
