/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
    pgm.addColumns('runbook', {
        last_run: {
            type: 'timestamp',
            notNull: false,
        }
    })
};

exports.down = pgm => {
    pgm.dropColumns('runbook', ['last_run'])
};
