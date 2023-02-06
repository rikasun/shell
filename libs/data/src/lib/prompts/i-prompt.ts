export interface IPrompt {
  featured: boolean;
  name: string;
  description: string;
  slug: string;
  needsMoreInfo: boolean;
  ip: string;
  hostname: string;
  port: number;
  closeTerminalOnExit: boolean;
  username: string;
  labels: { [key: string]: string };
  sessionId: string;
  certificateAuthentication: boolean;
  needAccess: boolean;
  needsAuthentication: boolean;
  authorizedForAuthenticatedPrincipals: boolean;
  authorizationExplanation: string;
  approvalRequired: boolean;
}

export interface IPromptForm {
  name: string;
  slug: string;
  description: string;
  ipAddress: string;
  hostname: string;
  port: number;
  username: string;
  labels: { [key: string]: string };
  certificateAuthentication: boolean;
  needsAuthentication: boolean;
  authorizationExplanation: string;
  promptForUsername: boolean;
  promptForKey: boolean;
  keyStored: boolean;
  sshPassphrase: boolean;
  reasonRequired: boolean;
  needsMoreInfo: boolean;
  approvalRequired: boolean;
}

export interface IPromptMoreInfoForm {
  privateKey?: File | null;
  passphrase?: string;
  username?: string;
  reason?: string;
  approvalStatus?: string;
}
