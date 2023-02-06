import { IPrompt } from '@cased/data';
import type { IPromptAPIResponse } from './prompt-service';

export const transformPrompts = (prompts: IPromptAPIResponse[]): IPrompt[] =>
  prompts.map((prompt) => ({
    featured: prompt.featured,
    name: prompt.name,
    description: prompt.description,
    slug: prompt.slug,
    needsMoreInfo: prompt.needs_more_info,
    ip: prompt.ip_address,
    hostname: prompt.hostname,
    port: prompt.port,
    closeTerminalOnExit: prompt.close_terminal_on_exit,
    username: prompt.username,
    labels: prompt.labels,
    sessionId: prompt.session_id,
    certificateAuthentication: prompt.certificate_authentication,
    needAccess: prompt.need_access,
    needsAuthentication: prompt.needs_authentication,
    authorizedForAuthenticatedPrincipals:
      prompt.authorized_for_authenticated_principals,
    authorizationExplanation: prompt.authorization_explanation,
    approvalRequired: prompt.approval_required,
  }));
