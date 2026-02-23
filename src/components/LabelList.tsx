import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLabels } from '../hooks/useLabels'; 
import { Ionicons } from '@expo/vector-icons';
import { LabelItem } from '../types/label';
import EditLabelModal from './EditLabelModal'; // Import de la modale d'édition

export default function LabelList() {
  const { data, isLoading, error, archiveLabel } = useLabels();
  
  // État pour stocker le label que l'on souhaite modifier
  const [editingLabel, setEditingLabel] = useState<LabelItem | null>(null);

  const handleArchive = (label: LabelItem) => {
    Alert.alert("Archive", `Archiver le label ${label.name} ?`, [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Oui", 
        style: "destructive",
        onPress: () => archiveLabel(label.id) 
      }
    ]);
  };

  if (isLoading) return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Erreur de chargement des labels</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data?.values}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.labelCard}>
            {/* Indicateur de couleur */}
            <View style={[styles.colorIndicator, { backgroundColor: item.color || '#DDD' }]} />
            
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
            </View>

            <View style={styles.actions}>
              {/* BOUTON EDITER */}
              <TouchableOpacity 
                onPress={() => setEditingLabel(item)}
                style={styles.actionBtn}
              >
                <Ionicons name="pencil-outline" size={20} color="#2E7D32" />
              </TouchableOpacity>

              {/* BOUTON ARCHIVER */}
              <TouchableOpacity 
                onPress={() => handleArchive(item)}
                style={styles.actionBtn}
              >
                <Ionicons name="archive-outline" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun label trouvé.</Text>}
      />

      {/* Rendu de la modale d'édition si un label est sélectionné */}
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
  listContainer: { padding: 15 },
  labelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  colorIndicator: { 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    marginRight: 15 
  },
  info: { flex: 1 },
  name: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#333'
  },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8 
  },
  actionBtn: {
    padding: 5,
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 30, 
    color: '#999',
    fontSize: 14
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});