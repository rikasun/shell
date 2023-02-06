/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('user', {
        password_digest: {
            type: 'string',
            notNull: false,
        }
    })
};

exports.down = pgm => {
    pgm.dropColumns('user', ['password_digest'])
};
