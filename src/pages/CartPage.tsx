import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Heart,
  Tag,
  Truck,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function CartPage() {
  const { items, loading, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { addToWishlist } = useWishlist();
  const { loading: authLoading } = useAuth();

  const handleMoveToWishlist = async (productId: string, itemId: string) => {
    try {
      await addToWishlist(productId);
      await removeFromCart(itemId);
      toast.success('Moved to wishlist');
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      toast.error('Failed to move to wishlist');
    }
  };

  const shippingCost = getTotalPrice() > 999 ? 0 : 99;
  const finalTotal = getTotalPrice() + shippingCost;

  if (authLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600">
              {items.length === 0 
                ? 'Your cart is empty' 
                : `You have ${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`
              }
            </p>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. 
                  Start shopping to fill it up!
                </p>
                <Button asChild size="lg">
                  <Link to="/products">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Link to={`/products/${item.product_id}`}>
                            <img
                              src={item.product?.images?.[0] || '/placeholder.jpg'}
                              alt={item.product?.title || 'Product'}
                              className="h-24 w-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                            />
                          </Link>
                          
                          <div className="flex-1 min-w-0">
                            <Link to={`/products/${item.product_id}`}>
                              <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                                {item.product?.title || 'Product Title'}
                              </h3>
                            </Link>
                            
                            {item.size && (
                              <p className="text-sm text-gray-600 mb-2">
                                Size: {item.size}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="font-semibold text-lg text-gray-900">
                                ₹{(item.product?.discount_price || item.product?.price || 0).toLocaleString()}
                              </span>
                              {item.product?.discount_price && item.product?.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveToWishlist(item.product_id, item.id)}
                                  className="text-gray-600 hover:text-primary-600"
                                >
                                  <Heart className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-600 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Recommended Products */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg">You might also like</CardTitle>
                    <CardDescription>
                      Based on items in your cart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Placeholder for recommended products */}
                      <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-sm text-gray-500">Recommended products coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                {/* Promo Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Promo Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Input placeholder="Enter promo code" className="flex-1" />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({items.length} items)</span>
                      <span className="font-medium">₹{getTotalPrice().toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `₹${shippingCost}`
                        )}
                      </span>
                    </div>
                    
                    {shippingCost > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-800">
                          Add ₹{(999 - getTotalPrice()).toLocaleString()} more for FREE shipping
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-lg">Total</span>
                        <span className="font-bold text-xl">₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full h-12 text-lg font-semibold">
                      <Link to="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck className="h-4 w-4 mr-2 text-green-600" />
                        Free delivery on orders above ₹999
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Shield className="h-4 w-4 mr-2 text-blue-600" />
                        Secure checkout with 256-bit SSL
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Continue Shopping */}
                <Button variant="outline" asChild className="w-full">
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}