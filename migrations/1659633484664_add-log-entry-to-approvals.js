/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('approval', {
        log_entry_id: {
            type: 'integer',
            references: '"log_entry"',
        },
    })
};

exports.down = pgm => {
    pgm.dropColumns('approval', ['log_entry'])
};
