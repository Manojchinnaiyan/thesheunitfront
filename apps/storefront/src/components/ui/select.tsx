import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = 'Select';

// These are simplified versions for your use case
const SelectContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

const SelectItem = ({ children, value, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) => (
  <option value={value} {...props}>{children}</option>
);

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <Select className={className} ref={ref} {...props}>
      {children}
    </Select>
  )
);

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <option value="" disabled>{placeholder}</option>
);

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
