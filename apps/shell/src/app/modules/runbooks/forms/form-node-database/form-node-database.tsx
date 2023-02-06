import './form-node-database.scss';
import { INodeActionData } from '@cased/data';
import { FormInputText, FormTextarea, FormSelect, Button } from '@cased/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStoreActions, useStoreState } from '@cased/redux';
import ConvertToSlug from '../../convert-to-slug/convert-to-slug';

export interface INodeDatabaseForm {
  name?: string;
  text?: string;
  databaseServer?: string;
}

export interface FormNodeDatabaseProps extends INodeDatabaseForm {
  onSubmit: (form: INodeActionData) => void;
}

export function FormNodeDatabase({
  name = '',
  text = '',
  databaseServer = '',
  onSubmit,
}: FormNodeDatabaseProps) {
  const { databases } = useStoreState((store) => store.runbooks);
  const markFormDirty = useStoreActions(
    (actions) => actions.runbooks.markFormDirty,
  );

  const [form, setForm] = useState({
    name,
    text,
    databaseServer,
  });

  useEffect(() => {
    setForm({
      name,
      text,
      databaseServer,
    });
  }, [name, text, databaseServer]);

  const databasesOptions = useMemo(
    () =>
      databases.map(({ id, label }) => ({
        label,
        value: id,
      })),
    [databases],
  );

  const updateForm = useCallback(
    (key: string, value: string) => {
      setForm({ ...form, [key]: value });
      markFormDirty();
    },
    [form, markFormDirty],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      onSubmit({
        name: form.name,
        database: {
          databaseServer: form.databaseServer,
          text: form.text,
        },
      });
    },
    [form, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="mb-2 divide-y">
      <div>
        <h2 className="font-bold">Basics</h2>

        <div className="overflow-x-auto">
          <pre>
            Slug: <ConvertToSlug text={form.name} />
          </pre>
        </div>

        <div className="mb-2">
          <FormInputText
            name="name"
            label="Name"
            value={form.name}
            required
            onChange={updateForm}
          />
        </div>
      </div>

      <div className="mb-2 pt-5">
        <FormSelect
          required
          name="databaseServer"
          label="Database Server"
          dataTestId="form-node-database__database-id"
          defaultOption="Select a database server"
          options={databasesOptions}
          value={form.databaseServer}
          onChange={updateForm}
        />

        <FormTextarea
          name="text"
          label="Command"
          value={form.text}
          onChange={updateForm}
        />
      </div>

      <Button display="primary" type="submit" className="block w-full">
        Save
      </Button>
    </form>
  );
}

export default FormNodeDatabase;
