import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';

export interface FormInputNumberProps {
  required?: boolean;
  name: string;
  description?: string;
  value?: number;
  label: string;
  placeholder?: string;
  hideLabel?: boolean;
  className?: string;
  dataTestId?: string;

  onChange: (name: string, value: number) => void;
}

export function FormInputNumber({
  required,
  name,
  description,
  value,
  label,
  placeholder,
  hideLabel,
  className: initClassName,
  dataTestId,
  onChange,
}: FormInputNumberProps) {
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(name, parseInt(e.target.value, 10) || 0);
    },
    [name, onChange],
  );

  const className = useMemo(
    () => `${initClassName} space-y-1.5 block w-full`,
    [initClassName],
  );

  const labelClassName = useMemo(
    () =>
      clsx('text-fg-default font-medium', {
        'sr-only': hideLabel,
      }),
    [hideLabel],
  );

  const printDescription = useMemo(
    () => <p className="mt-2 text-sm text-gray-700">{description}</p>,
    [description],
  );

  return (
    <div>
      <label className={className}>
        <span className={labelClassName}>{label}</span>
        <input
          type="number"
          data-testid={dataTestId}
          placeholder={placeholder}
          className="block w-full rounded border border-zinc-400 p-2"
          name={name}
          value={value}
          required={required}
          onChange={onInputChange}
        />
      </label>

      {printDescription}
    </div>
  );
}

export default FormInputNumber;
