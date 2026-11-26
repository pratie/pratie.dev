# Writing philosophy and style for pratie.dev

This is the owner's own brief for how notes on this site should sound. Follow it
for every note. Where it conflicts with general writing advice, this wins.

I want you to understand my personality, how I think, how I learn, and how I want the articles on this website to be written.

I'm an AI engineer, but that doesn't mean I understand everything about AI. I build products, work with models, APIs and agents, and I'm genuinely curious about how things work underneath.

This website is primarily for myself. I'm writing to understand things better, and if someone else finds these notes useful, that's a bonus.

## My writing voice

- Write like a curious engineer, not a professor.
- Be conversational, natural, approachable and intellectually curious.
- Use simple English. Don't try to sound intelligent through complicated vocabulary.
- Write as though I'm explaining something to a friend sitting next to me.
- Use first-person language where it feels natural, but never invent personal experiences or experiments.
- Don't sound overly polished, corporate or academic.
- Avoid excessive em dashes, unnecessary adjectives and generic AI-generated phrases.
- Don't imitate my spoken filler words. Preserve my personality and thinking process, not my verbal habits.

## How I like to understand things

My natural learning process is to ask questions.

What exactly is this?
Why do we even need it?
What happens if we don't have it?
How does it work internally?
Can we understand it with a small example?
Where does this matter in real-world engineering?
What are the limitations?

I want the articles to follow this natural progression where appropriate, without mechanically repeating these questions in every chapter.

Don't just tell me that something works. Help me understand why it works.

## Explain intuition before implementation

Whenever introducing a difficult concept, start with the problem it solves.

For example, don't immediately introduce KV caching by discussing attention matrices, tensor dimensions and memory allocation.

Instead, start with a simple question:

"If an LLM has already processed the previous 1,000 tokens, why should it repeat some of that work every time it generates another token?"

Now we have a reason to understand KV caching.

Once the intuition is clear, introduce the technical terminology, explain the implementation, and gradually explore the mathematics and engineering trade-offs.

I should understand the purpose of something before being asked to understand its implementation.

## Assume intelligence, not prior knowledge

The reader might be a software engineer, a student, an AI enthusiast or someone completely new to the subject.

Don't assume they already know every technical term.

When introducing terms such as logits, tensors, FLOPs, memory bandwidth, quantization or attention heads, briefly explain what they mean and why they matter in the current context.

Don't oversimplify to the point of technical inaccuracy. Simple language and deep technical understanding can coexist.

The goal is not to remove complexity. The goal is to make complexity understandable.

## Examples and visualizations

<!-- The owner's message was cut off after "I learn much". From everything else they
have said: they learn best from small worked examples and from figures they can
operate, so every hard idea gets one. Replace this note when they send the rest. -->

## How I'd like the articles to sound

Here's a small example of the difference in writing style.

Traditional technical writing:

> KV caching is an inference optimization technique that stores previously computed key and value tensors to avoid redundant computations during autoregressive decoding.

My writing style:

> Something I found interesting about LLM inference is how much work gets repeated.
>
> Think about it. If a model has already processed 1,000 tokens and needs to generate one more, does it really need to calculate everything from scratch?
>
> A lot of the previous calculations haven't changed. So why not save them somewhere and reuse them?
>
> That's essentially what KV caching does. But to understand what we're actually saving, we need to understand keys and values first.
