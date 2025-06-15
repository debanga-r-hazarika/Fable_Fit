import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function WishlistPage() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movingToCart, setMovingToCart] = useState<string | null>(null);
  const { loading: authLoading } = useAuth();

  const handleAddToCart = async (productId: string) => {
    setMovingToCart(productId);
    try {
      await addToCart(productId);
      await removeFromWishlist(productId);
      toast.success('Moved to cart');
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to move to cart');
    } finally {
      setMovingToCart(null);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

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
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {items.length === 0 
                ? 'Your wishlist is empty' 
                : `You have ${items.length} ${items.length === 1 ? 'item' : 'items'} in your wishlist`
              }
            </p>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Save items you love to your wishlist and never lose track of them. 
                  Start browsing and add items you'd like to buy later.
                </p>
                <Button asChild size="lg">
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary-600 fill-current" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {items.length} {items.length === 1 ? 'item' : 'items'} saved
                    </p>
                    <p className="text-sm text-gray-600">
                      Total value: ₹{items.reduce((total, item) => {
                        const price = item.product?.discount_price || item.product?.price || 0;
                        return total + price;
                      }, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      items.forEach(item => handleAddToCart(item.product_id));
                    }}
                    disabled={movingToCart !== null}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add All to Cart
                  </Button>
                </div>
              </div>

              {/* Wishlist Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <Link to={`/products/${item.product_id}`}>
                          <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                            <img
                              src={item.product?.images?.[0] || '/placeholder.jpg'}
                              alt={item.product?.title || 'Product'}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </Link>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                          className="absolute top-3 right-3 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>

                        {/* Discount Badge */}
                        {item.product?.discount_price && item.product?.price && (
                          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                            {Math.round(((item.product.price - item.product.discount_price) / item.product.price) * 100)}% OFF
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <Link to={`/products/${item.product_id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                            {item.product?.title || 'Product Title'}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg text-gray-900">
                              ₹{(item.product?.discount_price || item.product?.price || 0).toLocaleString()}
                            </span>
                            {item.product?.discount_price && item.product?.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{item.product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            onClick={() => handleAddToCart(item.product_id)}
                            disabled={movingToCart === item.product_id}
                            className="w-full"
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            {movingToCart === item.product_id ? 'Adding...' : 'Add to Cart'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}