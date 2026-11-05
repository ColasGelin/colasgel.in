"""Export Learn2Slither checkpoints to JSON, with fixtures for the TypeScript port.

Run with the Learn2Slither virtualenv:
  ~/Programmation/42Projects/Learn2Slither/venv/bin/python scripts/export_snake_weights.py
"""
import json
import random
import sys
from pathlib import Path

import torch

SOURCE = Path.home() / "Programmation/42Projects/Learn2Slither"
sys.path.insert(0, str(SOURCE))

from agent.state import State  # noqa: E402
from src.game_manager import GameManager  # noqa: E402

CHECKPOINTS = {
    1: "sess1-max3-sm0",
    10: "sess10-max4-sm0",
    100: "sess100-max5-sm0",
    30000: "sess30000-max62-sm0",
    50000: "sess50000-max61-sm0",
}
ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public/samples/snake"
FIXTURES = ROOT / "src/samples/snake/fixtures.json"


def export_layers(policy):
    names = ["fc1", "fc2", "fc3"]
    if sorted(k.split(".")[0] for k in policy) != sorted(names * 2):
        raise ValueError("expected 3 linear layers")
    if policy["fc1.weight"].shape[1] != 24 or policy["fc3.weight"].shape[0] != 4:
        raise ValueError("expected 24 inputs and 4 outputs")
    return [
        {
            "weight": policy[f"{n}.weight"].round(decimals=6).tolist(),
            "bias": policy[f"{n}.bias"].round(decimals=6).tolist(),
        }
        for n in names
    ]


def forward(layers, state):
    x = torch.tensor(state, dtype=torch.float32)
    for i, layer in enumerate(layers):
        weight = torch.tensor(layer["weight"], dtype=torch.float32)
        bias = torch.tensor(layer["bias"], dtype=torch.float32)
        x = weight @ x + bias
        if i < len(layers) - 1:
            x = torch.relu(x)
    return x.tolist()


def build_positions():
    random.seed(42)
    processor = State()
    positions = []
    for _ in range(5):
        game = GameManager()
        snake = game.snakes[0]
        snake.set_direction((-1, 0))
        for _ in range(random.randint(1, 3)):
            if snake.head[0] > 0:
                game.step((-1, 0))
        positions.append(
            {
                "game": {
                    "body": [list(p) for p in snake.body],
                    "direction": list(snake.direction),
                    "apples": [
                        {"position": list(a.position), "color": a.color}
                        for a in game.apples
                    ],
                },
                "state": processor.get_state(game).tolist(),
            }
        )
    return positions


def main():
    positions = build_positions()
    states = [p["state"] for p in positions]
    kept = {}
    for sessions, name in CHECKPOINTS.items():
        checkpoint = torch.load(
            SOURCE / f"models/{name}.pth", map_location="cpu", weights_only=False
        )
        policy = checkpoint["policy_net"]
        try:
            layers = export_layers(policy)
        except ValueError as error:
            print(f"dropped {name}: {error}")
            continue
        (OUTPUT / f"sess-{sessions}.json").write_text(
            json.dumps({"layers": layers}, separators=(",", ":"))
        )
        kept[sessions] = [forward(layers, s) for s in states]
        print(f"kept {name}: hidden {policy['fc1.weight'].shape[0]}")
    FIXTURES.write_text(
        json.dumps({"positions": positions, "qValues": kept}, separators=(",", ":"))
    )


if __name__ == "__main__":
    main()
