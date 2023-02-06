import { Button, CardBlock, TextBlock } from '@cased/ui';
import { useMemo } from 'react';
import { useStoreActions, useStoreState } from '@cased/redux';
import ReadyGuard from '../../guards/ready/ready-guard';
import LogCard from '../settings/pages/settings-users/log-card/log-card';

export function ActivityLogs() {
  const logs = useStoreState((state) => state.activities.allActivities);
  const populate = useStoreActions((state) => state.activities.populateAll);
  const exportLogs = useStoreActions((state) => state.activities.exportLogs);

  const printLogs = useMemo(
    () =>
      logs.map(
        ({ email, runbook, session, location, host, ip, id, approval }) => (
          <LogCard
            key={id}
            email={email}
            location={location}
            host={host}
            ip={ip}
            runbook={runbook}
            session={session}
            approval={approval}
          />
        ),
      ),
    [logs],
  );

  return (
    <ReadyGuard waitFor={populate}>
      <span data-testid="activity-logs" />
      <div className="flex flex-col space-y-4">
        {printLogs.length > 0 && (
          <div className="text-right">
            <Button display="primary" onClick={exportLogs}>
              Export Audit Logs
            </Button>
          </div>
        )}
        {printLogs}
        {printLogs.length === 0 && (
          <CardBlock>
            <TextBlock className="text-center">No logs found</TextBlock>
          </CardBlock>
        )}
      </div>
    </ReadyGuard>
  );
}

export default ActivityLogs;
