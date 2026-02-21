import Link from 'next/link';
import styles from './Module.module.css';

interface ModuleProps {
  title: string;
  variant?: 'light' | 'dark';
  href?: string;
  children?: React.ReactNode;
}

export default function Module({ title, variant = 'light', href, children }: ModuleProps) {
  const moduleClass = variant === 'dark'
    ? `${styles.module} ${styles.moduleDark}`
    : styles.module;

  const buttonClass = variant === 'dark'
    ? `${styles.learnMoreButton} ${styles.learnMoreButtonDark}`
    : styles.learnMoreButton;

  return (
    <div className={moduleClass}>
      <h3 className={styles.moduleTitle}>{title}</h3>
      <div className={styles.moduleContent}>
        {children}
      </div>
      <div className={styles.moduleFooter}>
        {href ? (
          <Link href={href} className={buttonClass}>
            Learn more
          </Link>
        ) : (
          <button className={buttonClass}>
            Learn more
          </button>
        )}
      </div>
    </div>
  );
}
