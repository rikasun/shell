import './form-radio.scss';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

export interface IRadioOption {
  label: string;
  description?: string;
  value: string;
}

export interface FormRadioProps {
  required?: boolean;
  name: string;
  value?: string;
  label: string;
  hideLabel?: boolean;
  dataTestId?: string;
  options: IRadioOption[];
  onChange: (name: string, value: string) => void;
}

export function FormRadio({
  required,
  name,
  value: initValue = '',
  label,
  hideLabel,
  options,
  onChange,
  dataTestId,
}: FormRadioProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onChange(name, e.target.value);
    },
    [name, onChange],
  );

  const labelClassName = useMemo(
    () =>
      clsx('text-fg-default font-medium', {
        'sr-only': hideLabel,
      }),
    [hideLabel],
  );

  const printOptions = useMemo(
    () =>
      options.map(({ value: v, label: l, description }) => (
        <div key={v}>
          <label>
            <input
              type="radio"
              name={name}
              value={v}
              onChange={onInputChange}
              required={required}
              checked={value === v}
            />
            <span className="ml-1.5">{l}</span>
          </label>

          <p
            className={clsx('mb-2 ml-5 text-sm text-gray-700', {
              hidden: !description,
            })}
          >
            {description}
          </p>
        </div>
      )),
    [name, onInputChange, options, required, value],
  );

  return (
    <fieldset className="space-y-1">
      <span className={labelClassName}>{label}</span>

      <div data-testid={dataTestId}>{printOptions}</div>
    </fieldset>
  );
}

export default FormRadio;
