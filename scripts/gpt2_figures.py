#!/usr/bin/env python3
"""Real GPT-2 small numbers for the figures in the notes.

Every "real GPT-2" figure on the site reads a JSON file written by this script,
so nothing in those figures is hand-tuned.

Setup (these versions run on an Intel Mac; newer ones are fine elsewhere):
    uv venv --python 3.11
    uv pip install "torch==2.2.2" "transformers==4.44.2" "numpy<2" scikit-learn
Run:
    python scripts/gpt2_figures.py      # writes src/data/gpt2/*.json
"""
import json
import pathlib
import sys
import warnings

import numpy as np
import torch
from sklearn.manifold import TSNE
from transformers import GPT2LMHeadModel, GPT2TokenizerFast

warnings.filterwarnings("ignore")
OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "data" / "gpt2"
OUT.mkdir(parents=True, exist_ok=True)

tok = GPT2TokenizerFast.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained(
    "gpt2", output_attentions=True, output_hidden_states=True, attn_implementation="eager"
).eval()
BOS = tok.bos_token_id  # GPT-2 has one special token, <|endoftext|>; it doubles as "start"
PROMPT = "The Eiffel Tower is located in the city of"


def show(i):
    return tok.decode([int(i)])


def encode(text):
    return [BOS] + tok.encode(text)


@torch.no_grad()
def forward(ids):
    return model(torch.tensor([ids]))


def save(name, obj):
    path = OUT / f"{name}.json"
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"wrote {path.name} ({path.stat().st_size} bytes)")


def r(x, n=4):
    return round(float(x), n)


# --- tokens: how the real tokenizer splits a few strings -------------------
def tokens():
    texts = [
        PROMPT,
        "hello",
        " hello",
        "Hello",
        " unbelievably",
        " tokenization",
        " 2026",
        " pratie",
    ]
    save("tokens", [{"text": t, "tokens": [[show(i), i] for i in tok.encode(t)]} for t in texts])


# --- loop: the same prompt continued three ways ---------------------------
def generate(steps, seed=None, k=6):
    """seed=None is greedy; otherwise sample from the full distribution at T=1."""
    g = torch.Generator().manual_seed(seed) if seed is not None else None
    ids, out = encode(PROMPT), []
    for _ in range(steps):
        p = forward(ids).logits[0, -1].softmax(-1)
        nxt = int(p.argmax()) if g is None else int(torch.multinomial(p, 1, generator=g))
        top = p.topk(k)
        out.append({
            "top": [[show(i), r(v)] for v, i in zip(top.values, top.indices)],
            "pick": show(nxt),
            "p": r(p[nxt]),
            "rank": int((p > p[nxt]).sum()) + 1,
        })
        ids.append(nxt)
    return out


def loop(explore=False):
    if explore:
        for seed in range(60):
            print(seed, repr("".join(s["pick"] for s in generate(14, seed))))
        return
    save("loop", {
        "prompt": [show(i) for i in tok.encode(PROMPT)],
        "runs": [
            {"id": "a", "label": "roll the dice", "steps": generate(16, seed=21)},
            {"id": "b", "label": "roll again", "steps": generate(16, seed=SEED_B)},
            {"id": "greedy", "label": "always take the top one", "steps": generate(26)},
        ],
    })


SEED_B = 13


# --- attention: five real heads on the prompt ------------------------------
HEADS = [(9, 8), (4, 11), (2, 9), (1, 10), (5, 1)]


def attention():
    ids = encode(PROMPT)
    att = torch.stack(forward(ids).attentions)[:, 0]  # layer, head, reader, read
    n = len(ids)
    start_share = torch.stack([att[:, :, i, 0] for i in range(2, n)]).mean()
    save("attn", {
        "tokens": [show(i) for i in ids],
        "startShare": r(start_share, 3),
        "heads": [
            {"layer": l, "head": h, "w": [[r(x, 3) for x in att[l, h, i, : i + 1]] for i in range(n)]}
            for l, h in HEADS
        ],
    })


# --- lens: decode the last position after every block ----------------------
def lens():
    out = forward(encode(PROMPT))
    watch = {w: tok.encode(w)[0] for w in (" Paris", " London")}
    rows = []
    for k in range(1, 13):
        h = out.hidden_states[k][0, -1]
        if k < 12:  # the last entry already went through the final layer norm
            h = model.transformer.ln_f(h)
        p = model.lm_head(h).softmax(-1)
        top = p.topk(3)
        rows.append({
            "block": k,
            "top": [[show(i), r(v)] for v, i in zip(top.values, top.indices)],
            "watch": {w.strip(): r(p[i]) for w, i in watch.items()},
        })
    save("lens", rows)


# --- sampler: logits you can re-temperature in the browser -----------------
def sampler():
    contexts = [PROMPT, "I went to the bank to deposit some", "Once upon a"]
    data = []
    for text in contexts:
        logits = forward(encode(text)).logits[0, -1]
        order = logits.argsort(descending=True)
        top, rest = order[:10], logits[order[10:]].numpy()
        step = 0.1
        lo = float(np.floor(rest.min() / step) * step)
        counts = np.bincount(((rest - lo) / step).astype(int)).tolist()
        data.append({
            "text": text,
            "top": [[show(i), r(logits[i], 3)] for i in top],
            "rest": {"lo": r(lo, 2), "step": step, "counts": counts},
        })
    save("sampler", data)


# --- surprisal: what the model thought of each token of a finished sentence
def surprisal():
    ids = encode(PROMPT + " Paris.")
    logp = forward(ids).logits[0].log_softmax(-1)
    rows = []
    for k in range(len(ids) - 1):
        best = int(logp[k].argmax())
        rows.append({
            "t": show(ids[k + 1]),
            "p": r(logp[k, ids[k + 1]].exp()),
            "guess": show(best),
            "guessP": r(logp[k, best].exp()),
        })
    loss = -sum(float(logp[k, ids[k + 1]]) for k in range(len(ids) - 1)) / (len(ids) - 1)
    save("surprisal", {"tokens": rows, "loss": r(loss, 3)})


# --- embed: a 2-D map of some rows of the embedding table ------------------
WORDS = {
    "numbers": "one two three four five six seven eight",
    "days": "Monday Tuesday Wednesday Thursday Friday Saturday Sunday",
    "places": "Paris London Berlin Rome Tokyo France Germany Italy Japan",
    "animals": "dog cat horse bird fish lion",
    "colours": "red blue green yellow black white",
    "code": "Python Java PHP Linux HTML",
    "people": "king queen prince man woman",
    "verbs": "walked ran jumped said went",
}


def embed():
    table = model.transformer.wte.weight.detach()
    unit = table / table.norm(dim=1, keepdim=True)
    ids, cats = [], []
    for cat, words in WORDS.items():
        for w in words.split():
            (i,) = tok.encode(" " + w)  # every word here is a single token
            ids.append(i)
            cats.append(cat)
    xy = TSNE(n_components=2, perplexity=5, metric="cosine", init="pca", random_state=0).fit_transform(
        unit[ids].numpy()
    )
    xy = (xy - xy.min(0)) / (xy.max(0) - xy.min(0))
    points = []
    for i, cat, (x, y) in zip(ids, cats, xy):
        sims = unit @ unit[i]
        near = sims.topk(6)
        points.append({
            "t": show(i),
            "cat": cat,
            "x": r(x, 3),
            "y": r(y, 3),
            "near": [[show(j), r(s, 2)] for s, j in zip(near.values[1:], near.indices[1:])],
        })
    save("embed", {"vocab": table.shape[0], "dims": table.shape[1], "points": points})


if __name__ == "__main__":
    if "--explore" in sys.argv:
        loop(explore=True)
    else:
        tokens(), loop(), attention(), lens(), sampler(), surprisal(), embed()
        print("parameters:", sum(p.numel() for p in model.parameters()))
