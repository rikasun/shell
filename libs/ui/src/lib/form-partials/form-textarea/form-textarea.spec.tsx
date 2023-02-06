import { render } from '@testing-library/react';

import FormTextarea from './form-textarea';

describe('FormTextarea', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FormTextarea name="" label="" onChange={() => {}} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
