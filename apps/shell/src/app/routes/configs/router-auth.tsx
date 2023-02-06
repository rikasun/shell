import Login from '../../modules/login/login';
import Logout from '../../modules/logout/logout';
import PageWrapper from '../page-wrapper';

export const routerAuthApp = [
  {
    path: '/auth/logout',
    element: (
      <PageWrapper>
        <Logout />
      </PageWrapper>
    ),
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
];
