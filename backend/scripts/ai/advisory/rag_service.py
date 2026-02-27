from config import PDF_PATH


def retrieve(query, k=3):
    # Lightweight fallback if heavy RAG deps are unavailable.
    try:
        from pypdf import PdfReader
        reader = PdfReader(PDF_PATH)
        pages = [p.extract_text() or "" for p in reader.pages[:k]]
        return [t.strip().replace("\n", " ")[:400] for t in pages if t.strip()]
    except Exception:
        return []

