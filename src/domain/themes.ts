/**
 * Theme definitions — color palettes, mode settings, colorblind presets.
 * Pure data, no DOM manipulation.
 */

export const COLOR_THEMES = [
  'chiba-city',
  'neon-core',
  'neon-arcade',
  'night-district',
  'gridline',
  'vaporwave',
  'synthwave',
  'high-contrast',
] as const
export type ColorTheme = (typeof COLOR_THEMES)[number]

export const MODES = ['system', 'light', 'dark'] as const
export type Mode = (typeof MODES)[number]

export const COLORBLIND_MODES = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
] as const
export type ColorblindMode = (typeof COLORBLIND_MODES)[number]

export const DEFAULT_SETTINGS = {
  colorTheme: 'chiba-city' as ColorTheme,
  mode: 'system' as Mode,
  colorblind: 'none' as ColorblindMode,
}
