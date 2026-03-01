import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus, PanResponder, View, ViewStyle } from 'react-native';

const INACTIVITY_TIMEOUT = 3000; // 3 seconds

export function useInactivity() {
  const [isActive, setIsActive] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const resetTimer = useCallback(() => {
    setIsActive(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    // Start timer on mount
    resetTimer();

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        resetTimer();
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to background
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsActive(true); // Show status bar when app goes to background
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription?.remove?.();
    };
  }, [resetTimer]);

  return { isActive, resetTimer };
}

// Hook wrapper for detecting inactivity with PanResponder
export function useInactivityDetector() {
  const { isActive, resetTimer } = useInactivity();
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponder: () => {
        resetTimer();
        return false;
      },
    })
  ).current;

  return { isActive, panHandlers: panResponder.panHandlers };
}
