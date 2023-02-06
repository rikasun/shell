import { ReactComponent as Home } from './assets/home.svg';
import { ReactComponent as Checkmark } from './assets/checkmark.svg';
import { ReactComponent as Clipboard } from './assets/clipboard.svg';
import { ReactComponent as Graph } from './assets/graph.svg';
import { ReactComponent as Settings } from './assets/settings.svg';

export const sampleNav = [
  {
    id: '1',
    title: 'Dashboard',
    path: '/a',
    icon: <Home />,
  },
  {
    id: '2',
    title: 'Approvals',
    path: '/b',
    icon: <Checkmark />,
  },
  {
    id: '3',
    title: 'Runbooks',
    path: '/c',
    icon: <Clipboard />,
  },
  {
    id: '4',
    title: 'Activity',
    path: '/d',
    icon: <Graph />,
  },
  {
    id: '5',
    title: 'Settings',
    path: '/e',
    icon: <Settings />,
  },
];
