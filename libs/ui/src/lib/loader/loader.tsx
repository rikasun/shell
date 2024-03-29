import { useMemo } from 'react';
import clsx from 'clsx';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Loader({ className: userClass, size = 'small' }: LoaderProps) {
  const className = useMemo(
    () =>
      clsx(` ${userClass}`, {
        'w-4 h-4': size === 'small',
        'w-8 h-8': size === 'medium',
        'w-12 h-12': size === 'large',
      }),
    [userClass, size],
  );

  return (
    <svg
      className={`text-primary -ml-1 mr-3 h-4 w-4 animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Loader;
