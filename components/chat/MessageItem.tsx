import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ChatMessage } from '../../services/chatService';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface MessageItemProps {
    item: ChatMessage;
    isOwnMessage: boolean;
    showAvatar: boolean;
    isOnline: boolean;
    onImagePress: (url: string) => void;
    onVideoPress: (url: string) => void;
    onDelete: (id: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
    item,
    isOwnMessage,
    showAvatar,
    isOnline,
    onImagePress,
    onVideoPress,
    onDelete,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
            {showAvatar && (
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.senderName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    {isOnline && <View style={styles.onlineIndicator} />}
                </View>
            )}

            <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
                {!isOwnMessage && showAvatar && (
                    <Text style={styles.senderName}>{item.senderName}</Text>
                )}

                {item.messageType === 'text' ? (
                    <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                        {item.content}
                    </Text>
                ) : item.messageType === 'image' ? (
                    <TouchableOpacity onPress={() => onImagePress(item.mediaUrl || '')}>
                        <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
                    </TouchableOpacity>
                ) : item.messageType === 'video' ? (
                    <TouchableOpacity onPress={() => onVideoPress(item.mediaUrl || '')}>
                        <View style={styles.videoContainer}>
                            <Image source={{ uri: item.mediaThumbnail }} style={styles.videoThumbnail} />
                            <View style={styles.playButton}>
                                <Text style={styles.playButtonText}>▶</Text>
                            </View>
                            {item.mediaDuration && (
                                <Text style={styles.videoDuration}>
                                    {Math.floor(item.mediaDuration / 60)}:{(item.mediaDuration % 60).toString().padStart(2, '0')}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                ) : null}

                <View style={styles.messageFooter}>
                    <Text style={styles.messageTime}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isOwnMessage && (
                        <View style={styles.messageStatus}>
                            {item.status === 'sending' && <ActivityIndicator size="small" color={theme.colors.textTertiary} />}
                            {item.status === 'sent' && <Text style={styles.statusIcon}>✓</Text>}
                            {item.status === 'delivered' && <Text style={styles.statusIcon}>✓✓</Text>}
                            {item.status === 'read' && <Text style={[styles.statusIcon, styles.readStatus]}>✓✓</Text>}
                            {item.status === 'failed' && <Text style={styles.statusIcon}>⚠</Text>}
                        </View>
                    )}
                </View>

                {isOwnMessage && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(item.id)}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'flex-end',
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
    },
    avatarContainer: {
        marginRight: 8,
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: theme.colors.white,
        fontSize: 14,
        fontWeight: theme.typography.weight.semiBold,
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.success,
        position: 'absolute',
        bottom: -2,
        right: -2,
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    messageBubble: {
        maxWidth: '80%',
        backgroundColor: theme.colors.card,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ownMessageBubble: {
        backgroundColor: theme.colors.primary,
    },
    senderName: {
        fontSize: 12,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.primary,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 20,
    },
    ownMessageText: {
        color: theme.colors.white,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
    },
    videoContainer: {
        position: 'relative',
    },
    videoThumbnail: {
        width: 200,
        height: 200,
        borderRadius: 12,
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonText: {
        color: theme.colors.white,
        fontSize: 16,
    },
    videoDuration: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: theme.colors.white,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    messageStatus: {
        marginLeft: 4,
    },
    statusIcon: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    readStatus: {
        color: theme.colors.white, // Changed to white for visibility on primary background
    },
    deleteButton: {
        marginTop: 4,
    },
    deleteButtonText: {
        fontSize: 12,
        color: theme.colors.error,
    },
});
