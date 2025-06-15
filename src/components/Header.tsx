import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X,
  LogOut,
  Settings,
  Package,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const categories = [
  { name: 'Dresses', href: '/products?category=dresses' },
  { name: 'Kurtis', href: '/products?category=kurtis' },
  { name: 'Tops', href: '/products?category=tops' },
  { name: 'Skirts', href: '/products?category=skirts' },
  { name: 'Pants', href: '/products?category=pants' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    console.log('Header: Attempting to sign out...');
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Header: Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  console.log('Header: Rendering with user:', user ? user.id : 'none');

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-white border-b border-gray-100'
      )}>
        <div className="w-full px-4 lg:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl lg:text-3xl font-playfair font-bold text-gradient"
              >
                Fable & Fits
              </motion.div>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center max-w-lg mx-8 flex-1">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for dresses, kurtis, tops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 w-full bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-full"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="relative hover:bg-primary-50 transition-colors"
              >
                <Link to="/wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary-500 hover:bg-primary-600">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="relative hover:bg-primary-50 transition-colors"
              >
                <Link to="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary-500 hover:bg-primary-600">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User Menu */}
              {authLoading ? (
                <LoadingSpinner />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-primary-50">
                      <User className="h-5 w-5" />
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <Settings className="mr-3 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center">
                        <Package className="mr-3 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/addresses" className="flex items-center">
                        <MapPin className="mr-3 h-4 w-4" />
                        Addresses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex border-primary-200 text-primary-700 hover:bg-primary-50"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center space-x-8 py-4 border-t border-gray-100">
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
              >
                {category.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsSearchOpen(false)} />
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="relative bg-white p-4 shadow-lg"
            >
              <form onSubmit={handleSearch} className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={closeMenu} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Link to="/" onClick={closeMenu}>
                    <div className="text-2xl font-playfair font-bold text-gradient">
                      Fable & Fits
                    </div>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={closeMenu}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
                  <Link
                    to="/products"
                    className="flex items-center py-3 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={closeMenu}
                  >
                    All Products
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="flex items-center py-3 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={closeMenu}
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    to="/contact"
                    className="flex items-center py-3 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={closeMenu}
                  >
                    Contact
                  </Link>
                </nav>

                {/* User section */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  {authLoading ? (
                    <LoadingSpinner />
                  ) : user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link to="/profile" onClick={closeMenu}>
                            <Settings className="mr-3 h-4 w-4" />
                            Profile Settings
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link to="/orders" onClick={closeMenu}>
                            <Package className="mr-3 h-4 w-4" />
                            My Orders
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            handleSignOut();
                            closeMenu();
                          }}
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button asChild className="w-full" onClick={closeMenu}>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}