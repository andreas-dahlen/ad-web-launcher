// useSnapInput.ts
interface SnapInput {
  value: number
  min: number
  max: number
  step: number
  enabled?: boolean // Made optional with default true safety
  onChange: (value: number) => void
}
export function useSnapInput({
  value,
  min,
  max,
  step,
  enabled = true,
  onChange
}: SnapInput) {
  const canIncrement = enabled && value < max;
  const canDecrement = enabled && value > min;

  const increment = () => {
    if (canIncrement) onChange(Math.min(max, value + step));
  };

  const decrement = () => {
    if (canDecrement) onChange(Math.max(min, value - step));
  };

  return { canIncrement, canDecrement, increment, decrement };
}
