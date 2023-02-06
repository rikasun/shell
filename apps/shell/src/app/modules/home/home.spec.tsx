import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { mockReactFlow } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import Home from './home';

describe('Home', () => {
  const setup = () => {
    window.history.pushState({}, 'Init', '/');
    mockReactFlow();

    return render(
      <StoreProvider store={getMockStore()}>
        <Home />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };
  it('should render successfully', () => {
    const { baseElement } = setup();
    expect(baseElement).toBeTruthy();
  });
});
