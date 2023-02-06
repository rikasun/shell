/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.dropColumns('database', ['password'])
};

exports.down = pgm => {
  pgm.addColumns('database', {
      password: {
          type: 'varchar(1000)'
      },
  })
};
