import html
import re


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value or "")).strip()


def normalize_title(value: str) -> str:
    return normalize_text(value).lower()


def decode_html(value: str) -> str:
    return html.unescape(value or "")


def escape_regexp(value: str) -> str:
    return re.escape(value or "")
