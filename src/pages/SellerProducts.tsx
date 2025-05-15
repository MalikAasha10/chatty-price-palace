
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductForm from "@/components/ProductForm";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sellerRef: string;
  createdAt: string;
}

const SellerProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  
  useEffect(() => {
    // Redirect if not logged in or not a seller
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login as a seller to access this page",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate, token]);

  // Fetch seller products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["sellerProducts"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/products/seller/my-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.products;
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditingProduct(true);
  };

  const filteredProducts = products?.filter((product: Product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading products...</div>;
  
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error loading products</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Products</h1>
          <Button onClick={() => setIsAddingProduct(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Products Table */}
        <Card className="overflow-hidden shadow-sm">
          {filteredProducts?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: Product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <Package className="h-10 w-10 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No products found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery ? "Try a different search term" : "Start selling by adding your first product"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setIsAddingProduct(true)} 
                  className="mt-4"
                >
                  Add Your First Product
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Product Form Modal */}
        {(isAddingProduct || isEditingProduct) && (
          <ProductForm
            isOpen={isAddingProduct || isEditingProduct}
            onClose={() => {
              setIsAddingProduct(false);
              setIsEditingProduct(false);
              setCurrentProduct(null);
            }}
            product={currentProduct}
            isEditing={isEditingProduct}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SellerProducts;
