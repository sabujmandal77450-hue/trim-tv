/**
 * useTVNavigation.ts
 *
 * Android TV / D-pad remote control support for TrimTV.
 *
 * Usage:
 *   const { isTV, tvEventType } = useTVNavigation({ onSelect, onBack, onLeft, onRight, onUp, onDown });
 *
 * Event types emitted by the TV remote:
 *   select   — center / OK button (play-pause equivalent in menus)
 *   back     — back button
 *   up / down / left / right  — D-pad directional keys
 *   playPause — media play/pause key
 *   rewind   — rewind button (10 s seek back)
 *   fastForward — fast-forward button (10 s seek forward)
 *   mediaFastForward / mediaRewind — longer aliases
 */

import {useEffect, useRef, useState} from 'react';
import {Platform, TVEventHandler, HWKeyEvent} from 'react-native';

export const isAndroidTV = Platform.isTV;

export type TVEventType =
  | 'select'
  | 'back'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'playPause'
  | 'rewind'
  | 'fastForward'
  | 'mediaFastForward'
  | 'mediaRewind'
  | 'mediaPlay'
  | 'mediaPause'
  | 'mediaStop'
  | 'mediaNext'
  | 'mediaPrevious'
  | null;

export interface TVNavigationOptions {
  onSelect?: () => void;
  onBack?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onPlayPause?: () => void;
  onRewind?: () => void;
  onFastForward?: () => void;
  enabled?: boolean;
}

/**
 * Hook that subscribes to TV remote / D-pad events.
 * On non-TV platforms this is a no-op.
 */
export function useTVNavigation(options: TVNavigationOptions = {}) {
  const {
    onSelect,
    onBack,
    onLeft,
    onRight,
    onUp,
    onDown,
    onPlayPause,
    onRewind,
    onFastForward,
    enabled = true,
  } = options;

  const [lastEventType, setLastEventType] = useState<TVEventType>(null);

  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useEffect(() => {
    if (!isAndroidTV || !enabled) {
      return;
    }

    const tvEventHandler = new TVEventHandler();

    tvEventHandler.enable(null, (_component: any, event: HWKeyEvent) => {
      const eventType = event?.eventType as TVEventType;
      setLastEventType(eventType);

      const cb = callbacksRef.current;

      switch (eventType) {
        case 'select':
          cb.onSelect?.();
          break;
        case 'back':
          cb.onBack?.();
          break;
        case 'left':
          cb.onLeft?.();
          break;
        case 'right':
          cb.onRight?.();
          break;
        case 'up':
          cb.onUp?.();
          break;
        case 'down':
          cb.onDown?.();
          break;
        case 'playPause':
          cb.onPlayPause?.();
          break;
        case 'rewind':
        case 'mediaRewind':
          cb.onRewind?.();
          break;
        case 'fastForward':
        case 'mediaFastForward':
          cb.onFastForward?.();
          break;
        default:
          break;
      }
    });

    return () => {
      tvEventHandler.disable();
    };
  }, [enabled]);

  return {
    isTV: isAndroidTV,
    lastEventType,
  };
}

/**
 * Simple hook that exposes whether the app is running on Android TV.
 */
export function useIsTV() {
  return isAndroidTV;
}

/**
 * Returns hasTVPreferredFocus prop only on TV so non-TV builds are unaffected.
 */
export function tvFocusProps(hasFocus = false) {
  if (!isAndroidTV) {
    return {};
  }
  return {
    hasTVPreferredFocus: hasFocus,
    accessible: true,
    isTVSelectable: true,
  };
}
