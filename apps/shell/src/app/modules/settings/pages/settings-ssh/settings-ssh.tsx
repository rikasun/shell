import {
  Card,
  CardBlock,
  CardTitle,
  Code,
  FormInputCheckbox,
  TextBlock,
} from '@cased/ui';
import { useMemo } from 'react';
import { useStoreState, useStoreActions } from '@cased/redux';
import { ReactComponent as IconInfo } from './icon-info.svg';
import SettingsTemplate, { TabId } from '../../settings-template';
import './settings-ssh.scss';
import ReadyGuard from '../../../../guards/ready/ready-guard';

export function SettingsSsh() {
  const ssh = useStoreState((state) => state.settings.ssh);
  const certificateAuthority = useStoreState(
    (state) => state.settings.certificateAuthority,
  );
  const showSshConfig = useStoreState(
    (store) => store.settings.certificateAuthentication,
  );

  const populate = useStoreActions((actions) => actions.settings.populateShell);
  const setSshConfig = useStoreActions(
    (actions) => actions.settings.setCertificateAuthentication,
  );

  const checkboxSubtext = useMemo(() => {
    if (showSshConfig) return 'Disable to revert to SSH key authentication.';
    if (certificateAuthority)
      return "Enable to use your organization's Certificate Authority to generate single use certificates for each connection.";

    return 'Enable to generate an org-wide Certificate Authority and use it to generate single use certificates for each connection.';
  }, [showSshConfig, certificateAuthority]);

  // Easier to print here than in the JSX due to prettier and quotation mark chaos
  const printHostLoginSingleUserInstructions = useMemo(
    () =>
      // prettier-ignore
      `echo 'cert-authority,principals="${ssh.principalName}" ${ssh.publicKey.trim()}' >> ~/.ssh/authorized_keys`,
    [ssh],
  );

  const printSshConfig = useMemo(() => {
    if (!showSshConfig) return null;

    return (
      <div
        data-testid="settings-ssh__ca-text"
        className="flex flex-col space-y-4"
      >
        <TextBlock>
          Your organization-wide Certificate Authority TextBlockublic Key:
        </TextBlock>

        <Code>{ssh.publicKey}</Code>

        <TextBlock>
          To configure a host to allow any member of your organization to log in
          as any user:
        </TextBlock>

        <Code>{ssh.instructionText}</Code>

        <TextBlock>
          To configure a host to allow any user of your org to login as a single
          user:
        </TextBlock>

        <Code>{printHostLoginSingleUserInstructions}</Code>
      </div>
    );
  }, [showSshConfig, printHostLoginSingleUserInstructions, ssh]);

  return (
    <ReadyGuard waitFor={populate}>
      <div data-testid="settings-ssh">
        <SettingsTemplate activeTab={TabId.Ssh}>
          <Card>
            <CardBlock>
              <CardTitle subtitle="Setup your preferred SSH configuration and SSH certificates">
                Configure SSH
              </CardTitle>
            </CardBlock>

            <CardBlock className="flex flex-col space-y-5">
              <FormInputCheckbox
                label="Enable Certificate Authentication"
                description={checkboxSubtext}
                value={showSshConfig}
                onChange={(_, value) => setSshConfig({ enable: value })}
              />

              {printSshConfig}
            </CardBlock>
          </Card>

          <Card>
            <CardBlock>
              <TextBlock>
                <IconInfo className="mr-2 inline-block w-6" />
                <small>
                  Your Cased Shell instance is using{' '}
                  <a href="https://docs.cased.com/cased-documentation/web-shell/host-and-container-auto-detection">
                    host and container auto-detection
                  </a>{' '}
                  to manage the list of available prompts.
                </small>
              </TextBlock>
            </CardBlock>
          </Card>
        </SettingsTemplate>
      </div>
    </ReadyGuard>
  );
}

export default SettingsSsh;
