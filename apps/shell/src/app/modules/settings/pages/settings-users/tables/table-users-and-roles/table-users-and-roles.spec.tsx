import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import TableUsersAndRoles from './table-users-and-roles';

describe('TableUsersAndRoles', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TableUsersAndRoles
        list={[
          {
            id: 'id',
            email: 'email',
            role: 'role',
            date: new Date(),
          },
        ]}
      />,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
