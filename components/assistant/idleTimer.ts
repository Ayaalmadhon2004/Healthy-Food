// A restartable idle timer: `onIdle` fires once if `reset()` is not called again within `ms`.
// Pure (the clock is injectable), so the timing logic is unit-tested without a network.

/** A stream that sends nothing (not even its first byte) for this long has stalled; the request is aborted. */
export const STREAM_IDLE_TIMEOUT_MS = 30_000;

export interface TimerApi {
  set: (fn: () => void, ms: number) => unknown;
  clear: (handle: unknown) => void;
}

export interface IdleTimer {
  /** Restarts the countdown (call on every chunk received). */
  reset: () => void;
  /** Stops it for good; `onIdle` will not fire after this. */
  stop: () => void;
}

const realTimers: TimerApi = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export function createIdleTimer(ms: number, onIdle: () => void, timers: TimerApi = realTimers): IdleTimer {
  let handle: unknown = null;
  let stopped = false;
  const arm = (): void => {
    if (handle !== null) timers.clear(handle);
    handle = timers.set(() => {
      handle = null;
      if (!stopped) {
        stopped = true;
        onIdle();
      }
    }, ms);
  };
  arm();
  return {
    reset: () => {
      if (!stopped) arm();
    },
    stop: () => {
      stopped = true;
      if (handle !== null) timers.clear(handle);
      handle = null;
    },
  };
}
