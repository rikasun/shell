import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { SearchAddon } from 'xterm-addon-search';

type Props = {
  terminal?: Terminal;
};

const searchOptions = { incremental: false };

export default function PromptSearch({ terminal }: Props) {
  const searchAddon = useRef<SearchAddon>();
  const [matchFailed, setMatchFailed] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // istanbul ignore next
    if (!terminal) return undefined;

    searchAddon.current = new SearchAddon();
    terminal.loadAddon(searchAddon.current);

    return () => {
      searchAddon.current?.dispose();
    };
  }, [terminal]);

  const queryChanged = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    // istanbul ignore next
    if (!searchAddon.current) return;

    const { value } = event.target;
    setQuery(value);

    const success = searchAddon.current.findNext(value, {
      ...searchOptions,
      incremental: true,
    });

    // istanbul ignore next
    if (value.trim() === '') {
      setMatchFailed(false);
    } else {
      setMatchFailed(!success);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    searchAddon.current?.findNext('');
    setMatchFailed(false);
  }, []);

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <button
        className="flex cursor-pointer items-center gap-1 text-white"
        onClick={() => inputRef.current?.focus()}
      >
        <MagnifyingGlassIcon className="h-4" />
        Search
      </button>

      <div className="dropdown-content mt-2 flex w-80 rounded-md bg-white p-3">
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className={clsx(
            'w-full grow rounded-md border-[1px] px-2 py-1',
            // istanbul ignore next
            matchFailed ? 'border-red-300 outline-red-500' : 'border-gray-300',
          )}
          onChange={queryChanged}
          value={query}
        />
        <button
          disabled={matchFailed}
          className="cursor-pointer pl-2 disabled:text-gray-400"
          onClick={() =>
            searchAddon.current?.findPrevious(query, searchOptions)
          }
        >
          <ChevronUpIcon className="h-4" />
        </button>
        <button
          disabled={matchFailed}
          className="cursor-pointer pl-2 disabled:text-gray-400"
          // istanbul ignore next
          onClick={() => searchAddon.current?.findNext(query, searchOptions)}
        >
          <ChevronDownIcon className="h-4" />
        </button>
        <button className="pl-2" onClick={clearSearch}>
          <XCircleIcon className="h-4" />
        </button>
      </div>
    </div>
  );
}
