import { render } from '@testing-library/react';
import { FieldType } from '@cased/data';
import FormFields from './form-fields';

describe('FormFields', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FormFields
        type={FieldType.Text}
        onChange={() => {}}
        onDelete={() => {}}
        name="My Name"
        id="My ID"
      />,
    );

    expect(baseElement).toBeTruthy();
  });
});
