import { HTMLAttributes } from 'react';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {}

export function LoadingSpinner({ ...props }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center">
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"
        data-testid="loading-spinner"
        {...props}
      />
    </div>
  );
}
