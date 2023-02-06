import { useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { useStoreActions, useStoreState } from '@cased/redux';
import PromptForm from './prompt-form/prompt-form';

import ReadyGuard from '../../guards/ready/ready-guard';
import Prompt from '../prompt/prompt';

export default function PromptConnect() {
  const params = useParams<{ slug: string }>();
  const populate = useStoreActions((actions) => actions.promptForm.populate);
  const prompt = useStoreState((state) => state.promptForm.prompt);
  const showPromptForm = useStoreState(
    (state) => state.promptForm.showPromptForm,
  );

  const handlePopulation = useCallback(() => {
    const { slug } = params;
    // istanbul ignore next
    if (!slug) throw new Error('No slug provided');
    return populate({ slug });
  }, [populate, params]);

  if (!params.slug) throw new Error('Slug param required');

  return (
    <ReadyGuard waitFor={handlePopulation}>
      <span data-testid="prompt-connect-ready" />
      {showPromptForm ? (
        <PromptForm prompt={prompt} />
      ) : (
        <Prompt slug={params.slug} />
      )}
    </ReadyGuard>
  );
}
