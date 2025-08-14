import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProductSearch } from '@/hooks/useSearch';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useProductSearch(query, !!query);

  // Convert API product data to format expected by ProductCard
  const mapProductToCardProps = (product: any) => ({
    id: product._id,
    name: product.title,
    imageUrl: Array.isArray(product.images) && product.images.length > 0 
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) 
      : 'https://placehold.co/400',
    price: product.discountPercentage > 0 ? product.discountedPrice : product.price,
    originalPrice: product.discountPercentage > 0 ? product.price : undefined,
    rating: 4.5, // Default rating since we don't have real ratings yet
    sellerCount: 1, // Default to 1 seller per product for now
    category: product.category,
    bestSeller: false,
    isBargainable: product.allowBargaining
  });

  const products = data?.products?.map(mapProductToCardProps) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Search Results
            </h1>
            {query && (
              <p className="text-muted-foreground">
                {isLoading ? 'Searching...' : `${data?.count || 0} results found for "${query}"`}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any products matching "{query}". Try a different search term.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check your spelling</p>
                <p>• Try more general keywords</p>
                <p>• Browse our categories instead</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Start searching</h3>
              <p className="text-muted-foreground">
                Enter a search term to find products
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;