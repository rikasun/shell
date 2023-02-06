import { render } from '@testing-library/react';

import FormSelect from './form-select';

describe('FormSelect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FormSelect
        name=""
        label=""
        defaultOption=""
        options={[]}
        onChange={() => {}}
      />,
    );
    expect(baseElement).toBeTruthy();
  });
});
