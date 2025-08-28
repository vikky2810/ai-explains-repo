/**
 * DOM manipulation utilities
 */

import { RefObject } from 'react';

/**
 * Smoothly scrolls to a referenced element
 */
export function smoothScrollToRef(ref: RefObject<HTMLElement | null>): void {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
