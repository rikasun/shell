import { render } from '@testing-library/react';

import TextBlock from './text-block';

describe('TextBlock', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TextBlock />);
    expect(baseElement).toBeTruthy();
  });
});
