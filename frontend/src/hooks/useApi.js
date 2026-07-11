// Generic async-call custom hook so every page is a few lines of glue.
//   const { data, loading, error, run } = useApi(SchemesAPI.find);
//   run(profile);  // populates data/error, toggles loading
import { useCallback, useState } from "react";

export function useApi(fn) {
  // Local states to track api call outcomes
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // executes the actual fetch callback function, managing the loading spinner toggles
  // and catching runtime network exceptions.
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

  // Resets the local state to defaults.
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, run, reset, setData };
}
