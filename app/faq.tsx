import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { Accordion, LoadingSpinner } from '@/components/ui';
import { useFAQContent } from '@/hooks/useFAQContent';

export default function FAQScreen() {
  const { t } = useTranslation('common'); // Changed to common to avoid type error, or keep support if defined
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const faqData = useFAQContent();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!faqData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" color="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('faq') || 'FAQ'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>Find answers to common questions about our service</Text>

        {faqData.categories.map((category, categoryIndex) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(categoryIndex * 100)}
          >
            <Text style={styles.categoryTitle}>{category.title}</Text>

            {category.questions.map((item, questionIndex) => {
              const itemId = `${category.id}-${questionIndex}`;
              return (
                <Accordion
                  key={itemId}
                  title={item.q}
                  expanded={expandedItem === itemId}
                  onToggle={() => toggleExpand(itemId)}
                >
                  <Text style={styles.answer}>{item.a}</Text>
                </Accordion>
              );
            })}
          </Animated.View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Still have questions?</Text>
          <Text style={styles.footerText}>
            Contact our support team at support@tiffinwale.com or call 1800-123-4567
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.semiBold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  title: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: theme.typography.size.l,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  categoryTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.semiBold,
    color: theme.colors.primary,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  answer: {
    fontSize: theme.typography.size.m,
    lineHeight: theme.typography.size.m * 1.5,
    color: theme.colors.textSecondary,
  },
  footer: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  footerTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  footerText: {
    fontSize: theme.typography.size.m,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.size.m * 1.5,
  },
});