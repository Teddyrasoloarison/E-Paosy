import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/projectService";
import { useAuthStore } from "../store/useAuthStore";
import { CreateProjectDto, UpdateProjectDto, ProjectStatistics } from "../types/project";

export const useProjects = () => {
  const accountId = useAuthStore((state) => state.accountId);
  const queryClient = useQueryClient();

  // 1. La Query : Pour récupérer la liste des projets (GET)
  const query = useQuery({
    queryKey: ["projects", accountId],
    queryFn: () => projectService.getProjects(accountId!),
    enabled: !!accountId,
  });

  // Query pour récupérer les statistiques de tous les projets
  const statisticsQuery = useQuery({
    queryKey: ["projectsStatistics", accountId],
    queryFn: async () => {
      const projects = await projectService.getProjects(accountId!);
      if (!projects.values || projects.values.length === 0) {
        return {};
      }
      
      // Récupérer les statistiques pour chaque projet en parallèle
      const statsPromises = projects.values.map(async (project) => {
        try {
          const stats = await projectService.getProjectStatistics(accountId!, project.id);
          return { [project.id]: stats };
        } catch {
          // En cas d'erreur, retourner des statistiques vides
          return { 
            [project.id]: {
              project,
              totalEstimatedCost: 0,
              totalRealCost: 0,
              remainingBudget: project.initialBudget,
              transactionCount: 0,
            } as ProjectStatistics 
          };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      return Object.assign({}, ...statsResults);
    },
    enabled: !!accountId && !!query.data?.values?.length,
    staleTime: 30000, // Cache pendant 30 secondes
  });

  // 2. Mutation : Créer un projet (POST)
  const createMutation = useMutation({
    mutationFn: (newProject: CreateProjectDto) =>
      projectService.createProject(accountId!, newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", accountId] });
    },
  });

  // 3. Mutation : Mettre à jour un projet (PUT)
  const updateMutation = useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectDto;
    }) => projectService.updateProject(accountId!, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", accountId] });
    },
  });

  // 4. Mutation : Supprimer un projet (DELETE)
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) =>
      projectService.deleteProject(accountId!, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", accountId] });
    },
  });

  // 5. Mutation : Archiver un projet (POST)
  const archiveMutation = useMutation({
    mutationFn: (projectId: string) =>
      projectService.archiveProject(accountId!, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", accountId] });
    },
  });

  // Helper function to handle delete with callbacks
  const handleDelete = (projectId: string, options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => {
    deleteMutation.mutate(projectId, {
      onSuccess: () => {
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error as Error);
      },
    });
  };

  // Helper function to handle archive with callbacks
  const handleArchive = (projectId: string, options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => {
    archiveMutation.mutate(projectId, {
      onSuccess: () => {
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error as Error);
      },
    });
  };

  return {
    ...query,
    // Données des projets
    projects: query.data?.values || [],

    // Statistiques des projets
    projectStatistics: statisticsQuery.data || {},
    isLoadingStatistics: statisticsQuery.isLoading,
    statisticsError: statisticsQuery.error,

    // Actions
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: handleDelete,
    archiveProject: handleArchive,

    // États de chargement
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isArchiving: archiveMutation.isPending,

    // Erreurs
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    archiveError: archiveMutation.error,
  };
};
