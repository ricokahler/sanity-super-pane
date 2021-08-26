import { useState, useEffect } from 'react';

export function useStickyStateSet(defaultValue: Set<string>, key: string) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
      ? new Set<string>(JSON.parse(stickyValue))
      : defaultValue;
  });

  useEffect(() => {
    if (value) {
      window.localStorage.setItem(key, JSON.stringify(Array.from(value)));
    }
  }, [key, value]);

  return [value, setValue] as const;
}
