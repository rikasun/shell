import { IListItem } from '@cased/data';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../button/button';
import Card, { CardBlock, CardTitle } from '../card/card';
import TextBlock from '../text/text-block/text-block';
import TextLink from '../text/text-link/text-link';

export interface CardCrudProps {
  title: string;
  subtitle?: string;
  items: IListItem[];
  newItemName?: string;
  baseUrl: string;

  onDelete?: (id: string) => void;
}

export function CardCrud({
  title,
  subtitle,
  items,
  newItemName,
  baseUrl,
  onDelete,
}: CardCrudProps) {
  const deleteProvider = useCallback(
    (id: string) => {
      // eslint-disable-next-line no-alert
      if (onDelete && window.confirm(`Are you sure you want to delete this?`)) {
        onDelete(id);
      }
    },
    [onDelete],
  );

  const printProviders = useMemo(
    () =>
      items.map(({ id, name }) => (
        <CardBlock key={id} className="flex justify-between">
          <TextBlock>{name}</TextBlock>

          <div className="flex flex-row space-x-4">
            <TextLink to={`${baseUrl}/${id}`}>Edit</TextLink>

            {onDelete ? (
              <TextLink display="danger" onClick={() => deleteProvider(id)}>
                Delete
              </TextLink>
            ) : null}
          </div>
        </CardBlock>
      )),
    [items, deleteProvider, onDelete, baseUrl],
  );

  const printNewButton = useMemo(() => {
    if (!newItemName) return null;

    return (
      <Button display="primary" as={<Link to={`${baseUrl}/new`} />}>
        Add {newItemName}
      </Button>
    );
  }, [newItemName, baseUrl]);

  return (
    <Card>
      <CardBlock className="flex items-center justify-between">
        <CardTitle subtitle={subtitle}>{title}</CardTitle>

        {printNewButton}
      </CardBlock>

      {printProviders}
    </Card>
  );
}

export default CardCrud;
