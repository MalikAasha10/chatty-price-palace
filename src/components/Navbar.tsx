
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would be from auth context in a real app

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-brand-500">BargainBay</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 px-6 max-w-xl">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/categories" className="text-gray-700 hover:text-brand-500 transition-colors">
              Categories
            </Link>
            <Link to="/deals" className="text-gray-700 hover:text-brand-500 transition-colors">
              Deals
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      2
                    </span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-brand-500 text-brand-500">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-brand-500 hover:bg-brand-600">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search - visible when menu is closed */}
        {!isMenuOpen && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-lg"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 bg-white border-t animate-slide-up">
          <div className="flex flex-col space-y-3">
            <Link to="/categories" className="text-gray-700 py-2 border-b border-gray-100">
              Categories
            </Link>
            <Link to="/deals" className="text-gray-700 py-2 border-b border-gray-100">
              Deals
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="text-gray-700 py-2 border-b border-gray-100">
                  My Account
                </Link>
                <Link to="/orders" className="text-gray-700 py-2 border-b border-gray-100">
                  My Orders
                </Link>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full border-brand-500 text-brand-500">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full bg-brand-500 hover:bg-brand-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            <Link to="/cart" className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">Shopping Cart</span>
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
