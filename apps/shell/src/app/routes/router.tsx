import { createBrowserRouter, Outlet } from 'react-router-dom';
import AuthGuard from '../guards/auth/auth-guard';
import Home from '../modules/home/home';
import NotFound from '../modules/not-found/not-found';
import PageWrapper from './page-wrapper';
import PageTwoColumn from '../modules/shared/page-two-column/page-two-column';
import { routerPromptsApp } from './configs/router-prompts';
import {
  routerRunbooksTwoColumn,
  routerRunbooksApp,
} from './configs/router-runbooks';
import { routerAuthApp } from './configs/router-auth';
import { routeConfigSettingsTwoColumn } from './configs/router-settings';
import { routeConfigApprovalsTwoColumn } from './configs/router-approvals';
import { routeConfigActivitiesTwoColumn } from './configs/router-activities';
import { routeConfigDashboardTwoColumn } from './configs/router-dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWrapper>
        <Home />
      </PageWrapper>
    ),
  },
  {
    path: `/`,
    element: (
      <PageWrapper>
        <AuthGuard>
          <PageTwoColumn>
            <Outlet />
          </PageTwoColumn>
        </AuthGuard>
      </PageWrapper>
    ),
    children: [
      ...routerRunbooksTwoColumn,
      ...routeConfigSettingsTwoColumn,
      ...routeConfigApprovalsTwoColumn,
      ...routeConfigActivitiesTwoColumn,
      ...routeConfigDashboardTwoColumn,
    ],
  },
  ...routerPromptsApp,
  ...routerRunbooksApp,
  ...routerAuthApp,
  {
    path: '*',
    element: <NotFound />,
  },
]);
