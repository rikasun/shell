import { ReactElement, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ILink } from '@cased/data';

export interface HeaderProps {
  title: string;
  logo: ReactElement;
  userName: string;
  userLinks: ILink[];
  className?: string;
}

export function Header({
  title,
  userName,
  userLinks,
  className,
  logo,
}: HeaderProps) {
  const cx = useMemo(
    () =>
      `header w-full bg-white top-0 p-4 flex justify-between items-center border-b border-zinc-200 ${className}`,
    [className],
  );

  const printLinks = useMemo(
    () => (
      <ul className="w-48 py-2">
        {userLinks.map(({ title: linkTitle, path }) => (
          <li key={linkTitle}>
            <Link
              className="rounded- py-1 px-4 text-sm hover:bg-zinc-100"
              to={path}
            >
              {linkTitle}
            </Link>
          </li>
        ))}
      </ul>
    ),
    [userLinks],
  );

  return (
    <div className={cx}>
      <Link to="/">
        <div className="flex items-center space-x-2">
          <div>{logo}</div>
          <div className="font-medium text-gray-900">{title}</div>
        </div>
      </Link>

      <div className="dropdown dropdown-bottom dropdown-end">
        <button className="cursor-pointer">{userName}</button>
        <div className="dropdown-content menu rounded border border-zinc-200 bg-white p-0 shadow">
          {printLinks}
        </div>
      </div>
    </div>
  );
}

export default Header;
