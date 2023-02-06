import { render } from '@testing-library/react';

import Card, { CardBlock, CardTitle } from './card';

describe('Card', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Card>
        <CardTitle>Card Title</CardTitle>
        <CardBlock>Card Block</CardBlock>
      </Card>,
    );

    expect(baseElement).toBeTruthy();
  });
});
