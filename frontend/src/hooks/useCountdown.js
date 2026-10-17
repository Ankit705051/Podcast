import { useState, useEffect } from 'react';

export function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();

    if (diff <= 0) {
      return { total: 0, h: 0, m: 0, s: 0 };
    }

    return {
      total: diff,
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(calc());
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}
