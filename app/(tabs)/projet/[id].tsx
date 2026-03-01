import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Colors } from '../../../constants/colors';
import CreateProjectTransactionModal from '../../../src/components/CreateProjectTransactionModal';
import ProjectTransactionList from '../../../src/components/ProjectTransactionList';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '../../../src/services/projectService';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { useModernAlert } from '../../../src/hooks/useModernAlert';

type TabType = 'transactions' | 'statistics';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const accountId = useAuthStore((state) => state.accountId);
  const { success: showSuccess, error: showError } = useModernAlert();
  
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [downloadingType, setDownloadingType] = useState<'statistics' | 'invoice' | null>(null);

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', accountId, id],
    queryFn: () => projectService.getProjectById(accountId!, id!),
    enabled: !!accountId && !!id,
  });

  // Fetch project statistics
  const { data: statistics, isLoading: isStatsLoading } = useQuery({
    queryKey: ['projectStatistics', accountId, id],
    queryFn: () => projectService.getProjectStatistics(accountId!, id!),
    enabled: !!accountId && !!id,
  });

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)/projet');
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  const projectColor = project?.color || theme.primary;

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    let base64 = '';

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

  const handleDownloadPDF = async (type: 'statistics' | 'invoice') => {
    if (!accountId || !id || !project) return;

    setDownloadingType(type);
    try {
      let responseData: ArrayBuffer;

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const filename = `${type === 'invoice' ? 'facture' : 'statistique'}-${project.name}-${dateStr}.pdf`;

      switch (type) {
        case 'statistics':
          responseData = await projectService.downloadStatisticsPDF(accountId, id);
          break;
        case 'invoice':
          responseData = await projectService.downloadInvoicePDF(accountId, id);
          break;
        default:
          setDownloadingType(null);
          return;
      }

      const base64Code = arrayBufferToBase64(responseData);
      
      const fileUri = cacheDirectory + filename;

      await writeAsStringAsync(fileUri, base64Code, {
        encoding: 'base64',
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partager le PDF',
        });
        showSuccess('Succès', 'PDF généré avec succès !');
      } else {
        Alert.alert('PDF enregistré', `Le PDF a été enregistré sous: ${fileUri}`);
        showSuccess('Succès', 'PDF enregistré avec succès !');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showError('Erreur', 'Impossible de télécharger le PDF');
    } finally {
      setDownloadingType(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Projet" subtitle="Chargement..." icon="flag-outline">
        <View style={[styles.center, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </DashboardShell>
    );
  }

  if (!project) {
    return (
      <DashboardShell title="Projet" subtitle="Non trouvé" icon="flag-outline">
        <View style={[styles.center, { backgroundColor: theme.background }]}>
          <Text style={{ color: theme.error }}>Projet non trouvé</Text>
        </View>
      </DashboardShell>
    );
  }

  // Calculate budget progress
  const budgetUsed = statistics?.totalRealCost || 0;
  const budgetRemaining = statistics?.remainingBudget || 0;
  const budgetProgress = project.initialBudget > 0 ? (budgetUsed / project.initialBudget) * 100 : 0;
  const isOverBudget = budgetRemaining < 0;

  return (
    <DashboardShell 
      title={project.name} 
      subtitle={project.description || 'Détails du projet'} 
      icon="flag-outline"
    >
      <View style={styles.container}>
        {/* Budget Summary Card */}
        <View style={[styles.budgetCard, { backgroundColor: projectColor + '15', borderColor: projectColor + '30' }]}>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetItem}>
              <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Budget Initial</Text>
              <Text style={[styles.budgetValue, { color: theme.text }]}>
                {project.initialBudget.toLocaleString()} Ar
              </Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Restant</Text>
              <Text style={[styles.budgetValue, { color: isOverBudget ? theme.error : theme.success }]}>
                {budgetRemaining.toLocaleString()} Ar
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: isOverBudget ? theme.error : projectColor,
                  width: `${Math.min(budgetProgress, 100)}%` 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {budgetProgress.toFixed(1)}% utilisé
          </Text>
        </View>

        {/* Tab Buttons */}
        <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'transactions' && { backgroundColor: projectColor + '20' }
            ]}
            onPress={() => setActiveTab('transactions')}
          >
            <Ionicons 
              name="receipt" 
              size={18} 
              color={activeTab === 'transactions' ? projectColor : theme.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'transactions' ? projectColor : theme.textSecondary }
            ]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'statistics' && { backgroundColor: projectColor + '20' }
            ]}
            onPress={() => setActiveTab('statistics')}
          >
            <Ionicons 
              name="stats-chart" 
              size={18} 
              color={activeTab === 'statistics' ? projectColor : theme.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'statistics' ? projectColor : theme.textSecondary }
            ]}>
              Statistiques
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'transactions' ? (
            <ProjectTransactionList project={project} />
          ) : (
            <ScrollView style={styles.statsContainer}>
              {/* Statistics Summary */}
              {isStatsLoading ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <>
                  <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.statIcon, { backgroundColor: projectColor + '20' }]}>
                      <Ionicons name="calculator" size={24} color={projectColor} />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Coût Total Estimé</Text>
                      <Text style={[styles.statValue, { color: projectColor }]}>
                        {statistics?.totalEstimatedCost?.toLocaleString() || 0} Ar
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.statIcon, { backgroundColor: theme.success + '20' }]}>
                      <Ionicons name="cash" size={24} color={theme.success} />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Coût Total Réel</Text>
                      <Text style={[styles.statValue, { color: theme.success }]}>
                        {statistics?.totalRealCost?.toLocaleString() || 0} Ar
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.statIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Ionicons name="receipt" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Nombre de Transactions</Text>
                      <Text style={[styles.statValue, { color: theme.text }]}>
                        {statistics?.transactionCount || 0}
                      </Text>
                    </View>
                  </View>

                  {/* PDF Download Section */}
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Exporter en PDF</Text>
                  
                  <View style={styles.pdfButtons}>
                    <TouchableOpacity 
                      style={[styles.pdfButton, { backgroundColor: projectColor + '15', borderColor: projectColor + '30' }]}
                      onPress={() => handleDownloadPDF('statistics')}
                      disabled={!!downloadingType}
                    >
                      {downloadingType === 'statistics' ? (
                        <ActivityIndicator size="small" color={projectColor} />
                      ) : (
                        <>
                          <Ionicons name="stats-chart" size={20} color={projectColor} />
                          <Text style={[styles.pdfButtonText, { color: projectColor }]}>Statistiques</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.pdfButton, { backgroundColor: theme.success + '15', borderColor: theme.success + '30' }]}
                      onPress={() => handleDownloadPDF('invoice')}
                      disabled={!!downloadingType}
                    >
                      {downloadingType === 'invoice' ? (
                        <ActivityIndicator size="small" color={theme.success} />
                      ) : (
                        <>
                          <Ionicons name="document-text" size={20} color={theme.success} />
                          <Text style={[styles.pdfButtonText, { color: theme.success }]}>Facture</Text>
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
      {activeTab === 'transactions' && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: projectColor }]} 
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <CreateProjectTransactionModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        project={project}
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  pdfButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 100,
  },
  pdfButton: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  pdfButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0px 4px 12px rgba(13, 148, 136, 0.3)' },
    }),
  },
});
