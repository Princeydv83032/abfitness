import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearPageCache } from "../lib/pageCache";

const useAuthStore = create(
  persist(
    (set) => ({
      role: null,
      user: null,
      isLoggedIn: false,

      setMember: (userData) =>
        set({
          role: "member",
          user: userData,
          isLoggedIn: true,
        }),

      setOwner: (ownerData) =>
        set({
          role: "owner",
          user: ownerData,
          isLoggedIn: true,
        }),

      logout: () => {
        // Page cache bhi saaf karo - warna agle user ko pichhle user ka
        // cached data ek pal ke liye dikh sakta hai
        clearPageCache();
        set({
          role: null,
          user: null,
          isLoggedIn: false,
        });
      },
    }),
    {
      name: "abfitness_auth",
    },
  ),
);

export default useAuthStore;
