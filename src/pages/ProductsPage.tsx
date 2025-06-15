import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Grid,
  List,
  X,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  images: string[];
  condition: string;
  sizes: string[];
  category_id: string;
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface Filters {
  category: string[];
  priceRange: [number, number];
  sizes: string[];
  condition: string[];
  search: string;
  sortBy: string;
}

const conditions = ['New', 'Excellent', 'Good', 'Fair'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Most Popular' },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') ? [searchParams.get('category')!] : [],
    priceRange: [0, 10000],
    sizes: [],
    condition: [],
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sort') || 'newest'
  });

  useEffect(() => {
    // Fetch categories and products when component mounts
    Promise.all([fetchCategories(), fetchProducts()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Fetch products when filters change (but not on initial load)
    if (!loading) {
      fetchProducts();
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Categories fetch error:', error);
        toast.error('Failed to load categories');
        return;
      }
      
      console.log('Categories fetched:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products with filters:', filters);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.category.length > 0) {
        const categoryIds = categories
          .filter(cat => filters.category.includes(cat.name))
          .map(cat => cat.id);
        
        if (categoryIds.length > 0) {
          query = query.in('category_id', categoryIds);
        }
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters.condition.length > 0) {
        query = query.in('condition', filters.condition);
      }

      // Price range filter
      const minPrice = filters.priceRange[0];
      const maxPrice = filters.priceRange[1];
      query = query.gte('price', minPrice).lte('price', maxPrice);

      // Sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Products fetch error:', error);
        toast.error('Failed to load products');
        return;
      }
      
      let filteredProducts = data || [];
      console.log('Products fetched:', filteredProducts);

      // Size filter (client-side since sizes is an array)
      if (filters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.sizes.some((size: string) => filters.sizes.includes(size))
        );
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      priceRange: [0, 10000],
      sizes: [],
      condition: [],
      search: '',
      sortBy: 'newest'
    });
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.category.includes(category.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('category', [...filters.category, category.name]);
                  } else {
                    updateFilter('category', filters.category.filter(c => c !== category.name));
                  }
                }}
              />
              <label htmlFor={category.id} className="text-sm text-gray-700 cursor-pointer">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Price Range</h3>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>₹{filters.priceRange[0]}</span>
            <span>₹{filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Sizes</h3>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size: string) => (
            <Button
              key={size}
              variant={filters.sizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (filters.sizes.includes(size)) {
                  updateFilter('sizes', filters.sizes.filter(s => s !== size));
                } else {
                  updateFilter('sizes', [...filters.sizes, size]);
                }
              }}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Condition</h3>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={filters.condition.includes(condition)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('condition', [...filters.condition, condition]);
                  } else {
                    updateFilter('condition', filters.condition.filter(c => c !== condition));
                  }
                }}
              />
              <label htmlFor={condition} className="text-sm text-gray-700 cursor-pointer">
                {condition}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {getActiveFiltersCount() > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="aspect-[3/4] bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
              All Products
            </h1>
            <p className="text-gray-600">
              Discover our curated collection of preloved fashion
            </p>
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Search className="h-4 w-4 mr-2" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active Filters */}
              <div className="flex items-center space-x-2">
                {filters.category.map((category) => (
                  <Badge key={category} variant="secondary" className="px-2 py-1">
                    {category}
                    <button
                      onClick={() => updateFilter('category', filters.category.filter(c => c !== category))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.sizes.map((size: string) => (
                  <Badge key={size} variant="secondary" className="px-2 py-1">
                    Size: {size}
                    <button
                      onClick={() => updateFilter('sizes', filters.sizes.filter(s => s !== size))}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort */}
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden md:flex items-center border border-gray-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {products.length} products
            </p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Filters</h2>
                    {getActiveFiltersCount() > 0 && (
                      <Badge>{getActiveFiltersCount()}</Badge>
                    )}
                  </div>
                  <FilterContent />
                </CardContent>
              </Card>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {categories.length === 0 
                        ? 'Unable to load products. Please check your connection.' 
                        : 'Try adjusting your filters or search terms'
                      }
                    </p>
                    <Button onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              {products.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    Load More Products
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}