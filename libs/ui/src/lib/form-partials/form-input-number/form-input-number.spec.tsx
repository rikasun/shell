import { fireEvent, render } from '@testing-library/react';

import FormInputNumber from './form-input-number';

describe('FormInputNumber', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FormInputNumber
        value={1}
        name="name"
        label="My Label"
        onChange={() => {}}
      />,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should emit new values', () => {
    const label = 'My Label';
    const name = 'My Name';
    const value = 2;
    const callback = jest.fn();

    const { getByLabelText } = render(
      <FormInputNumber
        value={1}
        name={name}
        label={label}
        onChange={callback}
      />,
    );

    fireEvent.change(getByLabelText(label), {
      target: { value },
    });

    expect(callback).toHaveBeenCalledWith(name, value);
  });
});
