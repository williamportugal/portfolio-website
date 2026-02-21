'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from '@/context/TransitionContext';
import styles from './HomeBackground.module.css';

interface HomeBackgroundProps {
  variant: 'mobile' | 'desktop';
}

export default function HomeBackground({ variant }: HomeBackgroundProps) {
  const { isExiting } = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setIsVisible(false);
      prevPathname.current = pathname;
    }

    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, [pathname]);

  const backgroundClass = variant === 'mobile'
    ? styles.mobileBackground
    : styles.desktopBackground;

  const animationClass = isExiting
    ? styles.fadeToWhite
    : isVisible
      ? styles.fadeFromWhite
      : '';

  return (
    <div className={`${backgroundClass} ${animationClass}`}>
      <div className={styles.gradientTop} />
      <div className={styles.gradientBottom} />
      <div className={styles.grain} />
    </div>
  );
}
