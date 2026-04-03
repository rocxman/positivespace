import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (classnames)', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });

    it('handles false conditions', () => {
      const isActive = false;
      expect(cn('base', isActive && 'active')).toBe('base');
    });

    it('merges tailwind classes correctly', () => {
      expect(cn('px-2 px-4')).toBe('px-4');
    });

    it('handles undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });
  });
});
