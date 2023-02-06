import { render } from '@testing-library/react';
import { A } from '@cased/test-utilities';

import DatabaseForm from './database-form';

describe('DatabaseForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <DatabaseForm
        form={A.runbookDatabase().build()}
        onSubmit={jest.fn()}
        onChange={jest.fn()}
      />,
    );
    expect(baseElement).toBeTruthy();
  });
});
