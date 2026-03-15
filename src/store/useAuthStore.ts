import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
// Dynamic import used to break circular dependency: api.ts -> useAuthStore.ts -> goalService.ts -> api.ts

interface AuthState {
  token: string | null;
  accountId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  setAuth: (
    token: string,
    accountId: string,
    username: string,
  ) => Promise<void>;
  setIsPremium: (premium: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loadStorage: () => Promise<void>;
  deleteCompletedAndExpiredGoals: () => Promise<{
    deletedCount: number;
    deletedGoalNames: { name: string; status: "achieved" | "expired" }[];
  }>;
  setGoalsDeletedFlag: (
    deleted: { name: string; status: "achieved" | "expired" }[],
  ) => Promise<void>;
  getGoalsDeletedFlag: () => Promise<
    { name: string; status: "achieved" | "expired" }[] | null
  >;
  clearGoalsDeletedFlag: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  accountId: null,
  username: null,
  isAuthenticated: false,
  isPremium: false,

  setAuth: async (token, accountId, username) => {
    await SecureStore.setItemAsync("userToken", token);
    await SecureStore.setItemAsync("accountId", accountId);
    await SecureStore.setItemAsync("username", username);
    set({ token, accountId, username, isAuthenticated: true });
  },

  setIsPremium: async (premium: boolean) => {
    await SecureStore.setItemAsync("isPremium", premium.toString());
    set({ isPremium: premium });
  },

  logout: async () => {
    // First, run the cleanup for goals
    await useAuthStore.getState().deleteCompletedAndExpiredGoals();

    // Then, clear session data
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("accountId");
    await SecureStore.deleteItemAsync("username");
    await SecureStore.deleteItemAsync("isPremium");
    set({
      token: null,
      accountId: null,
      username: null,
      isAuthenticated: false,
      isPremium: false,
    });
  },

  loadStorage: async () => {
    const token = await SecureStore.getItemAsync("userToken");
    const accountId = await SecureStore.getItemAsync("accountId");
    const username = await SecureStore.getItemAsync("username");
    const isPremiumStr = await SecureStore.getItemAsync("isPremium");
    const isPremium = isPremiumStr === "true";
    if (token && accountId) {
      set({
        token,
        accountId,
        username: username ?? "Utilisateur",
        isAuthenticated: true,
        isPremium,
      });
    } else {
      set({ isPremium });
    }
  },

  deleteCompletedAndExpiredGoals: async () => {
    const accountId = useAuthStore.getState().accountId;
    if (!accountId) {
      return { deletedCount: 0, deletedGoalNames: [] };
    }

    try {
      // Dynamic import to break circular dependency cycle
      const { goalService } = await import("../services/goalService");

      // Get all goals
      const result = await goalService.getGoals(accountId);
      const goals = result.values || [];
      const now = new Date();

      // Filter completed or expired goals
      const goalsToDelete = goals.filter(
        (goal: {
          isCompleted: boolean;
          endingDate: string;
          id: string;
          walletId: string;
          name: string;
        }) => {
          const isCompleted = goal.isCompleted === true;
          const isExpired = new Date(goal.endingDate) < now;
          return isCompleted || isExpired;
        },
      );

      // Delete each goal
      let deletedCount: number = 0;
      const deletedGoalNames: {
        name: string;
        status: "achieved" | "expired";
      }[] = [];
      for (const goal of goalsToDelete) {
        try {
          await goalService.deleteGoal(accountId, goal.walletId, goal.id);
          deletedCount++;
          deletedGoalNames.push({
            name: goal.name,
            status: goal.isCompleted ? "achieved" : "expired",
          });
          console.log(`Objectif "${goal.name}" supprimé automatiquement`);
        } catch (err) {
          console.error(`Erreur suppression objectif ${goal.name}:`, err);
        }
      }

      // Set flag if any goals were deleted
      if (deletedCount > 0) {
        await SecureStore.setItemAsync(
          "goalsDeleted",
          JSON.stringify(deletedGoalNames),
        );
      }

      return { deletedCount, deletedGoalNames };
    } catch (err) {
      console.error("Erreur lors de la suppression des objectifs:", err);
      return { deletedCount: 0, deletedGoalNames: [] };
    }
  },

  setGoalsDeletedFlag: async (
    deleted: { name: string; status: "achieved" | "expired" }[],
  ) => {
    if (deleted.length > 0) {
      await SecureStore.setItemAsync("goalsDeleted", JSON.stringify(deleted));
    } else {
      await SecureStore.deleteItemAsync("goalsDeleted");
    }
  },

  getGoalsDeletedFlag: async () => {
    const value = await SecureStore.getItemAsync("goalsDeleted");
    return value ? JSON.parse(value) : null;
  },

  clearGoalsDeletedFlag: async () => {
    await SecureStore.deleteItemAsync("goalsDeleted");
  },
}));
