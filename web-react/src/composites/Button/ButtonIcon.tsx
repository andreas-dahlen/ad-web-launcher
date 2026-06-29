import clsx from 'clsx';
import css from './Button.module.css';
import type { Icon } from '@phosphor-icons/react';
import type { DynamicIconComponent } from '@typing/svg';

export interface ButtonIconProps {
  // Accepts any standard Phosphor Icon component
  Icon: Icon | DynamicIconComponent
  isActive?: boolean;
  isPending?: boolean // Could map to an animation state (like a spinner or light weight)
  adjust?: {
    flipX?: boolean;
    flipY?: boolean;
    rotate?: 90 | 180 | 270;
  };
}

export default function ButtonIcon({
  Icon,
  isActive,
  isPending = false,
  adjust = {}
}: ButtonIconProps) {
  const { flipX, flipY, rotate } = adjust

  const activeWeight = isPending ? "light" : isActive ? "duotone" : "regular";

  return (
    <Icon
      size={40} // Your standardized grid dimension
      weight={activeWeight}
      className={clsx(
        css.svg,
        flipY && css.flipY,
        flipX && css.flipX,
        rotate === 90 && css.rotate90,
        rotate === 180 && css.rotate180,
        rotate === 270 && css.rotate270
      )}
    />
  )
}