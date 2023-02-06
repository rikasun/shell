import { render } from '@testing-library/react';

import StatusBar from './status-bar';

describe('Status Bar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusBar />);
    expect(baseElement).toBeTruthy();
  });
});
