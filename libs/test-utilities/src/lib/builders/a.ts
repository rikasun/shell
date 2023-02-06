import { ApprovalProgramBuilder } from './approval-program.builder';
import { ApiProviderBuilder } from './api-provider.builder';
import { ApprovalBuilder } from './approval.builder';
import { BlockDatabaseBuilder } from './block-database.builder';
import { BlockFormBuilder } from './block-form.builder';
import { BlockRestBuilder } from './block-rest.builder';
import { BlockShellBuilder } from './block-shell.builder';
import { BlockTextBuilder } from './block-text.builder';
import { SettingsReponseBuilder } from './settings-response.builder';
import { RunbookDatabaseBuilder } from './runbook-database.builder';
import { UserBuilder } from './user.builder';
import { PromptFormBuilder } from './prompt-form.builder';

export class A {
  static apiProvider() {
    return new ApiProviderBuilder();
  }

  static runbookDatabase() {
    return new RunbookDatabaseBuilder();
  }

  static blockForm() {
    return new BlockFormBuilder();
  }

  static blockRest() {
    return new BlockRestBuilder();
  }

  static blockDatabase() {
    return new BlockDatabaseBuilder();
  }

  static blockShell() {
    return new BlockShellBuilder();
  }

  static blockText() {
    return new BlockTextBuilder();
  }

  static settingsResponse() {
    return new SettingsReponseBuilder();
  }

  static approval() {
    return new ApprovalBuilder();
  }

  static approvalProgram() {
    return new ApprovalProgramBuilder();
  }

  static user() {
    return new UserBuilder();
  }

  static promptForm() {
    return new PromptFormBuilder();
  }
}
