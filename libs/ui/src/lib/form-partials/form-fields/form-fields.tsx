import { FieldType, INodeForm } from '@cased/data';
import { useCallback, useMemo, useState } from 'react';
import Button from '../../button/button';
import FormInputText from '../form-input-text/form-input-text';
import FormKeyValueCreator from '../form-key-value-creator/form-key-value-creator';
import FormSelect from '../form-select/form-select';
import './form-fields.scss';

export interface FormFieldsProps extends INodeForm {
  onChange: (value: INodeForm) => void;
  onDelete: () => void;
}

export function FormFields({
  name,
  id,
  type,
  options = [],
  onChange,
  onDelete,
}: FormFieldsProps) {
  const [form, setForm] = useState({
    name,
    id,
    type,
    options,
  });

  const onInputChange = useCallback(
    (key: string, value: unknown) => {
      const newForm = { ...form, [key]: value };
      setForm(newForm);
      onChange(newForm);
    },
    [onChange, form],
  );

  const printOptionName = useMemo(() => {
    if (form.type === FieldType.Dropdown) {
      return <h3>Drowdown Options</h3>;
    }

    if (form.type === FieldType.Radio) {
      return <h3>Radio Options</h3>;
    }

    return null;
  }, [form]);

  const printFormKeyValueCreator = useMemo(() => {
    if (form.type === FieldType.Text) return null;

    return (
      <FormKeyValueCreator
        name="options"
        values={form.options}
        headerKey="Label"
        headerValue="Value"
        onChange={(key, value) => onInputChange(key, value)}
      />
    );
  }, [form, onInputChange]);

  return (
    <div className="space-y-2">
      <FormInputText
        name="name"
        label="Field Name"
        value={name}
        required
        onChange={(key, value) => {
          onInputChange(key, value);
        }}
      />

      <FormSelect
        name="type"
        label="Field Type"
        value={type}
        required
        options={[
          { label: 'Text', value: FieldType.Text },
          { label: 'Dropdown', value: FieldType.Dropdown },
          { label: 'Radio', value: FieldType.Radio },
        ]}
        onChange={(key, value) => {
          onInputChange(key, value);
        }}
      />

      {printOptionName}
      {printFormKeyValueCreator}

      <Button
        className="d-block w-full"
        type="button"
        display="danger"
        size="small"
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
}

export default FormFields;
