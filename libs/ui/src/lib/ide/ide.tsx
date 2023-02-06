import { useCallback, useEffect, useMemo, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';

import 'prismjs/components/prism-json';
import './ide.scss';
import Button from '../button/button';

export interface IdeProps {
  mode: 'json';
  code: string;
  onChange: (value: string) => void;
  delay?: number;
}

export function Ide({ mode, code: initCode, onChange, delay = 500 }: IdeProps) {
  const [code, setCode] = useState('');
  const [handler, setHandler] = useState<ReturnType<typeof setTimeout>>();
  const [error, setError] = useState<string | null>(null);

  const debounce = useCallback(
    (callback: () => void) => {
      if (handler) clearTimeout(handler);
      setHandler(setTimeout(() => callback(), delay));
    },
    [handler, delay],
  );

  const submitCode = useCallback(
    (newCode: string) => {
      setError(null);

      try {
        JSON.parse(newCode);
        onChange(newCode);
      } catch (e) {
        console.error('IDE Submission', newCode, 'JSON Error', e);
        const { message } = e as Error;
        setError(message);
      }
    },
    [onChange],
  );

  const onValueChange = useCallback(
    (newCode: string) => {
      const jsonParseSafeCode = newCode.trim() || '{}';
      setCode(jsonParseSafeCode);
      debounce(() => submitCode(jsonParseSafeCode));
    },
    [debounce, submitCode],
  );

  const highlightCode = useCallback(
    (newCode: string) =>
      highlight(newCode, languages['json'], 'json')
        .split('\n')
        .map(
          (line, i) =>
            `<span class="ide__line-number">${
              i + 1
            }</span><span class="ide__line">${line}</span>`,
        )
        .join('\n'),
    [],
  );

  const cleanCode = useCallback(() => {
    try {
      const newCode = JSON.stringify(JSON.parse(code), null, 2);
      onValueChange(newCode);
    } catch (e) {
      // do nothing
    }
  }, [code, onValueChange]);

  const printError = useMemo(() => {
    if (!error) return null;

    return (
      <div className="alert alert-error my-3 bg-red-600 p-3 text-white shadow-lg">
        <div>
          <span>JSON Error: {error}</span>
        </div>
      </div>
    );
  }, [error]);

  // cancel the debounce on unmount
  useEffect(() => () => clearTimeout(handler), [handler]);

  // Protect against invalid modes
  useEffect(() => {
    if (mode !== 'json') throw new Error('Unsupported mode');
  }, [mode]);

  // Validate and clean initCode
  useEffect(() => {
    if (code || !initCode) return;

    try {
      const parsed = JSON.parse(initCode);
      setCode(JSON.stringify(parsed, null, 2));
    } catch (e) {
      const { message } = e as Error;
      setError(message);
      setCode(initCode);
    }
  }, [initCode, code]);

  return (
    <div>
      <Editor
        className="ide"
        value={code}
        onValueChange={onValueChange}
        highlight={highlightCode}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
      />

      <Button size="small" onClick={cleanCode}>
        Prettify
      </Button>

      {printError}
    </div>
  );
}

export default Ide;
