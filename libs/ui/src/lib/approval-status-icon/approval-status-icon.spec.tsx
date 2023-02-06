import { render } from '@testing-library/react';
import { ApprovalStatus } from '@cased/data';

import ApprovalStatusIcon from './approval-status-icon';

describe('ApprovalStatusIcon', () => {
  it('renders all ApprovalStatus states successfully', () => {
    Object.values(ApprovalStatus).forEach((status) => {
      const { baseElement } = render(
        <ApprovalStatusIcon status={status} selfApproved />,
      );
      expect(baseElement).toBeTruthy();
    });
  });

  it('renders nothing when an unknown status is given', () => {
    const { baseElement } = render(
      <ApprovalStatusIcon status={'🦧' as ApprovalStatus} selfApproved />,
    );
    expect(baseElement.textContent).toBe('');
  });
});
