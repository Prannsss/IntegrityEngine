'use client';

import { forwardRef, useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** The label that floats above the field on focus / when filled */
  label: string;
  /** Optional element rendered inside the right edge (e.g. eye-toggle button) */
  rightElement?: ReactNode;
  containerClassName?: string;
}

/**
 * Input with a floating label animation.
 * The label sits in the centre of the field as placeholder text, then
 * animates upward on focus or when the field has a value.
 */
export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, className, containerClassName, id, rightElement, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const [focused, setFocused] = useState(false);
    const floated = focused || Boolean(props.value);

    return (
      <div className={cn('relative', containerClassName)}>
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            // layout
            'peer h-14 w-full rounded-xl border px-4 pb-2 pt-6',
            // colour / bg
            'bg-white/[0.03] dark:bg-white/[0.03] text-sm text-foreground',
            // border
            'border-white/[0.08] focus:border-primary/60 dark:focus:border-primary/60',
            'focus:outline-none focus:ring-0 transition-colors',
            // light mode tints
            'light:bg-black/[0.03] light:border-black/[0.12]',
            rightElement && 'pr-10',
            className
          )}
        />

        {/* Floating label */}
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-4 select-none transition-all duration-200 ease-out origin-left',
            floated
              ? 'top-2 text-[10px] font-semibold tracking-wide text-primary'
              : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground'
          )}
        >
          {label}
        </label>

        {/* Right slot (e.g. password eye-toggle) */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
