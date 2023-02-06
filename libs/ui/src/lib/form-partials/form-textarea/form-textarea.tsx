import './form-textarea.scss';
import React, { useCallback } from 'react';

export interface FormTextareaProps {
  required?: boolean;
  name: string;
  value?: string;
  label: string;
  onChange: (name: string, value: string) => void;
}

export function FormTextarea({
  required,
  name,
  value,
  label,
  onChange,
}: FormTextareaProps) {
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(name, e.target.value);
    },
    [name, onChange],
  );

  return (
    <label>
      <span className="label label-text">{label}</span>
      <textarea
        className="textarea textarea-bordered block w-full"
        name={name}
        value={value}
        required={required}
        onChange={onInputChange}
      />
    </label>
  );
}

export default FormTextarea;
