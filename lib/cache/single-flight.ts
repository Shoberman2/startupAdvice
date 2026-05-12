/**
 * In-memory single-flight cache for one Fluid Compute instance.
 *
 * When N concurrent requests hit the same key with a cache miss, exactly one
 * runs the work; the rest await the same promise. Drops the worst-case stampede
 * from (N × downstream calls) to (1 × downstream calls) per instance.
 *
 * Cleanup is mandatory and runs in finally — entries are deleted whether the
 * underlying work resolves or rejects. Without this, every miss leaks a Map
 * entry forever. (This was flagged as a critical gap in /plan-eng-review.)
 */
export class SingleFlight<V> {
  private readonly inFlight = new Map<string, Promise<V>>();

  async run(key: string, work: () => Promise<V>): Promise<V> {
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = (async () => {
      try {
        return await work();
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /** For tests: how many entries are currently in flight. */
  size(): number {
    return this.inFlight.size;
  }
}

// Module-level shared instance. Fluid Compute reuses the module across
// concurrent requests within the same instance, so this is the dedupe surface.
export const panelSingleFlight = new SingleFlight<unknown>();
