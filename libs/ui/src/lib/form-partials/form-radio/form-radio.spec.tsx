import { render } from '@testing-library/react';

import FormRadio from './form-radio';

describe('FormSelect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FormRadio name="" label="" options={[]} onChange={() => {}} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
