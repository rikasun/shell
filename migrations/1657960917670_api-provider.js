/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('apiprovider', {
    id: 'id',
    api_name: { type: 'text' },
    base_url: {
      type: 'text',
    },
    authentication_type: {
      type: 'text',
    },
    data: {
      type: 'json',
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
  pgm.dropTable('apiprovider')
}
