import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { IFormOption } from '@cased/data';
import Button from '../../button/button';
import './form-key-value-creator.scss';

export interface FormKeyValueCreatorProps {
  name: string;
  values: IFormOption[];
  headerKey: string;
  headerValue: string;
  onChange: (name: string, values: IFormOption[]) => void;
}

export function FormKeyValueCreator({
  values,
  headerKey,
  headerValue,
  name,
  onChange,
}: FormKeyValueCreatorProps) {
  const [keyValues, setKeyValues] = useState<IFormOption[]>(values);

  useEffect(() => {
    setKeyValues(values);
  }, [values]);

  const setIndex = useCallback(
    (index: number, label: string, value: string) => {
      const newKeyValues = [...keyValues];
      newKeyValues[index] = { ...newKeyValues[index], [label]: value };

      setKeyValues(newKeyValues);
      onChange(name, [...newKeyValues]);
    },
    [keyValues, name, onChange],
  );

  const deleteEntry = useCallback(
    (index: number) => {
      const newKeyValues = [...keyValues];
      newKeyValues.splice(index, 1);

      setKeyValues(newKeyValues);
      onChange(name, [...newKeyValues]);
    },
    [keyValues, onChange, name],
  );

  const add = useCallback(() => {
    const newKeyValues = [...keyValues, { id: nanoid(), label: '', value: '' }];
    setKeyValues(newKeyValues);

    onChange(name, newKeyValues);
  }, [keyValues, name, onChange]);

  return (
    <>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-sm">{headerKey}</th>
            <th colSpan={2} className="text-left text-sm">
              {headerValue}
            </th>
          </tr>
        </thead>
        <tbody>
          {keyValues.map(({ label, value, id }, index) => (
            <tr key={id}>
              <td>
                <input
                  data-testid={`form-key-value-creator__label-${index}`}
                  type="text"
                  className="w-full rounded border border-zinc-400 text-sm"
                  value={label}
                  required
                  onChange={(e) => {
                    setIndex(index, 'label', e.target.value);
                  }}
                />
              </td>
              <td>
                <input
                  data-testid={`form-key-value-creator__value-${index}`}
                  type="text"
                  className="w-full rounded border border-zinc-400 text-sm"
                  value={value}
                  onChange={(e) => {
                    setIndex(index, 'value', e.target.value);
                  }}
                />
              </td>
              <td>
                <Button
                  type="button"
                  display="link"
                  size="small"
                  onClick={() => deleteEntry(index)}
                >
                  X
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        type="button"
        display="default"
        outline
        size="small"
        onClick={() => add()}
      >
        Add {headerKey}
      </Button>
    </>
  );
}

export default FormKeyValueCreator;
