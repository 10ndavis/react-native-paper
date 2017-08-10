/* @flow */

export type Theme = {
  type: string,
  roundness: number,
  colors: {
    primary: string,
    primaryDark: string,
    background: string,
    paper: string,
    accent: string,
    text: string,
    secondaryText: string,
    disabled: string,
    placeholder: string,
  },
  fonts: {
    regular: string,
    medium: string,
    light: string,
    thin: string,
  },
};
