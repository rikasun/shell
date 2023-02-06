import clsx from 'clsx';
import { useMemo } from 'react';
import './table.scss';

export interface TableProps {
  children?: React.ReactNode;
  className?: string;
  testId?: string;
}

export interface TableRowProps extends TableProps {
  display?: 'head' | 'body';

  /**
   * Daisy UI includes an annoying graphical artifact that appears
   * when the header row is hidden. You can get rid of it with this
   */
  noHeader?: boolean;
}

export interface TableHeadProps extends TableProps {
  hide?: boolean;
}

export function TableHeadCell({
  children,
  className: customClassName,
  testId,
}: TableProps) {
  const className = useMemo(
    () => clsx('text-gray-500', customClassName),
    [customClassName],
  );
  return (
    <th data-testid={testId} className={className}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, testId }: TableProps) {
  return (
    <td data-testid={testId} className={className}>
      {children}
    </td>
  );
}

export function TableRow({
  children,
  display = 'body',
  className: customClassName,
  noHeader = false,
  testId,
}: TableRowProps) {
  const classNames = useMemo(
    () =>
      clsx(customClassName, {
        'border-0': noHeader,
        'border-t': !noHeader,
        'border-solid border-alto-three': display === 'body',
      }),
    [display, customClassName, noHeader],
  );

  return (
    <tr data-testid={testId} className={classNames}>
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className: customClassName,
  hide = false,
  testId,
}: TableHeadProps) {
  const className = useMemo(
    () =>
      clsx(customClassName, {
        'sr-only': hide,
      }),
    [customClassName, hide],
  );

  return (
    <thead data-testid={testId} className={className}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, testId }: TableProps) {
  return (
    <tbody data-testid={testId} className={className}>
      {children}
    </tbody>
  );
}

export function Table({ children, className = '', testId }: TableProps) {
  const classNames = useMemo(
    () => clsx(`overflow-x-auto`, className),
    [className],
  );

  return (
    <div data-testid={testId} className={classNames}>
      <table className="table">{children}</table>
    </div>
  );
}
