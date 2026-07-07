// Generic async-call hook so every page is a few lines of glue.
//   const { data, loading, error, run } = useApi(SchemesAPI.find);
//   run(profile);  // populates data/error, toggles loading
import { useCallback, useState } from "react";

export function useApi(fn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || "Something went wrong.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, run, reset, setData };
}
