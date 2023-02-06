/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('snippet', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: '"organization"',
    },
    name: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    code: { type: 'text', notNull: true },
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
  pgm.dropTable('snippet')
};
