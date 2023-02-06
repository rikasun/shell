import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Subnav from './subnav';

describe('Subnav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Subnav
        tabs={[
          {
            id: '1',
            text: 'Link 1',
            to: '/link-1',
          },
        ]}
        activeId="1"
      />,
      {
        wrapper: BrowserRouter,
      },
    );
    expect(baseElement).toBeTruthy();
  });
});
