'use client';

import { useState } from 'react';
import type { AddressForm as AddressFormType } from '@repo/types';

interface AddressFormProps {
  initialData?: Partial<AddressFormType>;
  onSubmit: (data: AddressFormType) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function AddressForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save Address',
  isLoading = false
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormType>({
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    company: initialData.company || '',
    address_line_1: initialData.address_line_1 || '',
    address_line_2: initialData.address_line_2 || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postal_code: initialData.postal_code || '',
    country: initialData.country || 'IN', // Use country code instead of name
    phone: initialData.phone || '',
  });

  const [errors, setErrors] = useState<Partial<AddressFormType>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof AddressFormType]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormType> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const inputClassName = (hasError: boolean) =>
    `mt-1 block w-full px-3 py-2 border ${
      hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    } rounded-md shadow-sm focus:outline-none focus:ring-1 disabled:bg-gray-50 disabled:cursor-not-allowed`;

  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
  const errorClassName = "mt-1 text-sm text-red-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelClassName}>First Name *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={inputClassName(!!errors.first_name)}
            disabled={isLoading}
            placeholder="Enter your first name"
          />
          {errors.first_name && <p className={errorClassName}>{errors.first_name}</p>}
        </div>

        <div>
          <label htmlFor="last_name" className={labelClassName}>Last Name *</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={inputClassName(!!errors.last_name)}
            disabled={isLoading}
            placeholder="Enter your last name"
          />
          {errors.last_name && <p className={errorClassName}>{errors.last_name}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="company" className={labelClassName}>Company (Optional)</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={inputClassName(false)}
          disabled={isLoading}
          placeholder="Enter company name"
        />
      </div>

      <div>
        <label htmlFor="address_line_1" className={labelClassName}>Address Line 1 *</label>
        <input
          type="text"
          id="address_line_1"
          name="address_line_1"
          value={formData.address_line_1}
          onChange={handleChange}
          className={inputClassName(!!errors.address_line_1)}
          disabled={isLoading}
          placeholder="Enter your street address"
        />
        {errors.address_line_1 && <p className={errorClassName}>{errors.address_line_1}</p>}
      </div>

      <div>
        <label htmlFor="address_line_2" className={labelClassName}>Address Line 2 (Optional)</label>
        <input
          type="text"
          id="address_line_2"
          name="address_line_2"
          value={formData.address_line_2}
          onChange={handleChange}
          className={inputClassName(false)}
          disabled={isLoading}
          placeholder="Apartment, suite, etc."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className={labelClassName}>City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={inputClassName(!!errors.city)}
            disabled={isLoading}
            placeholder="Enter city"
          />
          {errors.city && <p className={errorClassName}>{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className={labelClassName}>State *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={inputClassName(!!errors.state)}
            disabled={isLoading}
            placeholder="Enter state"
          />
          {errors.state && <p className={errorClassName}>{errors.state}</p>}
        </div>

        <div>
          <label htmlFor="postal_code" className={labelClassName}>Postal Code *</label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            className={inputClassName(!!errors.postal_code)}
            disabled={isLoading}
            placeholder="Enter postal code"
          />
          {errors.postal_code && <p className={errorClassName}>{errors.postal_code}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className={labelClassName}>Country *</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={inputClassName(!!errors.country)}
            disabled={isLoading}
          >
            <option value="">Select a country</option>
            <option value="IN">India</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="JP">Japan</option>
            <option value="SG">Singapore</option>
            <option value="AE">United Arab Emirates</option>
          </select>
          {errors.country && <p className={errorClassName}>{errors.country}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClassName}>Phone Number (Optional)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClassName(false)}
            disabled={isLoading}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  );
}
