import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useLabels } from '../hooks/useLabels';
import { useModernAlert } from '../hooks/useModernAlert';
import { useThemeStore } from '../store/useThemeStore';
import { LabelItem } from '../types/label';
import EditLabelModal from './EditLabelModal';

export default function LabelList() {
  const { labels, isLoading, error, archiveLabel } = useLabels();
  const [editingLabel, setEditingLabel] = useState<LabelItem | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Sort labels by creation date (newest first)
  const sortedLabels = useMemo(() => {
    if (!labels) return [];
    return [...labels].sort((a, b) => {
      // If createdAt exists, use it for sorting (newest first)
      if (a.createdAt && b.createdAt) {
        return b.createdAt.localeCompare(a.createdAt);
      }
      // Fallback: keep original order from API
      return 0;
    });
  }, [labels]);

  const { show } = useModernAlert();

  const handleArchive = (label: LabelItem) => {
    show({
      title: "Archiver",
      message: `Voulez-vous archiver le label "${label.name}" ?`,
      type: 'confirm',
      buttons: [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui", 
          style: "destructive",
          onPress: () => archiveLabel(label.id) 
        }
      ]
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: theme.error + '15' }]}>
          <Ionicons name="alert-circle" size={32} color={theme.error} />
        </View>
        <Text style={[styles.errorText, { color: theme.error }]}>Erreur de chargement</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={sortedLabels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.labelCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setEditingLabel(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.labelColorBar, { backgroundColor: item.color || theme.primary }]} />
            
            <View style={styles.labelContent}>
              <View style={styles.labelInfo}>
                <Text style={[styles.labelName, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.labelMeta}>
                  <Ionicons name="pricetag-outline" size={12} color={theme.textTertiary} />
                  <Text style={[styles.labelMetaText, { color: theme.textTertiary }]}>
                    {item.id.slice(0, 8)}...
                  </Text>
                </View>
              </View>
              
              <View style={styles.labelActions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
                  onPress={() => setEditingLabel(item)}
                >
                  <Ionicons name="pencil" size={16} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.error + '15' }]}
                  onPress={() => handleArchive(item)}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="pricetag-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun label</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Créez votre premier label pour catégoriser vos transactions
            </Text>
          </View>
        }
      />

      {editingLabel && (
        <EditLabelModal 
          visible={!!editingLabel} 
          onClose={() => setEditingLabel(null)} 
          label={editingLabel} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { 
    padding: 12,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  labelColorBar: {
    width: 6,
  },
  labelContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  labelInfo: {
    flex: 1,
  },
  labelName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  labelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelMetaText: {
    fontSize: 12,
  },
  labelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
