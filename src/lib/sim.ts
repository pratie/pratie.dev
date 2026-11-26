/**
 * A small model of autoscaling: traffic jumps, the autoscaler asks for more replicas,
 * and they arrive one cold start later. Time moves in ten-second steps.
 */

export const STEP = 10; // seconds
export const STEPS = 48; // eight minutes
export const PER_REPLICA = 4; // requests one replica finishes per step
export const SPIKE = { from: 8, to: 28, quiet: 6, busy: 30 }; // requests arriving per step
const MAX_REPLICAS = 12;

export interface SimInput {
  /** seconds from asking for a replica to it serving traffic */
  cold: number;
  /** replicas that are always running */
  min: number;
  /** seconds of low demand before a replica is removed */
  delay: number;
}

export interface SimStep {
  arriving: number;
  ready: number;
  starting: number;
  waiting: number;
}

export interface SimResult {
  steps: SimStep[];
  /** the longest any request waited in the queue, in seconds */
  worstWait: number;
  /** replica time paid for, and the part of it that did no work, in seconds */
  paid: number;
  idle: number;
  peakWaiting: number;
}

export function simulate({ cold, min, delay }: SimInput): SimResult {
  const coldSteps = Math.ceil(cold / STEP);
  const delaySteps = Math.ceil(delay / STEP);
  let ready = Math.max(1, min);
  let waiting = 0;
  let quietFor = 0;
  let paid = 0;
  let idle = 0;
  const due: number[] = []; // the step at which each requested replica becomes ready
  const steps: SimStep[] = [];
  const arrived: number[] = []; // running totals, to work out how long requests waited
  const served: number[] = [];

  for (let t = 0; t < STEPS; t++) {
    const arriving = t >= SPIKE.from && t < SPIKE.to ? SPIKE.busy : SPIKE.quiet;

    // replicas that finished their cold start join in
    while (due.length > 0 && due[0] <= t) {
      due.shift();
      ready++;
    }

    // the autoscaler looks at demand and asks for what is missing
    const wanted = Math.min(MAX_REPLICAS, Math.max(min, 1, Math.ceil((arriving + waiting) / PER_REPLICA)));
    for (let n = ready + due.length; n < wanted; n++) due.push(t + Math.max(1, coldSteps));
    if (wanted < ready) {
      quietFor++;
      if (quietFor > delaySteps) ready = wanted;
    } else quietFor = 0;

    const capacity = ready * PER_REPLICA;
    const demand = waiting + arriving;
    const done = Math.min(capacity, demand);
    waiting = demand - done;
    paid += (ready + due.length) * STEP;
    idle += ((capacity - done) / PER_REPLICA) * STEP;

    arrived.push((arrived[t - 1] ?? 0) + arriving);
    served.push((served[t - 1] ?? 0) + done);
    steps.push({ arriving, ready, starting: due.length, waiting });
  }

  // first in, first out: the last request of step i is served once `served` catches up with `arrived[i]`
  let worstWait = 0;
  for (let i = 0; i < STEPS; i++) {
    let j = i;
    while (j < STEPS - 1 && served[j] < arrived[i]) j++;
    worstWait = Math.max(worstWait, (j - i) * STEP);
  }
  return { steps, worstWait, paid, idle, peakWaiting: Math.max(...steps.map((s) => s.waiting)) };
}
