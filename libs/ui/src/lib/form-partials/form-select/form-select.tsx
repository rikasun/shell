import './form-select.scss';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export interface FormSelectProps {
  required?: boolean;
  name: string;
  value?: string;
  label: string;
  defaultOption?: string;
  dataTestId?: string;
  options: { value: string; label: string }[];
  onChange: (name: string, value: string) => void;
}

export function FormSelect({
  required,
  name,
  value: initValue = '',
  label,
  options,
  defaultOption,
  onChange,
  dataTestId,
}: FormSelectProps) {
  const [value, setValue] = useState(initValue);

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setValue(e.target.value);
      onChange(name, e.target.value);
    },
    [name, onChange],
  );

  const printOptions = useMemo(
    () =>
      options.map(({ value: v, label: l }) => (
        <option key={l} value={v}>
          {l}
        </option>
      )),
    [options],
  );

  const printDefaultOption = useMemo(() => {
    if (!defaultOption) return null;
    return (
      <option disabled key="default" value="">
        {defaultOption}
      </option>
    );
  }, [defaultOption]);

  return (
    <label className="block w-full space-y-1.5">
      <span className="text-fg-default font-medium">{label}</span>

      <select
        className="block w-full rounded border border-zinc-400 p-2"
        onChange={onInputChange}
        required={required}
        value={value}
        data-testid={dataTestId}
      >
        {printDefaultOption}
        {printOptions}
      </select>
    </label>
  );
}

export default FormSelect;
