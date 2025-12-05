import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Calendar, MapPin, Phone, Star } from 'lucide-react-native';
import { Order, SubscriptionPlan } from '@/lib/api';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { useRouter } from 'expo-router';
import { BaseCard } from '../ui/BaseCard';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface OrderCardProps {
    order: Order;
    onPress?: () => void;
    onRate?: (orderId: string) => void;
    onTrack?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onPress,
    onRate,
    onTrack,
}) => {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const partner = typeof order.businessPartner === 'object'
        ? order.businessPartner
        : null;

    const plan = typeof order.subscriptionPlan === 'object'
        ? order.subscriptionPlan as SubscriptionPlan
        : null;

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (canTrack && onTrack) {
            onTrack(order._id);
        } else {
            router.push(`/track?id=${order._id}`);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Scheduled';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Scheduled';
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
            });
        } catch {
            return 'Scheduled';
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    const formatMealType = (type?: string) => {
        if (!type) return '';
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const canRate = order.status === 'delivered' && !order.rating;
    const canTrack = ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);

    return (
        <BaseCard onPress={handlePress} style={styles.card}>
            {/* Header with Partner Info and Status */}
            <View style={styles.header}>
                <View style={styles.partnerInfo}>
                    {partner?.logoUrl && (
                        <Image
                            source={{ uri: partner.logoUrl }}
                            style={styles.partnerLogo}
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.partnerText}>
                        <Text style={styles.partnerName} numberOfLines={1}>
                            {partner?.businessName || 'Tiffin Service'}
                        </Text>
                        {plan && (
                            <Text style={styles.planName} numberOfLines={1}>
                                {plan.name}
                            </Text>
                        )}
                    </View>
                </View>
                <OrderStatusBadge status={order.status} size="small" />
            </View>

            {/* Order Details */}
            <View style={styles.details}>
                {/* Order ID and Date */}
                <View style={styles.detailRow}>
                    <Text style={styles.orderIdLabel}>Order #{order._id?.slice(-8) || 'N/A'}</Text>
                    <Text style={styles.orderDate}>
                        {formatDate(order.orderDate || order.deliveryDate || order.createdAt)}
                    </Text>
                </View>

                {/* Meal Type and Time Slot */}
                {(order.mealType || order.deliveryTimeRange) && (
                    <View style={styles.mealRow}>
                        {order.mealType && (
                            <View style={styles.mealTag}>
                                <Text style={styles.mealText}>{formatMealType(order.mealType)}</Text>
                            </View>
                        )}
                        {order.deliveryTimeRange && (
                            <View style={styles.timeTag}>
                                <Text style={styles.timeText}>{order.deliveryTimeRange}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Delivery Date */}
                <View style={styles.infoRow}>
                    <Calendar size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.infoLabel}>Delivery:</Text>
                    <Text style={styles.infoValue}>
                        {formatDate(order.deliveryDate || order.scheduledDeliveryTime || order.orderDate)}
                        {formatTime(order.deliveryDate || order.scheduledDeliveryTime) && `, ${formatTime(order.deliveryDate || order.scheduledDeliveryTime)}`}
                    </Text>
                </View>

                {/* Delivery Address */}
                <View style={styles.infoRow}>
                    <MapPin size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </Text>
                </View>

                {/* Partner Contact (if out for delivery) */}
                {canTrack && partner?.phoneNumber && (
                    <View style={styles.infoRow}>
                        <Phone size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoLabel}>Contact:</Text>
                        <Text style={styles.infoValue}>{partner.phoneNumber}</Text>
                    </View>
                )}

                {/* Special Instructions */}
                {order.specialInstructions && (
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructionsLabel}>Note:</Text>
                        <Text style={styles.instructionsText} numberOfLines={2}>
                            {order.specialInstructions}
                        </Text>
                    </View>
                )}

                {/* Order Items */}
                {(() => {
                    const baseItems = order.items?.filter((item: any) =>
                        !item.specialInstructions?.toLowerCase().includes('extra') &&
                        !item.mealId?.includes('extra') &&
                        !item.mealId?.includes('delivery-fee')
                    ) || [];

                    const extraItems = order.items?.filter((item: any) =>
                        item.specialInstructions?.toLowerCase().includes('extra') ||
                        item.mealId?.includes('extra')
                    ) || [];

                    const allItems = baseItems.concat(extraItems);

                    if (allItems.length === 0) return null;

                    return (
                        <View style={styles.itemsContainer}>
                            <Text style={styles.itemsSectionTitle}>Meal Items</Text>

                            {/* Base Items */}
                            {baseItems.length > 0 && (
                                <>
                                    {baseItems.slice(0, 3).map((item: any, index: number) => (
                                        <View key={`base-${index}`} style={styles.itemRow}>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.itemName}>
                                                    {item.name || item.specialInstructions || 'Meal Item'}
                                                </Text>
                                            </View>
                                            <Text style={styles.itemQty}>x{item.quantity || 1}</Text>
                                        </View>
                                    ))}
                                    {baseItems.length > 3 && (
                                        <Text style={styles.moreItems}>
                                            +{baseItems.length - 3} more base items
                                        </Text>
                                    )}
                                </>
                            )}

                            {/* Extra Items */}
                            {extraItems.length > 0 && (
                                <View style={styles.extraItemsSection}>
                                    <Text style={styles.extraItemsTitle}>✨ Extra Items:</Text>
                                    {extraItems.map((item: any, index: number) => (
                                        <View key={`extra-${index}`} style={styles.extraItemRow}>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.extraItemName}>
                                                    {item.name || item.specialInstructions || 'Extra Item'}
                                                </Text>
                                                {item.price > 0 && (
                                                    <Text style={styles.extraItemPrice}>+₹{item.price}</Text>
                                                )}
                                            </View>
                                            <Text style={styles.itemQty}>x{item.quantity || 1}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })()}
            </View>

            {/* Footer with Amount and Actions */}
            <View style={styles.footer}>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Total</Text>
                    <Text style={styles.amount}>₹{order.totalAmount}</Text>
                </View>
                <View style={styles.actions}>
                    {canTrack && onTrack && (
                        <TouchableOpacity
                            style={styles.trackButton}
                            onPress={() => onTrack(order._id)}
                        >
                            <Text style={styles.trackButtonText}>Track</Text>
                        </TouchableOpacity>
                    )}
                    {canRate && onRate && (
                        <TouchableOpacity
                            style={styles.rateButton}
                            onPress={() => onRate(order._id)}
                        >
                            <Star size={14} color={theme.colors.primary} />
                            <Text style={styles.rateButtonText}>Rate</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Existing Rating */}
            {order.rating && (
                <View style={styles.ratingContainer}>
                    <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={14}
                                color={theme.colors.primary}
                                fill={star <= order.rating! ? theme.colors.primary : 'transparent'}
                            />
                        ))}
                    </View>
                    {order.review && (
                        <Text style={styles.reviewText} numberOfLines={2}>
                            {order.review}
                        </Text>
                    )}
                </View>
            )}
        </BaseCard>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        marginHorizontal: theme.spacing.l,
        marginBottom: theme.spacing.l,
        padding: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: theme.spacing.l,
        paddingBottom: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    partnerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: theme.spacing.m,
    },
    partnerLogo: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.m,
        marginRight: theme.spacing.s,
    },
    partnerText: {
        flex: 1,
    },
    partnerName: {
        fontSize: theme.typography.size.l,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
        marginBottom: 2,
    },
    planName: {
        fontSize: theme.typography.size.s,
        color: theme.colors.textSecondary,
    },
    details: {
        padding: theme.spacing.l,
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderIdLabel: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
    },
    orderDate: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.textTertiary,
    },
    mealRow: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    mealTag: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.borderRadius.s,
    },
    mealText: {
        fontSize: theme.typography.size.xs,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.primary,
    },
    timeTag: {
        backgroundColor: theme.colors.infoLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.borderRadius.s,
    },
    timeText: {
        fontSize: theme.typography.size.xs,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.info,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: theme.typography.size.s,
        color: theme.colors.textSecondary,
        marginLeft: 6,
        marginRight: 4,
    },
    infoValue: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
        flex: 1,
    },
    instructionsContainer: {
        backgroundColor: theme.colors.primaryLight,
        padding: 10,
        borderRadius: theme.borderRadius.s,
    },
    instructionsLabel: {
        fontSize: 11,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.warningText,
        marginBottom: 4,
    },
    instructionsText: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.warningText,
        lineHeight: 16,
    },
    itemsContainer: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.s,
        gap: theme.spacing.s,
        marginTop: theme.spacing.s,
    },
    itemsSectionTitle: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    itemName: {
        fontSize: theme.typography.size.s,
        color: theme.colors.text,
        flex: 1,
        fontFamily: theme.typography.fontFamily.regular,
    },
    itemQty: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.semiBold,
        minWidth: 32,
        textAlign: 'right',
    },
    moreItems: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.textTertiary,
        fontStyle: 'italic',
        marginTop: 4,
        fontFamily: theme.typography.fontFamily.regular,
    },
    extraItemsSection: {
        backgroundColor: theme.colors.primaryLight,
        padding: 10,
        borderRadius: theme.borderRadius.s,
        marginTop: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.primary + '20',
    },
    extraItemsTitle: {
        fontSize: theme.typography.size.xs,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.primary,
        marginBottom: 6,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    extraItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    extraItemName: {
        fontSize: theme.typography.size.s,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        flex: 1,
    },
    extraItemPrice: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semiBold,
        marginLeft: theme.spacing.s,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.l,
        paddingTop: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    amountContainer: {
        gap: 4,
    },
    amountLabel: {
        fontSize: 11,
        color: theme.colors.textTertiary,
    },
    amount: {
        fontSize: 20,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    trackButton: {
        backgroundColor: theme.colors.infoLight,
        paddingHorizontal: theme.spacing.l,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.m,
    },
    trackButtonText: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.info,
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: theme.spacing.l,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.m,
        gap: 6,
    },
    rateButtonText: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.warningText,
    },
    ratingContainer: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
        gap: theme.spacing.s,
    },
    ratingStars: {
        flexDirection: 'row',
        gap: 4,
    },
    reviewText: {
        fontSize: theme.typography.size.s,
        color: theme.colors.textSecondary,
        lineHeight: 18,
        fontStyle: 'italic',
    },
});
