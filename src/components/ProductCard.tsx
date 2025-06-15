import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  images: string[];
  condition: string;
  sizes: string[];
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  index?: number;
}

export function ProductCard({ product, onQuickView, index = 0 }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const finalPrice = product.discount_price || product.price;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (product.sizes.length > 0) {
        if (onQuickView) {
          onQuickView(product);
        } else {
          toast.info('Please select a size');
        }
      } else {
        await addToCart(product.id);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group-hover:scale-[1.02]">
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <Link to={`/products/${product.id}`}>
            <div className="aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer relative">
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex] || product.images[0]}
                alt={product.title}
                onError={handleImageError}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => {
                  if (product.images.length > 1) {
                    setCurrentImageIndex(1);
                  }
                }}
                onMouseLeave={() => setCurrentImageIndex(0)}
              />
              
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white font-semibold shadow-lg">
                <Zap className="h-3 w-3 mr-1" />
                {discountPercentage}% OFF
              </Badge>
            )}
            {product.condition && (
              <Badge variant="secondary" className="bg-white/95 text-gray-700 shadow-md backdrop-blur-sm">
                {product.condition}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                variant={isInWishlist(product.id) ? "default" : "secondary"}
                className={cn(
                  "h-10 w-10 p-0 shadow-lg backdrop-blur-sm",
                  isInWishlist(product.id)
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white/90 hover:bg-white text-gray-700"
                )}
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isInWishlist(product.id) && "fill-current scale-110"
                  )}
                />
              </Button>
            </motion.div>
            
            {onQuickView && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 p-0 bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm"
                  onClick={handleQuickView}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="sm"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg backdrop-blur-sm h-12 font-semibold"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {isLoading 
                  ? 'Adding...' 
                  : product.sizes.length > 0 
                    ? 'Select Size' 
                    : 'Add to Cart'
                }
              </Button>
            </motion.div>
          </div>

          {/* Image Dots Indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.images.slice(0, 3).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors leading-tight text-lg">
              {product.title}
            </h3>
          </Link>

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((size) => (
                <Badge key={size} variant="outline" className="text-xs font-medium">
                  {size}
                </Badge>
              ))}
              {product.sizes.length > 4 && (
                <Badge variant="outline" className="text-xs font-medium">
                  +{product.sizes.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-gray-900">
                ₹{finalPrice.toLocaleString()}
              </span>
              {product.discount_price && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < 4 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">(4.0)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}