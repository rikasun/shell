import { useMemo } from 'react';
import './text-date.scss';

export interface DateProps {
  date: Date;
  display?: 'default' | 'dateTime';
}

export function TextDate({ date: dateArg, display = 'default' }: DateProps) {
  /**
   * Full formatting docs can be found here:
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
   */
  const date = useMemo(() => {
    if (display === 'dateTime') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        hour12: false,
        minute: 'numeric',
        timeZoneName: 'short',
      }).format(dateArg);
    }

    return new Intl.DateTimeFormat('en-US').format(dateArg);
  }, [dateArg, display]);

  return <span>{date}</span>;
}

export default TextDate;
