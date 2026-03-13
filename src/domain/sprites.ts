/**
 * Sprite Manager — Centralized asset registry for theme visual resources.
 *
 * SOLID: Single Responsibility — one place to manage all theme sprites.
 * Adding a new theme background? Add one entry here — no CSS changes needed.
 *
 * Each theme maps to a sprite set (currently just a background image).
 * Extend ThemeSpriteSet to add more sprite slots (e.g., patterns, icons).
 */

/** A single visual asset (image, pattern, etc.) */
export interface SpriteAsset {
  readonly id: string
  readonly src: string
  readonly alt: string
}

/** Complete set of sprites for a single theme */
export interface ThemeSpriteSet {
  readonly background: SpriteAsset | null
}

/** Central sprite registry — maps theme ID → sprite set */
const SPRITE_REGISTRY: Readonly<Record<string, ThemeSpriteSet>> = {
  'neon-core': {
    background: {
      id: 'neon-core-bg',
      src: '/backgrounds/matrix.png',
      alt: 'Matrix digital rain pattern',
    },
  },
  'neon-arcade': {
    background: {
      id: 'neon-arcade-bg',
      src: '/backgrounds/cityscape.png',
      alt: 'Cityscape skyline',
    },
  },
  'night-district': {
    background: null,
  },
  gridline: {
    background: {
      id: 'gridline-bg',
      src: '/backgrounds/matrix.png',
      alt: 'Matrix digital rain pattern',
    },
  },
  vaporwave: {
    background: {
      id: 'vaporwave-bg',
      src: '/backgrounds/laser.png',
      alt: 'Laser grid pattern',
    },
  },
  synthwave: {
    background: {
      id: 'synthwave-bg',
      src: '/backgrounds/circuit.png',
      alt: 'Circuit board traces',
    },
  },
  'high-contrast': {
    background: null,
  },
}

/** Get the sprite set for a theme (returns empty set if theme unknown) */
export const getThemeSprites = (themeId: string): ThemeSpriteSet =>
  SPRITE_REGISTRY[themeId] ?? { background: null }

/** Get the background image as a CSS url() value, or 'none' */
export const getBackgroundCssValue = (themeId: string): string => {
  const sprite = SPRITE_REGISTRY[themeId]?.background
  return sprite ? `url('${sprite.src}')` : 'none'
}

/** Get all unique sprite sources across all themes (for bulk preloading) */
export const getAllSpriteSources = (): readonly string[] => {
  const sources = new Set<string>()
  for (const spriteSet of Object.values(SPRITE_REGISTRY)) {
    if (spriteSet.background) {
      sources.add(spriteSet.background.src)
    }
  }
  return [...sources]
}

/** Preload a single sprite image into the browser cache */
export const preloadSprite = (src: string): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to preload sprite: ${src}`))
    img.src = src
  })

/** Preload all theme sprites (fire-and-forget, errors silently ignored) */
export const preloadAllSprites = (): void => {
  for (const src of getAllSpriteSources()) {
    preloadSprite(src).catch(() => {})
  }
}
