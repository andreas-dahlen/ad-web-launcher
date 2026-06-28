import clsx from 'clsx';
import css from './Button.module.css';
import type { Icon } from '@phosphor-icons/react';
import type { DynamicIconComponent } from '@typing/svg';

interface ButtonIconProps {
  // Accepts any standard Phosphor Icon component
  Icon: Icon | DynamicIconComponent
  isActive?: boolean;
  isPending?: boolean // Could map to an animation state (like a spinner or light weight)

  flipX?: boolean
  flipY?: boolean
}

export default function ButtonIcon({
  Icon,
  isActive,
  isPending = false,
  flipX = false,
  flipY = false
}: ButtonIconProps) {

  const activeWeight = isPending ? "light" : isActive ? "duotone" : "regular";

  return (
    <Icon
      size={40} // Your standardized grid dimension
      weight={activeWeight} // Automatically leverages Phosphor's strength!
      mirrored={flipX}
      className={clsx(
        css.svg,
        isActive === undefined && css.default,
        isActive ? css.dark : css.bright,

        flipY && css.flipY
      )}
    />
  )
}