import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Send,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/products' },
    { name: 'Dresses', href: '/products?category=dresses' },
    { name: 'Kurtis', href: '/products?category=kurtis' },
    { name: 'Tops', href: '/products?category=tops' },
    { name: 'New Arrivals', href: '/products?sort=newest' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns & Refunds', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/story' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ]
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
];

export function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl lg:text-4xl font-playfair font-bold text-gradient mb-4">
                Fable & Fits
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Curated preloved fashion for the modern Indian woman. 
                Sustainable style that tells your story, one piece at a time.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full hover:bg-primary-500 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h4 className="font-semibold text-white font-playfair text-lg capitalize">
                  {category}
                </h4>
                <nav className="space-y-3">
                  {links.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block text-gray-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h4 className="font-semibold text-white font-playfair text-lg">
                Stay Updated
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get the latest updates on new arrivals and exclusive offers.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20 focus:border-primary-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white group"
                >
                  Subscribe
                  <Send className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-500/20 rounded-full">
                <Mail className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium">hello@fableandfits.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-500/20 rounded-full">
                <Phone className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="font-medium">+91 98765 43210</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-500/20 rounded-full">
                <MapPin className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium">Mumbai, India</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Fable & Fits. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
          
          {/* Made with Love */}
          <div className="flex items-center justify-center mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-2 text-primary-500 fill-current animate-pulse" />
              <span>for sustainable fashion</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}