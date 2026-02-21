'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Header.module.css';
import TransitionLink from './TransitionLink';

interface NavLink {
  href: string;
  label: string;
}

const mainNavLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
];

export default function Header() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [overWhite, setOverWhite] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const checkBackground = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;

    const headerRect = header.getBoundingClientRect();
    const headerMidY = headerRect.top + headerRect.height / 2;

    // Find all white section panels
    const whiteSections = document.querySelectorAll('[data-white-section]');
    let isOverWhite = false;

    whiteSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (headerMidY >= rect.top && headerMidY <= rect.bottom) {
        isOverWhite = true;
      }
    });

    setOverWhite(isOverWhite);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      }

      setLastScrollY(currentScrollY);
      checkBackground();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    checkBackground();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, checkBackground]);

  // Re-check on pathname change
  useEffect(() => {
    // Small delay to let the page render
    const timer = setTimeout(checkBackground, 100);
    return () => clearTimeout(timer);
  }, [pathname, checkBackground]);

  const pillClass = `${styles.pillNav} ${!isNavVisible ? styles.pillNavHidden : ''} ${!overWhite ? styles.pillNavLight : ''}`;
  const contactClass = `${styles.contactButton} ${!overWhite ? styles.contactButtonLight : ''}`;

  return (
    <header ref={headerRef} className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          {/* Centered Pill Navigation */}
          <div className={pillClass}>
            {mainNavLinks.map((link) => (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''} ${!overWhite ? styles.navLinkLight : ''}`}
              >
                {link.label}
              </TransitionLink>
            ))}
          </div>

          {/* Contact Button - Always visible */}
          <TransitionLink href="/contact" className={contactClass}>
            Contact Me
          </TransitionLink>
        </div>
      </nav>
    </header>
  );
}
