"use client";

import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";

type SpotlightProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Wraps a surface with the `.spotlight` hover glow from globals.css.
 *
 * Pointer position is written straight to CSS custom properties on the
 * element, so moving the mouse never re-renders React.
 */
export default function Spotlight<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: SpotlightProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <Tag ref={ref} onPointerMove={handlePointerMove} className={`spotlight ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
