# Step 1 Fix: Correct Backend Field Names
# Navigate to storefront
cd apps/storefront

# Fix the AddressForm to match exact backend field names
cat > src/components/checkout/AddressForm.tsx << 'EOF'
'use client';

import { useState } from 'react';

// Match exact backend CreateAddressRequest structure
interface AddressFormData {
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;  // Backend expects "address_line1" (no underscore)
  address_line2?: string; // Backend expects "address_line2" (no underscore)
  city: string;
  state: string;
  postal_code: string;
  country: string; // 2-letter ISO code
  phone?: string;
  is_default?: boolean;
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  showTypeSelection?: boolean;
}

export function AddressForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save Address',
  isLoading = false,
  showTypeSelection = true
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    type: initialData.type || 'shipping',
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    company: initialData.company || '',
    address_line1: initialData.address_line1 || '', // Correct field name
    address_line2: initialData.address_line2 || '', // Correct field name
    city: initialData.city || '',
    state: initialData.state || '',
    postal_code: initialData.postal_code || '',
    country: initialData.country || 'IN', // Default to India (2-letter code)
    phone: initialData.phone || '',
    is_default: initialData.is_default || false,
  });

  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  // Country options with 2-letter ISO codes
  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AE', name: 'United Arab Emirates' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof AddressFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormData> = {};

    // Backend validation requirements
    if (!formData.type) {
      newErrors.type = 'Address type is required';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.address_line1.trim()) { // Correct field name
      newErrors.address_line1 = 'Address line 1 is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    } else if (formData.country.length !== 2) {
      newErrors.country = 'Country must be a 2-letter code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submitted with data:', formData);
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      console.log('❌ Form validation failed:', errors);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Type Selection */}
        {showTypeSelection && (
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Address Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.type ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
            >
              <option value="shipping">Shipping Address</option>
              <option value="billing">Billing Address</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.first_name ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
              placeholder="Enter first name"
            />
            {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.last_name ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
              placeholder="Enter last name"
            />
            {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
          </div>
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company (Optional)
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
            placeholder="Company name"
          />
        </div>

        {/* Address Fields - CORRECTED FIELD NAMES */}
        <div>
          <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            value={formData.address_line1}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.address_line1 ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            disabled={isLoading}
            placeholder="Street address, building number"
          />
          {errors.address_line1 && <p className="mt-1 text-sm text-red-600">{errors.address_line1}</p>}
        </div>

        <div>
          <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="address_line2"
            name="address_line2"
            value={formData.address_line2}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
            placeholder="Apartment, suite, unit, etc."
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
              placeholder="City"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State/Province *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
              placeholder="State"
            />
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Postal Code *
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.postal_code ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
              placeholder="Postal code"
            />
            {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
          </div>
        </div>

        {/* Country and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country *
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.country ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* Default Address Checkbox */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">
              Set as default {formData.type} address
            </span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
EOF

echo "✅ Step 1 FIXED: Corrected backend field names"
echo ""
echo "🔧 Critical fixes applied:"
echo "   ✅ address_line1 (was address_line_1) - backend expects no underscore"
echo "   ✅ address_line2 (was address_line_2) - backend expects no underscore"
echo "   ✅ All other required fields properly named"
echo "   ✅ 2-letter country codes (IN, US, GB, etc.)"
echo "   ✅ Proper validation for all required fields"
echo ""
echo "📝 Test this now in your profile page - the validation error should be fixed!"
echo ""
echo "Backend expects these exact field names:"
echo "   • type: 'shipping' or 'billing'"
echo "   • first_name: string"
echo "   • last_name: string"
echo "   • address_line1: string (NO underscore!)"
echo "   • address_line2: string (NO underscore!)"
echo "   • city: string"
echo "   • state: string"
echo "   • postal_code: string"
echo "   • country: 2-letter code (IN, US, etc.)"
echo "   • phone: string (optional)"
echo "   • is_default: boolean"