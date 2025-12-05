import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Shield, Calendar, CheckCircle2, Mail, Phone, MapPin, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { Header } from './ui/Header';

interface PolicySection {
    title: string;
    content: string;
    bullets?: string[];
    contact?: string[];
}

interface PolicyData {
    lastUpdated: string;
    sections: PolicySection[];
}

interface PolicyScreenProps {
    title: string;
    data: PolicyData;
    onBack: () => void;
}

export const PolicyScreen: React.FC<PolicyScreenProps> = ({
    title,
    data,
    onBack,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const renderBullets = (bullets: string[]) => (
        <View style={styles.bulletsContainer}>
            {bullets.map((bullet, index) => (
                <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 50).springify()}
                    style={styles.bulletItem}
                >
                    <View style={styles.bulletIconContainer}>
                        <CheckCircle2 size={16} color={theme.colors.primary} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.bulletText}>{bullet}</Text>
                </Animated.View>
            ))}
        </View>
    );

    const renderContact = (contact: string[]) => (
        <View style={styles.contactContainer}>
            <View style={styles.contactHeader}>
                <Sparkles size={18} color={theme.colors.primary} strokeWidth={2} />
                <Text style={styles.contactHeaderText}>Get in Touch</Text>
            </View>
            {contact.map((item, index) => {
                const isEmail = item.toLowerCase().includes('email');
                const isPhone = item.toLowerCase().includes('phone');
                const isAddress = item.toLowerCase().includes('address');

                let Icon = Mail;
                let iconColor = '#3B82F6';
                if (isPhone) {
                    Icon = Phone;
                    iconColor = '#10B981';
                }
                if (isAddress) {
                    Icon = MapPin;
                    iconColor = '#F59E0B';
                }

                return (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(index * 100).springify()}
                        style={styles.contactItem}
                    >
                        <LinearGradient
                            colors={[`${iconColor}20`, `${iconColor}10`]}
                            style={styles.contactIconGradient}
                        >
                            <Icon size={20} color={iconColor} strokeWidth={2.5} />
                        </LinearGradient>
                        <Text style={styles.contactText}>{item}</Text>
                    </Animated.View>
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            <Header title={title} showBack onBack={onBack} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Header with Gradient */}
                <Animated.View entering={FadeInDown.springify()}>
                    <LinearGradient
                        colors={['#FF9B42', '#FF8C00', '#FF7A00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroIconContainer}>
                            <Shield size={40} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.heroTitle}>{title}</Text>
                        <View style={styles.heroDateContainer}>
                            <Calendar size={16} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                            <Text style={styles.heroDate}>Updated {data.lastUpdated}</Text>
                        </View>

                        {/* Decorative Elements */}
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />
                    </LinearGradient>
                </Animated.View>

                {/* Sections */}
                {data.sections.map((section, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(index * 100).springify()}
                    >
                        <View style={styles.sectionCard}>
                            {/* Section Header */}
                            <View style={styles.sectionHeader}>
                                <LinearGradient
                                    colors={['#FF9B42', '#FF8C00']}
                                    style={styles.sectionNumberGradient}
                                >
                                    <Text style={styles.sectionNumber}>{index + 1}</Text>
                                </LinearGradient>
                                <View style={styles.sectionTitleContainer}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <View style={styles.sectionUnderline} />
                                </View>
                            </View>

                            {/* Content */}
                            <Text style={styles.sectionContent}>{section.content}</Text>

                            {section.bullets && renderBullets(section.bullets)}
                            {section.contact && renderContact(section.contact)}
                        </View>
                    </Animated.View>
                ))}

                {/* Premium Footer */}
                <Animated.View
                    entering={FadeInDown.delay(data.sections.length * 100).springify()}
                    style={styles.footerCard}
                >
                    <LinearGradient
                        colors={['#10B98120', '#10B98110']}
                        style={styles.footerGradient}
                    >
                        <View style={styles.footerIconContainer}>
                            <CheckCircle2 size={24} color="#10B981" strokeWidth={2.5} />
                        </View>
                        <View style={styles.footerTextContainer}>
                            <Text style={styles.footerTitle}>You're Protected</Text>
                            <Text style={styles.footerText}>
                                By using TiffinWale, you agree to these terms and our commitment to your privacy
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },

    // Hero Card Styles
    heroCard: {
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#FF9B42',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    heroIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    heroTitle: {
        fontSize: 28,
        fontFamily: 'Poppins-Bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    heroDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    heroDate: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: 'rgba(255,255,255,0.95)',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },

    // Section Card Styles
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 16,
    },
    sectionNumberGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF9B42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    sectionNumber: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#FFFFFF',
    },
    sectionTitleContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: '#1F2937',
        lineHeight: 26,
        marginBottom: 6,
    },
    sectionUnderline: {
        width: 40,
        height: 3,
        backgroundColor: '#FF9B42',
        borderRadius: 2,
    },
    sectionContent: {
        fontSize: 15,
        color: '#6B7280',
        fontFamily: 'Poppins-Regular',
        lineHeight: 24,
        marginBottom: 16,
    },

    // Bullets Styles
    bulletsContainer: {
        marginTop: 12,
        gap: 12,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingLeft: 8,
    },
    bulletIconContainer: {
        marginTop: 3,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
    },

    // Contact Styles
    contactContainer: {
        marginTop: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    contactHeaderText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#1F2937',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 12,
    },
    contactIconGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        fontFamily: 'Poppins-Medium',
        lineHeight: 20,
    },

    // Footer Styles
    footerCard: {
        marginTop: 24,
        marginBottom: 8,
    },
    footerGradient: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: '#10B98130',
    },
    footerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    footerTextContainer: {
        flex: 1,
    },
    footerTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    footerText: {
        fontSize: 13,
        color: '#6B7280',
        fontFamily: 'Poppins-Regular',
        lineHeight: 20,
    },
});
