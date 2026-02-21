'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface TransitionContextType {
  isExiting: boolean;
  isEntering: boolean;
  navigateTo: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isExiting: false,
  isEntering: false,
  navigateTo: () => {},
});

export function useTransition() {
  return useContext(TransitionContext);
}

interface TransitionProviderProps {
  children: React.ReactNode;
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Handle entrance animation when pathname changes
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      // New page loaded, trigger entrance
      setIsEntering(true);
      prevPathname.current = pathname;

      // Mark entrance as complete after animation
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const navigateTo = useCallback((href: string) => {
    if (isExiting) return; // Prevent double navigation

    setIsExiting(true);

    // Wait for exit animation to complete before navigating
    // Exit animation is 0.35s (350ms), add small buffer
    setTimeout(() => {
      router.push(href);
      setIsExiting(false);
    }, 350);
  }, [router, isExiting]);

  return (
    <TransitionContext.Provider value={{ isExiting, isEntering, navigateTo }}>
      {children}
    </TransitionContext.Provider>
  );
}
