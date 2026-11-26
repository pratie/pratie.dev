#!/usr/bin/env python3
"""A GPT forward pass in plain NumPy.

The note at /notes/gpt-from-scratch shows this file piece by piece, so the code
on the page is the code that was tested. Run it to check it against GPT-2:

    uv pip install "torch==2.2.2" "transformers==4.44.2" "numpy<2"
    python scripts/gpt_numpy.py
"""
import numpy as np


# --- embedding
def embed(ids, wte, wpe):
    # one row per token, plus one row per position
    return wte[ids] + wpe[np.arange(len(ids))]


# --- softmax
def softmax(x):
    x = x - x.max(axis=-1, keepdims=True)  # the largest score becomes 0
    e = np.exp(x)
    return e / e.sum(axis=-1, keepdims=True)


# --- cross_entropy
def cross_entropy(logits, targets):
    # -log(softmax(logits)[target]) without ever computing a probability
    z = logits - logits.max(axis=-1, keepdims=True)
    log_probs = z - np.log(np.exp(z).sum(axis=-1, keepdims=True))
    return -log_probs[np.arange(len(targets)), targets].mean()


# --- linear
def linear(x, w, b):
    return x @ w + b


# --- attention
def attention(x, qkv, out, n_head):
    T, d = x.shape
    q, k, v = np.split(linear(x, **qkv), 3, axis=-1)  # three (T, d) matrices

    # (T, d) -> (n_head, T, d / n_head): every head gets its own slice
    split = lambda m: m.reshape(T, n_head, d // n_head).transpose(1, 0, 2)
    q, k, v = split(q), split(k), split(v)

    scores = q @ k.transpose(0, 2, 1) / np.sqrt(d // n_head)  # (n_head, T, T)
    scores = scores + np.triu(np.full((T, T), -np.inf), k=1)  # no looking right
    mixed = softmax(scores) @ v  # (n_head, T, d / n_head)

    merged = mixed.transpose(1, 0, 2).reshape(T, d)  # heads side by side again
    return linear(merged, **out)


# --- layer_norm
def layer_norm(x, gain, bias, eps=1e-5):
    mean = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return gain * (x - mean) / np.sqrt(var + eps) + bias


# --- mlp
def gelu(x):
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x**3)))


def mlp(x, up, down):
    return linear(gelu(linear(x, **up)), **down)  # d -> 4d -> d


# --- block
def block(x, norm1, attn, norm2, ff, n_head):
    x = x + attention(layer_norm(x, **norm1), **attn, n_head=n_head)
    x = x + mlp(layer_norm(x, **norm2), **ff)
    return x


# --- gpt
def gpt(ids, wte, wpe, blocks, norm, n_head):
    x = embed(ids, wte, wpe)
    for b in blocks:
        x = block(x, **b, n_head=n_head)
    return layer_norm(x, **norm) @ wte.T  # a score for every token, at every position


# --- end


def gpt2_weights(model):
    """Unpack Hugging Face's GPT-2 into the plain dictionaries the functions above take."""
    sd = {k: v.numpy() for k, v in model.state_dict().items()}
    pair = lambda name: {"w": sd[f"{name}.weight"], "b": sd[f"{name}.bias"]}
    norm = lambda name: {"gain": sd[f"{name}.weight"], "bias": sd[f"{name}.bias"]}
    blocks = [
        {
            "norm1": norm(f"transformer.h.{i}.ln_1"),
            "attn": {"qkv": pair(f"transformer.h.{i}.attn.c_attn"), "out": pair(f"transformer.h.{i}.attn.c_proj")},
            "norm2": norm(f"transformer.h.{i}.ln_2"),
            "ff": {"up": pair(f"transformer.h.{i}.mlp.c_fc"), "down": pair(f"transformer.h.{i}.mlp.c_proj")},
        }
        for i in range(model.config.n_layer)
    ]
    return {
        "wte": sd["transformer.wte.weight"],
        "wpe": sd["transformer.wpe.weight"],
        "blocks": blocks,
        "norm": norm("transformer.ln_f"),
        "n_head": model.config.n_head,
    }


if __name__ == "__main__":
    import warnings

    import torch
    from transformers import GPT2LMHeadModel, GPT2TokenizerFast

    warnings.filterwarnings("ignore")
    tok = GPT2TokenizerFast.from_pretrained("gpt2")
    reference = GPT2LMHeadModel.from_pretrained("gpt2").eval()
    weights = gpt2_weights(reference)

    prompt = "The Eiffel Tower is located in the city of"
    ids = [tok.bos_token_id] + tok.encode(prompt)

    logits = gpt(ids, **weights)
    with torch.no_grad():
        expected = reference(torch.tensor([ids])).logits[0].numpy()
    print(f"largest difference from the reference implementation: {np.abs(logits - expected).max():.5f}")

    probs = softmax(logits[-1])
    for i in probs.argsort()[::-1][:5]:
        print(f"{tok.decode([int(i)])!r:>12} {probs[i]:.1%}")

    sentence = [tok.bos_token_id] + tok.encode(prompt + " Paris.")
    loss = cross_entropy(gpt(sentence[:-1], **weights), np.array(sentence[1:]))
    print(f"loss on the finished sentence: {loss:.3f}")
