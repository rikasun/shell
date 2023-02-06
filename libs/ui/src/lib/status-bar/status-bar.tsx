import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

interface StatusBarProps {
  state?: 'loading' | 'error';
  show?: boolean;
  children?: React.ReactNode;
}

export function StatusBar({
  state = 'loading',
  show = false,
  children,
}: StatusBarProps) {
  const [isOpen, setIsOpen] = useState(show);

  useEffect(() => {
    setIsOpen(show);
  }, [show]);

  const bar = useMemo(() => {
    if (state === 'loading') {
      return (
        <>
          <svg
            className="float-left -ml-1 mr-3 h-6 w-6 animate-spin text-gray-500"
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
          <span className="message">{children || 'Connecting'}</span>
        </>
      );
    }

    if (state === 'error') {
      return (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="float-left mr-2 h-6 w-6 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="message">{children || 'Error'}</span>
        </>
      );
    }
    return null;
  }, [children, state]);

  const wrapperClassName = useMemo(
    () =>
      clsx(
        'rounded border border-gray-400 bg-white px-4 py-2 shadow-xl w-fit',
        {
          hidden: !isOpen,
        },
      ),
    [isOpen],
  );

  return <div className={wrapperClassName}>{bar}</div>;
}

export default StatusBar;
