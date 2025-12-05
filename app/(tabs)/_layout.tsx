import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, ShoppingBag, MapPin, Utensils, User } from 'lucide-react-native';
import { ProtectedRoute } from '@/auth/AuthMiddleware';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF9B42',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            display: 'flex',
            backgroundColor: '#FFFFFF',
            height: 70,
            paddingBottom: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#EEEEEE',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 11,
            marginTop: 4,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                width: 48,
                height: 36,
                borderRadius: 12,
                backgroundColor: focused ? '#FF9B42' + '15' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Home
                  size={24}
                  color={focused ? '#FF9B42' : color}
                  strokeWidth={focused ? 2.5 : 2}
                  fill={focused ? '#FF9B42' + '20' : 'none'}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                width: 48,
                height: 36,
                borderRadius: 12,
                backgroundColor: focused ? '#FF9B42' + '15' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <ShoppingBag
                  size={24}
                  color={focused ? '#FF9B42' : color}
                  strokeWidth={focused ? 2.5 : 2}
                  fill={focused ? '#FF9B42' + '20' : 'none'}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: 'Track',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                width: 48,
                height: 36,
                borderRadius: 12,
                backgroundColor: focused ? '#FF9B42' + '15' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <MapPin
                  size={24}
                  color={focused ? '#FF9B42' : color}
                  strokeWidth={focused ? 2.5 : 2}
                  fill={focused ? '#FF9B42' + '20' : 'none'}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="plans"
          options={{
            title: 'Plans',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                width: 48,
                height: 36,
                borderRadius: 12,
                backgroundColor: focused ? '#FF9B42' + '15' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Utensils
                  size={24}
                  color={focused ? '#FF9B42' : color}
                  strokeWidth={focused ? 2.5 : 2}
                  fill={focused ? '#FF9B42' + '20' : 'none'}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                width: 48,
                height: 36,
                borderRadius: 12,
                backgroundColor: focused ? '#FF9B42' + '15' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <User
                  size={24}
                  color={focused ? '#FF9B42' : color}
                  strokeWidth={focused ? 2.5 : 2}
                  fill={focused ? '#FF9B42' + '20' : 'none'}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
