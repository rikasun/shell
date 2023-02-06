import { Button, FormRadio, TextTitle } from '@cased/ui';
import { useState } from 'react';
import './modal-permissions.scss';

export interface ModalPermissionsProps {
  onClose: () => void;
  onSubmit: (role: string) => void;
  name: string;
  role: string;
}

/**
 * @TODO Move modal to @cased/ui as a re-usable component
 * @TODO Move to redux modal layer, modals should never be called directly in a page
 */
export function ModalPermissions({
  onSubmit,
  onClose,
  name,
  role,
}: ModalPermissionsProps) {
  const [selectedRole, setSelectedRole] = useState(role);

  return (
    <div className="modal modal-open bg-black/50">
      <div className="modal-box bg-white">
        <TextTitle className="mb-3 border-b border-gray-400 pb-3" size="lg">
          Edit role for {name}
          <button className="float-right" onClick={onClose}>
            X
          </button>
        </TextTitle>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(selectedRole);
          }}
        >
          <FormRadio
            name="role"
            label="Set Role"
            value={role}
            options={[
              {
                label: 'Admin',
                value: 'Admin',
                description: `Best for organization administrators.`,
              },
              {
                label: 'User',
                value: 'User',
                description: `Best for people who need to view Cased data, but don't need to make any updates.`,
              },
            ]}
            onChange={(_, value) => setSelectedRole(value)}
          />

          <Button display="primary" className="primary" type="submit">
            Update
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ModalPermissions;
