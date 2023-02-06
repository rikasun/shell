import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { A } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import PromptForm from './prompt-form';

describe('Prompt Form', () => {
  const prompt = A.promptForm().withReasonRequired(true).build();

  const setup = async () => {
    const result = render(
      <StoreProvider store={getMockStore()}>
        <PromptForm prompt={prompt} />
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => result.getByTestId('prompt-form'));

    return result;
  };
  it('should render successfully', async () => {
    const { getByTestId } = await setup();

    const form = getByTestId('prompt-form__form');
    expect(form).toBeTruthy();
  });

  it('should render the reason field', async () => {
    const { getByTestId } = await setup();

    const reason = getByTestId('prompt-form__reason');
    expect(reason).toBeTruthy();
  });

  it('should print labels of the prompt', async () => {
    const { getByText } = await setup();

    expect(getByText('environment=development')).toBeTruthy();
  });

  it('should not print the labels that not exist', async () => {
    const { queryByText } = await setup();

    expect(queryByText('app=demo-worker')).toBeFalsy();
  });
});
