'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { AddressForm as AddressFormType } from '@repo/types';

interface AddressFormProps {
  initialData?: Partial<AddressFormType>;
  onSubmit: (data: AddressFormType) => void | Promise<void>;
  onCancel: () => void;
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
    country: initialData.country || 'IN',
    phone: initialData.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    // Validate postal code format for India
    if (formData.country === 'IN' && formData.postal_code) {
      const pinCodeRegex = /^[1-9][0-9]{5}$/;
      if (!pinCodeRegex.test(formData.postal_code)) {
        newErrors.postal_code = 'Please enter a valid 6-digit PIN code';
      }
    }

    // Validate phone number if provided
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handleChange = (field: keyof AddressFormType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            className={errors.first_name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>
        
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            className={errors.last_name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
        </div>
      </div>

      {/* Company */}
      <div>
        <Label htmlFor="company">Company (Optional)</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          disabled={isLoading}
          placeholder="Company name"
        />
      </div>

      {/* Address Lines */}
      <div>
        <Label htmlFor="address_line_1">Address Line 1 *</Label>
        <Input
          id="address_line_1"
          value={formData.address_line_1}
          onChange={(e) => handleChange('address_line_1', e.target.value)}
          className={errors.address_line_1 ? 'border-red-500' : ''}
          disabled={isLoading}
          placeholder="Street address, P.O. Box, etc."
        />
        {errors.address_line_1 && <p className="text-red-500 text-sm mt-1">{errors.address_line_1}</p>}
      </div>

      <div>
        <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
        <Input
          id="address_line_2"
          value={formData.address_line_2}
          onChange={(e) => handleChange('address_line_2', e.target.value)}
          disabled={isLoading}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={errors.city ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>
        
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className={errors.state ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>
        
        <div>
          <Label htmlFor="postal_code">
            {formData.country === 'IN' ? 'PIN Code *' : 'Postal Code *'}
          </Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            className={errors.postal_code ? 'border-red-500' : ''}
            disabled={isLoading}
            placeholder={formData.country === 'IN' ? '123456' : 'Postal code'}
          />
          {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
        </div>
      </div>

      {/* Country */}
      <div>
        <Label htmlFor="country">Country *</Label>
        <Select 
          value={formData.country} 
          onValueChange={(value) => handleChange('country', value)}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN">🇮🇳 India</SelectItem>
            <SelectItem value="US">🇺🇸 United States</SelectItem>
            <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
            <SelectItem value="CA">🇨🇦 Canada</SelectItem>
            <SelectItem value="AU">🇦🇺 Australia</SelectItem>
            <SelectItem value="DE">🇩🇪 Germany</SelectItem>
            <SelectItem value="FR">🇫🇷 France</SelectItem>
            <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
          </SelectContent>
        </Select>
        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={errors.phone ? 'border-red-500' : ''}
          disabled={isLoading}
          placeholder="+91 98765 43210"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
