import { CardCrud } from '@cased/ui';
import { useCallback, useMemo } from 'react';
import { useStoreState, useStoreActions } from '@cased/redux';
import ReadyGuard from '../../../../guards/ready/ready-guard';
import SettingsTemplate, { TabId } from '../../settings-template';

export function SettingsApprovals() {
  const programs = useStoreState((state) => state.settingsApprovals.programs);
  const access = useStoreState((state) => state.settingsApprovals.access);

  const populate = useStoreActions((state) => state.settingsApprovals.populate);
  const deleteProgram = useStoreActions(
    (state) => state.settingsApprovals.deleteProgram,
  );

  const transformedPrograms = useMemo(
    () =>
      programs.map(({ id, name }) => ({
        id,
        name,
      })),
    [programs],
  );

  const transformedAccess = useMemo(
    () =>
      access.map(({ id, name }) => ({
        id,
        name,
      })),
    [access],
  );

  const clickDeleteProgramApproval = useCallback(
    (targetId: string) => {
      const id = targetId;

      /* istanbul ignore next */
      if (!id) throw new Error('Failed to find program approval deletion ID');

      deleteProgram({ id });
    },
    [deleteProgram],
  );

  return (
    <ReadyGuard waitFor={populate}>
      <SettingsTemplate activeTab={TabId.Approvals}>
        <CardCrud
          title="Program Approvals"
          baseUrl="/settings/approvals/programs"
          items={transformedPrograms}
          onDelete={clickDeleteProgramApproval}
          newItemName="Program"
        />

        <CardCrud
          title="Access Approvals"
          baseUrl="/settings/approvals/access"
          items={transformedAccess}
        />

        <span data-testid="program-approvals" />
      </SettingsTemplate>
    </ReadyGuard>
  );
}

export default SettingsApprovals;
