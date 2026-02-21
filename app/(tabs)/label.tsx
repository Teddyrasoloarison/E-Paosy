import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardShell from '@/components/dashboard-shell';
import { useAuthStore } from '@/src/store/useAuthStore';
import { LabelItem, LabelPayload, labelService } from '@/src/services/labelService';

const DEFAULT_COLOR = '#4CAF50';
const PAGE_SIZE = 5;
const COLOR_OPTIONS = [
  '#4CAF50',
  '#2E7D32',
  '#1E88E5',
  '#1565C0',
  '#8E24AA',
  '#E91E63',
  '#F4511E',
  '#FB8C00',
  '#FDD835',
  '#546E7A',
];

export default function LabelScreen() {
  const accountId = useAuthStore((state) => state.accountId);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelItem | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const normalizeText = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const isResemblingLabelName = (rawName: string, pool: LabelItem[]) => {
    const normalizedCandidate = normalizeText(rawName);
    return pool.some((label) => {
      if (editingLabel && label.id === editingLabel.id) {
        return false;
      }
      const normalizedExisting = normalizeText(label.name);
      return (
        normalizedExisting === normalizedCandidate ||
        normalizedExisting.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normalizedExisting)
      );
    });
  };

  const getAllLabelsForUniquenessCheck = async (activeAccountId: string) => {
    const firstPage = await labelService.getAll(activeAccountId, 1, 50);
    const all = [...(firstPage.values || [])];
    const allPages = firstPage.pagination?.totalPage || 1;

    if (allPages <= 1) {
      return all;
    }

    for (let page = 2; page <= allPages; page += 1) {
      const nextPage = await labelService.getAll(activeAccountId, page, 50);
      all.push(...(nextPage.values || []));
    }

    return all;
  };

  const resetForm = () => {
    setName('');
    setColor(DEFAULT_COLOR);
    setEditingLabel(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (label: LabelItem) => {
    setEditingLabel(label);
    setName(label.name);
    setColor(label.color || DEFAULT_COLOR);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const loadLabels = useCallback(async () => {
    if (!accountId) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await labelService.getAll(accountId, currentPage, PAGE_SIZE);
      setLabels(data.values ?? []);
      setTotalPage(data.pagination?.totalPage || 1);
      setHasNext(Boolean(data.pagination?.hasNext));
      setHasPrev(Boolean(data.pagination?.hasPrev));
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de charger les labels.');
    } finally {
      setIsLoading(false);
    }
  }, [accountId, currentPage]);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const handleSave = async () => {
    if (!accountId) {
      Alert.alert('Erreur', 'Compte non trouve.');
      return;
    }

    if (!canSubmit) {
      Alert.alert('Validation', 'Le nom du label est obligatoire.');
      return;
    }

    const payload: LabelPayload = {
      name: name.trim(),
      color: color.trim() || DEFAULT_COLOR,
    };

    setIsSaving(true);
    try {
      const allLabels = await getAllLabelsForUniquenessCheck(accountId);
      if (isResemblingLabelName(name, allLabels)) {
        Alert.alert('Validation', 'Un label similaire existe deja. Choisissez un nom plus distinct.');
        return;
      }

      if (editingLabel) {
        await labelService.updateOne(accountId, editingLabel.id, payload);
      } else {
        await labelService.createOne(accountId, payload);
      }
      closeModal();
      await loadLabels();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Operation impossible.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (label: LabelItem) => {
    if (!accountId) {
      return;
    }

    Alert.alert('Suppression', `Supprimer le label "${label.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await labelService.archiveOne(accountId, label.id);
            await loadLabels();
          } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Suppression impossible.');
          }
        },
      },
    ]);
  };

  return (
    <DashboardShell title="Label" subtitle="Gestion des labels">
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Creer un label</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.tableContainer} contentContainerStyle={styles.tableContent}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.nameCol]}>Nom</Text>
          <Text style={[styles.headerCell, styles.colorCol]}>Couleur</Text>
          <Text style={[styles.headerCell, styles.actionCol]}>Actions</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#2E7D32" />
          </View>
        ) : labels.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucun label disponible.</Text>
          </View>
        ) : (
          labels.map((label) => (
            <View key={label.id} style={styles.row}>
              <Text style={[styles.cell, styles.nameCol]} numberOfLines={1}>
                {label.name}
              </Text>
              <View style={[styles.cell, styles.colorCol, styles.colorCellWrap]}>
                <View style={[styles.colorDot, { backgroundColor: label.color || DEFAULT_COLOR }]} />
                <Text style={styles.colorText} numberOfLines={1}>
                  {label.color || DEFAULT_COLOR}
                </Text>
              </View>
              <View style={[styles.cell, styles.actionCol, styles.actionWrap]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => openEditModal(label)}>
                  <Ionicons name="create-outline" size={17} color="#1B5E20" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(label)}>
                  <Ionicons name="trash-outline" size={17} color="#C62828" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, !hasPrev && styles.pageButtonDisabled]}
          onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={!hasPrev}
        >
          <Text style={[styles.pageButtonText, !hasPrev && styles.pageButtonTextDisabled]}>Precedent</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          Page {currentPage} / {Math.max(1, totalPage)}
        </Text>
        <TouchableOpacity
          style={[styles.pageButton, !hasNext && styles.pageButtonDisabled]}
          onPress={() => setCurrentPage((prev) => prev + 1)}
          disabled={!hasNext}
        >
          <Text style={[styles.pageButtonText, !hasNext && styles.pageButtonTextDisabled]}>Suivant</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingLabel ? 'Modifier le label' : 'Creer un label'}</Text>

            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Courses"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Couleur</Text>
            <View style={styles.palette}>
              {COLOR_OPTIONS.map((itemColor) => {
                const isSelected = color === itemColor;
                return (
                  <TouchableOpacity
                    key={itemColor}
                    style={[
                      styles.paletteItem,
                      { backgroundColor: itemColor },
                      isSelected && styles.paletteItemSelected,
                    ]}
                    onPress={() => setColor(itemColor)}
                  >
                    {isSelected ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal} disabled={isSaving}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, (!canSubmit || isSaving) && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!canSubmit || isSaving}
              >
                <Text style={styles.saveButtonText}>{isSaving ? 'En cours...' : 'Valider'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  createButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFEADF',
    maxHeight: 430,
  },
  tableContent: { paddingBottom: 4 },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9F1EA',
    backgroundColor: '#F8FCF8',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerCell: { color: '#4E6855', fontWeight: '700', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F5F0',
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  cell: { color: '#223B2B', fontSize: 13 },
  nameCol: { flex: 1.5, paddingRight: 8 },
  colorCol: { flex: 1.8, paddingRight: 8 },
  actionCol: { flex: 1.2 },
  colorCellWrap: { flexDirection: 'row', alignItems: 'center' },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#D6E4D9',
  },
  colorText: { color: '#223B2B', fontSize: 12, flex: 1 },
  actionWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EFF6F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: { paddingVertical: 26 },
  emptyBox: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: '#6A7F70' },
  pagination: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageButton: {
    backgroundColor: '#E8F3E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pageButtonDisabled: { backgroundColor: '#F2F4F2' },
  pageButtonText: { color: '#1B5E20', fontWeight: '600', fontSize: 13 },
  pageButtonTextDisabled: { color: '#9DA9A1' },
  pageInfo: { color: '#425B4B', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2ECE4',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1B5E20', marginBottom: 14 },
  inputLabel: { color: '#58725F', fontSize: 13, marginBottom: 6, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D9E6DC',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    color: '#1E3526',
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  paletteItem: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paletteItemSelected: {
    borderColor: '#1B5E20',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  cancelButton: {
    backgroundColor: '#F1F3F1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelButtonText: { color: '#607566', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
