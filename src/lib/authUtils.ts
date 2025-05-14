import axios from 'axios';

type UserRole = "user" | "seller";

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessAddress: string;
  taxId: string;
}

export const validateSignupForm = (
  formData: SignupFormData, 
  role: UserRole, 
  agreedToTerms: boolean,
  setErrorMessage: (message: string) => void
) => {
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
    setErrorMessage('Please fill out all required fields');
    return false;
  }
  
  if (role === 'seller' && (!formData.businessName || !formData.businessAddress)) {
    setErrorMessage('Please fill out all required business information');
    return false;
  }
  
  if (formData.password !== formData.confirmPassword) {
    setErrorMessage('Passwords do not match');
    return false;
  }
  
  if (formData.password.length < 6) {
    setErrorMessage('Password must be at least 6 characters long');
    return false;
  }
  
  if (!agreedToTerms) {
    setErrorMessage('Please agree to the terms and privacy policy');
    return false;
  }
  
  return true;
};

export const registerUser = async (formData: SignupFormData, role: UserRole) => {
  // Prepare data for API request
  const userData = {
    name: `${formData.firstName} ${formData.lastName}`,
    email: formData.email,
    password: formData.password
  };

  try {
    if (role === 'seller') {
      const sellerData = {
        ...userData,
        storeName: formData.businessName
      };
      
      console.log("Registering seller with data:", sellerData);
      return await axios.post('http://localhost:5000/api/auth/seller/register', sellerData);
    } else {
      console.log("Registering user with data:", userData);
      return await axios.post('http://localhost:5000/api/auth/user/register', userData);
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const storeAuthData = (data: any, role: UserRole) => {
  if (!data || !data.token) {
    console.error("Invalid authentication data:", data);
    throw new Error("Invalid authentication data received");
  }
  
  // Store token consistently across the app
  localStorage.setItem('token', data.token);
  localStorage.setItem('userToken', data.token);
  
  // Store user/seller info
  if (role === 'seller' && data.seller) {
    localStorage.setItem('seller', JSON.stringify(data.seller));
  } else if (data.user) {
    localStorage.setItem('userData', JSON.stringify(data.user));
  }
};