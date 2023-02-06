/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('casedshell', {
        id: 'id',
        organization_id: {
            type: 'integer',
            notNull: true,
            references: '"organization"',
        },
        name: { type: 'text', notNull: true },
        hostname: { type: 'text', notNull: true },
        ca_enabled: { type: 'boolean', notNull: true, default: true },
        created_at: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
        updated_at: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('current_timestamp'),
        },
      })
    }

exports.down = pgm => {
    pgm.dropTable('casedshell')
};
