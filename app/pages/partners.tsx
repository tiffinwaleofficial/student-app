import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Search, Filter, MapPin, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PartnerCard } from '../../components/PartnerCard';
import { BackButton } from '../../components/BackButton';
import { api, Partner } from '@/lib/api';

export default function PartnersDiscoveryScreen() {
  const router = useRouter();
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCity, selectedCuisine, selectedDietary, minRating, partners]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await api.partners.getAllPartners();
      setPartners(data.partners);
      setFilteredPartners(data.partners);
    } catch (error: any) {
      console.error('Failed to fetch partners:', error);
      Alert.alert('Error', error.message || 'Failed to load tiffin centers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPartners();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...partners];

    // Search by business name
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter((p) => p.address?.city === selectedCity);
    }

    // Filter by cuisine
    if (selectedCuisine) {
      filtered = filtered.filter((p) =>
        p.cuisineTypes?.includes(selectedCuisine)
      );
    }

    // Filter by dietary option
    if (selectedDietary) {
      filtered = filtered.filter((p) =>
        p.dietaryOptions?.includes(selectedDietary)
      );
    }

    // Filter by minimum rating
    if (minRating > 0) {
      filtered = filtered.filter((p) =>
        (p.averageRating || 0) >= minRating
      );
    }

    // Do not force isActive filter; backend may not set this flag consistently
    // Keep all partners after other filters

    setFilteredPartners(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity(null);
    setSelectedCuisine(null);
    setSelectedDietary(null);
    setMinRating(0);
  };

  // Extract unique cities, cuisines, and dietary options
  const cities = [...new Set(partners.map((p) => p.address?.city).filter(Boolean))] as string[];
  const cuisines = [
    ...new Set(partners.flatMap((p) => p.cuisineTypes || []))
  ];
  const dietaryOptions = [
    ...new Set(partners.flatMap((p) => p.dietaryOptions || []))
  ];

  const activeFiltersCount =
    (selectedCity ? 1 : 0) +
    (selectedCuisine ? 1 : 0) +
    (selectedDietary ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Find Tiffin Centers</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={activeFiltersCount > 0 ? '#FFF' : '#666'} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {/* City Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>City</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.filterChip, selectedCity === city && styles.filterChipActive]}
                    onPress={() => setSelectedCity(selectedCity === city ? null : city)}
                  >
                    <MapPin size={14} color={selectedCity === city ? '#FFF' : '#666'} />
                    <Text style={[styles.filterChipText, selectedCity === city && styles.filterChipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cuisine Filter */}
            {cuisines.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Cuisine</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {cuisines.map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine}
                      style={[styles.filterChip, selectedCuisine === cuisine && styles.filterChipActive]}
                      onPress={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                    >
                      <Text style={[styles.filterChipText, selectedCuisine === cuisine && styles.filterChipTextActive]}>
                        {cuisine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Dietary Filter */}
            {dietaryOptions.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Dietary</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {dietaryOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.filterChip, selectedDietary === option && styles.filterChipActive]}
                      onPress={() => setSelectedDietary(selectedDietary === option ? null : option)}
                    >
                      <Text style={[styles.filterChipText, selectedDietary === option && styles.filterChipTextActive]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Min Rating</Text>
              <View style={styles.ratingRow}>
                {[3, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingChip, minRating === rating && styles.ratingChipActive]}
                    onPress={() => setMinRating(minRating === rating ? 0 : rating)}
                  >
                    <Text style={[styles.ratingChipText, minRating === rating && styles.ratingChipTextActive]}>
                      {rating}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <X size={16} color="#EF4444" />
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredPartners.length} {filteredPartners.length === 1 ? 'center' : 'centers'} found
        </Text>
      </View>

      {/* Partners List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9F43']} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9F43" />
            <Text style={styles.loadingText}>Loading tiffin centers...</Text>
          </View>
        ) : filteredPartners.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No tiffin centers found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : 'Check back later for new partners'}
            </Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredPartners.map((partner) => (
            <PartnerCard key={partner._id} partner={partner} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#FF9F43',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  filtersPanel: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 20,
  },
  filterSection: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#FF9F43',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingChip: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ratingChipActive: {
    backgroundColor: '#FF9F43',
  },
  ratingChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  ratingChipTextActive: {
    color: '#FFF',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  clearButton: {
    marginTop: 16,
    backgroundColor: '#FF9F43',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});

