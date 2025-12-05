import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Order } from '@/lib/api/services/order.service';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { MealInfoCard } from './meal/MealInfoCard';
import { ExtrasSelection, ExtraItem } from './meal/ExtrasSelection';
import { RatingForm } from './meal/RatingForm';

interface MealDetailModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateOrder: (orderId: string, updates: any) => Promise<void>;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  visible,
  order,
  onClose,
  onUpdateOrder,
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      // Initialize extras from order or defaults
      // Note: In a real app, available extras should probably come from an API or the order object
      const initialExtras = [
        { id: 'roti', name: 'Extra Roti', price: 10, quantity: 0 },
        { id: 'rice', name: 'Extra Rice', price: 20, quantity: 0 },
        { id: 'curry', name: 'Extra Curry', price: 30, quantity: 0 },
      ];

      // If order has existing extras, map them here (simplified logic)
      if (order.items) {
        // Logic to parse existing extras from items would go here
      }

      setExtras(initialExtras);
      setRating(order.rating || 0);
      setReview(order.review || '');
    }
  }, [order]);

  const handleUpdateQuantity = (id: string, delta: number) => {
    setExtras((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const handleSaveExtras = async () => {
    if (!order) return;

    const selectedExtras = extras.filter(e => e.quantity > 0);
    if (selectedExtras.length === 0) {
      Alert.alert(t('info'), t('noExtrasSelected'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert extras to the format expected by the API
      // This depends on how the backend expects extras. 
      // Assuming we add them as items or update a specific field.
      // For now, we'll pass the raw extras array to the parent handler.

      await onUpdateOrder(order._id, { extras: selectedExtras });
      Alert.alert(t('success'), t('extrasUpdated'));
      onClose();
    } catch (error) {
      console.error('Error updating extras:', error);
      Alert.alert(t('error'), t('failedToUpdateExtras'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!order) return;

    if (rating === 0) {
      Alert.alert(t('error'), t('pleaseSelectRating'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateOrder(order._id, { rating, review });
      Alert.alert(t('success'), t('reviewSubmitted'));
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(t('error'), t('failedToSubmitReview'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('mealDetails')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <MealInfoCard order={order} t={t} />

            {/* Show Extras Selection only if order is not delivered/cancelled */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <>
                <ExtrasSelection
                  extras={extras}
                  onUpdateQuantity={handleUpdateQuantity}
                  t={t}
                />
                <TouchableOpacity
                  style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                  onPress={handleSaveExtras}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>{t('saveExtras')}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Show Rating Form only if order is delivered */}
            {order.status === 'delivered' && (
              <RatingForm
                rating={rating}
                review={review}
                onRatingChange={setRating}
                onReviewChange={setReview}
                onSubmit={handleSubmitReview}
                isSubmitting={isSubmitting}
                t={t}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: theme.typography.weight.bold,
  },
});
