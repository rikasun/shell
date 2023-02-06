import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import LogCard from './log-card';

describe('LogCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <LogCard
        email="asdf@asdf.com"
        runbookId="1"
        runbookName="asdf"
        location="asdf"
        host="asdf"
        ip="asdf"
        date={new Date()}
      />,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
