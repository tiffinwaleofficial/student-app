import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CustomerProfile } from '@/types/api';
import { Meal } from '@/types';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { MealDetailModal } from './MealDetailModal';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

import {
  DashboardHeader,
  StatsOverview,
  PlanOverviewCard,
  TodaysMeals,
  UpcomingMeals
} from './dashboard';

type ActiveSubscriptionDashboardProps = {
  user: CustomerProfile | null;
  todayMeals: Meal[];
  upcomingMeals?: Meal[];
  isLoading: boolean;
};

export const ActiveSubscriptionDashboard = ({ user, todayMeals, upcomingMeals = [], isLoading }: ActiveSubscriptionDashboardProps) => {
  const router = useRouter();
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<'extras' | 'rate' | undefined>(undefined);
  const { t } = useTranslation('common');
  const { currentSubscription } = useSubscriptionStore();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  // Use subscription from user profile if available, otherwise from subscription store
  const activeSubscription = (user as any)?.currentSubscription || currentSubscription;

  const handleMealPress = (mealId: string, action?: 'extras' | 'rate') => {
    setSelectedMealId(mealId);
    setSelectedAction(action);
    setMealModalVisible(true);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Header with Greeting */}
      <DashboardHeader user={user} />

      {/* Stats Cards */}
      <StatsOverview
        activeSubscription={activeSubscription}
        todayMeals={todayMeals}
        upcomingMeals={upcomingMeals}
      />

      {/* Plan Information */}
      <PlanOverviewCard
        activeSubscription={activeSubscription}
        onViewDetails={() => {
          // Handle view details if needed, maybe navigate to plan details
          console.log('View plan details');
        }}
      />

      {/* Today's Meals */}
      <TodaysMeals
        todayMeals={todayMeals}
        isLoading={isLoading}
        onViewAll={() => router.push('/(tabs)/orders' as any)}
        onMealPress={handleMealPress}
      />

      {/* Coming Up Next */}
      <UpcomingMeals
        todayMeals={todayMeals}
        onViewAll={() => router.push('/(tabs)/orders?tab=upcoming' as any)}
        onMealPress={handleMealPress}
      />

      {/* Meal Detail Modal */}
      <MealDetailModal
        visible={mealModalVisible}
        order={selectedMealId ? (todayMeals.find(m => m.orderId === selectedMealId || m.id === selectedMealId) as any) : null}
        onUpdateOrder={async (orderId, updates) => {
          console.log('Update order', orderId, updates);
        }}
        onClose={() => {
          setMealModalVisible(false);
          setSelectedMealId(null);
          setSelectedAction(undefined);
        }}
      />
    </ScrollView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 50, // Increased for safe area
    paddingBottom: 100,
  },
});