import { render } from '@testing-library/react';

import Ide from './ide';

describe('Ide', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Ide mode="json" code="" onChange={() => {}} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
