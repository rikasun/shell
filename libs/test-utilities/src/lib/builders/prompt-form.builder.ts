import { IPromptForm } from '@cased/data';

export class PromptFormBuilder {
  reasonRequired = false;
  approvalRequired = false;
  needsMoreInfo = false;

  build(): IPromptForm {
    return {
      name: 'demo-bastion-test',
      description: 'test description',
      needsMoreInfo: this.needsMoreInfo,
      slug: 'demo-bastion',
      hostname: '',
      port: 22,
      ipAddress: '',
      username: '',
      labels: {
        environment: 'development',
        script: 'local-run-docker',
        app: 'bastion',
      },
      certificateAuthentication: false,
      needsAuthentication: false,
      authorizationExplanation: '',
      promptForUsername: false,
      promptForKey: false,
      keyStored: false,
      sshPassphrase: false,
      reasonRequired: this.reasonRequired,
      approvalRequired: this.approvalRequired,
    };
  }

  withReasonRequired(reasonRequired: boolean): PromptFormBuilder {
    this.reasonRequired = reasonRequired;
    return this;
  }

  withApprovalRequired(approvalRequired: boolean): PromptFormBuilder {
    this.approvalRequired = approvalRequired;
    return this;
  }

  withNeedsMoreInfo(needsMoreInfo: boolean): PromptFormBuilder {
    this.needsMoreInfo = needsMoreInfo;
    return this;
  }
}
