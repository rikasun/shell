import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import TableGroups from './table-groups';

describe('TableGroups', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TableGroups
        list={[
          {
            id: '1',
            name: 'Group 1',
            userCount: 1,
          },
        ]}
      />,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
