const AnsiCode = {
  reset: '0',
  bold: '1',
  italic: '3',
  underline: '4',
  black: '30',
  red: '31',
  green: '32',
  yellow: '33',
  blue: '34',
  magenta: '35',
  cyan: '36',
  white: '37',
  grey: '90',
  gray: '90',
  blackBg: '40',
  redBg: '41',
  greenBg: '42',
  yellowBg: '43',
  blueBg: '44',
  magentaBg: '45',
  cyanBg: '46',
  whiteBg: '47',
  greyBg: '100',
  up: '1A',
  down: '1B',
  left: '1D',
  right: '1C',
  clear: '2K',
} as const;

type AnsiKeyword = keyof typeof AnsiCode;

const ESCAPE = '\x1b[';

export const escape = (...codes: AnsiKeyword[]) =>
  codes
    .map((code) => {
      let value: string = AnsiCode[code];
      value = Number.isNaN(Number(value)) ? value : `${value}m`;
      return `${ESCAPE}${value}`;
    })
    .join('');

export const ansi = (message: string, ...codes: AnsiKeyword[]) =>
  `${escape(...codes)}${message}${escape('reset')}`;
