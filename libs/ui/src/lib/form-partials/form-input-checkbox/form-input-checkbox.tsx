import { useCallback, useState } from 'react';
import './form-input-checkbox.scss';

export interface FormInputCheckboxProps {
  label: string;
  description: string;
  name?: string;
  value?: boolean;
  dataTestId?: string;

  onChange: (name: string, value: boolean) => void;
}

export function FormInputCheckbox({
  label,
  name = '',
  description,
  dataTestId,
  value: initValue = false,
  onChange,
}: FormInputCheckboxProps) {
  const [value, setValue] = useState(initValue);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.checked;
      setValue(val);
      onChange(name, val);
    },
    [name, onChange],
  );

  return (
    <div className="checkbox-group">
      <label>
        <input
          data-testid={dataTestId}
          checked={value}
          type="checkbox"
          className="mr-2"
          onChange={onInputChange}
        />

        <span className="font-semibold">{label}</span>
      </label>

      <p className="label-detail ml-6 text-sm text-slate-700">{description}</p>
    </div>
  );
}

export default FormInputCheckbox;
