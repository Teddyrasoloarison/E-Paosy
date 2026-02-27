import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  BackHandler,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../../src/store/useThemeStore';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmModalProps) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onCancel();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onCancel]);

  const handleConfirm = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View 
        style={[
          styles.overlay, 
          { 
            backgroundColor: theme.overlay,
            opacity: fadeAnim 
          }
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={onCancel}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                backgroundColor: theme.surface,
                transform: [{ scale: scaleAnim }],
              },
              Platform.OS === 'ios' && styles.iosShadow,
              Platform.OS === 'android' && styles.androidShadow,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDestructive ? theme.error + '15' : theme.primary + '15' }]}>
              <Ionicons 
                name={isDestructive ? "exit-outline" : "help-circle-outline"} 
                size={32} 
                color={isDestructive ? theme.error : theme.primary} 
              />
            </View>

            <Text style={[styles.title, { color: theme.text }]}>
              {title}
            </Text>

            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {message}
            </Text>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }
                ]}
                onPress={onCancel}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {cancelText}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: isDestructive ? theme.error : theme.primary }
                ]}
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  {confirmText}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  androidShadow: {
    elevation: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
});
