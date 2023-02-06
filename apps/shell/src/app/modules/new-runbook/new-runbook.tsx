import { Button, FormInputText } from '@cased/ui';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStoreState, useStoreActions } from '@cased/redux';

export function NewRunbook() {
  const newRunbookId = useStoreState((store) => store.runbookNew.newRunbookId);
  const createRunbook = useStoreActions((store) => store.runbookNew.create);
  const isRunbookCreated = useStoreState((store) => store.runbookNew.isCreated);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (isRunbookCreated && newRunbookId) {
      navigate(`/runbooks/${newRunbookId}`);
    }
  }, [isRunbookCreated, navigate, newRunbookId]);

  const updateForm = useCallback(
    (key: string, value: string) => {
      setForm({ ...form, [key]: value });
    },
    [form],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      createRunbook({ runbook: form });
    },
    [form, createRunbook],
  );

  return (
    <>
      <div className="space-y-2">
        <Link to="/runbooks" className="block text-sm">
          ‹ Back to all runbooks
        </Link>
        <h2 className="text-lg">Create a new runbook</h2>
      </div>
      <div className="rounded border border-zinc-300 bg-white">
        <div className="border-b border-zinc-300 p-4 font-medium">
          Runbook details
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <FormInputText
            name="name"
            label="Name"
            required
            value={form.name}
            onChange={updateForm}
          />
          <FormInputText
            name="description"
            label="Description"
            required
            value={form.description}
            onChange={updateForm}
          />
          <Button type="submit" display="primary">
            Submit
          </Button>
        </form>
      </div>

      <span data-testid="new-runbook" />
    </>
  );
}

export default NewRunbook;
