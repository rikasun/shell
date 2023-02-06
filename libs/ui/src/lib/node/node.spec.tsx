import { render } from '@testing-library/react';

import Node from './node';

describe('Node', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Node>Content</Node>);
    expect(baseElement).toBeTruthy();
  });
});
