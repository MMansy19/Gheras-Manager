import * as React from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className="sr-only"
            {...props}
          />
          <div
            className={`
              h-5 w-5 rounded border-2 cursor-pointer transition-all duration-200
              flex items-center justify-center
              ${checked
                ? 'bg-primary border-primary text-white'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary/50'
              }
              ${className || ''}
            `}
          >
            {checked && <Check className="h-3 w-3" />}
          </div>
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
