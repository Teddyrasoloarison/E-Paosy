import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../store/useThemeStore';

export interface ModernAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface ModernAlertOptions {
  title: string;
  message?: string;
  icon?: string;
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
  buttons?: ModernAlertButton[];
}

// Global alert handler
let globalAlertHandler: any = null;

export function ModernAlertProvider() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ModernAlertOptions | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const show = (newOptions: ModernAlertOptions) => {
    setOptions(newOptions);
    setVisible(true);

    scaleAnim.setValue(0);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (callback) callback();
    });
  };

  React.useEffect(() => {
    globalAlertHandler = { show };
  }, []);

  if (!options) return null;

  const defaultButtons: ModernAlertButton[] =
    options.buttons || [{ text: 'OK', style: 'default' }];

  const getIconColor = () => {
    switch (options.type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'confirm':
        return theme.primary;
      default:
        return theme.primary;
    }
  };

  const getIconName = () => {
    switch (options.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'confirm':
        return 'help-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getIconColor() + '15' },
            ]}
          >
            <Ionicons
              name={getIconName()}
              size={40}
              color={getIconColor()}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            {options.title}
          </Text>

          {/* Message */}
          {options.message && (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {options.message}
            </Text>
          )}

          {/* Buttons */}
          <View
            style={[
              styles.buttonsContainer,
              defaultButtons.length > 2 && styles.buttonColumnLayout,
            ]}
          >
            {defaultButtons.map((button, index) => {
              const isCancel = button.style === 'cancel';
              const isDestructive = button.style === 'destructive';

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    {
                      backgroundColor: isCancel
                        ? theme.backgroundSecondary
                        : isDestructive
                        ? '#EF4444'
                        : theme.primary,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    handleClose(button.onPress);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: isCancel ? theme.text : '#FFFFFF',
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function getModernAlertHandler() {
  return globalAlertHandler;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonColumnLayout: {
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
