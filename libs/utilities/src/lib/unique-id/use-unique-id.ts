import { nanoid } from 'nanoid';
import { useState } from 'react';

export const useUniqueId = (): string => {
  const [id] = useState(() => nanoid());
  return id;
};
