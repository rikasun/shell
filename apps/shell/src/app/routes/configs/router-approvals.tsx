import ApprovalCollection from '../../modules/approvals/approval-collection';
import ShowApproval from '../../modules/approvals/show/show-approval';

export const routeConfigApprovalsTwoColumn = [
  {
    path: '/approvals',
    element: <ApprovalCollection />,
  },
  {
    path: '/approvals/:id',
    element: <ShowApproval />,
  },
];
