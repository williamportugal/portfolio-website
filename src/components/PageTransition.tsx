'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from '@/context/TransitionContext';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { isExiting } = useTransition();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Reset on pathname change
    if (prevPathname.current !== pathname) {
      setShouldAnimate(false);
      prevPathname.current = pathname;
      hasInitialized.current = false;
    }

    // Use double RAF to ensure DOM is painted before animating
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        if (!hasInitialized.current) {
          setShouldAnimate(true);
          hasInitialized.current = true;
        }
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => cancelAnimationFrame(raf1);
  }, [pathname]);

  const animationClass = isExiting
    ? styles.slideDown
    : shouldAnimate
      ? styles.slideUp
      : '';

  return (
    <div className={`${styles.pageTransition} ${animationClass}`}>
      {children}
    </div>
  );
}
