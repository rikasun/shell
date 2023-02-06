import { CardCrud } from '@cased/ui';
import { useCallback, useState } from 'react';
import { useStoreActions } from '@cased/redux';
import ReadyGuard from '../../../../guards/ready/ready-guard';
import SettingsTemplate, { TabId } from '../../settings-template';
import { IListItem } from './i-list-item';

export function SettingsRunbooks() {
  const [apiProviders, setApiProviders] = useState<IListItem[]>([]);
  const [databases, setDatabases] = useState<IListItem[]>([]);

  const getAll = useStoreActions(
    (actions) => actions.settingsRunbooks.retrieveAllObjects,
  );

  const removeApiProvider = useStoreActions(
    (actions) => actions.settingsRunbooks.removeApiProvider,
  );

  const removeDatabase = useStoreActions(
    (actions) => actions.settingsRunbooks.removeDatabase,
  );

  const populate = useCallback(async () => {
    const { providers, databases: allDatabases } = await getAll();
    setApiProviders(providers);
    setDatabases(allDatabases);
  }, [getAll]);

  const deleteProvider = useCallback(
    async (id: string) => {
      await removeApiProvider({ id });
      setApiProviders(apiProviders.filter((x) => x.id !== id));
    },
    [apiProviders, removeApiProvider],
  );

  const deleteDatabase = useCallback(
    async (id: string) => {
      await removeDatabase({ id });
      setDatabases(databases.filter((x) => x.id !== id));
    },
    [databases, removeDatabase],
  );

  return (
    <ReadyGuard waitFor={populate}>
      <SettingsTemplate activeTab={TabId.Runbooks}>
        <CardCrud
          title="API Providers"
          subtitle="API providers are used with the REST API block in Runbooks"
          items={apiProviders}
          newItemName="API Provider"
          baseUrl="/settings/runbooks/providers"
          onDelete={deleteProvider}
        />

        <CardCrud
          title="Databases"
          subtitle="Databases are used with the Database block in Runbooks"
          items={databases}
          newItemName="Database"
          baseUrl="/settings/runbooks/databases"
          onDelete={deleteDatabase}
        />
        <span data-testid="settings-runbooks" />
      </SettingsTemplate>
    </ReadyGuard>
  );
}

export default SettingsRunbooks;
