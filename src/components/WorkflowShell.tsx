'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './WorkflowShell.module.css';

/* ─── Data types ─── */

interface ToolItem {
  logo: string;
  alt: string;
  name: string;
  description: string;
}

interface WorkflowStep {
  number: number;
  title: string;
  goal: string;
  items: ToolItem[];
}

/* ─── Step data ─── */

const STEPS: WorkflowStep[] = [
  {
    number: 1,
    title: 'Problem Discovery & Roadmap Planning',
    goal: 'Identify high-impact problems worth solving.',
    items: [
      {
        logo: '/logos/notion.png',
        alt: 'Notion',
        name: 'Notion',
        description: 'Synthesize research, competitive insights, and early thinking before formalizing plans',
      },
      {
        logo: '/logos/confluence.png',
        alt: 'Confluence',
        name: 'Confluence',
        description: 'Formalize problem statements, requirements, assumptions, and decision rationale',
      },
      {
        logo: '/logos/figma.png',
        alt: 'Figma',
        name: 'Figma',
        description: 'Translate strategy into a clear, visual roadmap that communicates scope and priorities to stakeholders.',
      },
      {
        logo: '/logos/jira.png',
        alt: 'Jira',
        name: 'Jira',
        description: 'Break our projects it into epics and planning sprints so high-level strategy is directly connected to our roadmap.',
      },
    ],
  },
  {
    number: 2,
    title: 'AI Agent Design, Prototyping & Validation',
    goal: 'Design the solution, validate feasibility, and de-risk ideas before full build.',
    items: [
      {
        logo: '/logos/figma.png',
        alt: 'Figma',
        name: 'Figma',
        description: 'Design agent flows and decision logic, mapping how the agent interprets inputs, makes decisions, and interacts with users or systems.',
      },
      {
        logo: '/logos/claude.png',
        alt: 'Claude',
        name: 'Claude',
        description: 'Build prototype agents using Claude Code to accelerate experimentation and iteration.',
      },
      {
        logo: '/logos/Python-Emblem.png',
        alt: 'Python',
        name: 'Python',
        description: 'Using VS Code, I manually edit POCs to improve agent outputs, write tests, and match intended scope.',
      },
      {
        logo: '/logos/notion.png',
        alt: 'Notion',
        name: 'Notion',
        description: 'Throughout development, I document development progress, decisions made, and key outcomes.',
      },
    ],
  },
  {
    number: 3,
    title: 'Agent Specification, Build Support & Delivery',
    goal: 'Enable engineers to implement reliable, production-ready agents.',
    items: [
      {
        logo: '/logos/confluence.png',
        alt: 'Confluence',
        name: 'Confluence',
        description: 'Finalize documentation of agent behavior, decision trees, and data flow to create implementation-ready specs.',
      },
      {
        logo: '/logos/jira.png',
        alt: 'Jira',
        name: 'Jira',
        description: 'Manage agent development by planning sprints, tracking progress, and ensuring delivery stays aligned with goals.',
      },
      {
        logo: '/logos/github.png',
        alt: 'GitHub',
        name: 'GitHub',
        description: 'Track implementation and development by staying up to date on repository updates and reviewing code.',
      },
    ],
  },
];

/* ─── Main component ─── */

interface WorkflowShellProps {
  activeStep?: number; // 0-indexed, driven by parent scroll progress
}

export default function WorkflowShell({ activeStep = 0 }: WorkflowShellProps) {
  // visibleStep: what's actually rendered (lags behind activeStep during exit anim)
  const [visibleStep, setVisibleStep] = useState(activeStep);
  const [phase, setPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const nextStepRef = useRef(activeStep);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeStep === visibleStep && phase === 'idle') return;
    if (activeStep === nextStepRef.current && phase !== 'idle') return;

    const isReverse = activeStep < nextStepRef.current;
    nextStepRef.current = activeStep;

    // Clear any in-flight timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setDirection(isReverse ? 'reverse' : 'forward');

    // Start exit animation on the current step
    setPhase('exiting');

    // After exit completes, swap content and enter
    timerRef.current = setTimeout(() => {
      setVisibleStep(activeStep);
      setPhase('entering');

      // After enter completes, go idle
      timerRef.current = setTimeout(() => {
        setPhase('idle');
      }, 500);
    }, 350);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const step = STEPS[visibleStep] ?? STEPS[0];

  const exitClass  = direction === 'reverse' ? styles.stepExitReverse  : styles.stepExit;
  const enterClass = direction === 'reverse' ? styles.stepEnterReverse : styles.stepEnter;

  const contentClass = [
    styles.stepContent,
    phase === 'exiting' ? exitClass : '',
    phase === 'entering' ? enterClass : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.card}>

      {/* Animated step content */}
      <div className={contentClass}>

        {/* Step header */}
        <div className={styles.stepHeader}>
          <div className={styles.stepBadge}>{step.number}</div>
          <div className={styles.stepHeaderText}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepGoal}>
              <span className={styles.goalLabel}>Goal:</span> {step.goal}
            </p>
          </div>
        </div>

        <div className={styles.headerDivider} />

        {/* Tool rows */}
        <div className={styles.gridBody}>

          {step.items.map((item, i) => (
            <div key={item.alt}>
              <div className={styles.gridRow}>
                <div className={styles.gridCellLogo}>
                  <Image
                    src={item.logo}
                    alt={item.alt}
                    width={200}
                    height={200}
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.gridCellDescription}>
                  <p className={styles.descriptionText}>{item.description}</p>
                </div>
              </div>
              {i < step.items.length - 1 && <div className={styles.gridDivider} />}
            </div>
          ))}
        </div>

      </div>
      {/* end stepContent */}

    </div>
  );
}
