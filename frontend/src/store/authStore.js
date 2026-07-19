import { create } from "zustand";
import { persist } from "zustand/middleware";

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

      logout: () =>
        set({
          role: null,
          user: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "abfitness_auth",
    },
  ),
);

export default useAuthStore;
