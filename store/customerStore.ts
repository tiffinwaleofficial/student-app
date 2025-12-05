import { create } from 'zustand';
import { DeliveryAddress } from '@/types/api';
import api from '@/utils/apiClient';

interface CustomerState {
  addresses: DeliveryAddress[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => Promise<void>;
  updateAddress: (address: DeliveryAddress) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  addresses: [],
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await api.customer.getAddresses();
      set({ addresses, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch addresses',
        isLoading: false,
      });
    }
  },

  addAddress: async (address: Omit<DeliveryAddress, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📤 Sending address to backend:', address);
      const newAddress = await api.customer.addAddress(address);
      console.log('✅ Address added successfully:', newAddress);
      
      // Add frontend-only fields for display
      const addressWithDisplay = {
        ...newAddress,
        type: address.type || 'Other',
        displayName: address.type || 'Other',
      };
      
      set((state) => ({
        addresses: [...state.addresses, addressWithDisplay],
        isLoading: false,
      }));
    } catch (error) {
      console.error('❌ Error adding address:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to add address',
        isLoading: false,
      });
    }
  },

  updateAddress: async (address: DeliveryAddress) => {
    set({ isLoading: true, error: null });
    if (!address.id) {
      set({ error: 'Address ID is missing for update', isLoading: false });
      return;
    }
    try {
      console.log('📤 Updating address:', address.id, address);
      const updatedAddress = await api.customer.updateAddress(address.id, address);
      console.log('✅ Address updated successfully:', updatedAddress);
      
      // Add frontend-only fields for display
      const addressWithDisplay = {
        ...updatedAddress,
        type: address.type || 'Other',
        displayName: address.type || 'Other',
      };
      
      set((state) => ({
        addresses: state.addresses.map((a) => (a.id === address.id ? addressWithDisplay : a)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('❌ Error updating address:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update address',
        isLoading: false,
      });
    }
  },

  deleteAddress: async (id: string) => {
    console.log('🗑️ CustomerStore: deleteAddress called with id:', id);
    set({ isLoading: true, error: null });
    try {
      console.log('🗑️ CustomerStore: Calling API to delete address:', id);
      await api.customer.deleteAddress(id);
      console.log('✅ CustomerStore: Address deleted successfully, updating state');
      set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('❌ CustomerStore: Error deleting address:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete address',
        isLoading: false,
      });
    }
  },
})); 