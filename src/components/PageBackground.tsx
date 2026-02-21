'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from '@/context/TransitionContext';
import styles from './PageBackground.module.css';

interface PageBackgroundProps {
  variant: 'mobile' | 'desktop';
}

export default function PageBackground({ variant }: PageBackgroundProps) {
  const { isExiting } = useTransition();
  const [shouldAnimate, setShouldAnimate] = useState(false);
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

    // Use double RAF for smooth entrance
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

  const backgroundClass = variant === 'mobile'
    ? styles.mobileBackground
    : styles.desktopBackground;

  const animationClass = isExiting
    ? styles.fadeToWhite
    : shouldAnimate
      ? styles.fadeFromWhite
      : '';

  return (
    <div className={`${backgroundClass} ${animationClass}`} />
  );
}
