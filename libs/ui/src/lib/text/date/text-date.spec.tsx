import { render } from '@testing-library/react';

import { TextDate } from './text-date';

describe('Date', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TextDate date={new Date()} />);
    expect(baseElement).toBeTruthy();
  });
});
