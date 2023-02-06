import AuthGuard from '../../guards/auth/auth-guard';
import PromptConnect from '../../modules/prompt-connect/prompt-connect';
import PromptWatcher from '../../modules/prompt/prompt-watcher';
import PageWrapper from '../page-wrapper';

export const routerPromptsApp = [
  {
    path: '/prompts',
    children: [
      {
        path: 'share/:promptSessionId',
        element: (
          <PageWrapper>
            <AuthGuard>
              <PromptWatcher />
            </AuthGuard>
          </PageWrapper>
        ),
      },
      {
        path: ':slug',
        element: (
          <PageWrapper>
            <AuthGuard>
              <PromptConnect />
            </AuthGuard>
          </PageWrapper>
        ),
      },
    ],
  },
];
