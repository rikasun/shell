/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('organization', {
    id: 'id',
    name: { type: 'text', notNull: true },
    sso_id: { type: 'text' },
    logo_image_url: {
      type: 'text',
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

  pgm.createTable('runbook', {
    id: 'id',
    name: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    organization_id: {
      type: 'integer',
      notNull: true,
      references: '"organization"',
      onDelete: 'cascade',
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

  pgm.createIndex('runbook', 'organization_id')

  pgm.createTable('block', {
    id: 'id',
    block_type: {
      type: 'text',
      notNull: true,
    },
    sort_order: {
      type: 'integer',
    },
    runbook_id: {
      type: 'integer',
      notNull: true,
      references: '"runbook"',
      onDelete: 'cascade',
    },
    data: {
      type: 'json',
    },
    name: {
      type: 'text',
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

  pgm.createIndex('block', 'runbook_id')

  pgm.createTable('user', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: '"organization"',
    },
    name: { type: 'text', notNull: true },
    active: { type: 'boolean', notNull: true, default: true },
    idp_user_id: { type: 'string' },
    idp_directory_user_id: { type: 'string' },
    email: {
      type: 'string',
      notNull: true,
      unique: true,
    },
    admin: {
      type: 'boolean',
      default: false,
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

  pgm.createIndex('user', 'email')

  pgm.createTable('group', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: '"organization"',
    },
    name: {
      type: 'string',
      notNull: true,
    },
    scim_group_id: {
      type: 'string',
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

  pgm.createIndex('group', 'name')

  pgm.createTable('user_group', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"user"',
    },
    group_id: {
      type: 'integer',
      notNull: true,
      references: '"group"',
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

  pgm.createIndex('user_group', 'user_id')
  pgm.createIndex('user_group', 'group_id')

  pgm.createTable('program', {
    id: 'id',
    creator_id: {
      type: 'integer',
      notNull: true,
      references: '"user"',
    },
    name: { type: 'text', notNull: true },
    path: { type: 'text', notNull: true },
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

  pgm.createIndex('program', 'path')

  pgm.createTable('approval', {
    id: 'id',
    state: { type: 'text', notNull: true },
    requestor_id: {
      type: 'integer',
      notNull: true,
      references: '"user"',
    },
    responder_id: {
      type: 'integer',
      references: '"user"',
    },
    program_id: {
      type: 'integer',
      references: '"program"',
    },
    prompt: { type: 'text' },
    ip_address: { type: 'text' },
    reason: { type: 'text' },
    command: { type: 'text' },
    metadata: {
      type: 'json',
      notNull: true,
      default: pgm.func("'{}'::jsonb"),
    },
    was_auto_approved: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
    expired_at: {
      type: 'timestamp',
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

  pgm.createIndex('approval', 'requestor_id')

  pgm.createTable('approval_settings', {
    id: 'id',
    program_id: {
      type: 'integer',
      references: '"program"',
    },
    prompt: { type: 'text' },
    reason_required: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    self_approval: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    peer_approval: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    approval_duration: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    approval_timeout: {
      type: 'integer',
      notNull: true,
      default: 10,
    },
    deny_on_unreachable: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    subcommands: {
      type: 'text[]',
      default: pgm.func("'{}'"),
      notNull: true,
    },
    custom_commands: {
      type: 'text[]',
      default: pgm.func("'{}'"),
      notNull: true,
    },
    ignore_list: {
      type: 'text[]',
      default: pgm.func("'{}'"),
      notNull: true,
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
  pgm.dropTable('approval')
  pgm.dropTable('approval_settings')
  pgm.dropTable('user_group')
  pgm.dropTable('program')
  pgm.dropTable('group')
  pgm.dropTable('block')
  pgm.dropTable('runbook')
  pgm.dropTable('user')
  pgm.dropTable('organization')
}
