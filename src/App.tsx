import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdminRoute } from '@/components/AdminRoute';
import { AdminLayout } from '@/layouts/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OrdersPage } from '@/pages/OrdersPage';
import { AddressesPage } from '@/pages/AddressesPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { CartPage } from '@/pages/CartPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { ProductsManagement } from '@/pages/admin/ProductsManagement';
import { OrdersManagement } from '@/pages/admin/OrdersManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ProductsManagement />} />
                <Route path="orders" element={<OrdersManagement />} />
                {/* Additional admin routes will be added here */}
              </Route>

              {/* Public Routes */}
              <Route path="/*" element={
                <div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/addresses" element={<AddressesPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      {/* Additional public routes will be added here */}
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
            <Toaster 
              position="top-right" 
              richColors
              closeButton
            />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;