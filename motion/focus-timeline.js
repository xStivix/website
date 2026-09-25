const duration = 16;

// One monotonic timeline for all three pages, including artwork loaded later.
// Hidden artwork reads the current phase on return without rendering offscreen.
export function createFocusTimeline(now = () => performance.now()) {
  let start = null;
  return (timestamp = now()) => {
    start ??= timestamp;
    return (duration * .36 + Math.max(0, timestamp - start) / 1000) % duration;
  };
}

export const focusTimeline = createFocusTimeline();
