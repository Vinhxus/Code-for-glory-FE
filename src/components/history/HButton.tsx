import './HButton.css';
import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'recall' | 'delete';

type ButtonProps = {
  variant?: Variant;
} & ComponentProps<'button'>;

function getVariantStyle(variant: Variant) {
  switch (variant) {
    case 'primary':
      return 'bg-violet-600 hover:bg-purple-600 text-green-500 cursor-pointer view-fix';
    case 'recall':
      return 'recall-btn';
    default:
      return 'bg-violet-600 hover:bg-purple-600 text-green-500 cursor-pointer view-fix';
  }
}

export default function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        'transition-colors rounded px-2 py-1',
        getVariantStyle(variant),
        className
      )}
    />
  );
}
