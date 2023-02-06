import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Sidebar from './sidebar';

describe('Sidebar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Sidebar
        links={[
          {
            id: '1',
            title: 'Link 1',
            path: '/link-1',
            icon: <div>Icon</div>,
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
