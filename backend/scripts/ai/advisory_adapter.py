import json
import sys
from pathlib import Path


def _to_reasons(text):
    lines = []
    for raw in text.splitlines():
        cleaned = raw.strip().lstrip("-").strip()
        if cleaned:
            lines.append(cleaned)
    return lines[:6] if lines else ["Advisory generated from current telemetry."]


def main():
    input_data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}

    advisory_dir = Path(__file__).resolve().parent / "advisory"
    sys.path.insert(0, str(advisory_dir))

    from orchestrator import run_pipeline  # noqa

    result = run_pipeline(input_data)
    advisory_text = result.get("advisory", "").strip()
    reasons = _to_reasons(advisory_text)

    output = {
        "recommendation": reasons[0],
        "reasons": reasons,
        "source": "advisory_model_v2",
        "meta": {
            "rain_forecast": result.get("rain_forecast", {}),
        },
    }
    print(json.dumps(output))


if __name__ == "__main__":
    main()

