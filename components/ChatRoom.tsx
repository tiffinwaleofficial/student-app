import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import { ChatMessage, Conversation } from '../services/chatService';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { imageUploadService, UploadType } from '../services/imageUploadService';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { MessageItem } from './chat/MessageItem';
import { ChatInput } from './chat/ChatInput';
import { MediaPickerModal } from './chat/MediaPickerModal';
import { MediaPreviewModal } from './chat/MediaPreviewModal';

interface ChatRoomProps {
  conversation: Conversation;
  onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ conversation, onBack }) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const {
    messages,
    isSending,
    error,
    sendTextMessage,
    sendMediaMessage,
    deleteMessage,
    sendTypingIndicator,
    typingIndicators,
    onlineUsers,
    setActiveConversation,
    clearError,
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'optimizing' | 'uploading' | 'completed' | 'failed'>('optimizing');
  const [optimizationData, setOptimizationData] = useState<{
    originalSize: number,
    optimizedSize: number,
    compressionRatio: number
  } | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversationMessages = messages.get(conversation.id) || [];

  useEffect(() => {
    setActiveConversation(conversation);
    return () => {
      setActiveConversation(null);
    };
  }, [conversation, setActiveConversation]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('chatError'), error, [{ text: t('ok'), onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');

    if (isTyping) {
      await sendTypingIndicator(conversation.id, false);
      setIsTyping(false);
    }

    try {
      await sendTextMessage(conversation.id, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      sendTypingIndicator(conversation.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      if (isTyping) {
        await sendTypingIndicator(conversation.id, false);
        setIsTyping(false);
      }
    }, 2000);
  };

  const handleMediaPicker = () => {
    setShowMediaPicker(true);
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreviewImage(asset.uri);
        setPreviewVideo(asset.type === 'video' ? asset.uri : null);
        setPreviewType(asset.type === 'video' ? 'video' : 'image');
        setShowImagePreview(true);
        setShowMediaPicker(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreviewImage(asset.uri);
        setPreviewVideo(asset.type === 'video' ? asset.uri : null);
        setPreviewType(asset.type === 'video' ? 'video' : 'image');
        setShowImagePreview(true);
        setShowMediaPicker(false);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Document selected:', asset);
        setShowMediaPicker(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSendMedia = async () => {
    if (!previewImage && !previewVideo) return;

    try {
      const fileUri = previewType === 'video' ? previewVideo! : previewImage!;

      setUploadProgress(0);
      setUploadStatus('optimizing');
      setOptimizationData(null);

      const configStatus = imageUploadService.getConfigStatus();
      if (!configStatus.configured) {
        Alert.alert('Configuration Error', 'Media upload is temporarily unavailable. Please try again later!');
        return;
      }

      const uploadType = previewType === 'video' ? UploadType.REVIEW_VIDEO : UploadType.REVIEW_IMAGE;

      const onProgress = (progress: number, status: string, optimizationResult?: any) => {
        setUploadProgress(progress);
        setUploadStatus(status as any);

        if (optimizationResult) {
          setOptimizationData({
            originalSize: optimizationResult.originalSize,
            optimizedSize: optimizationResult.optimizedSize,
            compressionRatio: optimizationResult.compressionRatio
          });
        }
      };

      const result = await imageUploadService.uploadImageWithProgress(
        fileUri,
        uploadType,
        onProgress
      );

      if (result.success && result.url) {
        await sendMediaMessage(conversation.id, result.url, previewType);

        setShowImagePreview(false);
        setPreviewImage(null);
        setPreviewVideo(null);
        setUploadProgress(0);
        setUploadStatus('optimizing');
        setOptimizationData(null);
      } else {
        setUploadStatus('failed');
        Alert.alert('Upload Failed', result.error || 'Failed to upload media. Please try again!');
      }
    } catch (error) {
      console.error('Error sending optimized media:', error);
      setUploadStatus('failed');
      Alert.alert('Error', 'Failed to send media');
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      t('deleteMessage'),
      t('areYouSureDeleteMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteMessage(messageId) },
      ]
    );
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwnMessage = item.senderType === 'user';
    const isOnline = onlineUsers.has(item.senderId);
    const showAvatar = !isOwnMessage && (index === 0 || conversationMessages[index - 1].senderId !== item.senderId);

    return (
      <MessageItem
        item={item}
        isOwnMessage={isOwnMessage}
        showAvatar={showAvatar}
        isOnline={isOnline}
        onImagePress={(url) => {
          setPreviewImage(url);
          setPreviewType('image');
          setShowImagePreview(true);
        }}
        onVideoPress={(url) => {
          setPreviewVideo(url);
          setPreviewType('video');
          setShowImagePreview(true);
        }}
        onDelete={handleDeleteMessage}
      />
    );
  };

  const renderTypingIndicator = () => {
    const typingUsers = typingIndicators.get(conversation.id) || [];
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>
          {typingUsers.map(user => user.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.conversationTitle}>{conversation.participants[0]?.name || 'Chat'}</Text>
          <Text style={styles.conversationSubtitle}>
            {onlineUsers.has(conversation.participants[0]?.id || '') ? 'Online' : 'Offline'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleMediaPicker} style={styles.mediaButton}>
          <Text style={styles.mediaButtonText}>📎</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input */}
      <ChatInput
        inputText={inputText}
        isSending={isSending}
        onChangeText={handleTyping}
        onSend={handleSendMessage}
        placeholder={t('typeAMessage')}
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onImagePick={handleImagePicker}
        onCameraCapture={handleCameraCapture}
        onDocumentPick={handleDocumentPicker}
        t={t}
      />

      {/* Image Preview Modal */}
      <MediaPreviewModal
        visible={showImagePreview}
        previewType={previewType}
        previewImage={previewImage}
        previewVideo={previewVideo}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        optimizationData={optimizationData}
        isSending={isSending}
        onClose={() => setShowImagePreview(false)}
        onSend={handleSendMedia}
      />
    </KeyboardAvoidingView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weight.semiBold,
    color: theme.colors.text,
  },
  conversationSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  mediaButton: {
    padding: 8,
  },
  mediaButtonText: {
    fontSize: 20,
    color: theme.colors.text,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ChatRoom;
