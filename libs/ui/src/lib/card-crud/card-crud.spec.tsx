import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import CardCrud from './card-crud';

describe('CardCrud', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <CardCrud
        title=""
        items={[
          {
            id: '1',
            name: 'Item 1',
          },
        ]}
        baseUrl=""
      />,
      { wrapper: BrowserRouter },
    );
    expect(baseElement).toBeTruthy();
  });
});
