import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CurrencyState {
  currency: "MGA" | "USD" | "EURO";
  setCurrency: (currency: "MGA" | "USD" | "EURO") => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "MGA",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "currency-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Simple hook for usage everywhere
export const useCurrency = () => useCurrencyStore((state) => state.currency);
