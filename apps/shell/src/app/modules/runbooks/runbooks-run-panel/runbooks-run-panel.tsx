import { FieldType } from '@cased/data';
import { Button, FormInputText, FormRadio, FormSelect } from '@cased/ui';
import { useCallback, useEffect, useMemo } from 'react';
import { useStoreActions, useStoreState } from '@cased/redux';
import { ReactComponent as Success } from '../../shared/page-two-column/icons/success.svg';
import { ReactComponent as Failure } from '../../shared/page-two-column/icons/failure.svg';

export function RunbooksRunPanel() {
  const runbooksRun = useStoreActions((store) => store.runbookRun.run);
  const results = useStoreState((store) => store.runbookRun.runResult);
  const setRunResult = useStoreActions(
    (store) => store.runbookRun.setRunResult,
  );
  const runFormFields = useStoreState((store) => store.runbookRun.formFields);
  const setRunbookRunFormFields = useStoreActions(
    (store) => store.runbookRun.setRunbookRunFormFields,
  );
  const runData = useStoreState((store) => store.runbookRun.runData);
  const setRunbookRunData = useStoreActions(
    (store) => store.runbookRun.setRunbookRunData,
  );

  const updateRunbookRunData = useCallback(
    (key: string, value: string) => {
      if (!runData) return;
      const blockId = Object.keys(runData)[0];
      const newValue = { ...runData[blockId], [key]: value };

      setRunbookRunData({ runData: { [blockId]: newValue } });
    },
    [runData, setRunbookRunData],
  );

  useEffect(() => {
    setRunResult({ runResult: [] });
  }, [setRunResult]);

  useEffect(() => {
    setRunbookRunFormFields();
  }, [results, setRunbookRunFormFields]);

  const buttonText = useMemo(() => {
    if (results?.length === 0) {
      return 'Run Runbook';
    }
    return 'Run Runbook again';
  }, [results]);

  const printRunResult = useMemo(
    () =>
      results.map(({ success, output }) => (
        <div className="space-y-2.5 p-4 pl-0" key={output}>
          <div className="flex items-center font-medium">
            {success ? <Success /> : <Failure />}
            <span>{success ? 'Ran successfully' : `Failed`} </span>
          </div>
          {output && (
            <pre className="max-h-96 overflow-y-scroll whitespace-normal rounded bg-gray-700 py-4 px-5 text-white">
              {output}
            </pre>
          )}
        </div>
      )),
    [results],
  );

  const printRunDataCollection = useMemo(
    () =>
      runFormFields.map(({ name, id, type, options }) => (
        <div key={id} className="py-2">
          {type === FieldType.Text && (
            <FormInputText
              label={name}
              name={name}
              onChange={updateRunbookRunData}
              dataTestId={`runbooks-run-panel-${name}`}
            />
          )}
          {type === 'radio' && (
            <FormRadio
              label={name}
              name={name}
              required
              options={
                options?.map((o) => ({ value: o.value, label: o.label })) || []
              }
              onChange={updateRunbookRunData}
            />
          )}
          {type === FieldType.Dropdown && (
            <FormSelect
              options={
                options?.map((o) => ({ value: o.value, label: o.label })) || []
              }
              onChange={updateRunbookRunData}
              name={name}
              label={name}
              dataTestId={`runbooks-run-panel-${name}`}
            />
          )}
        </div>
      )),
    [runFormFields, updateRunbookRunData],
  );

  return (
    <div className="fixed z-50 h-full w-72 border-r border-zinc-200 bg-white p-4">
      {runFormFields && printRunDataCollection}
      <Button display="primary" className="mt-4 w-full" onClick={runbooksRun}>
        {buttonText}
      </Button>
      <div>{printRunResult}</div>
    </div>
  );
}

export default RunbooksRunPanel;
