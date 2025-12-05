import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, ActivityIndicator, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Heart,
    Share2,
    Phone,
    Mail,
    MapPin,
    Clock,
    Star,
    CheckCircle,
    Award,
    Utensils,
    Leaf,
    ChevronRight,
} from 'lucide-react-native';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Restaurant } from '@/types';
import api from '@/utils/apiClient';

const HEADER_HEIGHT = 320;

export default function PartnerDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { fetchAvailablePlans, availablePlans } = useSubscriptionStore();

    const [partner, setPartner] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState<'about' | 'plans' | 'reviews'>('about');
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        if (params.id) {
            loadPartnerDetails(params.id as string);
        }
    }, [params.id]);

    useEffect(() => {
        if (partner) {
            loadPlans();
        }
    }, [partner]);

    const loadPartnerDetails = async (id: string) => {
        try {
            setLoading(true);
            const data = await api.partners.getById(id);
            setPartner(data);
        } catch (error) {
            console.error('Error loading partner details:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPlans = async () => {
        try {
            if (partner?.id) {
                await fetchAvailablePlans(true, partner.id);
                setPlans(availablePlans);
            }
        } catch (error) {
            console.error('Error loading plans:', error);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${partner?.businessName} on TiffinWale!`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCall = () => {
        if (partner?.contactPhone) {
            // Implement call functionality
            Alert.alert('Call', `Would call: ${partner.contactPhone}`);
        }
    };

    const handleEmail = () => {
        if (partner?.contactEmail) {
            // Implement email functionality
            Alert.alert('Email', `Would email: ${partner.contactEmail}`);
        }
    };

    const handlePlanSelect = (planId: string) => {
        router.push(`/checkout?planId=${planId}` as any);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF9B42" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!partner) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Tiffin center not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    {partner.bannerUrl ? (
                        <Image source={{ uri: partner.bannerUrl }} style={styles.heroImage} />
                    ) : (
                        <LinearGradient
                            colors={['#FF9B42', '#FF6B6B']}
                            style={styles.heroGradient}
                        />
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                        style={styles.heroOverlay}
                    />

                    {/* Back Button */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                        <BlurView intensity={80} tint="dark" style={styles.headerButtonBlur}>
                            <ArrowLeft size={20} color="#FFFFFF" />
                        </BlurView>
                    </TouchableOpacity>

                    {/* Action Buttons */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.headerActionButton}>
                            <BlurView intensity={80} tint="dark" style={styles.headerButtonBlur}>
                                <Heart size={20} color={isFavorite ? '#FF6B6B' : '#FFFFFF'} fill={isFavorite ? '#FF6B6B' : 'none'} />
                            </BlurView>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={styles.headerActionButton}>
                            <BlurView intensity={80} tint="dark" style={styles.headerButtonBlur}>
                                <Share2 size={20} color="#FFFFFF" />
                            </BlurView>
                        </TouchableOpacity>
                    </View>

                    {/* Partner Info Card */}
                    <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.partnerInfoCard}>
                        <View style={styles.logoContainer}>
                            {partner.logoUrl ? (
                                <Image source={{ uri: partner.logoUrl }} style={styles.logo} />
                            ) : (
                                <View style={styles.placeholderLogo}>
                                    <Text style={styles.placeholderLogoText}>
                                        {partner.businessName.substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            {partner.status === 'approved' && (
                                <View style={styles.verifiedBadge}>
                                    <CheckCircle size={16} color="#4CAF50" fill="#4CAF50" />
                                </View>
                            )}
                        </View>

                        <View style={styles.partnerInfo}>
                            <Text style={styles.businessName}>{partner.businessName}</Text>
                            {partner.averageRating && partner.averageRating > 0 && (
                                <View style={styles.ratingRow}>
                                    <View style={styles.ratingBadge}>
                                        <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
                                        <Text style={styles.ratingText}>{partner.averageRating.toFixed(1)}</Text>
                                    </View>
                                    {partner.totalReviews && partner.totalReviews > 0 && (
                                        <Text style={styles.reviewsText}>({partner.totalReviews} reviews)</Text>
                                    )}
                                </View>
                            )}
                        </View>

                        {partner.isAcceptingOrders && (
                            <View style={styles.openBadge}>
                                <View style={styles.openDot} />
                                <Text style={styles.openText}>Open Now</Text>
                            </View>
                        )}
                    </Animated.View>
                </View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.quickActionsContainer}>
                    {partner.contactPhone && (
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
                            <View style={styles.quickActionIcon}>
                                <Phone size={20} color="#FF9B42" />
                            </View>
                            <Text style={styles.quickActionText}>Call</Text>
                        </TouchableOpacity>
                    )}
                    {partner.contactEmail && (
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleEmail}>
                            <View style={styles.quickActionIcon}>
                                <Mail size={20} color="#FF9B42" />
                            </View>
                            <Text style={styles.quickActionText}>Email</Text>
                        </TouchableOpacity>
                    )}
                    {partner.address && (
                        <TouchableOpacity style={styles.quickActionButton}>
                            <View style={styles.quickActionIcon}>
                                <MapPin size={20} color="#FF9B42" />
                            </View>
                            <Text style={styles.quickActionText}>Directions</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* Tab Navigation */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'about' && styles.tabActive]}
                        onPress={() => setActiveTab('about')}
                    >
                        <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>About</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'plans' && styles.tabActive]}
                        onPress={() => setActiveTab('plans')}
                    >
                        <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>Plans</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>Reviews</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    {activeTab === 'about' && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            {/* Description */}
                            {partner.description && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>About Us</Text>
                                    <Text style={styles.descriptionText}>{partner.description}</Text>
                                </View>
                            )}

                            {/* Details Grid */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Details</Text>
                                <View style={styles.detailsGrid}>
                                    {/* Hours */}
                                    {partner.businessHours && (
                                        <View style={styles.detailCard}>
                                            <View style={styles.detailIcon}>
                                                <Clock size={20} color="#FF9B42" />
                                            </View>
                                            <View style={styles.detailContent}>
                                                <Text style={styles.detailLabel}>Hours</Text>
                                                <Text style={styles.detailValue}>
                                                    {partner.businessHours.open} - {partner.businessHours.close}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Location */}
                                    {partner.address && (
                                        <View style={styles.detailCard}>
                                            <View style={styles.detailIcon}>
                                                <MapPin size={20} color="#FF9B42" />
                                            </View>
                                            <View style={styles.detailContent}>
                                                <Text style={styles.detailLabel}>Location</Text>
                                                <Text style={styles.detailValue}>
                                                    {partner.address.city}, {partner.address.state}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Established Year */}
                                    {partner.establishedYear && (
                                        <View style={styles.detailCard}>
                                            <View style={styles.detailIcon}>
                                                <Award size={20} color="#FF9B42" />
                                            </View>
                                            <View style={styles.detailContent}>
                                                <Text style={styles.detailLabel}>Since</Text>
                                                <Text style={styles.detailValue}>{partner.establishedYear}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Cuisines */}
                            {partner.cuisineTypes && partner.cuisineTypes.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Cuisines</Text>
                                    <View style={styles.tagsContainer}>
                                        {partner.cuisineTypes.map((cuisine, index) => (
                                            <View key={index} style={styles.tag}>
                                                <Utensils size={14} color="#FF9B42" />
                                                <Text style={styles.tagText}>{cuisine}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Dietary Options */}
                            {(partner.isVegetarian || (partner.dietaryOptions && partner.dietaryOptions.length > 0)) && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Dietary Options</Text>
                                    <View style={styles.tagsContainer}>
                                        {partner.isVegetarian && (
                                            <View style={[styles.tag, styles.tagVeg]}>
                                                <View style={styles.vegDot} />
                                                <Text style={styles.tagTextVeg}>Pure Vegetarian</Text>
                                            </View>
                                        )}
                                        {partner.dietaryOptions?.includes('vegan') && (
                                            <View style={[styles.tag, styles.tagVegan]}>
                                                <Leaf size={14} color="#10B981" />
                                                <Text style={styles.tagTextVegan}>Vegan</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </Animated.View>
                    )}

                    {activeTab === 'plans' && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Subscription Plans</Text>
                                {plans.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyStateText}>No plans available</Text>
                                    </View>
                                ) : (
                                    <View style={styles.plansContainer}>
                                        {plans.map((plan, index) => (
                                            <Animated.View
                                                key={plan.id}
                                                entering={SlideInRight.delay(index * 100).duration(400)}
                                                style={styles.planCard}
                                            >
                                                <View style={styles.planHeader}>
                                                    <Text style={styles.planName}>{plan.name}</Text>
                                                    <View style={styles.planPriceContainer}>
                                                        <Text style={styles.planPrice}>₹{plan.price}</Text>
                                                        <Text style={styles.planDuration}>/{plan.duration || 30} days</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.planDescription}>{plan.description}</Text>
                                                <View style={styles.planFeatures}>
                                                    {plan.features?.slice(0, 3).map((feature, idx) => (
                                                        <View key={idx} style={styles.planFeature}>
                                                            <View style={styles.planFeatureDot} />
                                                            <Text style={styles.planFeatureText}>{feature}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.planButton}
                                                    onPress={() => handlePlanSelect(plan.id)}
                                                >
                                                    <Text style={styles.planButtonText}>Subscribe</Text>
                                                    <ChevronRight size={16} color="#FFFFFF" />
                                                </TouchableOpacity>
                                            </Animated.View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    )}

                    {activeTab === 'reviews' && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Customer Reviews</Text>
                                <View style={styles.emptyState}>
                                    <Star size={48} color="#CCCCCC" />
                                    <Text style={styles.emptyStateText}>No reviews yet</Text>
                                    <Text style={styles.emptyStateSubtext}>Be the first to review this tiffin center!</Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAF0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFAF0',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFAF0',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#FF9B42',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    heroContainer: {
        height: HEADER_HEIGHT,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    headerBackButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 20,
        zIndex: 10,
    },
    headerActions: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        flexDirection: 'row',
        gap: 12,
        zIndex: 10,
    },
    headerActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    headerButtonBlur: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    partnerInfoCard: {
        position: 'absolute',
        bottom: -60,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    logoContainer: {
        position: 'relative',
        marginRight: 16,
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    placeholderLogo: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: '#FFF5E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderLogoText: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#FF9B42',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 2,
    },
    partnerInfo: {
        flex: 1,
    },
    businessName: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#333333',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF9B42',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontFamily: 'Poppins-Bold',
        color: '#FFFFFF',
    },
    reviewsText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#999999',
    },
    openBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    openDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
    },
    openText: {
        fontSize: 11,
        fontFamily: 'Poppins-SemiBold',
        color: '#059669',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginTop: 80,
        marginBottom: 20,
    },
    quickActionButton: {
        alignItems: 'center',
        gap: 8,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF5E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#666666',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    tabActive: {
        backgroundColor: '#FF9B42',
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#666666',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    contentContainer: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#333333',
        marginBottom: 16,
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        lineHeight: 22,
    },
    detailsGrid: {
        gap: 12,
    },
    detailCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    detailIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF5E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#999999',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5E0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    tagText: {
        fontSize: 13,
        fontFamily: 'Poppins-Medium',
        color: '#FF9B42',
    },
    tagVeg: {
        backgroundColor: '#F0FDF4',
    },
    tagTextVeg: {
        fontSize: 13,
        fontFamily: 'Poppins-Medium',
        color: '#16A34A',
    },
    vegDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#16A34A',
    },
    tagVegan: {
        backgroundColor: '#ECFDF5',
    },
    tagTextVegan: {
        fontSize: 13,
        fontFamily: 'Poppins-Medium',
        color: '#059669',
    },
    plansContainer: {
        gap: 16,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    planName: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#333333',
        flex: 1,
    },
    planPriceContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#FF9B42',
    },
    planDuration: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#999999',
    },
    planDescription: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        marginBottom: 16,
        lineHeight: 20,
    },
    planFeatures: {
        marginBottom: 16,
        gap: 8,
    },
    planFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    planFeatureDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#FF9B42',
    },
    planFeatureText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
    },
    planButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF9B42',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    planButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        color: '#FFFFFF',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#999999',
    },
    emptyStateSubtext: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#CCCCCC',
        textAlign: 'center',
    },
});
