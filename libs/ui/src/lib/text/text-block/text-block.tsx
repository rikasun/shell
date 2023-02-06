import { ReactNode } from 'react';
import './text-block.scss';

export interface TextBlockProps {
  children: ReactNode;
  className?: string;
}

export function TextBlock({ children, className }: TextBlockProps) {
  return <p className={className}>{children}</p>;
}

export default TextBlock;
