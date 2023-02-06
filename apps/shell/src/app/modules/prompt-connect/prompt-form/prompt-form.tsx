import { Button, FormInputText, TextTitle } from '@cased/ui';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ArrowUpTrayIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { nanoid } from 'nanoid';
import { IPromptForm, IPromptMoreInfoForm } from '@cased/data';
import { useStoreActions } from '@cased/redux';
import ConnectStatusBar from '../connect-status-bar/connect-status-bar';

interface IProps {
  prompt: IPromptForm;
}
export function PromptForm({ prompt }: IProps) {
  const submitForm = useStoreActions(
    (actions) => actions.promptForm.submitForm,
  );

  const [form, setForm] = useState<IPromptMoreInfoForm>({
    username: '',
    privateKey: null,
    passphrase: '',
    reason: '',
  });

  const printLabels = useMemo(
    () =>
      prompt.labels &&
      Object.entries(prompt.labels).map(([key, value]) => (
        <p
          className="text-sm text-gray-700"
          key={nanoid()}
        >{` ${key}=${value} `}</p>
      )),
    [prompt.labels],
  );

  const updateForm = useCallback(
    (key: string, value: unknown) => {
      const newForm = { ...form, [key]: value };
      setForm(newForm);
    },
    [form],
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      setForm({ ...form, privateKey: file });
    },
    [form],
  );

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      submitForm({ form });
    },
    [form, submitForm],
  );

  return (
    <div className="relative mx-auto max-w-xl space-y-12 py-10 px-4">
      <ConnectStatusBar />
      <span data-testid="prompt-form" />
      <div className="space-y-4">
        <div>
          <TextTitle size="lg">{prompt.name}</TextTitle>
          <h5>
            {prompt.description}
            {prompt.ipAddress}
            {!prompt.ipAddress &&
              prompt.hostname !== prompt.name &&
              prompt.hostname}
          </h5>
          <div className="mt-2">
            <p className="text-sm font-medium">Labels</p>
            {printLabels}
          </div>
        </div>
        <div className="bg-white">
          {prompt.needsAuthentication ? (
            <p className="border-b border-yellow-200 bg-yellow-100 p-3 text-sm font-semibold text-yellow-400">
              Additional information is required to access this host.
            </p>
          ) : (
            <p className="border-b border-green-200 bg-green-100 p-3 text-sm font-semibold text-green-400">
              {prompt.certificateAuthentication
                ? `Authenticating with SSH certificates. ${prompt.authorizationExplanation}`
                : 'Authenticating using stored credentials.'}
            </p>
          )}

          <form data-testid="prompt-form__form" onSubmit={onSubmit}>
            <div className="space-y-4 p-3">
              {(prompt.promptForUsername || !prompt.username) && (
                <FormInputText
                  name="username"
                  placeholder="Your SSH username"
                  required
                  label="Username (required)"
                  onChange={updateForm}
                />
              )}

              {(prompt.promptForKey ||
                (!prompt.keyStored && !prompt.certificateAuthentication)) && (
                <>
                  <label htmlFor="file">SSH private key</label>
                  <label className="flex w-48 cursor-pointer items-center rounded border border-zinc-400 p-2">
                    <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
                    Choose a file
                    <input
                      type="file"
                      accept=".pem,.key,.p12"
                      className="hidden"
                      name="privatekey"
                      value=""
                      onChange={handleFileUpload}
                    />
                    <input
                      type="hidden"
                      className="term"
                      name="term"
                      value="xterm-256color"
                    />
                  </label>
                  {form.privateKey && (
                    <div className="flex items-center font-mono text-sm text-gray-900">
                      <CheckCircleIcon className="mr-2 h-6 w-6 text-green-500" />{' '}
                      {form.privateKey.name}
                    </div>
                  )}
                  {(prompt.promptForKey || !prompt.sshPassphrase) && (
                    <FormInputText
                      label="Passphrase (optional)"
                      name="passphrase"
                      placeholder="Your SSH passphrase"
                      onChange={updateForm}
                    />
                  )}
                </>
              )}

              {prompt.reasonRequired && (
                <FormInputText
                  label="Please enter a reason for access"
                  name="reason"
                  placeholder="Reason for ssh access"
                  required
                  dataTestId="prompt-form__reason"
                  onChange={updateForm}
                />
              )}
            </div>
            <div className="border-t border-gray-300" />
            <Button type="submit" display="primary" className="m-3">
              <span className="flex items-center text-sm font-semibold hover:text-blue-500">
                Start session
                <ArrowTopRightOnSquareIcon className="m-1 w-4" />
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PromptForm;
