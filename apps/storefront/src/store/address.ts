import { create } from "zustand";
import { addressService } from "@repo/api";
import type { UserAddress, AddressForm } from "@repo/types";

interface AddressState {
  addresses: UserAddress[];
  isLoading: boolean;
  error: string | null;
  lastNotification: string | null;
}

interface AddressActions {
  fetchAddresses: () => Promise<void>;
  createAddress: (
    addressData: AddressForm & { type: "shipping" | "billing" }
  ) => Promise<UserAddress>;
  updateAddress: (id: number, addressData: AddressForm) => Promise<UserAddress>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (
    id: number,
    type: "shipping" | "billing"
  ) => Promise<void>;
  clearError: () => void;
  clearNotification: () => void;
  getDefaultAddress: (type: "shipping" | "billing") => UserAddress | undefined;
  getAddressesByType: (type: "shipping" | "billing") => UserAddress[];
}

export const useAddressStore = create<AddressState & AddressActions>(
  (set, get) => ({
    addresses: [],
    isLoading: false,
    error: null,
    lastNotification: null,

    fetchAddresses: async () => {
      set({ isLoading: true, error: null });
      try {
        const addresses = await addressService.getAddresses();
        console.log("Fetched addresses:", addresses);
        set({ addresses, error: null });
      } catch (error: any) {
        console.error("Failed to fetch addresses:", error);
        set({ error: error.message || "Failed to fetch addresses" });
      } finally {
        set({ isLoading: false });
      }
    },

    createAddress: async (
      addressData: AddressForm & { type: "shipping" | "billing" }
    ) => {
      set({ isLoading: true, error: null });
      try {
        const newAddress = await addressService.createAddress(addressData);
        console.log("Created address:", newAddress);

        set((state) => ({
          addresses: [...state.addresses, newAddress],
          error: null,
          lastNotification: `${addressData.type.charAt(0).toUpperCase() + addressData.type.slice(1)} address created successfully!`,
        }));

        setTimeout(() => {
          set({ lastNotification: null });
        }, 3000);

        return newAddress;
      } catch (error: any) {
        console.error("Failed to create address:", error);
        set({ error: error.message || "Failed to create address" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateAddress: async (id: number, addressData: AddressForm) => {
      set({ isLoading: true, error: null });
      try {
        const updatedAddress = await addressService.updateAddress(
          id,
          addressData
        );
        console.log("Updated address:", updatedAddress);

        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? updatedAddress : addr
          ),
          error: null,
          lastNotification: "Address updated successfully!",
        }));

        setTimeout(() => {
          set({ lastNotification: null });
        }, 3000);

        return updatedAddress;
      } catch (error: any) {
        console.error("Failed to update address:", error);
        set({ error: error.message || "Failed to update address" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteAddress: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        await addressService.deleteAddress(id);
        console.log("Deleted address:", id);

        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== id),
          error: null,
          lastNotification: "Address deleted successfully!",
        }));

        setTimeout(() => {
          set({ lastNotification: null });
        }, 3000);
      } catch (error: any) {
        console.error("Failed to delete address:", error);
        set({ error: error.message || "Failed to delete address" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    setDefaultAddress: async (id: number, type: "shipping" | "billing") => {
      set({ isLoading: true, error: null });
      try {
        const updatedAddress = await addressService.setDefaultAddress(id, type);
        console.log("Set default address:", updatedAddress);

        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            // Only update is_default for addresses of the same type
            is_default: addr.type === type ? addr.id === id : addr.is_default,
          })),
          error: null,
          lastNotification: `Default ${type} address updated!`,
        }));

        setTimeout(() => {
          set({ lastNotification: null });
        }, 3000);
      } catch (error: any) {
        console.error("Failed to set default address:", error);
        set({ error: error.message || "Failed to set default address" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    clearNotification: () => {
      set({ lastNotification: null });
    },

    getDefaultAddress: (type: "shipping" | "billing") => {
      const { addresses } = get();
      return addresses.find((addr) => addr.type === type && addr.is_default);
    },

    getAddressesByType: (type: "shipping" | "billing") => {
      const { addresses } = get();
      return addresses.filter((addr) => addr.type === type);
    },
  })
);
