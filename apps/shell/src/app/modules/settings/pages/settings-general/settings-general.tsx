import { Card, CardBlock, CardTitle, FormInputCheckbox } from '@cased/ui';

import { useStoreActions, useStoreState } from '@cased/redux';
import SettingsTemplate, { TabId } from '../../settings-template';
import { GithubConnection } from './github-conenction/github-connection';

import ReadyGuard from '../../../../guards/ready/ready-guard';

/**
 * Conversion of page shell/templates/v2/pages/settings.html
 */
export function SettingsGeneral() {
  const reasonRequired = useStoreState(
    (state) => state.settings.shell.reasonRequired,
  );
  const recordOutput = useStoreState(
    (state) => state.settings.shell.recordOutput,
  );

  const populate = useStoreActions((actions) => actions.settings.populateShell);
  const setReasonRequired = useStoreActions(
    (actions) => actions.settings.setReasonRequired,
  );
  const setRecordOutput = useStoreActions(
    (actions) => actions.settings.setRecordOutput,
  );

  return (
    <ReadyGuard waitFor={populate}>
      <div data-testid="settings-general">
        <SettingsTemplate activeTab={TabId.General}>
          <Card>
            <CardBlock>
              <CardTitle subtitle="Third-party connections">
                Connections
              </CardTitle>
            </CardBlock>

            <CardBlock>
              <GithubConnection />
            </CardBlock>
          </Card>

          <Card>
            <CardBlock>
              <CardTitle>Shell Settings</CardTitle>
            </CardBlock>

            <CardBlock>
              <form className="space-y-4">
                <FormInputCheckbox
                  dataTestId="settings-general__reason-required"
                  label="Reason required"
                  description="A reason must be provided before prompt sessions can be connected."
                  name="reasonRequired"
                  value={reasonRequired}
                  onChange={(_, value) =>
                    setReasonRequired({ required: value })
                  }
                />

                {/* Should be some sort of container wrapper for all the sections instead to standardize this */}
                <div className="-mx-4 h-px bg-gray-300" />

                <FormInputCheckbox
                  dataTestId="settings-general__record-output"
                  label="Record output"
                  name="recordOutput"
                  description="Have a history of what happened during the approved session."
                  value={recordOutput}
                  onChange={(_, value) => setRecordOutput({ record: value })}
                />
              </form>
            </CardBlock>
          </Card>
        </SettingsTemplate>
      </div>
    </ReadyGuard>
  );
}

export default SettingsGeneral;
