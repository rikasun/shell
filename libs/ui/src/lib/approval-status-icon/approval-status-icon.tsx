import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { ApprovalStatus } from '@cased/data';

type Props = {
  status: ApprovalStatus;
  selfApproved?: boolean;
};

export function ApprovalStatusIcon({ status, selfApproved }: Props) {
  if (status === ApprovalStatus.Approved) {
    if (selfApproved) {
      return (
        <div className="flex items-center text-sm font-bold">
          <CheckCircleIcon className="mr-1 h-6 w-6 text-yellow-500" />
          Self-approved
        </div>
      );
    }

    return (
      <div className="flex items-center text-sm font-bold">
        <CheckCircleIcon className="mr-1 h-6 w-6 text-green-500" />
        Approved
      </div>
    );
  }
  if (status === ApprovalStatus.Denied) {
    return (
      <div className="flex items-center text-sm font-bold">
        <NoSymbolIcon className="mr-1 h-6 w-6 text-red-500" />
        Denied
      </div>
    );
  }
  if (status === ApprovalStatus.Cancelled) {
    return (
      <div className="flex items-center text-sm font-bold">
        <NoSymbolIcon className="mr-1 h-6 w-6 text-red-500" />
        Cancelled
      </div>
    );
  }
  if (status === ApprovalStatus.TimedOut) {
    return (
      <div className="flex items-center text-sm font-bold">
        <NoSymbolIcon className="mr-1 h-6 w-6 text-red-500" />
        Timed out
      </div>
    );
  }

  return null;
}

export default ApprovalStatusIcon;
