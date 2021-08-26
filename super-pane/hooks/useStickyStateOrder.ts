import { useState, useEffect } from 'react';

export interface ColumnOrder {
  key: string;
  direction: string;
}

export function useStickyStateOrder(defaultValue: ColumnOrder, key: string) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    if (value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}
