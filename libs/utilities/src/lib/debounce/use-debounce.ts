import { useEffect, useState } from 'react';
import { Debounce } from './debounce';

export const useDebounce = ({ delay = 100 }: { delay: number }): Debounce => {
  const [debounce, setDebounce] = useState<Debounce>(new Debounce(delay));

  useEffect(() => setDebounce(new Debounce(delay)), [delay]);

  return debounce;
};
