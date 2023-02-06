import { ComponentMeta } from '@storybook/react';
import { useState } from 'react';
import { FormLabels, ILabel } from './form-labels';

export default {
  component: FormLabels,
  title: 'Form Partials/Input Suggestion Labels',
  argTypes: {
    onValueChange: { action: 'onValueChange' },
    onSearch: { action: 'onSearch' },
  },
} as ComponentMeta<typeof FormLabels>;

export const ShowSuggestionsAfterTyping = ({ ...args }) => {
  const [suggestions, setSuggestions] = useState<ILabel[]>([]);
  const [selections, setSelections] = useState<ILabel[]>([]);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <FormLabels
        {...args}
        name="my-labels-id"
        label="Show Suggestions When Typing"
        suggestions={suggestions}
        selections={selections}
        onAdd={(_, label) => setSelections([...selections, label])}
        onRemove={(_, label) =>
          setSelections(selections.filter((l) => l.id !== label.id))
        }
        onSearch={() => {
          setSuggestions([
            { id: '1', text: 'One' },
            { id: '2', text: 'Two' },
            { id: '3', text: 'Three' },
          ]);
        }}
      />

      <p>Note: Duplicate suggestions will be skipped when added</p>
    </form>
  );
};

export const ShowSuggestionsByDefault = ({ ...args }) => {
  const [selections, setSelections] = useState<ILabel[]>([]);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <FormLabels
        {...args}
        name="my-labels-id"
        label="Show Suggestions When Typing"
        suggestions={[]}
        selections={selections}
        onAdd={(_, label) => setSelections([...selections, label])}
        onRemove={(_, label) =>
          setSelections(selections.filter((l) => l.id !== label.id))
        }
        onSearch={() => {}}
      />

      <p>Note: Duplicate suggestions will be skipped when added</p>
    </form>
  );
};
