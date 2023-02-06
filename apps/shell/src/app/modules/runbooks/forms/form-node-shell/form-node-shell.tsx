import './form-node-shell.scss';
import { INodeActionData } from '@cased/data';
import { FormInputText, FormTextarea, FormSelect, Button } from '@cased/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStoreActions, useStoreState } from '@cased/redux';
import ConvertToSlug from '../../convert-to-slug/convert-to-slug';

export interface INodeShellForm {
  name?: string;
  text?: string;
  prompt?: string;
}

export interface FormNodeShellProps extends INodeShellForm {
  onSubmit: (form: INodeActionData) => void;
}

export function FormNodeShell({
  name = '',
  text = '',
  prompt = '',
  onSubmit,
}: FormNodeShellProps) {
  const { prompts } = useStoreState((store) => store.runbooks);
  const markFormDirty = useStoreActions(
    (actions) => actions.runbooks.markFormDirty,
  );
  const [form, setForm] = useState({
    name,
    text,
    prompt,
  });

  useEffect(() => {
    setForm({
      name,
      text,
      prompt,
    });
  }, [name, text, prompt]);

  const promptOptions = useMemo(
    () =>
      prompts.map(({ slug }) => ({
        label: slug,
        value: slug,
      })),
    [prompts],
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
        shell: {
          prompt: form.prompt,
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
          name="prompt"
          label="Prompt"
          defaultOption="Select a prompt"
          dataTestId="form-node-shell__provider-slug"
          options={promptOptions}
          value={form.prompt}
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

export default FormNodeShell;
