'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import Module from './Module';
import styles from './ModuleCarousel.module.css';

interface CompanySection {
  company: string;
  preposition?: 'at' | 'for';
  bullets: string[];
}

interface ModuleData {
  id: number;
  title: string;
  sections: CompanySection[];
}

const modules: ModuleData[] = [
  {
    id: 1,
    title: "AI Product Development",
    sections: [
      {
        company: "My Senior Project",
        preposition: 'for',
        bullets: [
          "Built a conversational chat interface and interactive assignment dashboard to streamline how students access and interact with their course information.",
          "Developed a RAG-powered AI assistant that ingests course content into a vector database, enabling students to ask natural language questions and receive context-aware answers.",
          
        ],
      },{
        company: "Trust & Will",
        preposition: 'at',
        bullets: [
          "Designed end-to-end agentic behavior for future AI features by mapping decision-making logic and data flow.",
        ],
      },
      
    ],
  },
  {
    id: 2,
    title: "Product Management",
    sections: [
      {
        company: "Trust & Will",
        preposition: 'at',
        bullets: [
          "Built my team's Jira project and Confluence space to establish our internal organization and facilitate cross-functional communication.",
          "Translated high-level product concepts into detailed technical requirements for future AI-powered tools.",
          "Authored detailed product requirement documents (PRDs) outlining feature scope, user flows, system behavior, and success metrics.",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Software Engineering",
    sections: [
      {
        company: "the Sustainable Land Initiative",
        preposition: 'for',
        bullets: [
          "Developed and maintained front-end features using HTML, CSS, and JavaScript to improve usability, performance, and overall user experience",
          "Built key features like the frontend reservation interface and backend equipment logic, allowing the site to begin accepting equipment reservations.",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "POC Development",
    sections: [
      {
        company: "Trust & Will",
        preposition: 'at',
        bullets: [
          "Built python-based proofs of concept for multiple AI agents, comparing implementation methods for accuracy, detail, and performance to provide engineers with clear strategies for implementation.",
          "Used Claude Code to rapidly prototype PoC features, reducing time from idea to functional demo"
        ],
      },
    ],
  },
  {
    id: 3,
    title: "User Research",
    sections: [
      {
        company: "Cal Poly LAES",
        preposition: 'for',
        bullets: [
          "Designed and conducted usability tests for the LAES website, identifying friction points and opportunities to improve navigation, clarity, and overall user experience.",
          "Identified patterns in user needs and behaviors to inform more intuitive, user-centered product designs.",
        ],
      },
    ],
  },
];

export default function ModuleCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // Check if at start or end of scroll
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener('scroll', updateScrollState, { passive: true });
    // Initial check
    updateScrollState();
    return () => track.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.scrollWrapper}>
        <div className={`${styles.fadeLeft} ${atStart ? styles.fadeHidden : ''}`} />
        <div className={`${styles.fadeRight} ${atEnd ? styles.fadeHidden : ''}`} />
        <div
          ref={trackRef}
          className={styles.scrollTrack}
          role="region"
          aria-label="Module carousel"
          tabIndex={0}
        >
          {modules.map((mod) => (
            <div key={mod.id} className={styles.card}>
              <Module title={mod.title} variant="dark" href="/experience">
                {mod.sections.map((section, si) => (
                  <div key={si}>
                    <p className={styles.companyLabel}>
                      {section.preposition === 'for' ? 'For' : 'At'} <strong>{section.company}</strong>, I:
                    </p>
                    <ul>
                      {section.bullets.map((bullet, bi) => (
                        <li key={bi}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Module>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
