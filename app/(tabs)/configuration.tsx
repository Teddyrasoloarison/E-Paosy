import DashboardShell from "@/components/dashboard-shell";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/colors";

import { useNotificationStore } from "../../src/store/useNotificationStore";
import { useThemeStore } from "../../src/store/useThemeStore";

type ModalType = "currency" | "recurrence" | "hour";

export default function ConfigurationScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const notifConfig = useNotificationStore();

  // Local states
  const [isPremium, setIsPremium] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("currency");
  const [showNotifications, setShowNotifications] = useState(false);

  // Custom input states
  // Clock states for hour modal
  const [clockTime, setClockTime] = useState(new Date());
  const [showClockPicker, setShowClockPicker] = useState(false);
  // Selected state for recurrence options
  const [selectedRecurrence, setSelectedRecurrence] = useState(
    notifConfig.recurrence,
  );

  // Sync selected recurrence with store
  useEffect(() => {
    setSelectedRecurrence(notifConfig.recurrence);
  }, [notifConfig.recurrence]);

  // Navigation & biometric
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          router.replace("/(tabs)/dashboard");
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [router]),
  );

  const toggleBiometric = async (value: boolean) => {
    // Placeholder biometric logic
    setIsBiometricEnabled(value);
  };

  // Display helpers
  const hourLabel = `${String(notifConfig.notificationHour).padStart(2, "0")}:${String(notifConfig.notificationMinute).padStart(2, "0")}`;

  // Modal controls
  const openModal = (type: ModalType) => {
    if (type === "hour") {
      const now = new Date();
      now.setHours(
        notifConfig.notificationHour,
        notifConfig.notificationMinute,
        0,
        0,
      );
      setClockTime(now);
    }
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Custom validations - customHour removed, clock only

  // Standard selection
  const handleModalSelect = (item: string) => {
    switch (modalType) {
      case "currency":
        setIsPremium(true);
        break; // Demo
      case "recurrence":
        const previousRecurrence = notifConfig.recurrence;
        notifConfig.setConfig({
          recurrence: item as any,
          ...(item === "Annuelle" && { daysCount: 365 }),
        });
        console.log(
          `Récurrence changée: ${previousRecurrence} → ${item} (jours: ${item === "Annuelle" ? 365 : notifConfig.daysCount})`,
        );
        break;
      case "hour":
        notifConfig.setConfig({
          notificationHour: parseInt(item),
          notificationMinute: 0,
        });
        break;
    }
    closeModal();
  };

  const getStandardOptions = (): string[] => {
    if (modalType === "hour") return []; // No list for hour - clock only
    switch (modalType) {
      case "currency":
        return ["MGA", "USD", "EUR"];
      case "recurrence":
        return frequencyOptions.map((opt) => opt.key);
      default:
        return [];
    }
  };

  const getOptionLabel = (item: string): string => {
    switch (modalType) {
      case "hour":
        return `${String(item).padStart(2, "0")}:00`;
      default:
        return item;
    }
  };

  const getModalTitle = (): string => {
    switch (modalType) {
      case "currency":
        return "Devise";
      case "recurrence":
        return "Fréquence des notifications";
      case "hour":
        return "🕐 Heure de notification";
      default:
        return "";
    }
  };

  const handleClockChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setClockTime(selectedTime);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Auto-confirm on time selection - single tap UX
      const newHour = selectedTime.getHours();
      const newMinute = selectedTime.getMinutes();
      notifConfig.setConfig({
        notificationHour: newHour,
        notificationMinute: newMinute,
      });
      console.log(
        `[CONFIG] Heure de notification mise à jour: ${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`,
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      closeModal();
    }
  };

  // Enhanced frequency options with previews and icons
  const frequencyOptions = [
    {
      key: "Quotidienne",
      label: "Tous les jours",
      subtitle: "1 jour",
      icon: "sun-outline",
      days: 1,
    },
    {
      key: "Hebdomadaire",
      label: "Toutes les semaines",
      subtitle: "7 jours",
      icon: "calendar-week-outline",
      days: 7,
    },
    {
      key: "Mensuelle",
      label: "Tous les mois",
      subtitle: "30 jours",
      icon: "calendar-month-outline",
      days: 30,
    },
    {
      key: "Annuelle",
      label: "Tous les ans",
      subtitle: "365 jours",
      icon: "gift-outline" as any,
      days: 365,
    },
  ];

  // Current frequency preview for header
  const currentFrequency =
    frequencyOptions.find((opt) => opt.key === selectedRecurrence) ||
    frequencyOptions[0];
  const headerPreview = currentFrequency
    ? `${currentFrequency.label} (${currentFrequency.subtitle})`
    : selectedRecurrence;

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: any) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.settingIcon, { backgroundColor: theme.primary + "15" }]}
      >
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <DashboardShell
      title="Configuration"
      subtitle="Paramètres de votre compte"
      icon="options-outline"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* APPAREIL */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          PARAMETRES
        </Text>
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="moon"
            title="Mode Sombre"
            subtitle={isDarkMode ? "Activé" : "Désactivé"}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary + "50" }}
                thumbColor={isDarkMode ? theme.primary : "#f4f3f4"}
              />
            }
          />
          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Ionicons name="notifications" size={20} color={theme.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Notifications
              </Text>
              <Text
                style={[styles.settingSubtitle, { color: theme.textSecondary }]}
              >
                Personnalisez vos notifications
              </Text>
            </View>
            <Ionicons
              name={showNotifications ? "chevron-down" : "chevron-forward"}
              size={20}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
          {showNotifications && (
            <View
              style={[
                styles.nestedSettings,
                { backgroundColor: theme.surface + "10" },
              ]}
            >
              <SettingItem
                icon="notifications-outline"
                title="Status"
                subtitle={notifConfig.isEnabled ? "ON" : "OFF"}
                rightElement={
                  <Switch
                    value={notifConfig.isEnabled}
                    onValueChange={(val) =>
                      notifConfig.setConfig({ isEnabled: val })
                    }
                    trackColor={{
                      false: theme.border,
                      true: theme.primary + "50",
                    }}
                    thumbColor={
                      notifConfig.isEnabled ? theme.primary : "#f4f3f4"
                    }
                  />
                }
              />
              {notifConfig.isEnabled && (
                <>
                  <SettingItem
                    icon="time-outline"
                    title="Récurrence"
                    subtitle={notifConfig.recurrence}
                    onPress={() => openModal("recurrence")}
                  />
                  <SettingItem
                    icon="alarm-outline"
                    title="Heure"
                    subtitle={hourLabel}
                    onPress={() => openModal("hour")}
                  />
                </>
              )}
              {notifConfig.isEnabled && (
                <Text style={[styles.summary, { color: theme.textTertiary }]}>
                  Dépenses ({notifConfig.recurrence}) à {hourLabel}
                </Text>
              )}
            </View>
          )}
          <SettingItem
            icon="shield-checkmark"
            title="Sécurité"
            subtitle="Sécurisez votre compte"
            onPress={() => router.push("/(tabs)/empreinte")}
          />
        </View>

        {/* ABONNEMENT */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ABONNEMENT
        </Text>
        <View
          style={[
            styles.subscriptionCard,
            isPremium
              ? styles.premiumCard
              : { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.subscriptionRow}>
            <View>
              <Text
                style={[
                  styles.subscriptionLabel,
                  isPremium && styles.whiteText,
                ]}
              >
                Statut
              </Text>
              <Text
                style={[
                  styles.subscriptionStatus,
                  isPremium && styles.whiteTextBold,
                ]}
              >
                {isPremium ? "PRO" : "Gratuit"}
              </Text>
            </View>
            {isPremium ? (
              <View
                style={[
                  styles.premiumBadge,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Ionicons name="star" size={16} color="#FFFFFF" />
                <Text style={styles.premiumBadgeText}>ACTIF</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.premiumBtn, { backgroundColor: theme.primary }]}
                onPress={() => setIsPremium(true)}
              >
                <Ionicons name="diamond" size={16} color="#FFFFFF" />
                <Text style={styles.premiumBtnText}>Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SUPPORT */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          AIDE
        </Text>
        <View style={styles.settingsGroup}>
          <SettingItem icon="language" title="Langue" subtitle="Français" />
          <SettingItem
            icon="help-circle"
            title="Support"
            subtitle="FAQ et contact"
          />
          <SettingItem
            icon="document-text"
            title="CGU"
            subtitle="Conditions générales"
          />
        </View>

        {/* APP INFO */}
        <View
          style={[styles.appInfo, { backgroundColor: theme.primary + "08" }]}
        >
          <View
            style={[
              styles.appInfoIcon,
              { backgroundColor: theme.primary + "15" },
            ]}
          >
            <Ionicons name="wallet" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.appInfoTitle, { color: theme.text }]}>
            E-PAOSY
          </Text>
          <Text style={[styles.appInfoVersion, { color: theme.textSecondary }]}>
            v1.0.0
          </Text>
        </View>

        {/* UNIVERSAL MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {getModalTitle()}
              </Text>
              {modalType === "recurrence" ? (
                <View style={styles.modernRecurrenceContainer}>
                  {frequencyOptions.map((option) => {
                    const isSelected = selectedRecurrence === option.key;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.modernRecurrenceOption,
                          {
                            borderColor: isSelected
                              ? theme.primary
                              : theme.border,
                            borderWidth: isSelected ? 2 : 1,
                            shadowColor: isSelected ? theme.primary : "#000",
                            shadowOpacity: isSelected ? 0.3 : 0.1,
                            shadowRadius: isSelected ? 10 : 4,
                            elevation: isSelected ? 6 : 2,
                          },
                        ]}
                        onPress={() => handleModalSelect(option.key)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.simpleOptionContent}>
                          <Text
                            style={[
                              styles.simpleOptionTitle,
                              {
                                color: isSelected ? theme.primary : theme.text,
                                backgroundColor: "transparent",
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                          <Text
                            style={[
                              styles.simpleOptionSubtitle,
                              {
                                color: isSelected
                                  ? theme.textSecondary
                                  : theme.textSecondary,
                                backgroundColor: "transparent",
                              },
                            ]}
                          >
                            {option.subtitle}
                          </Text>
                          {isSelected && (
                            <View style={styles.simpleSelectedIndicator}>
                              <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={theme.primary}
                              />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                getStandardOptions().map((item) => {
                  const isSelected = (function () {
                    const currentType = modalType as ModalType;
                    switch (currentType) {
                      case "recurrence":
                        return selectedRecurrence === item;
                      case "hour":
                        return (
                          notifConfig.notificationHour.toString() ===
                          (item as string)
                        );
                      default:
                        return false;
                    }
                  })();
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.modalOption,
                        {
                          borderBottomColor: theme.border,
                          backgroundColor: isSelected
                            ? theme.primary + "10"
                            : "transparent",
                          borderLeftWidth: isSelected ? 4 : 0,
                          borderLeftColor: theme.primary,
                          paddingLeft: isSelected ? 20 : 16,
                        },
                      ]}
                      onPress={() => handleModalSelect(item)}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: 1,
                        }}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            {
                              color: theme.text,
                              ...(isSelected && {
                                color: theme.primary,
                                fontWeight: "600",
                              }),
                            },
                          ]}
                        >
                          {getOptionLabel(item)}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.primary}
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}

              {modalType === "hour" && (
                <View
                  style={[
                    styles.clockContainer,
                    { backgroundColor: theme.surface + "44" },
                  ]}
                >
                  <DateTimePicker
                    testID="clockPicker"
                    value={clockTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "clock"}
                    onChange={handleClockChange}
                  />
                  <Text style={[styles.digitalPreview, { color: theme.text }]}>
                    {clockTime.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                  <View style={styles.clockButtons}>
                    <TouchableOpacity
                      style={[styles.cancelBtn, { borderColor: theme.border }]}
                      onPress={closeModal}
                    >
                      <Text
                        style={[
                          styles.cancelText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Annuler
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Duplicate Annuelle removed */}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  clockContainer: {
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    backdropFilter: "blur(20px)",
  },
  digitalPreview: {
    fontSize: 32,
    fontWeight: "800",
    marginVertical: 20,
    textAlign: "center",
    letterSpacing: 2,
  },
  clockButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  confirmBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsGroup: {
    gap: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  nestedSettings: {
    paddingLeft: 16,
    gap: 8,
    marginBottom: 8,
  },
  summary: {
    fontSize: 12,
    padding: 12,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderRadius: 10,
    marginHorizontal: 8,
  },
  hint: {
    fontSize: 12,
    fontStyle: "italic",
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 12,
    marginBottom: 20,
  },
  subscriptionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  premiumCard: {
    backgroundColor: "#0D9488",
    borderWidth: 0,
  },
  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subscriptionLabel: {
    fontSize: 13,
    color: "#475569",
  },
  subscriptionStatus: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  whiteText: {
    color: "#FFFFFF",
  },
  whiteTextBold: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  premiumBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  premiumBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  appInfo: {
    alignItems: "center",
    padding: 30,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  appInfoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  appInfoVersion: {
    fontSize: 14,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    gap: 4,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
  },
  cancelText: {
    fontWeight: "600",
    textAlign: "center",
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  customInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
  },
  customInputSmall: {
    width: 60,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
  },
  timeColon: {
    fontSize: 24,
    fontWeight: "bold",
    width: 20,
    textAlign: "center",
  },
  applyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  applyBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Modern recurrence styles
  modernRecurrenceContainer: {
    gap: 12,
  },
  modernRecurrenceOption: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  selectedIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  daysInfo: {
    flex: 1,
    marginRight: 16,
  },
  daysLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  daysValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  frequencyInfo: {
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  frequencyValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Simplified recurrence styles
  simpleOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  simpleOptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  simpleOptionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  simpleSelectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
