// eslint-disable-next-line import/no-extraneous-dependencies
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');
const daisyui = require('daisyui');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0500ff',
        'primary-hover': '#0538ff',
        'bg-default': colors.zinc[50],
        'fg-default': colors.zinc[900],
        'fg-muted': colors.zinc[700],
        'fg-subtle': colors.zinc[500],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    styled: false,
    themes: [],
  },
};
