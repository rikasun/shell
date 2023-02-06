import AuthGuard from '../../guards/auth/auth-guard';
import RunbooksGuard from '../../modules/guards/runbooks-guard/runbooks-guard';
import NewRunbook from '../../modules/new-runbook/new-runbook';
import RunbooksList from '../../modules/runbooks-list/runbooks-list';
import Runbooks from '../../modules/runbooks/runbooks';
import PageWrapper from '../page-wrapper';

export const routerRunbooksTwoColumn = [
  {
    path: 'runbooks/new',
    element: <NewRunbook />,
  },
  {
    path: 'runbooks',
    element: (
      <PageWrapper>
        <AuthGuard>
          <RunbooksList />
        </AuthGuard>
      </PageWrapper>
    ),
  },
];

export const routerRunbooksApp = [
  {
    path: '/runbooks/:id',
    element: (
      <PageWrapper>
        <AuthGuard>
          <RunbooksGuard>
            <Runbooks />
          </RunbooksGuard>
        </AuthGuard>
      </PageWrapper>
    ),
  },
];
