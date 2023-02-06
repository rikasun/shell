import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { promptService } from '@cased/remotes';
import { act } from 'react-dom/test-utils';
import PromptDownload from './prompt-download';

describe('PromptDownload', () => {
  beforeAll(() => {
    // This prevents the "Error: Not implemented: navigation (except hash changes)"
    // console error. https://stackoverflow.com/questions/65402808/jest-error-not-implemented-navigation-except-hash-changes-when-click-event
    HTMLAnchorElement.prototype.click = jest.fn();
  });

  it('renders', async () => {
    render(<PromptDownload promptSlug="slug" />);
  });

  it('downloads a file', async () => {
    const postSpy = jest
      .spyOn(promptService, 'download')
      .mockResolvedValue('data');

    // Jest doesn't know about URL.createObjectURL
    global.URL.createObjectURL = jest.fn();

    const { findByText, findByTestId } = render(
      <PromptDownload promptSlug="slug" />,
    );

    const button = await findByText('Download');
    const input = (await findByTestId(
      'prompt-download__filepath',
    )) as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: '/var/something.txt' } });
      button.click();
    });

    await findByText('Downloading...');

    await waitFor(() =>
      expect(postSpy).toHaveBeenCalledWith('/var/something.txt', 'slug'),
    );
  });

  it('downloads a file on `enter` keystroke', async () => {
    const postSpy = jest
      .spyOn(promptService, 'download')
      .mockResolvedValue('data');

    // Jest doesn't know about URL.createObjectURL
    global.URL.createObjectURL = jest.fn();

    const { findByText, findByTestId } = render(
      <PromptDownload promptSlug="slug" />,
    );

    const input = (await findByTestId(
      'prompt-download__filepath',
    )) as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: '/var/something.txt' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });

    await findByText('Downloading...');

    await waitFor(() =>
      expect(postSpy).toHaveBeenCalledWith('/var/something.txt', 'slug'),
    );
  });

  it('handles errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest
      .spyOn(promptService, 'download')
      .mockRejectedValue(new Error('This is a test.'));

    const { findByText, findByTestId } = render(
      <PromptDownload promptSlug="slug" />,
    );

    const button = await findByText('Download');
    const input = (await findByTestId(
      'prompt-download__filepath',
    )) as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: '/var/something.txt' } });
      button.click();
    });

    await findByText('Downloading...');

    await waitFor(async () => {
      expect(
        screen.getByTestId('prompt-download__error').textContent,
      ).toContain('Error downloading file. This is a test.');
    });
  });
});
