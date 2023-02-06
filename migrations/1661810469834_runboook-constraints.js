/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addConstraint("runbook", "runbook_name_uniq", { unique: ['name'] })
};

exports.down = pgm => {
    pgm.dropConstraint("runbook", "runbook_name_uniq")
};
