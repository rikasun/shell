import { useEffect, useMemo } from 'react';

import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeadCell,
  TableBody,
  TableCell,
  TextDate,
} from '@cased/ui';
import { Link } from 'react-router-dom';
import { useStoreState, useStoreActions } from '@cased/redux';
import BlankRunbooksList from './blank-runbooks-list';

export function RunbooksList() {
  const state = useStoreState((store) => store.runbooksList);
  const runbooks = useStoreState((store) => store.runbooksList.runbooks);
  const populate = useStoreActions((store) => store.runbooksList.populate);

  const printRunbooksRows = useMemo(
    () => (
      <>
        {runbooks.map(({ id, name, lastRun, description }) => {
          const lastRunDate: Date | null = lastRun ? new Date(lastRun) : null;

          return (
            <TableRow key={id}>
              <TableCell>
                <Link
                  to={`/runbooks/${id}?mode=view`}
                  className="text-blue-600"
                >
                  {name}
                </Link>
              </TableCell>
              {lastRunDate ? (
                <TableCell>
                  <TextDate date={lastRunDate} /> <small>GMT</small>
                </TableCell>
              ) : (
                <TableCell>Never</TableCell>
              )}
              <TableCell>{description}</TableCell>
            </TableRow>
          );
        })}
      </>
    ),
    [runbooks],
  );

  useEffect(() => {
    if (state.isPopulateCompleted) return;
    populate();
  }, [populate, state.isPopulateCompleted]);

  if (!state.isPopulateCompleted) {
    return null;
  }

  return (
    <>
      <div>
        <Button
          className="mb-3"
          display="primary"
          as={<Link to="/runbooks/new" />}
        >
          New Runbook
        </Button>
      </div>
      {runbooks.length > 0 && (
        <Table className="w-full">
          <TableHead>
            <TableRow display="head">
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Last run</TableHeadCell>
              <TableHeadCell>Description</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="bg-white">{printRunbooksRows}</TableBody>
        </Table>
      )}
      {runbooks.length === 0 && <BlankRunbooksList />}
      <span data-testid="runbooks-list" />
    </>
  );
}

export default RunbooksList;
