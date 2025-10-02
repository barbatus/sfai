import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/tw';

const spaceVariants = cva('', {
  variants: {
    direction: {
      vertical: 'space-y',
      horizontal: 'space-x',
    },
    size: {
      0: '',
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
      6: '',
      8: '',
      10: '',
      12: '',
      16: '',
    },
  },
  compoundVariants: [
    // Vertical spacing
    { direction: 'vertical', size: 0, class: 'space-y-0' },
    { direction: 'vertical', size: 1, class: 'space-y-1' },
    { direction: 'vertical', size: 2, class: 'space-y-2' },
    { direction: 'vertical', size: 3, class: 'space-y-3' },
    { direction: 'vertical', size: 4, class: 'space-y-4' },
    { direction: 'vertical', size: 5, class: 'space-y-5' },
    { direction: 'vertical', size: 6, class: 'space-y-6' },
    { direction: 'vertical', size: 8, class: 'space-y-8' },
    { direction: 'vertical', size: 10, class: 'space-y-10' },
    { direction: 'vertical', size: 12, class: 'space-y-12' },
    { direction: 'vertical', size: 16, class: 'space-y-16' },
    // Horizontal spacing
    { direction: 'horizontal', size: 0, class: 'space-x-0' },
    { direction: 'horizontal', size: 1, class: 'space-x-1' },
    { direction: 'horizontal', size: 2, class: 'space-x-2' },
    { direction: 'horizontal', size: 3, class: 'space-x-3' },
    { direction: 'horizontal', size: 4, class: 'space-x-4' },
    { direction: 'horizontal', size: 5, class: 'space-x-5' },
    { direction: 'horizontal', size: 6, class: 'space-x-6' },
    { direction: 'horizontal', size: 8, class: 'space-x-8' },
    { direction: 'horizontal', size: 10, class: 'space-x-10' },
    { direction: 'horizontal', size: 12, class: 'space-x-12' },
    { direction: 'horizontal', size: 16, class: 'space-x-16' },
  ],
  defaultVariants: {
    direction: 'vertical',
    size: 4,
  },
});

export interface SpaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spaceVariants> {
  as?: React.ElementType;
}

const Space = React.forwardRef<HTMLDivElement, SpaceProps>(
  ({ className, direction, size, as: Component = 'div', ...props }, ref) => {
    return React.createElement(Component, {
      className: cn(spaceVariants({ direction, size }), className),
      ref,
      ...props,
    });
  },
);

Space.displayName = 'Space';

export { Space, spaceVariants };
