import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const heroSlides = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg',
    title: 'Summer Collection',
    subtitle: 'Discover preloved treasures',
    description: 'Curated dresses and tops for the modern woman',
    cta: 'Shop Dresses',
    link: '/products?category=dresses',
    theme: 'light'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/8180204/pexels-photo-8180204.jpeg',
    title: 'Ethnic Elegance',
    subtitle: 'Traditional meets contemporary',
    description: 'Beautiful kurtis and ethnic wear collection',
    cta: 'Shop Kurtis',
    link: '/products?category=kurtis',
    theme: 'dark'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/5698859/pexels-photo-5698859.jpeg',
    title: 'Casual Chic',
    subtitle: 'Everyday essentials',
    description: 'Comfortable tops and casual wear',
    cta: 'Shop Tops',
    link: '/products?category=tops',
    theme: 'light'
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <div 
      className="relative h-[100vh] min-h-[600px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${currentSlideData.image})`,
            }}
          >
            <div className={cn(
              'absolute inset-0',
              currentSlideData.theme === 'dark' 
                ? 'bg-gradient-to-r from-black/70 via-black/50 to-transparent'
                : 'bg-gradient-to-r from-white/80 via-white/60 to-transparent'
            )} />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="w-full px-6 lg:px-12">
              <div className="max-w-7xl mx-auto">
                <div className="max-w-2xl lg:max-w-3xl">
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="space-y-6 lg:space-y-8"
                  >
                    <div className="space-y-2">
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className={cn(
                          'text-lg lg:text-xl font-medium tracking-wide uppercase',
                          currentSlideData.theme === 'dark' ? 'text-white/90' : 'text-gray-600'
                        )}
                      >
                        {currentSlideData.subtitle}
                      </motion.p>
                      
                      <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className={cn(
                          'text-5xl md:text-6xl lg:text-8xl font-playfair font-bold leading-tight',
                          currentSlideData.theme === 'dark' ? 'text-white' : 'text-gray-900'
                        )}
                      >
                        {currentSlideData.title}
                      </motion.h1>
                    </div>
                    
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className={cn(
                        'text-xl lg:text-2xl leading-relaxed max-w-lg',
                        currentSlideData.theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                      )}
                    >
                      {currentSlideData.description}
                    </motion.p>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <Button
                        asChild
                        size="lg"
                        className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <Link to={currentSlideData.link}>
                          {currentSlideData.cta}
                          <motion.div
                            className="ml-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            →
                          </motion.div>
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className={cn(
                          'px-8 py-4 h-14 text-lg font-semibold border-2 transition-all duration-300',
                          currentSlideData.theme === 'dark'
                            ? 'border-white text-white hover:bg-white hover:text-gray-900'
                            : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                        )}
                      >
                        <Link to="/products">
                          View All Products
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="lg"
        className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-full h-14 w-14 p-0 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="lg"
        className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-full h-14 w-14 p-0 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Autoplay Control */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-full text-white"
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
      >
        <Play className={cn("h-4 w-4 transition-transform", !isAutoPlaying && "rotate-90")} />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-3 w-3 rounded-full transition-all duration-300 border border-white/30',
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/30 hover:bg-white/60'
            )}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-20 text-white/80 text-sm font-medium">
        {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
      </div>
    </div>
  );
}