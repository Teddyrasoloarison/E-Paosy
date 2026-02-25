import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useLabels } from '@/src/hooks/useLabels';
import { Ionicons } from '@expo/vector-icons';
import CreateLabelModal from '@/src/components/CreateLabelModal';
import LabelList from '@/src/components/LabelList';
import DashboardShell from '@/components/dashboard-shell';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function LabelsTab() {
  const { isLoading } = useLabels();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <DashboardShell title="Labels" subtitle="Organisez vos transactions">
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <LabelList />
      )}

      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.primary }]} 
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateLabelModal 
        visible={createModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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
