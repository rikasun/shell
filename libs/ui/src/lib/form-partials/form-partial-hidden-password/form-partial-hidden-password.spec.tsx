import { act, fireEvent, render, waitFor } from '@testing-library/react';

import FormPartialHiddenPassword from './form-partial-hidden-password';

describe('FormPartialHiddenPassword', () => {
  interface IOptions {
    name?: string;
    label?: string;
    defaultValue?: string;
    onEdit?: (name: string) => void;
    onChange?: (name: string, value: string) => void;
  }

  const setup = (options: IOptions = {}) => {
    const {
      name = 'protectedPassword',
      label = 'Password',
      defaultValue = '********',
      onEdit = () => {},
      onChange = () => {},
    } = options;

    return render(
      <FormPartialHiddenPassword
        name={name}
        label={label}
        defaultValue={defaultValue}
        onEdit={onEdit}
        onChange={onChange}
      />,
    );
  };

  it('should render successfully', () => {
    const { baseElement } = setup();
    expect(baseElement).toBeTruthy();
  });

  describe('disabled state', () => {
    it('should show the default value in the input', () => {
      const defaultValue = '********';
      const label = 'Password';

      const { getByLabelText } = setup({ defaultValue });
      const input = getByLabelText(label) as HTMLInputElement;

      expect(input.value).toEqual(defaultValue);
    });

    it('should not allow editing the input area', () => {
      const label = 'Password';

      const { getByLabelText } = setup({ label });
      const input = getByLabelText(label) as HTMLInputElement;

      expect(input.disabled).toBeTruthy();
    });
  });

  describe('enabled state', () => {
    it('should trigger onEdit when clicking edit', async () => {
      const name = 'protectedPassword';
      const onEdit = jest.fn();

      const { getByText } = setup({ name, onEdit });
      const editButton = getByText('Edit');

      await act(() => {
        editButton.click();
      });

      await waitFor(() => expect(onEdit).toHaveBeenCalledWith(name));
    });

    it('should allow typing into the input after clicking edit', async () => {
      const label = 'Password';

      const { getByLabelText, getByText } = setup({ label });

      const editButton = getByText('Edit');
      await act(() => {
        editButton.click();
      });

      const input = getByLabelText(label) as HTMLInputElement;
      await waitFor(() => expect(input.disabled).toBeFalsy());
    });

    it('should trigger onChange events as the user types into the input', async () => {
      const name = 'protectedPassword';
      const label = 'Password';
      const value = 'my custom password';
      const onChange = jest.fn();

      const { getByLabelText, getByText } = setup({ name, label, onChange });

      const editButton = getByText('Edit');
      await act(() => {
        editButton.click();
      });

      const input = getByLabelText(label) as HTMLInputElement;
      fireEvent.change(input, { target: { value } });

      expect(onChange).toHaveBeenCalledWith(name, value);
    });
  });
});
