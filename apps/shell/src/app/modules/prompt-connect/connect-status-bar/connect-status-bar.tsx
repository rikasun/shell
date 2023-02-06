import { StatusBar, TextLink, TextTitle } from '@cased/ui';
import { useStoreState } from '@cased/redux';

export function ConnectStatusBar() {
  const showApproval = useStoreState((state) => state.prompt.showApproval);
  const approvalId = useStoreState((state) => state.prompt.approvalId);
  const errorMessage = useStoreState((state) => state.prompt.message);

  return (
    <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
      <StatusBar show={showApproval} state={errorMessage ? 'error' : 'loading'}>
        {errorMessage}
        {!errorMessage && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <TextTitle>
              Approval Required...{' '}
              <TextLink to={`/approvals/${approvalId}`} targetBlank>
                click here to approve
              </TextLink>
            </TextTitle>
          </div>
        )}
      </StatusBar>
    </div>
  );
}

export default ConnectStatusBar;
