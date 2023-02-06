import { ILink } from '@cased/data';
import { ReactElement, useMemo } from 'react';
import { Link } from 'react-router-dom';

import './sidebar.scss';

export interface INavLink extends ILink {
  id: string;
  icon: ReactElement;
}

export interface SidebarProps {
  links: INavLink[];
  activeId?: string;
  className?: string;
}

const classDefault = 'flex items-center px-3 py-2 text-default rounded border';
const classActive = 'border-blue-200 bg-blue-50 font-medium text-blue-600';
const classInactive = 'text-gray-700 border-transparent';

export function Sidebar({ links, activeId, className }: SidebarProps) {
  const classNameDefault = `${className} bg-white h-full border-r zinc-200`;

  const printLinks = useMemo(
    () =>
      links.map(({ id, icon, title, path }) => {
        const isActive = id === activeId;
        const newClass = `${classDefault} ${
          isActive ? classActive : classInactive
        }`;

        return (
          <li key={id}>
            <Link to={path} key={id} className={newClass}>
              {icon}
              <span className="ml-2">{title}</span>
            </Link>
          </li>
        );
      }),
    [links, activeId],
  );

  return (
    <nav className={classNameDefault}>
      <ul className="p-4">{printLinks}</ul>
    </nav>
  );
}

export default Sidebar;
