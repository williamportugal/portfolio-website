'use client';

import Image from 'next/image';
import styles from './ExperienceCard.module.css';

interface ExperienceSection {
  title: string;
  bullets: React.ReactNode[];
}

interface ExperienceCardProps {
  logoSrc: string;
  logoAlt: string;
  companyDescription: string;
  companyUrl: string;
  jobTitle: string;
  dateRange: string;
  sections: ExperienceSection[];
}

export default function ExperienceCard({
  logoSrc,
  logoAlt,
  companyDescription,
  companyUrl,
  jobTitle,
  dateRange,
  sections,
}: ExperienceCardProps) {
  return (
    <div className={styles.wrapper}>
      {/* Back layer - header with logo and company info */}
      <div className={styles.backLayer}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={180}
              height={60}
              className={styles.logo}
            />
          </div>
          <p className={styles.companyInfo}>
            <span className={styles.companyDescription}>{companyDescription} </span>
            <span className={styles.companyUrl}>{companyUrl}</span>
          </p>
        </div>
      </div>
      {/* Front layer - job details */}
      <div className={styles.frontLayer}>
        <h2 className={styles.jobTitle}>{jobTitle}</h2>
        <p className={styles.dateRange}>{dateRange}</p>

        {sections.map((section, index) => (
          <div key={index} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <ul className={styles.bulletList}>
              {section.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex} className={styles.bulletItem}>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
