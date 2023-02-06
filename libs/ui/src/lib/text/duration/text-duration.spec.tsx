import { render } from '@testing-library/react';

import TextDuration from './text-duration';

describe('TextDuration', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TextDuration begin={new Date()} end={new Date()} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
