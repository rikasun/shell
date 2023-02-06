/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('casedshell', {
        snippets_repo_url: {
            type: 'text'
        },
        gh_token: {
            type: 'text'
        },
    })
};

exports.down = pgm => {
    pgm.dropColumns('casedshell', ['snippets_repo_url'])
    pgm.dropColumns('casedshell', ['gh_token'])
}; 