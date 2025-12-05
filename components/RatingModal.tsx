import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Star, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface RatingModalProps {
  visible: boolean;
  mealName: string;
  restaurantName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export const RatingModal = ({ visible, mealName, restaurantName, onClose, onSubmit }: RatingModalProps) => {
  const { t } = useTranslation('common');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalContainer}>
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={styles.overlay}
          />
          
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{t('rateYourMeal')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{mealName}</Text>
              <Text style={styles.restaurantName}>{restaurantName}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingPrompt}>{t('howWasYourMeal')}</Text>
              
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Star
                      size={36}
                      color={star <= rating ? '#FFB800' : '#E5E5E5'}
                      fill={star <= rating ? '#FFB800' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.ratingLabel}>
                {rating === 0 ? t('tapToRate') : 
                  rating === 1 ? t('poor') : 
                  rating === 2 ? t('fair') :
                  rating === 3 ? t('good') :
                  rating === 4 ? t('veryGood') : t('excellent')}
              </Text>
            </View>
            
            <View style={styles.commentContainer}>
              <Text style={styles.commentLabel}>{t('addCommentOptional')}</Text>
              <TextInput
                style={styles.commentInput}
                placeholder={t('tellUsWhatYouLiked')}
                multiline
                numberOfLines={4}
                maxLength={250}
                value={comment}
                onChangeText={setComment}
              />
              <Text style={styles.charCount}>{comment.length}/250</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? t('submitting') : t('submitRating')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  mealInfo: {
    marginBottom: 24,
  },
  mealName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 4,
  },
  restaurantName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingPrompt: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  ratingLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666666',
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  commentInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#FFD3B0',
  },
  submitButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
}); 