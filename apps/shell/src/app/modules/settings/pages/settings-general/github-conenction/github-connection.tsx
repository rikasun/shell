import { Button, FormInputText, TextBlock, TextLink } from '@cased/ui';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useCallback, useMemo } from 'react';
import { useStoreActions, useStoreState } from '@cased/redux';

export function GithubConnection() {
  const { hostname } = window.location;
  const organization = useStoreState((state) => state.settings.organization);
  const { ghAppUrl } = useStoreState((state) => state.settings.shell);
  const { githubRepos } = useStoreState((state) => state.settings);
  const setOrganization = useStoreActions(
    (actions) => actions.settings.setOrganization,
  );
  const connectGitHub = useStoreActions(
    (actions) => actions.settings.connectGitHub,
  );
  const disconnectGitHub = useStoreActions(
    (actions) => actions.settings.disconnectGitHub,
  );

  const [searchParams] = useSearchParams();

  const updateOrganization = useCallback(
    (_key: string, value: string) => {
      setOrganization({ organization: value });
    },
    [setOrganization],
  );

  const removeGitHub = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      disconnectGitHub();
    },
    [disconnectGitHub],
  );

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) return;
    connectGitHub();
  }, [connectGitHub, searchParams]);

  const printForm = useMemo(() => {
    if (!ghAppUrl) {
      return (
        <>
          <TextBlock className="mb-3">
            GitHub connection is not enabled. To setup, have an Organization
            Admin or{' '}
            <a
              className="text-blue-500"
              href="https://docs.github.com/en/organizations/managing-access-to-your-organizations-apps/adding-github-app-managers-in-your-organization"
            >
              Organization GitHub App Manager
            </a>{' '}
            complete these steps to connect this Cased Shell installation to
            GitHub.
          </TextBlock>

          <form
            action={`https://github.com/organizations/${organization}/settings/apps/new?state=1234`}
            method="POST"
            data-testid="settings-github-connection__form"
          >
            <input
              className="hidden"
              name="manifest"
              readOnly
              value={JSON.stringify({
                name: 'Cased Shell',
                url: `https://${hostname}`,
                hook_attributes: {
                  active: false,
                  url: 'https://example.com/github/events',
                },
                redirect_url: `https://${hostname}/settings`,
                public: false,
                default_permissions: {
                  contents: 'read',
                },
                default_events: [],
              })}
            />
            <FormInputText
              className="mb-3"
              label="Organization Name"
              hideLabel
              placeholder="Enter organization name"
              required
              name="organization"
              value={organization}
              onChange={updateOrganization}
            />

            <Button type="submit">Create a GitHub App</Button>
          </form>
        </>
      );
    }
    return (
      <>
        {githubRepos > 0 ? (
          <TextBlock>
            {`GitHub App is configured. ${githubRepos} repo(s) accessible. `}
            <TextLink href={ghAppUrl} targetBlank>
              Configure app on GitHub
            </TextLink>
            .
          </TextBlock>
        ) : (
          <TextBlock>
            {`GitHub App is created. ${githubRepos} repo(s) accessible. `}
            <TextLink targetBlank href={`${ghAppUrl}/installations/new`}>
              {' '}
              Install it on a repository to access its contents
            </TextLink>
            .
          </TextBlock>
        )}

        <form onSubmit={removeGitHub}>
          <Button type="submit">Remove GitHub App Credentials</Button>
        </form>
      </>
    );
  }, [
    ghAppUrl,
    githubRepos,
    hostname,
    organization,
    removeGitHub,
    updateOrganization,
  ]);

  return <div>{printForm}</div>;
}
