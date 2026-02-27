import json
import re
import sys
from pathlib import Path


def _fallback_answer(question, sensor):
    q = question.lower()
    moisture = sensor.get("moisture")
    temp = sensor.get("temperature")
    humidity = sensor.get("humidity")

    if any(k in q for k in ["irrigation", "paani", "water", "motor", "pump"]):
        if moisture is not None and moisture < 35:
            return (
                "Haan, abhi irrigation dena sahi rahega. Soil moisture low side par hai. "
                "Short cycle me paani do (15-20 min), phir 30-45 min baad moisture re-check karo."
            )
        return (
            "Irrigation ke liye pehle soil moisture check karo. Agar top layer dry ho aur moisture 35% se niche ho "
            "to short irrigation cycle do. Overwatering avoid karo."
        )

    if any(k in q for k in ["pest", "insect", "keeda", "disease", "rog", "whitefly", "aphid", "thrips"]):
        return (
            "Pest/disease ke liye pehle symptom isolate karo: leaf spots, curling, stem damage ya sucking marks. "
            "Affected plants ko alag karo, field scouting badhao, aur local agri guideline ke hisaab se targeted spray plan banao."
        )

    if any(k in q for k in ["fertilizer", "khad", "nutrient", "npk", "urea"]):
        return (
            "Fertilizer blindly apply mat karo. Crop stage + soil status ke basis par split dose best hoti hai. "
            "Vegetative stage me nitrogen priority, flowering/fruiting me potash balance maintain karo."
        )

    if any(k in q for k in ["weather", "rain", "baarish", "temperature"]):
        base = "Weather-based planning rakho: rain chance high ho to irrigation postpone karo."
        if temp is not None and temp >= 32:
            base += " High temperature me subah ya shaam irrigation better rahega."
        return base

    # Match greetings as whole words to avoid false positives like "bhindi" -> "hi"
    if re.search(r"\b(hello|hi|hey)\b", q) or "can i ask" in q or "anything" in q:
        return (
            "Bilkul, aap agriculture se related kuch bhi pooch sakte ho. "
            "Main irrigation, pest control, fertilizer planning, crop stage decisions aur weather-based actions me help kar sakta hoon."
        )

    extra = []
    if moisture is not None:
        extra.append(f"moisture {moisture}%")
    if temp is not None:
        extra.append(f"temperature {temp}C")
    if humidity is not None:
        extra.append(f"humidity {humidity}%")
    context = f" Current field context: {', '.join(extra)}." if extra else ""

    return (
        "Samajh gaya. Is query ka practical answer dene ke liye crop type, stage, aur recent field symptoms batayein. "
        "Tab main exact step-by-step action plan de dunga." + context
    )


def main():
    payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    question = payload.get("question", "").strip()
    sensor = payload.get("sensor", {}) or {}

    advisory_dir = Path(__file__).resolve().parent / "advisory"
    sys.path.insert(0, str(advisory_dir))

    try:
        from rag_service import retrieve  # noqa
        from llm_service import InferenceClient, HF_MODEL, HF_TOKEN  # noqa
    except Exception:
        print(json.dumps({"answer": _fallback_answer(question, sensor), "source": "fallback"}))
        return

    if not InferenceClient or not HF_TOKEN:
        print(json.dumps({"answer": _fallback_answer(question, sensor), "source": "fallback"}))
        return

    notes = []
    try:
        notes = retrieve(question, k=3)
    except Exception:
        notes = []

    context_block = "\n".join(notes) if notes else "No additional reference context."
    client = InferenceClient(model=HF_MODEL, token=HF_TOKEN)

    system_message = (
        "You are a general-purpose agriculture assistant for farmers. "
        "Always answer in simple Hinglish, practical and actionable. "
        "You can answer broad farming queries (irrigation, pests, nutrition, weather, crop care), "
        "not only sensor telemetry. Keep response concise and useful."
    )

    user_message = (
        f"User question: {question}\n"
        f"Optional sensor context: moisture={sensor.get('moisture', 'N/A')}, "
        f"temperature={sensor.get('temperature', 'N/A')}, "
        f"humidity={sensor.get('humidity', 'N/A')}\n"
        f"Knowledge context:\n{context_block}\n"
        f"If question is general, answer generally. If sensor data is useful, include it naturally."
    )

    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
            max_tokens=220,
            temperature=0.2,
        )
        answer = response.choices[0].message.content.strip()
        print(json.dumps({"answer": answer, "source": "llm"}))
    except Exception:
        print(json.dumps({"answer": _fallback_answer(question, sensor), "source": "fallback"}))


if __name__ == "__main__":
    main()
