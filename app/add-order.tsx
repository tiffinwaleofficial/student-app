import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, ShoppingCart } from 'lucide-react-native';
import api from '@/utils/apiClient';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/hooks/useNotification';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVegetarian?: boolean;
  isAvailable?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

export default function AddOrderScreen() {
  const router = useRouter();
  const { t } = useTranslation('orders');
  const { user } = useAuthStore();
  const { showError, success, warning } = useNotification();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [showCartModal, setShowCartModal] = useState(false);

  const categories = ['All', 'Main Course', 'Appetizers', 'Beverages', 'Desserts'];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const partners = await api.partners.getAll();
      
      // For demo purposes, create sample menu items
      const sampleItems: MenuItem[] = [
        {
          id: '1',
          name: 'Paneer Butter Masala',
          description: 'Rich and creamy paneer curry with aromatic spices',
          price: 180,
          category: 'Main Course',
          isVegetarian: true,
          isAvailable: true,
          image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          id: '2',
          name: 'Chicken Biryani',
          description: 'Fragrant basmati rice with tender chicken and spices',
          price: 220,
          category: 'Main Course',
          isVegetarian: false,
          isAvailable: true,
          image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          id: '3',
          name: 'Samosa (2 pcs)',
          description: 'Crispy pastry filled with spiced potatoes',
          price: 60,
          category: 'Appetizers',
          isVegetarian: true,
          isAvailable: true,
          image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          id: '4',
          name: 'Fresh Lime Soda',
          description: 'Refreshing lime drink with mint',
          price: 40,
          category: 'Beverages',
          isVegetarian: true,
          isAvailable: true,
          image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          id: '5',
          name: 'Gulab Jamun',
          description: 'Sweet milk dumplings in sugar syrup',
          price: 80,
          category: 'Desserts',
          isVegetarian: true,
          isAvailable: true,
          image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
      ];
      
      setMenuItems(sampleItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      showError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCartItems(cartItems.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getItemQuantity = (itemId: string): number => {
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      warning('Please add items to your cart before placing an order.');
      return;
    }

    if (!user?.id) {
      showError('Please login to place an order.');
      return;
    }

    try {
      // For now, use a default business partner ID - in real app, this should come from the menu items
      // or be selected by the user. Let's use the first available partner from seeded data
      const defaultBusinessPartnerId = "6075c1a5a9f14a2c9c5df91b"; // This should be fetched dynamically
      const defaultDeliveryAddress = user.address || "Default delivery address"; // Should come from user profile

      const orderData = {
        customer: user.id,
        businessPartner: defaultBusinessPartnerId,
        items: cartItems.map(item => ({
          mealId: item.id, // Backend expects 'mealId', not 'menuItem'
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || undefined,
        })),
        totalAmount: getTotalAmount(),
        deliveryAddress: defaultDeliveryAddress,
        deliveryInstructions: specialInstructions || undefined,
      };

      console.log('📤 Placing order with data:', orderData);
      const order = await api.orders.create(orderData);
      console.log('✅ Order placed successfully:', order);
      
      success('Order placed successfully! 🎉');
      
      // Clear cart and navigate back after success
      setCartItems([]);
      setSpecialInstructions('');
      setTimeout(() => {
        router.canGoBack() ? router.back() : router.push('/(tabs)/index');
      }, 1500);
    } catch (error) {
      console.error('❌ Error placing order:', error);
      
      // Better error handling
      let errorMessage = 'Failed to place order. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('addOrder')}</Text>
        <View style={styles.cartIconContainer}>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => setShowCartModal(true)}
          >
            <ShoppingCart size={24} color="#333333" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading menu...</Text>
            </View>
          ) : (
            filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              return (
                <View key={item.id} style={styles.menuItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.isVegetarian && (
                        <View style={styles.vegIndicator}>
                          <Text style={styles.vegText}>🌿</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    {quantity > 0 ? (
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => removeFromCart(item.id)}
                        >
                          <Minus size={16} color="#FF9B42" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => addToCart(item)}
                        >
                          <Plus size={16} color="#FF9B42" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart(item)}
                      >
                        <Text style={styles.addButtonText}>ADD</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Special Instructions */}
        {cartItems.length > 0 && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>Special Instructions (Optional)</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Any special requests for your order..."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </ScrollView>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartSummaryContent}>
            <View>
              <Text style={styles.cartItemsCount}>{cartItems.length} {t('items')}</Text>
              <Text style={styles.cartTotal}>₹{getTotalAmount()}</Text>
            </View>
            <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
              <Text style={styles.placeOrderText}>{t('placeOrder')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Cart Modal */}
      <Modal
        visible={showCartModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cartModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('yourCart')}</Text>
              <TouchableOpacity onPress={() => setShowCartModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {cartItems.length === 0 ? (
              <View style={styles.emptyCart}>
                <ShoppingCart size={48} color="#CCCCCC" />
                <Text style={styles.emptyCartText}>{t('yourCartIsEmpty')}</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.cartItemsList}>
                  {cartItems.map((item) => (
                    <View key={item.id} style={styles.cartItem}>
                      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                      <View style={styles.cartItemDetails}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>₹{item.price}</Text>
                      </View>
                      <View style={styles.cartItemQuantity}>
                        <TouchableOpacity
                          style={styles.cartQuantityButton}
                          onPress={() => removeFromCart(item.id)}
                        >
                          <Minus size={16} color="#FF9B42" />
                        </TouchableOpacity>
                        <Text style={styles.cartQuantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.cartQuantityButton}
                          onPress={() => addToCart(item)}
                        >
                          <Plus size={16} color="#FF9B42" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.cartModalFooter}>
                  <View style={styles.cartModalTotal}>
                    <Text style={styles.cartModalTotalText}>{t('total')}: ₹{getTotalAmount()}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.cartModalPlaceOrder}
                    onPress={() => {
                      setShowCartModal(false);
                      handlePlaceOrder();
                    }}
                  >
                    <Text style={styles.cartModalPlaceOrderText}>{t('placeOrder')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF9B42',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryButton: {
    backgroundColor: '#FF9B42',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  vegIndicator: {
    marginLeft: 8,
  },
  vegText: {
    fontSize: 12,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9B42',
  },
  quantityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9B42',
    borderRadius: 6,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  instructionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333333',
    textAlignVertical: 'top',
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cartSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemsCount: {
    fontSize: 14,
    color: '#666666',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  placeOrderButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Cart Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cartModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    fontSize: 18,
    color: '#666666',
    padding: 4,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  cartItemsList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#FF9B42',
    marginTop: 2,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
  },
  cartQuantityButton: {
    padding: 6,
  },
  cartQuantityText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  cartModalFooter: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cartModalTotal: {
    marginBottom: 16,
  },
  cartModalTotalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  cartModalPlaceOrder: {
    backgroundColor: '#FF9B42',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartModalPlaceOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
