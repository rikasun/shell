import clsx from 'clsx';
import { useMemo } from 'react';
import TextTitle from '../text/text-title/text-title';

export interface CardTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function CardTitle({
  children,
  subtitle,
  className: classNameOverride,
}: CardTitleProps) {
  const className = useMemo(
    () => clsx(`font-base font-semibold ${classNameOverride}`),
    [classNameOverride],
  );

  const printSubtitle = useMemo(() => {
    if (!subtitle) return null;

    return <p className="text-muted text-sm font-normal">{subtitle}</p>;
  }, [subtitle]);

  return (
    <div className={className}>
      <TextTitle>{children}</TextTitle>
      {printSubtitle}
    </div>
  );
}

export interface CardBlockProps {
  className?: string;
  children: React.ReactNode;
  padding?: number;
}

export function CardBlock({
  children,
  className: argClassName,
  padding = 4,
}: CardBlockProps) {
  const className = useMemo(
    () => `p-${padding} ${argClassName}`,
    [argClassName, padding],
  );
  return <div className={className}>{children}</div>;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className: classNameOverride }: CardProps) {
  const className = useMemo(
    () =>
      `rounded border border-zinc-300 divide-y divide-zinc-300 bg-white ${classNameOverride}`,
    [classNameOverride],
  );

  return <div className={className}>{children}</div>;
}

export default Card;
