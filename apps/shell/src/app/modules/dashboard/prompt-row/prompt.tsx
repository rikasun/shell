import { Button, TextTitle } from '@cased/ui';
import { useDebounce } from '@cased/utilities';
import { clsx } from 'clsx';
import { nanoid } from 'nanoid';
import React, { useCallback, useMemo } from 'react';
import { useStoreActions } from '@cased/redux';

export interface IPromptForm {
  name: string;
  description: string;
  slug: string;
  needsMoreInfo: boolean;
  ip?: string;
  hostname?: string;
  labels?: [string, string][];
  certificateAuthentication?: boolean;
  needAccess: boolean;
  needsAuthentication?: boolean;
  authorizedForAuthenticatedPrincipals?: boolean;
  authorizationExplanation?: string;
  approvalRequired: boolean;
}

export interface IPromptProps extends IPromptForm {
  connect: (
    e: React.FormEvent,
    needsMoreInfo: boolean,
    slug: string,
    approvalRequired: boolean,
  ) => void;
}

const SEARCH_DELAY = 500;

export function Prompt({
  name,
  description,
  ip,
  hostname,
  labels,
  certificateAuthentication,
  needAccess,
  needsAuthentication,
  authorizedForAuthenticatedPrincipals,
  authorizationExplanation,
  slug,
  needsMoreInfo,
  approvalRequired,
  connect,
}: IPromptProps) {
  const debounce = useDebounce({ delay: SEARCH_DELAY });
  const setSearch = useStoreActions((actions) => actions.dashboard.setSearch);
  const filterPrompts = useStoreActions(
    (actions) => actions.dashboard.filterPrompts,
  );

  const printTags = useMemo(() => {
    if (needsAuthentication) {
      return (
        <div className="label mr-2 inline-block rounded border border-yellow-300 bg-yellow-100 px-2 py-1 text-center text-xs text-yellow-500">
          auth required
        </div>
      );
    }
    return (
      <div
        className="label mr-2 inline-block rounded border border-green-300 bg-green-100 px-2 py-1 text-center text-xs text-green-500"
        title={authorizationExplanation}
      >
        {certificateAuthentication &&
          (authorizedForAuthenticatedPrincipals ? '✓' : 'ssh certs')}
        {!certificateAuthentication && 'creds stored'}
      </div>
    );
  }, [
    authorizationExplanation,
    authorizedForAuthenticatedPrincipals,
    certificateAuthentication,
    needsAuthentication,
  ]);

  const startSessionButton = useMemo(() => {
    if (needAccess) {
      return (
        <div className="start block w-full items-center text-sm font-semibold text-gray-700">
          No Access
        </div>
      );
    }
    return (
      <button
        type="submit"
        className="start block w-full pl-3"
        data-testid={`prompt__start-session-${slug}`}
      >
        <span className="flex items-center text-sm font-semibold hover:text-blue-500">
          Start session
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </span>
      </button>
    );
  }, [needAccess, slug]);

  const onLabelsSelect = useCallback(
    (q: string) => {
      debounce?.run(() => {
        filterPrompts({ q });
      });

      setSearch({ search: q });
    },
    [debounce, filterPrompts, setSearch],
  );

  const printLabels = useMemo(
    () =>
      labels &&
      labels.map(([key, value]) => (
        <Button
          className="py-0 pl-1 text-blue-500 hover:text-blue-700"
          display="link"
          onClick={() => onLabelsSelect?.(`${key}=${value}`)}
          key={nanoid()}
        >
          {`${key}=${value}`}
        </Button>
      )),
    [labels, onLabelsSelect],
  );

  return (
    <div
      className={clsx(
        'border-t border-zinc-300 px-4 py-2 first-of-type:border-t-0 ',
        { 'cursor-not-allowed opacity-50': needAccess },
      )}
    >
      <form
        className="prompt h-full w-full"
        onSubmit={(e) => connect(e, needsMoreInfo, slug, approvalRequired)}
      >
        <div className="grid h-20 grid-cols-12 items-center gap-6">
          <div className="col-span-5">
            <TextTitle size="lg">{name}</TextTitle>
            <p className="truncate  text-gray-600 hover:text-clip hover:whitespace-normal">
              {description}
              {ip}
              {!ip && hostname !== name && hostname}
            </p>
          </div>

          <p className="text-ellipse col-span-3 ml-2 truncate text-sm hover:text-clip hover:whitespace-normal">
            Labels:
            {printLabels}
          </p>

          <div className="col-span-2 text-center">{printTags}</div>

          <div
            className="align-right col-span-2"
            data-testid="prompt__start-session-button"
          >
            {startSessionButton}
          </div>
        </div>
      </form>
    </div>
  );
}

export default Prompt;
