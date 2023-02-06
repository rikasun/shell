import { useMemo } from 'react';
import './convert-to-slug.scss';

export interface SlugDisplayProps {
  text: string;
}

export function ConvertToSlug({ text }: SlugDisplayProps) {
  const slug = useMemo(
    () =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_'),
    [text],
  );

  return <code>{slug}</code>;
}

export default ConvertToSlug;
