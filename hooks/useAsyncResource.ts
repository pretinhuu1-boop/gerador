import { useEffect, useRef, useState } from 'react';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_TIMEOUT_MS = 8000;

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList,
  options: { timeoutMs?: number; enabled?: boolean } = {},
): State<T> & { refresh: () => void } {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, enabled = true } = options;
  const [state, setState] = useState<State<T>>({ data: null, loading: enabled, error: null });
  const generation = useRef(0);

  const run = () => {
    if (!enabled) return;
    const myGen = ++generation.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout após ${Math.round(timeoutMs / 1000)}s`)), timeoutMs),
    );
    Promise.race([loader(), timeoutPromise])
      .then((data) => {
        if (generation.current !== myGen) return;
        setState({ data, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (generation.current !== myGen) return;
        const message = e instanceof Error ? e.message : String(e);
        setState({ data: null, loading: false, error: message });
      });
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refresh: run };
}
