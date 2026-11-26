#!/usr/bin/env python3
"""Real measurements for the Inference Engineering notes.

Everything here runs GPT-2 small on a laptop CPU. The absolute numbers are slow
and would be hundreds of times better on a datacenter GPU. The shapes are what
the notes use: which phase is slow, what a cache buys, where quality breaks.

Setup (versions that run on an Intel Mac):
    uv venv --python 3.11
    uv pip install "torch==2.2.2" "transformers==4.44.2" "numpy<2"
Run everything, or name the parts you want:
    python scripts/inference_bench.py
    python scripts/inference_bench.py kvcache quant
Writes src/data/bench/<part>.json. Close other programs first; timings are noisy.

Two parts do not need GPT-2 and skip loading it when run by themselves:
    python scripts/inference_bench.py compute templates
"""
import json
import pathlib
import statistics
import sys
import time
import warnings

import numpy as np
import torch
from transformers import GPT2LMHeadModel, GPT2TokenizerFast

warnings.filterwarnings("ignore")
torch.manual_seed(0)
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "bench"
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT / "scripts"))

# Parts that never touch GPT-2. Asking only for these skips loading the model.
LIGHT = {"compute", "templates"}
NEEDS_GPT2 = not sys.argv[1:] or not set(sys.argv[1:]) <= LIGHT

tok = GPT2TokenizerFast.from_pretrained("gpt2") if NEEDS_GPT2 else None
model = GPT2LMHeadModel.from_pretrained("gpt2").eval() if NEEDS_GPT2 else None
BOS = tok.bos_token_id if tok else None

# Filler text to cut prompts of any length from. Its meaning does not matter for timing.
FILLER = (
    "A language model reads text one piece at a time and predicts what comes next. "
    "Serving one to many people at once is a different problem from training it, "
    "because every person is waiting, every answer has a different length, and the "
    "hardware that does the work is expensive and never quite the right size. "
) * 40
FILLER_IDS = tok.encode(FILLER) if tok else []


def save(name, obj):
    path = OUT / f"{name}.json"
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"wrote {path.name} ({path.stat().st_size} bytes)", flush=True)


def r(x, n=3):
    return round(float(x), n)


def prompt(n, batch=1):
    """A batch of n-token prompts."""
    return torch.tensor([[BOS] + FILLER_IDS[: n - 1]] * batch)


def timed(fn, repeats=3):
    """Median wall time of fn() in seconds, and its last result."""
    times, result = [], None
    for _ in range(repeats):
        start = time.perf_counter()
        result = fn()
        times.append(time.perf_counter() - start)
    return statistics.median(times), result


@torch.no_grad()
def prefill(ids):
    return model(ids, use_cache=True)


@torch.no_grad()
def decode(out, steps):
    """Greedy decode with the KV cache: each step feeds only the newest token."""
    past, nxt = out.past_key_values, out.logits[:, -1:].argmax(-1)
    for _ in range(steps):
        step = model(nxt, past_key_values=past, use_cache=True)
        past, nxt = step.past_key_values, step.logits[:, -1:].argmax(-1)


# --- phases: reading n tokens (one pass) against writing n tokens (n passes)
def phases():
    rows = []
    for n in (64, 256, 512):
        read_s, _ = timed(lambda: prefill(prompt(n)))
        start = prefill(prompt(2))
        write_s, _ = timed(lambda: decode(start, n), repeats=1)
        rows.append({"tokens": n, "read_s": r(read_s), "write_s": r(write_s)})
        print(rows[-1], flush=True)
    save("phases", rows)


# --- ttft: how the wait for the first token grows with the prompt, and the speed after it
def ttft():
    rows = []
    for n in (16, 64, 256, 1000):
        first_s, out = timed(lambda: prefill(prompt(n)), repeats=5)
        steps = 20
        rest_s, _ = timed(lambda: decode(out, steps), repeats=3)
        rows.append({"prompt": n, "ttft_ms": r(first_s * 1000, 1), "tps": r(steps / rest_s, 1)})
        print(rows[-1], flush=True)
    save("ttft", rows)


# --- percentiles: real compute times for varied requests, replayed through one queue
def percentiles():
    rng = np.random.default_rng(7)
    n_requests = 240
    work = []
    for i in range(n_requests):
        n_in, n_out = int(rng.integers(20, 200)), int(rng.integers(4, 36))
        start = time.perf_counter()
        decode(prefill(prompt(n_in)), n_out)
        work.append(time.perf_counter() - start)
        if i % 40 == 0:
            print("request", i, r(work[-1]), flush=True)
    mean_work = float(np.mean(work))
    # one worker, requests arriving at random so that it is busy about 70% of the time
    gaps = rng.exponential(mean_work / 0.7, n_requests)
    arrive = np.cumsum(gaps)
    free_at, total = 0.0, []
    for a, w in zip(arrive, work):
        begin = max(a, free_at)
        free_at = begin + w
        total.append(free_at - a)
    pct = lambda q: r(np.percentile(total, q) * 1000, 0)
    save("percentiles", {
        "requests": n_requests,
        "busy": r(sum(work) / free_at, 2),
        "compute_ms": sorted(r(w * 1000, 0) for w in work),
        "total_ms": sorted(r(t * 1000, 0) for t in total),
        "mean": r(np.mean(total) * 1000, 0),
        "p50": pct(50), "p90": pct(90), "p95": pct(95), "p99": pct(99),
    })


# --- kvcache: the same generation with and without the cache
@torch.no_grad()
def write_without_cache(n):
    """Feed the whole text through the model for every new token. Returns the text and each step's time."""
    ids, laps = prompt(2), []
    for _ in range(n):
        start = time.perf_counter()
        nxt = model(ids, use_cache=False).logits[:, -1:].argmax(-1)
        laps.append(time.perf_counter() - start)
        ids = torch.cat([ids, nxt], dim=1)
    return ids, laps


@torch.no_grad()
def write_with_cache(n):
    """Feed only the newest token and reuse the keys and values of the rest."""
    start = time.perf_counter()
    out = prefill(prompt(2))
    past, nxt, ids = out.past_key_values, out.logits[:, -1:].argmax(-1), [prompt(2)]
    laps = [time.perf_counter() - start]
    for _ in range(n - 1):
        ids.append(nxt)
        start = time.perf_counter()
        step = model(nxt, past_key_values=past, use_cache=True)
        past, nxt = step.past_key_values, step.logits[:, -1:].argmax(-1)
        laps.append(time.perf_counter() - start)
    ids.append(nxt)
    return torch.cat(ids, dim=1), laps


def kvcache():
    """Write the same 256 tokens both ways. Each step keeps its fastest time over a few runs,
    which filters out moments when the laptop was busy with something else."""
    marks = (16, 32, 64, 128, 256)
    write_with_cache(8)  # warm up, so the first timing is not paying for start-up
    write_without_cache(8)

    def fastest(write, runs):
        text, laps = write(256)
        for _ in range(runs - 1):
            again, more = write(256)
            assert torch.equal(text, again)
            laps = [min(a, b) for a, b in zip(laps, more)]
        return text, laps

    a, laps_with = fastest(write_with_cache, 3)
    b, laps_without = fastest(write_without_cache, 2)
    same = torch.equal(a, b)
    near = lambda laps, m: statistics.median(laps[max(0, m - 3) : m + 2]) * 1000
    save("kvcache", {
        # time to write the first n tokens
        "totals": [{"tokens": m, "with_s": r(sum(laps_with[:m])), "without_s": r(sum(laps_without[:m]))} for m in marks],
        # time for the token at position m, as the median of the steps around it
        "steps": [
            {"step": m, "with_ms": r(near(laps_with, m), 1), "without_ms": r(near(laps_without, m), 1)}
            for m in (2,) + marks
        ],
        "same_output": same,
    })
    print("same output:", same, "totals:", r(sum(laps_with)), r(sum(laps_without)), flush=True)


# --- batching: one decode step for 1, 2, 4... requests at once
def batching():
    rows = []
    for batch in (1, 2, 4, 8, 16, 32):
        out = prefill(prompt(64, batch))
        steps = 12
        decode(out, 2)  # warm up
        seconds, _ = timed(lambda: decode(out, steps), repeats=3)
        rows.append({
            "batch": batch,
            "step_ms": r(seconds / steps * 1000, 1),
            "total_tps": r(batch * steps / seconds, 1),
            "each_tps": r(steps / seconds, 1),
        })
        print(rows[-1], flush=True)
    save("batching", rows)


# --- membw: how fast this machine reads memory, against how fast it decodes
def membw():
    big = torch.ones(512 * 1024 * 1024 // 4)  # half a gibibyte of float32
    big.sum()
    seconds, _ = timed(lambda: big.sum(), repeats=7)
    read_gbs = big.numel() * 4 / 1e9 / seconds
    del big
    weights_gb = sum(p.numel() for p in model.parameters()) * 4 / 1e9
    out = prefill(prompt(32))
    decode(out, 4)
    steps = 40
    dec_s, _ = timed(lambda: decode(out, steps), repeats=3)
    save("membw", {
        "read_gbs": r(read_gbs, 1),
        "weights_gb": r(weights_gb, 3),
        "ceiling_tps": r(read_gbs / weights_gb, 1),
        "measured_tps": r(steps / dec_s, 1),
    })


# --- compute: how much arithmetic this machine can do when memory is not in the way
def compute():
    n = 1536
    a, b = torch.rand(n, n), torch.rand(n, n)
    a @ b
    # The machine is rarely idle, so keep the fastest try: that is what it is capable of.
    seconds = min(timed(lambda: a @ b, repeats=1)[0] for _ in range(25))
    # An n-by-n product is n*n*n multiplications and about as many additions.
    save("compute", {"size": n, "tries": 25, "matmul_gflops": r(2 * n**3 / seconds / 1e9, 1)})


# --- templates: one conversation, flattened into a single string by real chat templates
def templates():
    from transformers import AutoTokenizer

    messages = [
        {"role": "system", "content": "Answer in one short sentence."},
        {"role": "user", "content": "Why is the sky blue?"},
    ]
    models = []
    for name, repo in (("Qwen 2.5", "Qwen/Qwen2.5-0.5B-Instruct"), ("Phi-3", "microsoft/Phi-3-mini-4k-instruct")):
        t = AutoTokenizer.from_pretrained(repo)
        text = t.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        ids = t.apply_chat_template(messages, tokenize=True, add_generation_prompt=True)
        # Split the string into what I wrote and what the template added around it.
        parts, spans, at = [], [], 0
        for message in messages:
            start = text.index(message["content"], at)
            if start > at:
                parts.append({"kind": "template", "text": text[at:start]})
            parts.append({"kind": "content", "text": message["content"]})
            at = start + len(message["content"])
            spans.append((start, at))
        if at < len(text):
            parts.append({"kind": "template", "text": text[at:]})
        # A token counts as mine only if it lies wholly inside one of my messages.
        enc = t(text, add_special_tokens=False, return_offsets_mapping=True)
        assert enc["input_ids"] == list(ids), f"{repo}: the two ways of tokenizing disagree"
        mine = sum(any(a >= s and b <= e for s, e in spans) for a, b in enc["offset_mapping"] if b > a)
        models.append({
            "name": name, "repo": repo, "parts": parts,
            "tokens": len(ids), "content_tokens": mine, "vocab": len(t),
        })
        print(name, len(ids), "tokens,", mine, "from the messages", flush=True)
        print(text, flush=True)
    base = AutoTokenizer.from_pretrained("gpt2")
    save("templates", {
        "messages": messages,
        "models": models,
        "gpt2": {"has_template": base.chat_template is not None, "vocab": len(base)},
    })


# --- fusion: the same three operations with many trips to memory, or few
def fusion():
    n = 32 * 1024 * 1024
    x = np.random.default_rng(0).standard_normal(n).astype(np.float32)
    y = np.empty_like(x)

    def three_passes():
        np.multiply(x, 1.5, out=y)
        np.add(y, 0.25, out=y)
        np.maximum(y, 0, out=y)

    def one_pass(chunk=128 * 1024):  # half a megabyte at a time, small enough to stay in the CPU's cache
        for i in range(0, n, chunk):
            part = y[i : i + chunk]
            np.multiply(x[i : i + chunk], 1.5, out=part)
            np.add(part, 0.25, out=part)
            np.maximum(part, 0, out=part)

    def as_written():
        return np.maximum(x * 1.5 + 0.25, 0)  # the obvious one-liner: a fresh array at every step

    three_passes()
    expect = y.copy()
    one_pass()
    assert np.array_equal(expect, y) and np.array_equal(expect, as_written()), "all versions must agree"
    written_s, _ = timed(as_written, repeats=5)
    separate_s, _ = timed(three_passes, repeats=5)
    fused_s, _ = timed(one_pass, repeats=5)
    save("fusion", {
        "megabytes": n * 4 // (1024 * 1024),
        "written_ms": r(written_s * 1000, 0),
        "separate_ms": r(separate_s * 1000, 0),
        "fused_ms": r(fused_s * 1000, 0),
    })


# --- profile: where one forward pass spends its time
def profile():
    from torch.profiler import ProfilerActivity, profile as torch_profile

    ids = prompt(256)
    prefill(ids)
    with torch_profile(activities=[ProfilerActivity.CPU]) as prof:
        for _ in range(3):
            prefill(ids)
    events = [e for e in prof.key_averages() if e.self_cpu_time_total > 0]
    total = sum(e.self_cpu_time_total for e in events)
    events.sort(key=lambda e: e.self_cpu_time_total, reverse=True)
    top = [{"op": e.key, "share": r(e.self_cpu_time_total / total, 4)} for e in events[:8]]
    top.append({"op": "everything else", "share": r(1 - sum(t["share"] for t in top), 4)})
    save("profile", {"tokens": 256, "ops": top})


# --- quant: round GPT-2's weights to fewer bits and see when it stops being GPT-2
def quant():
    from gpt_numpy import cross_entropy, gpt, gpt2_weights, softmax

    base = gpt2_weights(model)
    text = (
        "The first thing to understand about serving a model is that nobody is waiting for "
        "the average request. They are waiting for their own. A system can look fast on a "
        "chart and still feel slow to the one person whose question landed behind a long "
        "one. So we measure the slow cases on purpose, and we design for them. That means "
        "knowing how long the prompt is, how long the answer will be, and how many other "
        "people asked at the same moment."
    )
    ids = [BOS] + tok.encode(text)
    eiffel = [BOS] + tok.encode("The Eiffel Tower is located in the city of")
    paris, london = tok.encode(" Paris")[0], tok.encode(" London")[0]

    def rounded(w, bits, per_column):
        levels = 2 ** (bits - 1) - 1
        peak = np.abs(w).max(axis=0, keepdims=True) if per_column else np.abs(w).max()
        scale = np.maximum(peak, 1e-12) / levels
        return (np.clip(np.round(w / scale), -levels, levels) * scale).astype(np.float32)

    def with_bits(bits, per_column):
        q = lambda w: rounded(w, bits, per_column)
        pair = lambda p: {"w": q(p["w"]), "b": p["b"]}
        return {
            "wte": q(base["wte"]),
            "wpe": q(base["wpe"]),
            "blocks": [
                {
                    "norm1": b["norm1"],
                    "attn": {"qkv": pair(b["attn"]["qkv"]), "out": pair(b["attn"]["out"])},
                    "norm2": b["norm2"],
                    "ff": {"up": pair(b["ff"]["up"]), "down": pair(b["ff"]["down"])},
                }
                for b in base["blocks"]
            ],
            "norm": base["norm"],
            "n_head": base["n_head"],
        }

    def score(weights):
        logits = gpt(ids[:-1], **weights)
        probs = softmax(gpt(eiffel, **weights)[-1])
        return {
            "loss": r(cross_entropy(logits, np.array(ids[1:]))),
            "guesses": logits.argmax(-1),
            "paris": r(probs[paris], 4),
            "london": r(probs[london], 4),
            "top": tok.decode([int(probs.argmax())]),
        }

    full = score(base)
    params = sum(p.numel() for p in model.parameters())
    rows = []
    for bits in (16, 8, 6, 5, 4, 3, 2):
        row = {"bits": bits, "megabytes": r(params * bits / 8 / 1e6, 0)}
        for name, per_column in (("one", False), ("column", True)):
            s = score(with_bits(bits, per_column))
            row[name] = {
                "loss": s["loss"],
                "same": r(float((s["guesses"] == full["guesses"]).mean()), 3),
                "paris": s["paris"],
                "london": s["london"],
                "top": s["top"],
            }
        rows.append(row)
        print(row, flush=True)
    save("quant", {
        "tokens": len(ids) - 1,
        "full": {
            "bits": 32, "megabytes": r(params * 4 / 1e6, 0), "loss": full["loss"],
            "paris": full["paris"], "london": full["london"], "top": full["top"],
        },
        "rows": rows,
    })


# --- spec: DistilGPT-2 drafts, GPT-2 checks
@torch.no_grad()
def spec():
    draft = GPT2LMHeadModel.from_pretrained("distilgpt2").eval()
    greedy = lambda m, ids: int(m(torch.tensor([ids])).logits[0, -1].argmax())

    def speculate(text, new_tokens, k=4):
        ids, rounds, start = [BOS] + tok.encode(text), [], None
        start = len(ids)
        while len(ids) - start < new_tokens:
            guess = list(ids)
            for _ in range(k):
                guess.append(greedy(draft, guess))
            drafted = guess[len(ids):]
            # one pass of the big model scores every drafted position at once
            wants = model(torch.tensor([guess])).logits[0, len(ids) - 1 :].argmax(-1).tolist()
            kept = 0
            while kept < k and drafted[kept] == wants[kept]:
                kept += 1
            rounds.append({
                "draft": [tok.decode([t]) for t in drafted],
                "kept": kept,
                "fix": tok.decode([wants[kept]]),
            })
            ids += drafted[:kept] + [wants[kept]]
        return ids[start:], rounds

    def plain(text, n):
        ids = [BOS] + tok.encode(text)
        for _ in range(n):
            ids.append(greedy(model, ids))
        return ids[-n:]

    prompts = [
        "The Eiffel Tower is located in the city of",
        "Once upon a time, there was a",
        "def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return",
        "The three primary colours are red,",
    ]
    runs = []
    for text in prompts:
        out, rounds = speculate(text, 40)
        same = out == plain(text, len(out))
        drafted = sum(len(x["draft"]) for x in rounds)
        kept = sum(x["kept"] for x in rounds)
        runs.append({
            "prompt": text,
            "rounds": rounds,
            "tokens": len(out),
            "passes": len(rounds),
            "accept": r(kept / drafted, 3),
            "same_output": same,
        })
        print(text[:30], len(out), "tokens in", len(rounds), "passes, accept", runs[-1]["accept"], flush=True)
    params = lambda m: sum(p.numel() for p in m.parameters())
    save("spec", {"k": 4, "draft_params": params(draft), "target_params": params(model), "runs": runs})


PARTS = {
    "phases": phases, "ttft": ttft, "kvcache": kvcache, "batching": batching, "membw": membw,
    "fusion": fusion, "profile": profile, "quant": quant, "spec": spec, "percentiles": percentiles,
    "compute": compute, "templates": templates,
}

if __name__ == "__main__":
    torch.set_num_threads(2)
    chosen = sys.argv[1:] or list(PARTS)
    save("machine", {"threads": torch.get_num_threads(), "torch": torch.__version__})
    for name in chosen:
        print(f"--- {name}", flush=True)
        PARTS[name]()
