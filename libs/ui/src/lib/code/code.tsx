import './code.scss';

export interface CodeProps {
  children: React.ReactNode;
}

export function Code({ children }: CodeProps) {
  return (
    <div className="rounded border border-gray-400 bg-gray-200 p-4">
      <pre>
        <code>
          <div className="overflow-x-auto whitespace-pre font-mono text-sm">
            {children}
          </div>
        </code>
      </pre>
    </div>
  );
}

export default Code;
