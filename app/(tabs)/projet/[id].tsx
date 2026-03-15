import DashboardShell from "@/components/dashboard-shell";
import { useCurrencyStore } from "@/src/store/useCurrencyStore";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { cacheDirectory, writeAsStringAsync } from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/colors";
import CreateProjectTransactionModal from "../../../src/components/CreateProjectTransactionModal";
import ProjectTransactionList from "../../../src/components/ProjectTransactionList";
import { useModernAlert } from "../../../src/hooks/useModernAlert";
import { projectService } from "../../../src/services/projectService";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useThemeStore } from "../../../src/store/useThemeStore";

type TabType = "transactions" | "statistics";
const { width } = Dimensions.get("window");

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const accountId = useAuthStore((state) => state.accountId);
  const currency = useCurrencyStore((state) => state.currency);
  const { success: showSuccess, error: showError } = useModernAlert();

  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [downloadingType, setDownloadingType] = useState<
    "statistics" | "invoice" | null
  >(null);

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", accountId, id],
    queryFn: () => projectService.getProjectById(accountId!, id!),
    enabled: !!accountId && !!id,
  });

  // Fetch project statistics
  const { data: statistics, isLoading: isStatsLoading } = useQuery({
    queryKey: ["projectStatistics", accountId, id],
    queryFn: () => projectService.getProjectStatistics(accountId!, id!),
    enabled: !!accountId && !!id,
  });

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/projet");
        return true;
      },
    );
    return () => backHandler.remove();
  }, [router]);

  // Debug validation
  console.log("ProjectDetailScreen project data:", project);
  const projectColor = project?.color || theme.primary;

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    let base64 = "";

    for (let i = 0; i < len; i += 3) {
      const n1 = bytes[i];
      const n2 = bytes[i + 1];
      const n3 = bytes[i + 2];

      const enc1 = n1 >> 2;
      const enc2 = ((n1 & 3) << 4) | (n2 >> 4);
      let enc3 = ((n2 & 15) << 2) | (n3 >> 6);
      let enc4 = n3 & 63;

      if (isNaN(n2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(n3)) {
        enc4 = 64;
      }

      base64 += chars[enc1] + chars[enc2] + chars[enc3] + chars[enc4];
    }

    return base64;
  };

  const handleDownloadPDF = async (type: "statistics" | "invoice") => {
    if (!accountId || !id || !project) return;

    setDownloadingType(type);
    try {
      let responseData: ArrayBuffer;

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const filename = `${type === "invoice" ? "facture" : "statistique"}-${project.name}-${dateStr}.pdf`;

      switch (type) {
        case "statistics":
          responseData = await projectService.downloadStatisticsPDF(
            accountId,
            id,
          );
          break;
        case "invoice":
          responseData = await projectService.downloadInvoicePDF(accountId, id);
          break;
        default:
          setDownloadingType(null);
          return;
      }

      const base64Code = arrayBufferToBase64(responseData);

      const fileUri = cacheDirectory + filename;

      await writeAsStringAsync(fileUri, base64Code, {
        encoding: "base64",
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "Partager le PDF",
        });
        showSuccess("Succès", "PDF généré avec succès !");
      } else {
        Alert.alert(
          "PDF enregistré",
          `Le PDF a été enregistré sous: ${fileUri}`,
        );
        showSuccess("Succès", "PDF enregistré avec succès !");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showError("Erreur", "Impossible de télécharger le PDF");
    } finally {
      setDownloadingType(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell
        title="Projet"
        subtitle="Chargement..."
        icon="briefcase-outline"
      >
        <View style={[styles.center, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </DashboardShell>
    );
  }

  if (!project) {
    return (
      <DashboardShell
        title="Projet"
        subtitle="Non trouvé"
        icon="briefcase-outline"
      >
        <View style={[styles.center, { backgroundColor: theme.background }]}>
          <Text style={{ color: theme.error }}>Projet non trouvé</Text>
        </View>
      </DashboardShell>
    );
  }

  // Calculate budget progress
  const budgetUsed = statistics?.totalRealCost || 0;
  const budgetRemaining = statistics?.remainingBudget || 0;
  const budgetProgress =
    project.initialBudget > 0 ? (budgetUsed / project.initialBudget) * 100 : 0;
  const isOverBudget = budgetRemaining < 0;
  const statusColor = isOverBudget ? theme.error : projectColor;

  return (
    <DashboardShell
      title={project.name}
      subtitle={project.description || "Détails du projet"}
      icon={
        (project as any).icon ||
        (project as any).ionicons ||
        "briefcase-outline"
      }
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Budget Summary Card */}
        <View
          style={[
            styles.budgetCard,
            { backgroundColor: theme.surface, shadowColor: theme.text },
          ]}
        >
          <View style={styles.budgetHeader}>
            <View>
              <Text
                style={[styles.budgetLabel, { color: theme.textSecondary }]}
              >
                Budget Restant
              </Text>
              <Text style={[styles.mainValue, { color: statusColor }]}>
                {budgetRemaining.toLocaleString()}{" "}
                <Text style={styles.currency}>{currency}</Text>
              </Text>
            </View>
            <View
              style={[
                styles.percentBadge,
                { backgroundColor: statusColor + "15" },
              ]}
            >
              <Text style={[styles.percentText, { color: statusColor }]}>
                {budgetProgress.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={[styles.progressBarBg, { backgroundColor: theme.border }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: statusColor,
                  width: `${Math.min(budgetProgress, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.budgetFooter}>
            <View style={styles.footerItem}>
              <Text
                style={[styles.footerLabel, { color: theme.textSecondary }]}
              >
                Initial
              </Text>
              <Text style={[styles.footerValue, { color: theme.text }]}>
                {project.initialBudget.toLocaleString()} {currency}
              </Text>
            </View>
            <View
              style={[
                styles.verticalDivider,
                { backgroundColor: theme.border },
              ]}
            />
            <View style={styles.footerItem}>
              <Text
                style={[styles.footerLabel, { color: theme.textSecondary }]}
              >
                Dépensé
              </Text>
              <Text style={[styles.footerValue, { color: theme.text }]}>
                {budgetUsed.toLocaleString()} {currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Buttons */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "transactions" && {
                borderBottomColor: projectColor,
              },
            ]}
            onPress={() => setActiveTab("transactions")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "transactions"
                  ? { color: projectColor, fontWeight: "700" }
                  : { color: theme.textSecondary },
              ]}
            >
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "statistics" && { borderBottomColor: projectColor },
            ]}
            onPress={() => setActiveTab("statistics")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "statistics"
                  ? { color: projectColor, fontWeight: "700" }
                  : { color: theme.textSecondary },
              ]}
            >
              Statistiques
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "transactions" ? (
            <ProjectTransactionList project={project} />
          ) : (
            <ScrollView
              style={styles.statsContainer}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Statistics Summary */}
              {isStatsLoading ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <>
                  <View style={styles.statsGrid}>
                    <View
                      style={[
                        styles.statCard,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          width: "100%",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statIcon,
                          { backgroundColor: projectColor + "15" },
                        ]}
                      >
                        <Ionicons
                          name="calculator"
                          size={22}
                          color={projectColor}
                        />
                      </View>
                      <View style={styles.statContent}>
                        <Text
                          style={[
                            styles.statLabel,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Estimé
                        </Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>
                          {statistics?.totalEstimatedCost?.toLocaleString() ||
                            0}{" "}
                          <Text style={{ fontSize: 12, fontWeight: "400" }}>
                            {currency}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statCard,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          width: "100%",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statIcon,
                          { backgroundColor: theme.success + "15" },
                        ]}
                      >
                        <Ionicons name="cash" size={22} color={theme.success} />
                      </View>
                      <View style={styles.statContent}>
                        <Text
                          style={[
                            styles.statLabel,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Réel
                        </Text>
                        <Text
                          style={[styles.statValue, { color: theme.success }]}
                        >
                          {statistics?.totalRealCost?.toLocaleString() || 0}{" "}
                          <Text style={{ fontSize: 12, fontWeight: "400" }}>
                            {currency}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statCard,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          width: "100%",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statIcon,
                          { backgroundColor: theme.primary + "15" },
                        ]}
                      >
                        <Ionicons
                          name="receipt-outline"
                          size={22}
                          color={theme.primary}
                        />
                      </View>
                      <View style={styles.statContent}>
                        <Text
                          style={[
                            styles.statLabel,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Transactions totales
                        </Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>
                          {statistics?.transactionCount || 0}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* PDF Download Section */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Documents
                  </Text>

                  <View style={styles.pdfButtons}>
                    <TouchableOpacity
                      style={[
                        styles.pdfButton,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => handleDownloadPDF("statistics")}
                      disabled={!!downloadingType}
                    >
                      {downloadingType === "statistics" ? (
                        <ActivityIndicator size="small" color={projectColor} />
                      ) : (
                        <>
                          <View
                            style={[
                              styles.pdfIcon,
                              { backgroundColor: projectColor + "15" },
                            ]}
                          >
                            <Ionicons
                              name="stats-chart"
                              size={20}
                              color={projectColor}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.pdfButtonText,
                                { color: theme.text },
                              ]}
                            >
                              Rapport Statistique
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: theme.textSecondary,
                              }}
                            >
                              Format PDF
                            </Text>
                          </View>
                          <Ionicons
                            name="download-outline"
                            size={20}
                            color={theme.textTertiary}
                          />
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.pdfButton,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => handleDownloadPDF("invoice")}
                      disabled={!!downloadingType}
                    >
                      {downloadingType === "invoice" ? (
                        <ActivityIndicator size="small" color={theme.success} />
                      ) : (
                        <>
                          <View
                            style={[
                              styles.pdfIcon,
                              { backgroundColor: theme.success + "15" },
                            ]}
                          >
                            <Ionicons
                              name="document-text"
                              size={20}
                              color={theme.success}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.pdfButtonText,
                                { color: theme.text },
                              ]}
                            >
                              Facture détaillée
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: theme.textSecondary,
                              }}
                            >
                              Format PDF
                            </Text>
                          </View>
                          <Ionicons
                            name="download-outline"
                            size={20}
                            color={theme.textTertiary}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* FAB for adding transaction */}
      {activeTab === "transactions" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: projectColor }]}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {project && (
        <CreateProjectTransactionModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          project={project}
        />
      )}
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  budgetCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  mainValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  budgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  verticalDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    marginBottom: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-around",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statCard: {
    width: (width - 56) / 2, // 2 colonnes avec padding (20*2) et gap (16)
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 16,
  },
  pdfButtons: {
    gap: 16,
    marginBottom: 40,
  },
  pdfButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  pdfIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pdfButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: "0px 4px 12px rgba(13, 148, 136, 0.3)" },
    }),
  },
});
