import { Button } from '@cased/ui';
import { ArrowDownCircleIcon } from '@heroicons/react/20/solid';
import { promptService } from '@cased/remotes';
import { useCallback, useState } from 'react';

type Props = { promptSlug: string };
export default function PromptDownload({ promptSlug }: Props) {
  const [filepath, setFilepath] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const downloadFile = useCallback(async () => {
    // istanbul ignore next
    if (!filepath) return;

    setDownloading(true);
    setErrorMessage('');
    try {
      const fileData = await promptService.download(filepath, promptSlug);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([fileData]));
      const filename = filepath.split('/').pop() as string;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      a.remove();

      setFilepath('');

      const { activeElement } = document;
      // istanbul ignore next
      if (activeElement instanceof HTMLInputElement) {
        activeElement.blur(); // Hides the dropdown
      }
    } catch (error) {
      // istanbul ignore else
      if (error instanceof Error) {
        setErrorMessage(`Error downloading file. ${error.message}`);
      } else {
        setErrorMessage(`Error downloading file`);
      }
    }

    setDownloading(false);
  }, [filepath, promptSlug]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      downloadFile();
    },
    [downloadFile],
  );

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <button className="gap-1I flex cursor-pointer items-center  text-white">
        <ArrowDownCircleIcon className="h-4 pr-1" />
        Download File
      </button>
      <div className="dropdown-content mt-2 w-80 rounded-md bg-white p-3">
        <p className="mb-4 text-sm text-gray-600">
          Enter the file path and press Download to begin downloading your file
        </p>
        {errorMessage && (
          <div
            data-testid="prompt-download__error"
            className="mb-4 text-sm text-red-600"
          >
            {errorMessage}
          </div>
        )}
        <input
          data-testid="prompt-download__filepath"
          placeholder="/path/to/your/file"
          className="mb-4 w-full grow rounded-md border-[1px] border-gray-300 px-2 py-1"
          autoComplete="off"
          onChange={(event) => setFilepath(event.target.value)}
          onKeyDown={handleKeyDown}
          value={filepath}
        />
        <div className="flex justify-end">
          <Button onClick={() => downloadFile()}>
            {downloading ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      </div>
    </div>
  );
}
