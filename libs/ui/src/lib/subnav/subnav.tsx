import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export interface Tab {
  text: string;
  id: string;
  to: string;
}

export interface SubnavProps {
  tabs: Tab[];
  activeId: string;
}

const classDefault = 'relative top-[1px] inline-block py-2 text-default';
const classActive = 'border-b-2 border-primary font-medium';
const classInactive = 'text-zinc-700 border-transparent hover:text-primary';

export function Subnav({ tabs, activeId }: SubnavProps) {
  const printLinks = useMemo(
    () =>
      tabs.map(({ text, to, id }) => {
        const isActive = id === activeId;
        const newClass = `${classDefault} ${
          isActive ? classActive : classInactive
        }`;
        return (
          <li key={id}>
            <Link to={to} className={newClass}>
              {text}
            </Link>
          </li>
        );
      }),
    [tabs, activeId],
  );
  return (
    <ul className="flex space-x-6 border-b border-zinc-200">{printLinks}</ul>
  );
}

export default Subnav;
