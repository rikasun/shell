/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('organization', {
        certificate_authentication: {
            type: 'boolean', notNull: true, default: true
        }
    })
};

exports.down = pgm => {
    pgm.dropColumns('organization', ['certificate_authentication'])
};
