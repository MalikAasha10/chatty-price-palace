import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Product {
  _id?: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category?: string;
  allowBargaining?: boolean;
  discountPercentage?: number;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isEditing: boolean;
}

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Beauty",
  "Toys & Games",
  "Other"
];

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.string().min(1, "Category is required"),
  allowBargaining: z.boolean().default(true),
  discountPercentage: z.coerce.number().min(0).max(50).default(5),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm = ({ isOpen, onClose, product, isEditing }: ProductFormProps) => {
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const token = localStorage.getItem("token");

  const defaultValues: ProductFormValues = {
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || 0,
    images: product?.images || [],
    category: product?.category || "Other",
    allowBargaining: product?.allowBargaining !== undefined ? product.allowBargaining : true,
    discountPercentage: product?.discountPercentage || 5,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title,
        description: product.description,
        price: product.price,
        images: product.images,
        category: product.category || "Other",
        allowBargaining: product.allowBargaining !== undefined ? product.allowBargaining : true,
        discountPercentage: product.discountPercentage || 5,
      });
      setImageUrls(product.images);
    }
  }, [product, form]);

  const addProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      return axios.post("/api/products", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (!product?._id) throw new Error("Product ID is missing");
      return axios.put(`/api/products/${product._id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEditing) {
      updateProduct.mutate(data);
    } else {
      addProduct.mutate(data);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updatedImages = [...imageUrls, newImageUrl];
      setImageUrls(updatedImages);
      form.setValue("images", updatedImages);
      setNewImageUrl("");
    } else if (newImageUrl && imageUrls.includes(newImageUrl)) {
      toast({
        title: "Warning",
        description: "This image URL is already added",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(updatedImages);
    form.setValue("images", updatedImages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your product information below"
              : "Fill in the details to add your product to the marketplace"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Bargain Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Maximum discount you'll accept during bargaining (0-50%)
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowBargaining"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow Bargaining</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Enable customers to negotiate prices with you
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Image URL"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddImage} className="shrink-0">
                        Add
                      </Button>
                    </div>

                    {imageUrls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Product ${index + 1}`}
                              className="h-32 w-full object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/300x300?text=Image+Error";
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 border-2 border-dashed rounded-md">
                        <Image className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          No images added yet
                        </p>
                      </div>
                    )}
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={addProduct.isPending || updateProduct.isPending}>
                {(addProduct.isPending || updateProduct.isPending) ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
