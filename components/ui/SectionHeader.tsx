import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllText?: string;
  style?: ViewStyle;
  rightElement?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onSeeAll,
  seeAllText = 'See All',
  style,
  rightElement,
}) => {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement ? (
        rightElement
      ) : onSeeAll ? (
        <TouchableOpacity
          onPress={onSeeAll}
          style={styles.seeAllButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            {seeAllText}
          </Text>
          <ChevronRight size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    marginRight: 2,
  },
});

export default SectionHeader;
