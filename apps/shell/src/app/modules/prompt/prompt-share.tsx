import { Button } from '@cased/ui';
import {
  CheckIcon,
  ShareIcon,
  Square2StackIcon,
} from '@heroicons/react/20/solid';
import { useCallback, useState } from 'react';
import { useStoreState } from '@cased/redux';

export default function PromptShare() {
  const [copied, setCopied] = useState(false);
  const url = useStoreState((state) => {
    if (!state.prompt.promptSessionId) return undefined;

    if (!state.prompt.promptSessionId.match(/^[a-z0-9-]+$/))
      throw new Error(
        `Invalid prompt session ID ${state.prompt.promptSessionId}`,
      );

    const shareUrl = new URL(window.location.href);
    shareUrl.pathname = `/prompts/share/${state.prompt.promptSessionId}`;
    return shareUrl.href;
  });

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(url || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <button className="flex cursor-pointer items-center gap-1 text-white">
        <ShareIcon className="h-4" />
        Share
      </button>
      <div className="dropdown-content mt-2 w-80 rounded-md bg-white p-3">
        <p className="mb-4 text-sm text-gray-600">
          Copy shareable link to this terminal session.
        </p>

        {!url && (
          <p className="text-sm text-gray-600">
            You must be connected to a terminal session to share.
          </p>
        )}

        {url && (
          <div className="flex rounded-md border-[1px] border-gray-300">
            <input
              readOnly
              className="grow rounded-md border-none px-2 py-1 outline-none"
              defaultValue={url}
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="flex justify-end">
              <Button
                display="link"
                className="relative rounded-none border-l-[1px]  py-0"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <CheckIcon className="h-4 text-green-500" />
                ) : (
                  <Square2StackIcon className="h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
