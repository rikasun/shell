import EditProgramApproval from '../../modules/settings/pages/settings-approvals/sub-pages/edit-program-approval/edit-program-approval';
import SettingsApprovals from '../../modules/settings/pages/settings-approvals/settings-approvals';
import NewApproval from '../../modules/settings/pages/settings-approvals/sub-pages/new-approval/new-approval';
import SettingsGeneral from '../../modules/settings/pages/settings-general/settings-general';
import SettingsSsh from '../../modules/settings/pages/settings-ssh/settings-ssh';
import SettingsUsers from '../../modules/settings/pages/settings-users/settings-users';
import UserLogs from '../../modules/settings/pages/settings-users/sub-pages/user-logs/user-logs';
import GroupView from '../../modules/settings/pages/settings-users/sub-pages/group-view/group-view';
import SettingsRunbooks from '../../modules/settings/pages/settings-runbooks/settings-runbooks';
import CreateProvider from '../../modules/settings/pages/settings-runbooks/providers/create-provider/create-provider';
import EditProvider from '../../modules/settings/pages/settings-runbooks/providers/edit-provider/edit-provider';
import CreateDatabase from '../../modules/settings/pages/settings-runbooks/databases/create-database/create-database';
import EditDatabase from '../../modules/settings/pages/settings-runbooks/databases/edit-database/edit-database';
import SettingsUserProfile from '../../modules/settings/pages/settings-user-profile/settings-user-profile';
import EditAccessApproval from '../../modules/settings/pages/settings-approvals/sub-pages/edit-access-approval/edit-access-approval';
import GroupLogs from '../../modules/settings/pages/settings-users/sub-pages/group-logs/group-logs';
import PageSettingsAddUser from '../../modules/settings/pages/page-settings-user-manager/page-settings-add-user';

export const routeConfigSettingsTwoColumn = [
  {
    path: 'settings',
    children: [
      {
        path: '',
        element: <SettingsGeneral />,
      },
      {
        path: 'ssh',
        element: <SettingsSsh />,
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            element: <SettingsUsers />,
          },
          {
            path: ':id',
            element: <UserLogs />,
          },
        ],
      },
      {
        path: 'groups',
        children: [
          {
            path: ':id',
            element: <GroupView />,
          },
          {
            path: 'activity',
            children: [
              {
                path: ':id',
                element: <GroupLogs />,
              },
            ],
          },
        ],
      },
      {
        path: 'add-user',
        element: <PageSettingsAddUser />,
      },
      {
        path: 'approvals',
        children: [
          {
            path: '',
            element: <SettingsApprovals />,
          },
          {
            path: 'programs',
            children: [
              {
                path: 'new',
                element: <NewApproval />,
              },
              {
                path: ':id',
                element: <EditProgramApproval />,
              },
            ],
          },
          {
            path: 'access',
            children: [
              {
                path: ':id',
                element: <EditAccessApproval />,
              },
            ],
          },
        ],
      },
      {
        path: 'runbooks',
        children: [
          {
            path: '',
            element: <SettingsRunbooks />,
          },
          {
            path: 'providers',
            children: [
              {
                path: 'new',
                element: <CreateProvider />,
              },
              {
                path: ':id',
                element: <EditProvider />,
              },
            ],
          },
          {
            path: 'databases',
            children: [
              {
                path: 'new',
                element: <CreateDatabase />,
              },
              {
                path: ':id',
                element: <EditDatabase />,
              },
            ],
          },
        ],
      },
      {
        path: 'user-profile',
        element: <SettingsUserProfile />,
      },
    ],
  },
];
