'use client';

import styles from './SkillsGrid.module.css';

interface Skill {
  label: string;
}

const skills: Skill[] = [
  { label: 'API Integrations' },
  { label: 'Agentic Behavior Design' },
  { label: 'Workflow Automation' },
  { label: 'AI Output Evaluation' },
];

export default function SkillsGrid() {
  return (
    <div className={styles.grid}>
      {skills.map((skill) => (
        <div key={skill.label} className={styles.skillItem}>
          <span className={styles.skillLabel}>{skill.label}</span>
          <button className={styles.skillButton} aria-label={`Learn more about ${skill.label}`}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.arrowIcon}
            >
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
