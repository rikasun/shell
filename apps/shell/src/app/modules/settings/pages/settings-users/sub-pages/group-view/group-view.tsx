import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextBlock,
  TextTitle,
} from '@cased/ui';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStoreState, useStoreActions } from '@cased/redux';
import ReadyGuard from '../../../../../../guards/ready/ready-guard';
import SettingsTemplate, { TabId } from '../../../../settings-template';

export function GroupView() {
  const params = useParams<{ id: string }>();

  const group = useStoreState((state) => state.settings.groupDetails);
  const populate = useStoreActions(
    (state) => state.settings.populateGroupDetails,
  );

  const printTable = useMemo(() => {
    if (!group.members.length) return <TextBlock>No members yet.</TextBlock>;

    return (
      <Table>
        <TableHead>
          <TableRow display="head">
            <TableHeadCell>User</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {group.members.map(({ id, email, role }) => (
            <TableRow key={id}>
              <TableCell>{email}</TableCell>
              <TableCell>{role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }, [group]);

  const handlePopulate = useCallback(() => {
    if (!params.id) throw new Error('No ID found');
    return populate({ id: params.id });
  }, [params, populate]);

  return (
    <ReadyGuard waitFor={handlePopulate}>
      <SettingsTemplate
        activeTab={TabId.Users}
        returnButton={{
          link: '/settings/users',
          title: `Back to all groups`,
        }}
      >
        <div data-testid="group-view">
          <TextTitle>Group</TextTitle>
          <TextBlock className="text-slate-500">
            User list for {group.name}
          </TextBlock>
        </div>

        {printTable}
      </SettingsTemplate>
    </ReadyGuard>
  );
}

export default GroupView;
