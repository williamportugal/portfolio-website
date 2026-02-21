'use client';

import { useTransition } from '@/context/TransitionContext';

interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function TransitionLink({ href, children, className, onClick }: TransitionLinkProps) {
  const { navigateTo } = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigateTo(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
