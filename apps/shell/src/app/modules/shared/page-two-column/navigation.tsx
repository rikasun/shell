import { ReactComponent as Home } from './icons/home.svg';
import { ReactComponent as Checkmark } from './icons/checkmark.svg';
import { ReactComponent as Clipboard } from './icons/clipboard.svg';
import { ReactComponent as Graph } from './icons/graph.svg';
import { ReactComponent as Settings } from './icons/settings.svg';

export const navigation = [
  {
    id: '1',
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Home />,
  },
  {
    id: '2',
    title: 'Approvals',
    path: '/approvals',
    icon: <Checkmark />,
  },
  {
    id: '3',
    title: 'Runbooks',
    path: '/runbooks',
    icon: <Clipboard />,
  },
  {
    id: '4',
    title: 'Activities',
    path: '/activities',
    icon: <Graph />,
  },
  {
    id: '5',
    title: 'Settings',
    path: '/settings',
    icon: <Settings />,
  },
];
