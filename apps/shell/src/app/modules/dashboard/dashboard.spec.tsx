import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import Dashboard from './dashboard';

const allPrompts = [
  {
    featured: false,
    name: 'demo-bastion-test',
    description: 'test description',
    slug: 'demo-bastion',
    needsMoreInfo: false,
    ip: '',
    hostname: '',
    port: 22,
    username: '',
    closeTerminalOnExit: false,
    labels: {
      environment: 'development',
      script: 'local-run-docker',
      app: 'bastion',
    },
    sessionId: '',
    certificateAuthentication: false,
    needAccess: false,
    needsAuthentication: false,
    authorizedForAuthenticatedPrincipals: false,
    authorizationExplanation: '',
    approvalRequired: false,
  },
  {
    featured: false,
    name: 'demo-bastion',
    description: 'test description 2',
    slug: 'demo-bastion-2',
    needsMoreInfo: false,
    ip: '',
    hostname: '',
    port: 22,
    username: '',
    closeTerminalOnExit: false,
    labels: {
      environment: 'development',
      app: 'bastion',
    },
    sessionId: '',
    certificateAuthentication: false,
    needAccess: false,
    needsAuthentication: false,
    authorizedForAuthenticatedPrincipals: false,
    authorizationExplanation: '',
    approvalRequired: false,
  },
];

describe('Dashboard', () => {
  const setup = async () => {
    const result = render(
      <StoreProvider
        store={getMockStore({
          promptService: {
            getAll: jest.fn().mockReturnValue(Promise.resolve(allPrompts)),
          },
        })}
      >
        <Dashboard />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => result.getByTestId('dashboard__ready'));

    return result;
  };

  it('should render successfully', async () => {
    const { baseElement } = await setup();
    expect(baseElement).toBeTruthy();
  });

  it('should show filtered results when searching by name', async () => {
    const testId = 'dashboard__filter-prompt';
    const { getByTestId, getByText } = await setup();
    const input = getByTestId(testId);
    jest.useFakeTimers();

    fireEvent.change(input, { target: { value: 'demo-bastion-test' } });

    jest.advanceTimersByTime(500);

    await waitFor(() => expect(getByText('test description')).toBeTruthy());
  });

  it('should show filtered results when searching by labels', async () => {
    const testId = 'dashboard__filter-prompt';
    const { getByTestId, getByText } = await setup();
    const input = getByTestId(testId);
    jest.useFakeTimers();

    fireEvent.change(input, { target: { value: 'script=local-run-docker' } });

    jest.advanceTimersByTime(500);

    await waitFor(() => expect(getByText('test description')).toBeTruthy());
  });

  it('should not show results when no match', async () => {
    const testId = 'dashboard__filter-prompt';
    const { getByTestId, queryByText } = await setup();
    const input = getByTestId(testId);
    jest.useFakeTimers();

    fireEvent.change(input, { target: { value: 'demo-bastion-1' } });

    jest.advanceTimersByTime(500);

    await waitFor(() => expect(queryByText('test description')).toBeFalsy());
  });

  it('should not show featured prompts when none is featured', async () => {
    const { queryByText } = await setup();

    await waitFor(() => expect(queryByText('Launch')).toBeFalsy());
  });

  it('should connect to prompt', async () => {
    const { getByTestId } = await setup();
    const connectButton = getByTestId('prompt__start-session-demo-bastion');
    const input = getByTestId('dashboard__filter-prompt');

    fireEvent.change(input, { target: { value: 'demo-bastion-test' } });

    await waitFor(() => expect(connectButton).toBeTruthy());

    fireEvent.click(connectButton);

    expect(window.location.pathname).toEqual('/prompts/demo-bastion');
  });
});
