import { render } from '@testing-library/react';

import TextTitle from './text-title';

describe('TextTitle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TextTitle />);
    expect(baseElement).toBeTruthy();
  });
});
