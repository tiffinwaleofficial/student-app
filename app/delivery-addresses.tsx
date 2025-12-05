import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Edit, MapPin, Home, Building, MapPin as OtherIcon } from 'lucide-react-native';
import { useCustomerStore } from '@/store/customerStore';
import { DeliveryAddress } from '@/types/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { showNotification } from '@/utils/notificationService';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { BaseModal, ConfirmDialog, FormInput, FormTagGroup, FormToggle, IconButton } from '@/components/ui';


export default function DeliveryAddressesScreen() {
  const router = useRouter();
  const { t } = useTranslation('profile');
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { addresses, isLoading, error, fetchAddresses, addAddress, updateAddress, deleteAddress } = useCustomerStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('add');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openModal = (address?: DeliveryAddress, mode: 'view' | 'edit' | 'add' = 'add') => {
    setSelectedAddress(address || null);
    setModalMode(mode);
    setModalVisible(true);
  };

  const handleDelete = (address: DeliveryAddress) => {
    console.log('🗑️ handleDelete called for address:', address);
    setAddressToDelete(address);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (addressToDelete?.id) {
      console.log('🗑️ Delete confirmed, calling deleteAddress with id:', addressToDelete.id);
      await deleteAddress(addressToDelete.id);
      setDeleteModalVisible(false);
      setAddressToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('🗑️ Delete cancelled');
    setDeleteModalVisible(false);
    setAddressToDelete(null);
  };

  const AddressForm = ({ address, mode, onSave, onCancel, onEdit }: {
    address: DeliveryAddress | null,
    mode: 'view' | 'edit' | 'add',
    onSave: (addr: DeliveryAddress) => void,
    onCancel: () => void,
    onEdit: () => void
  }) => {
    const [formState, setFormState] = useState({
      address: address?.address || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      landmark: address?.landmark || '',
      phoneNumber: address?.phoneNumber || '',
      type: address?.type || 'Other' as 'Home' | 'Office' | 'Other',
      isDefault: address?.isDefault || false,
    });

    const addressTypes = [
      { value: 'Home', label: 'Home', icon: Home },
      { value: 'Office', label: 'Office', icon: Building },
      { value: 'Other', label: 'Other', icon: OtherIcon },
    ];

    const getTypeIcon = (type?: string) => {
      switch (type) {
        case 'Home': return <Home size={20} color={theme.colors.primary} />;
        case 'Office': return <Building size={20} color={theme.colors.primary} />;
        default: return <OtherIcon size={20} color={theme.colors.primary} />;
      }
    };

    const handleSave = () => {
      if (!formState.type) {
        alert('Please select an address type');
        return;
      }

      const dataToSave = {
        ...formState,
        id: address?.id,
        displayName: formState.type, // Use type as display name for UI
      };
      onSave(dataToSave as DeliveryAddress);
    };

    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';
    const isAddMode = mode === 'add';

    return (
      <ScrollView style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isViewMode ? 'Address Details' : isEditMode ? 'Edit Address' : 'New Address'}
          </Text>
          {isViewMode && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Edit size={20} color={theme.colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {isViewMode ? (
          // Read-only view
          <View style={styles.viewContainer}>
            <View style={styles.viewField}>
              <Text style={styles.viewLabel}>{t('addressType')}</Text>
              <View style={styles.viewTypeContainer}>
                {getTypeIcon(formState.type)}
                <Text style={styles.viewTypeText}>{formState.type}</Text>
              </View>
            </View>

            <View style={styles.viewField}>
              <Text style={styles.viewLabel}>{t('fullAddress')}</Text>
              <Text style={styles.viewValue}>{formState.address}</Text>
            </View>

            <View style={styles.viewField}>
              <Text style={styles.viewLabel}>City</Text>
              <Text style={styles.viewValue}>{formState.city}</Text>
            </View>

            <View style={styles.viewField}>
              <Text style={styles.viewLabel}>State</Text>
              <Text style={styles.viewValue}>{formState.state}</Text>
            </View>

            <View style={styles.viewField}>
              <Text style={styles.viewLabel}>Zip Code</Text>
              <Text style={styles.viewValue}>{formState.zipCode}</Text>
            </View>

            {formState.phoneNumber && (
              <View style={styles.viewField}>
                <Text style={styles.viewLabel}>Phone Number</Text>
                <Text style={styles.viewValue}>{formState.phoneNumber}</Text>
              </View>
            )}

            {formState.landmark && (
              <View style={styles.viewField}>
                <Text style={styles.viewLabel}>Landmark</Text>
                <Text style={styles.viewValue}>{formState.landmark}</Text>
              </View>
            )}

            <View style={styles.viewField}>
              <Text style={styles.viewLabel}>Default Address</Text>
              <Text style={styles.viewValue}>{formState.isDefault ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        ) : (
          // Edit/Add mode
          <>
            <FormInput
              label="Full Address"
              value={formState.address}
              onChange={(value) => setFormState({ ...formState, address: value })}
              placeholder="Enter your full address"
              multiline
            />
            <FormInput
              label="City"
              value={formState.city}
              onChange={(value) => setFormState({ ...formState, city: value })}
              placeholder="Enter city"
            />
            <FormInput
              label="State"
              value={formState.state}
              onChange={(value) => setFormState({ ...formState, state: value })}
              placeholder="Enter state"
            />
            <FormInput
              label="Zip Code"
              value={formState.zipCode}
              onChange={(value) => setFormState({ ...formState, zipCode: value })}
              placeholder="Enter zip code"
            />
            <FormInput
              label="Phone Number (optional)"
              value={formState.phoneNumber}
              onChange={(value) => setFormState({ ...formState, phoneNumber: value })}
              placeholder="Enter phone number"
            />
            <FormInput
              label="Landmark (optional)"
              value={formState.landmark}
              onChange={(value) => setFormState({ ...formState, landmark: value })}
              placeholder="Enter landmark"
            />

            <FormToggle
              label="Set as Default Address"
              value={formState.isDefault}
              onChange={(value) => setFormState({ ...formState, isDefault: value })}
            />

            <FormTagGroup
              label="Address Type *"
              value={formState.type}
              onChange={(value) => setFormState({ ...formState, type: value as 'Home' | 'Office' | 'Other' })}
              options={addressTypes}
            />
          </>
        )}

        <View style={styles.modalButtons}>
          {isViewMode ? (
            <>
              <TouchableOpacity style={styles.deleteButton} onPress={() => {
                console.log('🗑️ Modal delete button clicked for address:', address);
                if (address) {
                  handleDelete(address);
                }
              }}>
                <Trash2 size={20} color={theme.colors.card} />
                <Text style={styles.deleteButtonText}>{t('delete')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                <Text style={styles.closeButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    );
  };

  const handleSaveAddress = async (address: DeliveryAddress) => {
    if (address.id) {
      await updateAddress(address);
    } else {
      const { id, ...rest } = address;
      await addAddress(rest);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('deliveryAddresses')}</Text>
        <TouchableOpacity onPress={() => openModal()} style={styles.addButton}>
          <Plus size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {isLoading && addresses.length === 0 ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color={theme.colors.primary} />
      ) : error ? (
        <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>
      ) : addresses.length === 0 ? (
        <View style={styles.centerContainer}>
          <MapPin size={64} color={theme.colors.tabIconDefault} />
          <Text style={styles.emptyTitle}>{t('noAddressesFound')}</Text>
          <Text style={styles.emptyDescription}>{t('addYourFirstAddress')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {addresses.map((address, index) => {
            console.log('📍 Rendering address:', address);
            console.log('📍 Address ID:', address.id);
            const getTypeIcon = (type?: string) => {
              switch (type) {
                case 'Home': return <Home size={20} color={theme.colors.primary} />;
                case 'Office': return <Building size={20} color={theme.colors.primary} />;
                default: return <OtherIcon size={20} color={theme.colors.primary} />;
              }
            };

            return (
              <Animated.View key={address.id || index} entering={FadeInDown.delay(index * 100).duration(400)}>
                <View style={[
                  styles.addressCard,
                  address.isDefault && styles.defaultAddressCard
                ]}>
                  <TouchableOpacity
                    style={styles.addressInfo}
                    onPress={() => openModal(address, 'view')}
                  >
                    <View style={styles.addressHeader}>
                      <View style={styles.addressTypeContainer}>
                        {getTypeIcon(address.type)}
                        <Text style={styles.addressName}>
                          {address.displayName || address.type || 'Address'}
                        </Text>
                      </View>
                      <View style={styles.headerActions}>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                          </View>
                        )}
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              openModal(address, 'edit');
                            }}
                          >
                            <Edit size={20} color={theme.colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              console.log('🗑️ Delete button clicked for address:', address);
                              handleDelete(address);
                            }}
                          >
                            <Trash2 size={20} color={theme.colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.addressText}>
                      {address.address}
                    </Text>
                    <Text style={styles.addressDetails}>
                      {`${address.city}, ${address.state} ${address.zipCode || ''}`}
                    </Text>
                    {address.phoneNumber && (
                      <Text style={styles.addressPhone}>Phone: {address.phoneNumber}</Text>
                    )}
                    {address.landmark && (
                      <Text style={styles.addressLandmark}>Near: {address.landmark}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}


      <BaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="medium"
        showCloseButton={false}
      >
        <AddressForm
          address={selectedAddress}
          mode={modalMode}
          onSave={handleSaveAddress}
          onCancel={() => setModalVisible(false)}
          onEdit={() => setModalMode('edit')}
        />
      </BaseModal>

      <ConfirmDialog
        visible={deleteModalVisible}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </View>
  );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.xxl + theme.spacing.xxl + theme.spacing.xs, paddingBottom: theme.spacing.l, backgroundColor: theme.colors.card },
  backButton: { padding: theme.spacing.s },
  headerTitle: { fontSize: theme.typography.size.xl, fontWeight: theme.typography.weight.bold, color: theme.colors.text },
  addButton: { padding: theme.spacing.s },
  content: { padding: theme.spacing.l },
  addressCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultAddressCard: {
    borderWidth: theme.spacing.xs / 2,
    borderColor: theme.colors.primary,
  },
  addressInfo: { flex: 1 },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: theme.typography.size.l,
    fontWeight: theme.typography.weight.bold,
    marginLeft: theme.spacing.s,
    color: theme.colors.text,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
  },
  defaultBadgeText: {
    color: theme.colors.card,
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
  },
  addressText: {
    color: theme.colors.text,
    fontSize: theme.typography.size.m,
    marginBottom: theme.spacing.xs,
  },
  addressDetails: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s,
    marginBottom: 2,
  },
  addressPhone: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s,
    marginBottom: 2,
  },
  addressLandmark: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.size.s,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.modalOverlay
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl - theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl - theme.spacing.xs,
  },
  modalTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s - 2,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.card,
  },
  editButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.size.s,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.primary,
  },
  viewContainer: {
    marginBottom: theme.spacing.xl - theme.spacing.xs,
  },
  viewField: {
    marginBottom: theme.spacing.l,
  },
  viewLabel: {
    fontSize: theme.typography.size.m,
    fontWeight: theme.typography.weight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  viewValue: {
    fontSize: theme.typography.size.l,
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.s,
  },
  viewTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.s,
  },
  viewTypeText: {
    marginLeft: theme.spacing.s,
    fontSize: theme.typography.size.l,
    color: theme.colors.textSecondary,
  },
  fieldLabel: {
    fontSize: theme.typography.size.m,
    fontWeight: theme.typography.weight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.xs,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
    gap: theme.spacing.s,
    flexWrap: 'wrap',
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s - 2,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.card,
  },
  tagButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tagButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.size.s,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.primary,
  },
  tagButtonTextActive: {
    color: theme.colors.card,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.m,
    fontSize: theme.typography.size.m,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
  },
  defaultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl - theme.spacing.xs,
    paddingVertical: theme.spacing.s,
  },
  defaultLabel: {
    fontSize: theme.typography.size.m,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl - theme.spacing.xs,
    gap: theme.spacing.m,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
  saveButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.card,
    fontWeight: theme.typography.weight.bold,
  },
  closeButton: {
    flex: 1,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: theme.spacing.s,
  },
  deleteButtonText: {
    color: theme.colors.card,
    fontWeight: theme.typography.weight.bold,
    marginLeft: theme.spacing.xs,
  },
  actionButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl - theme.spacing.xs
  },
  emptyTitle: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    marginTop: theme.spacing.xl - theme.spacing.xs,
    color: theme.colors.text
  },
  emptyDescription: {
    fontSize: theme.typography.size.l,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.m - 2,
    textAlign: 'center'
  },
  errorText: {
    fontSize: theme.typography.size.l,
    color: theme.colors.error
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.xl,
    margin: theme.spacing.xl - theme.spacing.xs,
    alignItems: 'center',
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  deleteModalMessage: {
    fontSize: theme.typography.size.l,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  deleteModalCancelButton: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl - theme.spacing.xs,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
  },
  deleteModalCancelText: {
    color: theme.colors.text,
    fontSize: theme.typography.size.l,
    fontWeight: theme.typography.weight.medium,
  },
  deleteModalConfirmButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.xl - theme.spacing.xs,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
  },
  deleteModalConfirmText: {
    color: theme.colors.card,
    fontSize: theme.typography.size.l,
    fontWeight: theme.typography.weight.medium,
  },
});