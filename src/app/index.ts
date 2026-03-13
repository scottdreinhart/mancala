/**
 * Application layer barrel export.
 * Re-exports all React hooks and services.
 *
 * Usage: import { useThemeContext, useSoundEffects } from '@/app'
 */

export * from './aiService'
export * from './crashLogger'
export * from './haptics'
export { SoundProvider, useSoundContext } from './SoundContext'
export { useSoundEffects } from './useSoundEffects'
export * from './storageService'
export { ThemeProvider, useThemeContext } from './ThemeContext'
export { useAppScreens } from './useAppScreens'
export { useDeviceInfo } from './useDeviceInfo'
export { useGameState } from './useGameState'
export type { GameStateHook } from './useGameState'
export { useKeyboardControls } from './useKeyboardControls'
export { useMediaQuery } from './useMediaQuery'
export { useOnlineStatus } from './useOnlineStatus'
export { useResponsiveState } from './useResponsiveState'
export { useServiceLoader } from './useServiceLoader'
export { useStats } from './useStats'
export { useSwipe } from './useSwipe'
export { useWindowSize } from './useWindowSize'
export type { WindowSize } from './useWindowSize'
export * from './wasmAIService'
