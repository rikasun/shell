import { Button, Card, CardBlock, CardTitle, FormInputText } from '@cased/ui';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStoreActions } from '@cased/redux';
import SettingsTemplate, { TabId } from '../../../../settings-template';
import { approvalPrograms } from './approval-programs';
import './new-approval.scss';

interface IForm {
  slug: string;
  description?: string;
}

export function NewApproval() {
  const [form, setForm] = useState<IForm>({ slug: '' });
  const createProgram = useStoreActions(
    (store) => store.settingsApprovals.createProgram,
  );
  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        const { id } = await createProgram({ ...form });
        navigate(`/settings/approvals/programs/${id}`);
      } catch (err) {
        console.error(err);
      }
    },
    [createProgram, form, navigate],
  );

  const updateForm = useCallback(
    (key: string, value: unknown) => {
      setForm({ ...form, [key]: value });
    },
    [form],
  );

  const printPrograms = useMemo(
    () =>
      approvalPrograms.map(({ name, image, slug }) => (
        <button
          key={slug}
          type="button"
          data-testid={`new-approval__program-${slug}`}
          onClick={() => updateForm('slug', slug)}
          className="relative cursor-pointer rounded border border-gray-400 bg-white text-center"
        >
          <img
            className="m-3 inline-block h-16 w-16 align-middle"
            src={image}
            alt={name}
          />
        </button>
      )),
    [updateForm],
  );

  return (
    <SettingsTemplate
      activeTab={TabId.Approvals}
      returnButton={{
        link: '/settings/approvals',
        title: 'Back to approvals',
      }}
    >
      <form
        data-testid="new-approval"
        className="flex flex-col space-y-4"
        onSubmit={onSubmit}
      >
        <Card>
          <CardBlock>
            <CardTitle>Commands programs for available approvals</CardTitle>
          </CardBlock>

          <CardBlock>
            <div className="grid grid-cols-3 items-center gap-4 md:grid-cols-4 lg:grid-cols-5">
              {printPrograms}
            </div>
          </CardBlock>
        </Card>

        <Card>
          <CardBlock className="flex flex-col space-y-4">
            <FormInputText
              required
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={updateForm}
              description={`The program name on Cased (${form.slug}) must match the program's name on your system PATH.`}
            />

            <FormInputText
              required
              label="Description"
              name="description"
              onChange={updateForm}
              description="e.g. MySQL Production"
            />
          </CardBlock>
        </Card>

        <div>
          <Button
            className="mr-3"
            as={<Link to="/settings/approvals" />}
            type="button"
          >
            Cancel
          </Button>

          <Button
            data-testid="new-approval__submit"
            display="primary"
            type="submit"
          >
            Create Approval Program
          </Button>
        </div>
      </form>
    </SettingsTemplate>
  );
}

export default NewApproval;
