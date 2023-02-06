import { useUniqueId } from '@cased/utilities';
import { useCallback, useMemo, useState } from 'react';
import Button from '../../button/button';

export interface FormPartialHiddenPasswordProps {
  name: string;
  label: string;
  defaultValue: string;
  onEdit: (name: string) => void;
  onChange: (name: string, value: string) => void;
}

export function FormPartialHiddenPassword({
  name,
  label,
  defaultValue,
  onEdit,
  onChange,
}: FormPartialHiddenPasswordProps) {
  const id = useUniqueId();
  const [isDisabled, setIsDisabled] = useState(true);
  const [password, setPassword] = useState(defaultValue);

  const clickEdit = useCallback(() => {
    setIsDisabled(false);
    setPassword('');
    onEdit(name);
  }, [name, onEdit]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPassword(value);
      onChange(name, value);
    },
    [name, onChange],
  );

  const printEditButton = useMemo(() => {
    if (!isDisabled) return null;

    return (
      <Button type="button" className="mr-2 flex-none" onClick={clickEdit}>
        Edit
      </Button>
    );
  }, [clickEdit, isDisabled]);

  return (
    <div className="block w-full space-y-1.5">
      <label htmlFor={id}>
        <span className="text-fg-default font-medium">{label}</span>
      </label>

      <div className="flex">
        {printEditButton}

        <input
          id={id}
          type="text"
          className="w-full flex-1 rounded border border-zinc-400 p-2"
          onChange={handleChange}
          value={password}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}

export default FormPartialHiddenPassword;
