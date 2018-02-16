/* @flow */

import color from 'color';
import DefaultTheme from './DefaultTheme';
import { white, grey800, lightBlue500, lightBlue700, redA400 } from './colors';
import type { Theme } from '../types';

const DarkTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: lightBlue500,
    primaryDark: lightBlue700,
    background: '#303030',
    paper: grey800,
    text: white,
    secondaryText: color(white)
      .alpha(0.7)
      .rgb()
      .string(),
    disabled: color(white)
      .alpha(0.3)
      .rgb()
      .string(),
    placeholder: color(white)
      .alpha(0.38)
      .rgb()
      .string(),
    helperText: color(white)
      .alpha(0.7)
      .rgb()
      .string(),
    errorText: redA400,
  },
};

export default DarkTheme;