/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('database', {
    id: 'id',
    name: { type: 'varchar(1000)', notNull: true },
    host: { type: 'varchar(1000)', notNull: true },
    port: { type: 'varchar(1000)', notNull: true },
    label: { type: 'varchar(1000)', notNull: true },
    username: { type: 'varchar(1000)', notNull: true },
    password: { type: 'varchar(1000)' },
    metadata: {
      type: 'json',
      notNull: true,
      default: pgm.func("'{}'::jsonb"),
    },
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

exports.down = (pgm) => {
  pgm.dropTable('database')
}
