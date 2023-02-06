import { fireEvent, render } from '@testing-library/react';
import FormKeyValueCreator from './form-key-value-creator';

describe('FormKeyValueCreator', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FormKeyValueCreator
        name="My Name"
        values={[]}
        headerKey="My Key"
        headerValue="My Value"
        onChange={() => {}}
      />,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should add a label value pair when clicking Add', () => {
    const headerKey = 'My Key';

    const { getByText, getByTestId } = render(
      <FormKeyValueCreator
        name="My Name"
        values={[]}
        headerKey={headerKey}
        headerValue="My Value"
        onChange={() => {}}
      />,
    );

    fireEvent.click(getByText(`Add ${headerKey}`));

    expect(getByTestId('form-key-value-creator__label-0')).toBeTruthy();
  });
});
