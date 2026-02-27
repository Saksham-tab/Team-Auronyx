import sys
import json

def calculate():
    try:
        input_data = json.loads(sys.argv[1])
        m = input_data.get('moisture', 50)
        t = input_data.get('temperature', 25)
        h = input_data.get('humidity', 50)
        
        # Health Index based on sensor stability (0-100 scale)
        # Ideal: M: 40-60, T: 22-28, H: 45-65
        m_score = 100 - abs(m - 50) * 2
        t_score = 100 - abs(t - 25) * 4
        h_score = 100 - abs(h - 55) * 2
        
        health = (m_score + t_score + h_score) / 3
        health = max(0, min(100, round(health, 0)))

        print(json.dumps({"index": health}))
    except Exception as e:
        print(json.dumps({"index": 0, "error": str(e)}))

if __name__ == "__main__":
    calculate()
