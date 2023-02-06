/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('authorized_approval_user', {
        id: 'id',
        approval_settings_id: {
          type: 'integer',
          notNull: true,
          references: '"approval_settings"',
        },
        user_id: {
          type: 'integer',
          notNull: true,
          references: '"user"',
        },
      })

      pgm.createTable('authorized_approval_group', {
        id: 'id',
        approval_settings_id: {
          type: 'integer',
          notNull: true,
          references: '"approval_settings"',
        },
        group_id: {
          type: 'integer',
          notNull: true,
          references: '"group"',
        },
      })

    }

exports.down = pgm => {
    pgm.dropTable('authorized_approval_user')
    pgm.dropTable('authorized_approval_group')

}
