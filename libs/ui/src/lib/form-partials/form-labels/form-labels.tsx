import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from '@cased/utilities';
import clsx from 'clsx';
import { ILabel } from '@cased/data';
import Button from '../../button/button';

export interface FormLabelsProps {
  label: string;
  hideLabel?: boolean;
  name: string;
  suggestions: ILabel[];
  selections: ILabel[];

  onSearch: (name: string, text: string) => void;
  onAdd: (name: string, value: ILabel) => void;
  onRemove: (name: string, value: ILabel) => void;
}

const LOSE_FOCUS_DELAY = 100;
const SEARCH_DELAY = 500;

/**
 * This component is managed by the parent component. It is up to the parent to set the suggestions and selections. Which means onAdd, onSearch, and onRemove callbacks need to be handled.
 *
 * Having this component managed by the parent is good because it allows the state to be altered on the fly. It can also blocks failed API requests from enterting into the state.
 */
export function FormLabels({
  suggestions,
  selections,
  label: textLabel,
  hideLabel,
  name,
  onSearch: onSearchCallback,
  onAdd,
  onRemove,
}: FormLabelsProps) {
  const loseFocusDelay = useDebounce({ delay: LOSE_FOCUS_DELAY });
  const searchDelay = useDebounce({ delay: SEARCH_DELAY });

  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const onSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShowSuggestions(false);

      searchDelay?.run(() => {
        onSearchCallback(name, e.target.value);
        setShowSuggestions(true);
      });

      setValue(e.target.value);
    },
    [setValue, name, onSearchCallback, searchDelay],
  );

  const removeSelection = useCallback(
    (label: ILabel) => {
      onRemove(name, label);
    },
    [onRemove, name],
  );

  const addSelection = useCallback(
    (selection: ILabel) => {
      setShowSuggestions(false);
      setValue('');

      if (!selections.find((s) => s.id === selection.id)) {
        onAdd(name, selection);
      }
    },
    [selections, onAdd, name],
  );

  const onInputBlur = useCallback(() => {
    loseFocusDelay.run(() => setShowSuggestions(false));
  }, [loseFocusDelay]);

  const printSelections = useMemo(() => {
    if (!selections.length) return null;

    const items = selections.map((label) => (
      <li className="text-sm" key={label.id}>
        {label.text}{' '}
        <Button
          className="ml-2 px-1 py-0"
          size="small"
          onClick={() => removeSelection(label)}
        >
          Remove
        </Button>
      </li>
    ));

    return <ul className="mt-2 space-y-1.5">{items}</ul>;
  }, [selections, removeSelection]);

  const printSuggestions = useMemo(() => {
    if (!suggestions.length || !showSuggestions) return null;

    const items = suggestions.map(({ id: key, text: v }) => (
      <button
        className="block w-full p-2 text-left hover:bg-gray-300"
        onClick={() => addSelection({ id: key, text: v })}
        type="button"
        key={key}
      >
        {v}
      </button>
    ));

    return (
      <div className="absolute z-10 w-full rounded-sm border border-gray-500 bg-white">
        {items}
      </div>
    );
  }, [suggestions, addSelection, showSuggestions]);

  const labelCss = useMemo(
    () =>
      clsx('text-fg-default font-medium', {
        'sr-only': hideLabel,
      }),
    [hideLabel],
  );

  return (
    <div>
      <label className="relative block w-full space-y-1.5">
        <span className={labelCss}>{textLabel}</span>

        <input
          type="text"
          className="block w-full rounded border border-zinc-400 p-2"
          value={value}
          onChange={onSearch}
          onBlur={onInputBlur}
        />

        {printSuggestions}
      </label>

      {printSelections}
    </div>
  );
}

export default FormLabels;
