import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';

export interface FormInputTextProps {
  required?: boolean;
  name: string;
  description?: string;
  value?: string;
  label: string;
  placeholder?: string;
  hideLabel?: boolean;
  className?: string;
  dataTestId?: string;
  autoComplete?: 'on' | 'off';
  type?: 'text' | 'password' | 'email';

  onChange: (name: string, value: string) => void;
}

export function FormInputText({
  required,
  name,
  description,
  value,
  label,
  placeholder,
  hideLabel,
  className: initClassName,
  dataTestId,
  autoComplete = 'off',
  type = 'text',
  onChange,
}: FormInputTextProps) {
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(name, e.target.value);
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
    () =>
      description ? (
        <p className="mt-2 text-sm text-gray-700">{description}</p>
      ) : null,
    [description],
  );

  return (
    <div>
      <label className={className}>
        <span className={labelClassName}>{label}</span>
        <input
          type={type}
          data-testid={dataTestId}
          placeholder={placeholder}
          className="block w-full rounded border border-zinc-400 p-2"
          name={name}
          value={value}
          required={required}
          onChange={onInputChange}
          autoComplete={autoComplete}
        />
      </label>

      {printDescription}
    </div>
  );
}

export default FormInputText;
