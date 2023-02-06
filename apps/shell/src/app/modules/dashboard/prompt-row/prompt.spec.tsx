import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import Prompt from './prompt';

describe('Prompt', () => {
  const connect = jest.fn().mockImplementation((event) => {
    event.preventDefault();
  });

  const setup = () =>
    render(
      <StoreProvider store={getMockStore()}>
        <Prompt
          name="name 1"
          description="description"
          slug="slug"
          needsMoreInfo
          needAccess={false}
          connect={connect}
          certificateAuthentication
          authorizedForAuthenticatedPrincipals={false}
          approvalRequired={false}
        />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  it('should render successfully', () => {
    const { getByText } = setup();
    expect(getByText('name 1')).toBeTruthy();
  });

  it('should connect on launch', () => {
    const { getByText } = setup();

    const launchButton = getByText('Start session');
    launchButton.click();

    expect(connect).toHaveBeenCalled();
  });

  it('should show more info', () => {
    const { getByText } = setup();
    expect(getByText('ssh certs')).toBeTruthy();
  });
});
