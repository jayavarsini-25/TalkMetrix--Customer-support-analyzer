from __future__ import annotations

from pathlib import Path

try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None  # type: ignore


def extract_text_from_pdf(raw_bytes: bytes, filename: str) -> str:
    if PdfReader is None:
        return f"PDF uploaded: {filename}"

    temp_path = Path(__file__).resolve().parent.parent / "uploads" / filename
    temp_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path.write_bytes(raw_bytes)

    try:
        reader = PdfReader(str(temp_path))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(page.strip() for page in pages if page and page.strip()).strip()
        return text or f"PDF uploaded: {filename}"
    except Exception:
        return f"PDF uploaded: {filename}"
    finally:
        try:
            temp_path.unlink(missing_ok=True)
        except Exception:
            pass
