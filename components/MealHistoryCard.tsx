import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Meal } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatMealStatusText, getMealStatusColor } from '@/utils/mealUtils';

interface MealHistoryCardProps {
  meal: Meal;
  index: number;
}

export function MealHistoryCard({ meal, index }: MealHistoryCardProps) {
  const { t } = useTranslation('common');
  const menuItem = meal.menu.length > 0 ? meal.menu[0] : null;
  
  return (
    <Animated.View 
      entering={FadeInDown.delay(100 + (index * 50)).duration(400)} 
      style={styles.card}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{formatDate(new Date(meal.date))}</Text>
          <Text style={styles.mealType}>
            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
          </Text>
        </View>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getMealStatusColor(meal.status) + '20' }
          ]}
        >
          <Text 
            style={[
              styles.statusText, 
              { color: getMealStatusColor(meal.status) }
            ]}
          >
            {formatMealStatusText(meal.status)}
          </Text>
        </View>
      </View>
      
      {menuItem ? (
        <View style={styles.content}>
          <Image 
            source={{ uri: menuItem.image }} 
            style={styles.mealImage} 
          />
          <View style={styles.mealDetails}>
            <Text style={styles.mealName}>{menuItem.name}</Text>
            <Text style={styles.restaurantName}>{meal.restaurantName}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.ratingText}>{menuItem.rating}</Text>
              <Text style={styles.reviewCount}>({menuItem.reviewCount} {t('reviews')})</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.detailsButton}>
            <ChevronRight size={20} color="#999999" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>{t('noMenuInfo')}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  mealType: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  restaurantName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
  },
  detailsButton: {
    padding: 8,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#999999',
  },
});