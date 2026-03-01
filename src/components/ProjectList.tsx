import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import ConfirmModal from './ConfirmModal';
import { useProjects } from '../hooks/useProjects';
import { useThemeStore } from '../store/useThemeStore';
import { Project } from '../types/project';
import EditProjectModal from './EditProjectModal';

// Mapping des icônes par défaut pour les projets
const PROJECT_DEFAULT_ICONS: Record<string, string> = {
  'default': 'folder',
  'construction': 'construct',
  'home': 'home',
  'car': 'car',
  'airplane': 'airplane',
  'gift': 'gift',
  'school': 'school',
  'heart': 'heart',
  'cart': 'cart',
  'briefcase': 'briefcase',
};

export default function ProjectList() {
  const { data, isLoading, error, archiveProject } = useProjects();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Get fresh project data from the query cache based on selected ID
  const selectedProject = useMemo(() => {
    if (!selectedProjectId || !data?.values) return null;
    return data.values.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, data?.values]);

  // Clic sur le projet -> Ouvre EditProjectModal
  const handleProjectPress = useCallback((project: Project) => {
    setSelectedProjectId(project.id);
  }, []);

  // Double clic -> Navigate to detail screen
  const handleProjectLongPress = useCallback((project: Project) => {
    router.push(`/projet/${project.id}` as any);
  }, [router]);

  const handleArchiveProject = useCallback((project: Project) => {
    setProjectToArchive(project);
  }, []);

  const confirmArchive = useCallback(() => {
    if (projectToArchive) {
      archiveProject(projectToArchive.id, {
        onSuccess: () => {
          setProjectToArchive(null);
        },
        onError: () => {
          setProjectToArchive(null);
        }
      });
    }
  }, [projectToArchive, archiveProject]);

  const handleCloseModal = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  // Sort projects by creation date (newest first - based on id)
  const sortedProjects = useMemo(() => {
    if (!data?.values) return [];
    return [...data.values].sort((a, b) => b.id.localeCompare(a.id));
  }, [data?.values]);

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
          <Ionicons name="alert-circle" size={28} color={theme.error} />
        </View>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Erreur lors du chargement des projets
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={sortedProjects}
        keyExtractor={(item, index) => item?.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (!item) return null;

          // Utiliser iconRef s'il existe, sinon utiliser une icône par défaut
          const projectIcon = item.iconRef || PROJECT_DEFAULT_ICONS['default'] || 'folder';
          const projectColor = item.color || theme.primary;

          return (
            <TouchableOpacity 
              style={[
                styles.projectCard, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.border,
                },
                item.isArchived && { opacity: 0.6 }
              ]}
              onPress={() => handleProjectPress(item)}
              onLongPress={() => handleProjectLongPress(item)}
              delayLongPress={500}
              activeOpacity={0.7}
            >
              {/* Icône avec couleur du projet */}
              <View style={[styles.iconContainer, { backgroundColor: projectColor + '20' }]}>
                <Ionicons 
                  name={projectIcon as any} 
                  size={24} 
                  color={item.isArchived ? theme.textTertiary : projectColor} 
                />
              </View>

              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {item.name || 'Sans nom'}
                </Text>
                {item.description ? (
                  <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
                
                {/* Affichage du budget initial */}
                {item.initialBudget !== undefined && item.initialBudget > 0 && (
                   <View style={[styles.budgetBadge, { backgroundColor: projectColor + '15' }]}>
                     <Ionicons name="wallet-outline" size={14} color={projectColor} />
                     <Text style={[styles.budgetBadgeText, { color: projectColor }]}>
                       Budget: {item.initialBudget.toLocaleString()} Ar
                     </Text>
                   </View>
                )}
              </View>

              <View style={styles.statusContainer}>
                <View style={styles.actionButtons}>
                  {/* Bouton pour voir les détails */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: projectColor + '20' }]}
                    onPress={() => handleProjectLongPress(item)}
                  >
                    <Ionicons name="eye" size={16} color={projectColor} />
                  </TouchableOpacity>
                  {/* Bouton pour modifier */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                    onPress={() => handleProjectPress(item)}
                  >
                    <Ionicons name="pencil" size={16} color={theme.primary} />
                  </TouchableOpacity>
                  {/* Bouton pour archiver */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.warning + '20' }]}
                    onPress={() => handleArchiveProject(item)}
                  >
                    <Ionicons name="archive" size={16} color={theme.warning} />
                  </TouchableOpacity>
                </View>
                {item.isArchived && (
                  <Text style={[styles.archivedTag, { color: theme.warning }]}>Archivé</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="flag-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun projet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Créez votre premier projet pour commencer
            </Text>
          </View>
        }
      />

      {selectedProject && (
        <EditProjectModal
          visible={true}
          onClose={handleCloseModal}
          project={selectedProject}
        />
      )}

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        visible={!!projectToArchive}
        title="Archiver le projet"
        message={`Êtes-vous sûr de vouloir archiver "${projectToArchive?.name}"?`}
        confirmText="Archiver"
        cancelText="Annuler"
        onConfirm={confirmArchive}
        onCancel={() => setProjectToArchive(null)}
        isDestructive={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { 
    paddingVertical: 10,
    paddingBottom: 100,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 1,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { 
    flex: 1, 
    marginLeft: 14,
  },
  name: { 
    fontSize: 16, 
    fontWeight: '700',
  },
  description: { 
    fontSize: 13, 
    marginTop: 2,
  },
  statusContainer: { 
    alignItems: 'flex-end',
  },
  archivedTag: { 
    fontSize: 11, 
    fontWeight: '700',
    marginTop: 4,
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
  budgetBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  budgetBadgeText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
