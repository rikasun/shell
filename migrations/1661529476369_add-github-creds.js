/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.dropColumns('casedshell', ['gh_token'])
  pgm.addColumns('casedshell', {
      gh_app_id: {
          type: 'integer'
      },
      gh_app_url: {
        type: 'string'
    },
})
};

exports.down = pgm => {
  pgm.dropColumns('casedshell', ['gh_app_id'])
  pgm.dropColumns('casedshell', ['gh_app_url'])
  pgm.addColumns('casedshell', {
      gh_token: {
          type: 'string'
      },
  })
};
