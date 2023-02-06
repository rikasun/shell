/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.dropColumns('casedshell', ['snippets_repo_url'])
};

exports.down = pgm => {
  pgm.addColumns('casedshell', {
      snippets_repo_url: {
          type: 'string'
      },
  })
};
