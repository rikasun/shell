/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('log_entry', {
        id: 'id',
        start_time: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        end_time: {
            type: 'timestamp',
        },
        creator_id: {
            type: 'integer',
            notNull: true,
            references: '"user"',
        },
        program_id: {
            type: 'integer',
            references: '"program"',
        },
        prompt: { type: 'text' },
        runbook_id: {
            type: 'integer',
            references: '"runbook"',
        },
        ip_address: { type: 'text' },
        reason: { type: 'text' },
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
};

exports.down = pgm => {
    pgm.dropTable('log_entry')
};
