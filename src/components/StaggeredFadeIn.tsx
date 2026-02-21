'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from '@/context/TransitionContext';
import styles from './StaggeredFadeIn.module.css';

interface StaggeredFadeInProps {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
  staggerDelay?: number;
}

export default function StaggeredFadeIn({
  children,
  index,
  baseDelay = 50,
  staggerDelay = 200,
}: StaggeredFadeInProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { isExiting } = useTransition();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset on pathname change
    if (prevPathname.current !== pathname) {
      setShouldAnimate(false);
      prevPathname.current = pathname;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Use double RAF + delay for smooth staggered entrance
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const delay = baseDelay + (index * staggerDelay);
        timerRef.current = setTimeout(() => {
          setShouldAnimate(true);
        }, delay);
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname, index, baseDelay, staggerDelay]);

  const animationClass = isExiting
    ? styles.slideDown
    : shouldAnimate
      ? styles.slideUp
      : '';

  return (
    <div className={`${styles.staggeredItem} ${animationClass}`}>
      {children}
    </div>
  );
}
