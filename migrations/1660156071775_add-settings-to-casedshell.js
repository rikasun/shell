/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('casedshell', {
        reason_required: {
            type: 'boolean', notNull: true, default: false
        },
        record_output: {
            type: 'boolean', notNull: true, default: false
        }
        
    })
};

exports.down = pgm => {
    pgm.dropColumns('casedshell', ['reason_required'])
    pgm.dropColumns('casedshell', ['record_output'])
};
