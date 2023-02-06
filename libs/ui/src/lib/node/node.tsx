import { ReactNode, useMemo } from 'react';
import clsx from 'clsx';
import { BlockType } from '@cased/data';

/* eslint-disable-next-line */
export interface NodeProps {
  children: ReactNode;
  active?: boolean;
  title: string;
  blockType: BlockType;
}

export function Node({
  children,
  active = false,
  title,
  blockType,
}: NodeProps) {
  const cx = useMemo(
    () =>
      clsx('bg-bg-default border rounded max-w-[16rem]', {
        'border-zinc-400': active === false,
        'border-primary drop-shadow-[0_0_5px_rgba(5,0,255,0.15)]':
          active === true,
      }),
    [active],
  );

  const nodeType = useMemo(() => {
    switch (blockType) {
      case 'shell':
        return 'Shell';
      case 'database':
        return 'Database';
      case 'rest':
        return 'REST API';
      case 'form':
        return 'User input';
      case 'text':
        return 'Markdown';
      default:
        return null;
    }
  }, [blockType]);

  return (
    <div className={cx}>
      <div className="shadow-active-node border-b border-zinc-400 p-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs">{nodeType}</div>
      </div>
      <div className="p-2 text-sm">{children}</div>
    </div>
  );
}

export default Node;
