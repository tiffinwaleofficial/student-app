import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera } from 'lucide-react-native';

interface ProfileAvatarProps {
  profileImage?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  size?: number;
  onPress?: () => void;
  showCameraIcon?: boolean;
  isUploading?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profileImage,
  firstName,
  lastName,
  name,
  size = 100,
  onPress,
  showCameraIcon = false,
  isUploading = false
}) => {
  // Get the initial letter for fallback
  const getInitial = () => {
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (name) return name.charAt(0).toUpperCase();
    return 'U';
  };

  const avatarSize = size;
  const borderRadius = avatarSize / 2;

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
      {profileImage ? (
        <Image 
          source={{ uri: profileImage }}
          style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius }]}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { width: avatarSize, height: avatarSize, borderRadius }]}>
          <Text style={[styles.initial, { fontSize: avatarSize * 0.4 }]}>
            {getInitial()}
          </Text>
        </View>
      )}
      
      {showCameraIcon && onPress && (
        <TouchableOpacity 
          style={[styles.cameraButton, { width: avatarSize * 0.36, height: avatarSize * 0.36, borderRadius: avatarSize * 0.18 }]}
          onPress={onPress}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Camera size={avatarSize * 0.2} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#FF9B42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9B42',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});






