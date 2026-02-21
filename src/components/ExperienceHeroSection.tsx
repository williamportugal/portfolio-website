'use client';

/**
 * ExperienceHeroSection
 *
 * Scrollytelling canvas for the My Experience page.
 * Container: 1600 vh  →  1500 vh of scroll range.
 * All progress values are normalised to this scroll range.
 *
 * ─── STATE 1 (launch — CSS-driven) ─────────────────────────────────────────
 *   • Title slides up + fades in
 *   • Description slides up + left-to-right clip-path reveal ("written" effect)
 *   • Bottom bar slides up from below the viewport
 *
 * ─── STATE 1 → 2 (scroll-driven, 0 → ~0.18) ────────────────────────────────
 *   • Bar expands upward (natural height → 100 vh)
 *   • Title + description fade in place (no movement)
 *   • Arrow fades out
 *   • "Internships" label shrinks + lightens; " 1/2" counter fades in
 *   • Left company header, right card, skills grid stagger up into State 2
 *
 * ─── STATE 2 (dwell, ~0.18 → ~0.21) ────────────────────────────────────────
 *   • Trust & Will internship details
 *
 * ─── STATE 2 → 3 (scroll-driven, ~0.21 → ~0.38) ────────────────────────────
 *   • T&W skills exit first (reverse order), then T&W header exits (slide up)
 *   • Right-card T&W text fades out (card stays)
 *   • Counter morphs "1/2" → "2/2"
 *   • Clavata header + right-card text + Clavata skills slide up one-by-one
 *   • "Projects" footer slides in from below
 *
 * ─── STATE 3 (dwell, ~0.38 → ~0.40) ────────────────────────────────────────
 *   • Clavata internship details
 *
 * ─── STATE 3 → 4 (scroll-driven, ~0.40 → ~0.63) ────────────────────────────
 *   • All S3 cards exit (slide up + fade)
 *   • Bar top row + S2/S3 card grid fade out
 *   • White bar slides up and off the top; "Projects" footer label morphs
 *   • Dark hero revealed; State 4 elements enter top-to-bottom
 *
 * ─── STATE 4 (dwell, ~0.63) ─────────────────────────────────────────────────
 *   • Senior project showcase on dark background
 *
 * ─── STATE 4 → 5 (scroll-driven, ~0.63 → ~0.82) ────────────────────────────
 *   • S4 left column exits in reverse order (skills → desc → title), slides up
 *   • S4 image scales to 90% (stacked-card effect, anchored top)
 *   • S5 image slides up on top of S4 image
 *   • S5 left column enters from below (title → desc → skills)
 *
 * ─── STATE 5 (dwell, ~0.82 → ~0.83) ─────────────────────────────────────────
 *   • Frontend Software Development project on dark background
 *
 * ─── STATE 5 → 6 (scroll-driven, ~0.83 → ~1.00) ────────────────────────────
 *   • S5 left column exits in reverse order (skills → desc → title), slides up
 *   • S4 image scales further to 81%; S5 image scales to 90% (stacked-card)
 *   • S6 image slides up on top of S5 image
 *   • S6 left column enters from below (title → desc → skills)
 *
 * ─── STATE 6 (resting, 1.00) ─────────────────────────────────────────────────
 *   • Usability Research and Testing project on dark background
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTransition } from '@/context/TransitionContext';
import HomeBackground from './HomeBackground';
import styles from './ExperienceHeroSection.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Experience data
// ─────────────────────────────────────────────────────────────────────────────

const trustAndWill = {
  logoSrc: '/images/trust-will-logo.png',
  logoAlt: 'Trust & Will',
  companyDescription: 'The leading digital estate planning platform in the U.S.',
  companyUrl: 'trustandwill.com',
  jobTitle: 'Product Management Intern',
  dateRange: 'Spring 2025 – Present',
  skills: ['Agent Architecture Design', 'POC Development', 'Product Roadmapping', 'Workflow Automation'],
  sections: [
    {
      title: 'Product Management',
      bullets: [
        <>Built our team&apos;s Jira project and Confluence space from the ground up, establishing our <strong>internal organization</strong> and allowing for <strong>cross-functional communication</strong>.</>,
        <>Translated high-level product concepts into detailed <strong>technical requirements</strong>, <strong>roadmaps</strong>, and <strong>logic flows</strong> while collaborating closely with product and engineering teams.</>,
      ],
    },
    {
      title: 'AI Product Development',
      bullets: [
        <>Designed <strong>end-to-end agentic behavior</strong> for future AI features by mapping decision-making logic, user interactions, and data flow.</>,
        <>Built Python-based proofs of concept for multiple AI agents, comparing implementation methods for accuracy, detail, and performance to provide engineers with clear strategies for implementation.</>,
      ],
    },
  ],
};

const clavata = {
  logoSrc: '/images/clavata.png',
  logoAlt: 'Clavata',
  companyDescription: 'AI-powered content moderation platform.',
  companyUrl: 'clavata.ai',
  jobTitle: 'Product Management Intern',
  dateRange: 'Summer 2024',
  skills: ['Competitive Analysis', 'Product Strategy', 'Technical Communication', 'Product Marketing'],
  sections: [
    {
      title: 'Product Strategy Research',
      bullets: [
        <>Conducted <strong>market research</strong> and generated <strong>technical insights</strong> across targeted technology companies to inform Clavata&apos;s product direction.</>,
        <>Analyzed content safety practices and use of AI technologies, preparing detailed <strong>presentations of findings</strong> for internal stakeholders.</>,
        <>Collaborated with <strong>product management</strong> and <strong>marketing</strong> throughout the project and presented final findings to the executive team.</>,
      ],
    },
  ],
};

// TODO: Update seniorProject with your actual project details.
const seniorProject = {
  imageSrc: '/cards/seniorProject.png',
  imageAlt: 'Senior Project',
  bullets: [
    <>Built a <strong>conversational AI chat interface</strong> and interactive assignment dashboard to streamline how students access and interact with their course information.</>,
    <>Integrated the <strong>Canvas LMS REST API</strong> to automatically ingest course content (syllabi, assignments, PDFs, announcements) into a vector database, enabling students to ask natural language questions and receive cited, context-aware answers powered by Claude</>,
    <>Designed a <strong>responsive, multi-platform interface</strong> that adapts its navigation patterns and layout to each device.</>,

  ],
  skills: ['AI Engineering', 'API Integration', 'Vector Database Design', 'UI/UX Design'],
};

// TODO: Update frontendDev with your actual project details.
const frontendDev = {
  imageSrc: '/cards/frontendDev.png',
  imageAlt: 'Frontend Development Project',
  bullets: [
    <>Contributed to the development of <strong>SutainableLandInitiative.org</strong>, a nonprofit platform focused on connecting farmers in the San Luis Obispo area with resources and support.</>,
    <>Focused on preparing the site to begin accepting equipment reservations by owning the development of key features including the <strong>equipment selection</strong> and <strong>reservation creation</strong> interfaces.</>,
    <>Emphasized responsive design and smooth user interactions to support a seamless experience from login to reservation.</>,
  ],
  skills: ['React / Next.js', 'Agile Methodology', 'UI/UX Design', 'Database Integration'],
};

// TODO: Update usabilityResearch with your actual project details.
const usabilityResearch = {
  imageSrc: '/cards/laes.png',
  imageAlt: 'Usability Research and Testing',
  bullets: [
    <>Designed and conducted a <strong>comprehensive usability study</strong> for Cal Poly's Liberal Arts Engineering Studies (LAES) website to enhance functionality and user experience.</>,
    <>Analyzed findings to develop <strong>actionable recommendations</strong> that improved site navigation, functionality, and content clarity, ensuring a more intuitive experience for prospective and current students</>,
  ],
  skills: ['User Research', 'Usability Testing', 'UX Analysis', 'Data Synthesis'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Scroll animation utilities (module-level — no closure captures)
// ─────────────────────────────────────────────────────────────────────────────

const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
const clamp   = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rp      = (p: number, s: number, e: number)   => clamp((p - s) / (e - s), 0, 1);
const lerp    = (a: number, b: number, t: number)   => a + (b - a) * t;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface ExperienceHeroSectionProps {
  variant: 'mobile' | 'desktop';
}

export default function ExperienceHeroSection({ variant }: ExperienceHeroSectionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { isExiting } = useTransition();
  const pathname     = usePathname();
  const prevPathname = useRef(pathname);

  // Flags & measurements
  const launchCompleteRef   = useRef(false);
  const naturalBarHeightRef = useRef(0);
  const counterChangedToS3  = useRef(false);   // tracks "1/2" → "2/2" swap

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const containerRef   = useRef<HTMLDivElement>(null);
  const titleRef       = useRef<HTMLHeadingElement>(null);
  const descRef        = useRef<HTMLParagraphElement>(null);
  const bottomBarRef   = useRef<HTMLDivElement>(null);
  const barTopRowRef   = useRef<HTMLDivElement>(null);
  const barLabelRef    = useRef<HTMLSpanElement>(null);
  const counterRef     = useRef<HTMLSpanElement>(null);
  const arrowRef       = useRef<HTMLDivElement>(null);
  const barState2Ref   = useRef<HTMLDivElement>(null);

  // State 2 left-column cards (T&W)
  const leftHeaderRef  = useRef<HTMLDivElement>(null);
  const leftSkillsRef  = useRef<HTMLDivElement>(null);

  // State 3 left-column cards (Clavata) — overlay inside the same card slots
  const leftHeaderS3Ref = useRef<HTMLDivElement>(null);
  const leftSkillsS3Ref = useRef<HTMLDivElement>(null);

  // Right card container + its two content wrappers
  const rightCardRef          = useRef<HTMLDivElement>(null);
  const rightCardS2ContentRef = useRef<HTMLDivElement>(null);
  const rightCardS3ContentRef = useRef<HTMLDivElement>(null);

  // Projects footer (direct child of bottomBar, independent of barState2Content)
  const projectsFooterRef = useRef<HTMLDivElement>(null);
  const projectsLabelRef  = useRef<HTMLSpanElement>(null);
  const footerArrowRef    = useRef<HTMLDivElement>(null);

  // State 4 elements (on dark background, outside the bar)
  const s4LabelRef  = useRef<HTMLDivElement>(null);
  const s4TitleRef  = useRef<HTMLHeadingElement>(null);
  const s4DescRef   = useRef<HTMLDivElement>(null);
  const s4RightRef  = useRef<HTMLDivElement>(null);
  const s4SkillsRef = useRef<HTMLDivElement>(null);

  // State 4 image wrapper (for scale animation during S4→5 and S5→6)
  const s4ImageRef  = useRef<HTMLDivElement>(null);

  // State 5 elements
  const s5ImageRef  = useRef<HTMLDivElement>(null);
  const s5TitleRef  = useRef<HTMLHeadingElement>(null);
  const s5DescRef   = useRef<HTMLDivElement>(null);
  const s5SkillsRef = useRef<HTMLDivElement>(null);

  // State 6 elements
  const s6ImageRef  = useRef<HTMLDivElement>(null);
  const s6TitleRef  = useRef<HTMLHeadingElement>(null);
  const s6DescRef   = useRef<HTMLDivElement>(null);
  const s6SkillsRef = useRef<HTMLDivElement>(null);

  // ── Launch animation trigger ──────────────────────────────────────────────
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setShouldAnimate(false);
      launchCompleteRef.current  = false;
      counterChangedToS3.current = false;
      prevPathname.current = pathname;
    }

    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setTimeout(() => setShouldAnimate(true), 50);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  // ── CSS → JS handoff ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!shouldAnimate) return;

    const timer = setTimeout(() => {
      const title = titleRef.current;
      const desc  = descRef.current;
      const bar   = bottomBarRef.current;
      const row   = barTopRowRef.current;

      if (title) {
        title.style.animation = 'none';
        title.style.opacity   = '1';
        title.style.transform = 'none';
      }

      if (desc) {
        desc.style.animation = 'none';
        desc.style.opacity   = '1';
        desc.style.transform = 'none';
        desc.style.clipPath  = 'none';
      }

      if (bar && row) {
        const h = row.getBoundingClientRect().height;
        naturalBarHeightRef.current = h;
        bar.style.animation = 'none';
        bar.style.transform = 'none';
        bar.style.height    = `${h}px`;
      }

      launchCompleteRef.current = true;
    }, 1350);

    return () => clearTimeout(timer);
  }, [shouldAnimate]);

  // ── JS-driven exit ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExiting || !launchCompleteRef.current) return;

    const title = titleRef.current;
    const desc  = descRef.current;
    const bar   = bottomBarRef.current;

    if (title) { title.style.transition = 'opacity 0.35s ease'; title.style.opacity = '0'; }
    if (desc)  { desc.style.transition  = 'opacity 0.35s ease'; desc.style.opacity  = '0'; }
    if (bar)   { bar.style.transition   = 'transform 0.35s ease'; bar.style.transform = 'translateY(100%)'; }
  }, [isExiting]);

  // ── Bar click — scroll to State 2 (bar fully expanded) ──────────────────
  const handleBarClick = useCallback(() => {
    if (!containerRef.current) return;
    const { top, height } = containerRef.current.getBoundingClientRect();
    const containerTop = top + window.scrollY;
    const scrollRange  = height - window.innerHeight;
    const target = containerTop + 0.093 * scrollRange;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // ── Projects footer click — scroll to State 4 (project content visible) ──
  const handleProjectsFooterClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // prevent bar's handleBarClick from firing
    if (!containerRef.current) return;
    const { top, height } = containerRef.current.getBoundingClientRect();
    const containerTop = top + window.scrollY;
    const scrollRange  = height - window.innerHeight;
    // State 4 fully visible at progress=0.627
    const target = containerTop + 0.627 * scrollRange;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // ── Scroll-driven animation (desktop only) ────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!launchCompleteRef.current || !containerRef.current) return;

    const vh = window.innerHeight;
    const { top, height } = containerRef.current.getBoundingClientRect();
    const scrollRange = height - vh;
    const progress    = clamp(-top / scrollRange, 0, 1);

    const bar           = bottomBarRef.current;
    const barLabel      = barLabelRef.current;
    const counter       = counterRef.current;
    const arrow         = arrowRef.current;
    const title         = titleRef.current;
    const desc          = descRef.current;
    const s2            = barState2Ref.current;
    const lHeader       = leftHeaderRef.current;
    const lHeaderS3     = leftHeaderS3Ref.current;
    const rCard         = rightCardRef.current;
    const rCardS2       = rightCardS2ContentRef.current;
    const rCardS3       = rightCardS3ContentRef.current;
    const lSkills       = leftSkillsRef.current;
    const lSkillsS3     = leftSkillsS3Ref.current;
    const footer        = projectsFooterRef.current;
    const projLabel     = projectsLabelRef.current;
    const footerArrow   = footerArrowRef.current;
    const barTopRow     = barTopRowRef.current;
    const s4Label       = s4LabelRef.current;
    const s4Title       = s4TitleRef.current;
    const s4Desc        = s4DescRef.current;
    const s4Right       = s4RightRef.current;
    const s4Skills      = s4SkillsRef.current;
    const s4Image       = s4ImageRef.current;
    const s5Image       = s5ImageRef.current;
    const s5Title       = s5TitleRef.current;
    const s5Desc        = s5DescRef.current;
    const s5Skills      = s5SkillsRef.current;
    const s6Image       = s6ImageRef.current;
    const s6Title       = s6TitleRef.current;
    const s6Desc        = s6DescRef.current;
    const s6Skills      = s6SkillsRef.current;

    if (!bar || !barLabel || !counter || !arrow || !title || !desc || !s2 ||
        !lHeader || !lHeaderS3 || !rCard || !rCardS2 || !rCardS3 ||
        !lSkills || !lSkillsS3 || !barTopRow) return;

    const barH = naturalBarHeightRef.current;

    // ─────────────────────────────────────────────────────────────────────────
    // STATE 1 → 2
    // Container: 1600 vh → 1500 vh of scroll range.
    // All values rescaled from the 1250 vh range (×5/6).
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Bar expands upward; top corners flatten as bar fills the viewport (0 → 0.093)
    const barP = easeOut(rp(progress, 0, 0.093));
    bar.style.height = `${lerp(barH, vh, barP)}px`;
    const br = lerp(20, 0, barP);
    bar.style.borderRadius = `${br}px ${br}px 0 0`;

    // Show S2 content container once scroll begins
    if (progress > 0.01 && s2.style.display !== 'flex') {
      s2.style.display = 'flex';
    }

    // 2. Title fades in place (0 → 0.075)
    title.style.opacity = String(clamp(1 - rp(progress, 0, 0.075), 0, 1));

    // 3. Description fades in place (0 → 0.075)
    desc.style.opacity = String(clamp(1 - rp(progress, 0, 0.075), 0, 1));

    // 4. Arrow fades out (0 → 0.048)
    arrow.style.opacity = String(clamp(1 - rp(progress, 0, 0.048), 0, 1));

    // 5. "Internships" label morphs (0 → 0.093)
    //    font-size: 1.2rem → 0.75rem  |  weight: 700 → 400  |  color: #131313 → #9F9F9F
    const labelP = easeOut(rp(progress, 0, 0.093));
    barLabel.style.fontSize   = `${lerp(1.2, 1.0, labelP)}rem`;
    barLabel.style.fontWeight = labelP < 0.5 ? '700' : '400';
    const ch = Math.round(lerp(19, 159, labelP));
    barLabel.style.color = `rgb(${ch},${ch},${ch})`;

    // 6. Counter opacity — multi-phase across States 1→2→3
    //    S1→S2 fade-in: 0.075→0.112 | hold | S2→S3 fade-out: 0.246→0.256 | S2→S3 fade-in: 0.256→0.266
    let cOp: number;
    if      (progress < 0.075) cOp = 0;
    else if (progress < 0.112) cOp = easeOut(rp(progress, 0.075, 0.112));
    else if (progress < 0.246) cOp = 1;
    else if (progress < 0.256) cOp = 1 - rp(progress, 0.246, 0.256);
    else                       cOp = easeOut(rp(progress, 0.256, 0.266));
    counter.style.opacity = String(cOp);

    // Counter text swap "1/2" ↔ "2/2"
    if (progress >= 0.256 && !counterChangedToS3.current) {
      counter.textContent = '\xa02/2';
      counterChangedToS3.current = true;
    } else if (progress < 0.256 && counterChangedToS3.current) {
      counter.textContent = '\xa01/2';
      counterChangedToS3.current = false;
    }

    // 7. S2 content wrapper fades in (0.093 → 0.133)
    s2.style.opacity = String(easeOut(rp(progress, 0.093, 0.133)));

    // 8. Left company header S2 slides up (0.112 → 0.149)
    const lhP = easeOut(rp(progress, 0.112, 0.149));
    lHeader.style.opacity   = String(lhP);
    lHeader.style.transform = `translateY(${lerp(40, 0, lhP)}px)`;

    // 9. Right card container slides up (0.128 → 0.165)
    const rcP = easeOut(rp(progress, 0.128, 0.165));
    rCard.style.opacity   = String(rcP);
    rCard.style.transform = `translateY(${lerp(40, 0, rcP)}px)`;

    // 10. Skills S2 slides up (0.144 → 0.182)
    const skP = easeOut(rp(progress, 0.144, 0.182));
    lSkills.style.opacity   = String(skP);
    lSkills.style.transform = `translateY(${lerp(40, 0, skP)}px)`;

    // ─────────────────────────────────────────────────────────────────────────
    // STATE 2 → 3  (runs after S1→2 code so later writes win)
    // ─────────────────────────────────────────────────────────────────────────

    // 11. Skills S2 exit — reverse order (first to leave), 0.212 → 0.238
    //     Guard: only take over after S1→2 entry is complete (0.182)
    if (progress >= 0.182) {
      const s2SkExit = rp(progress, 0.212, 0.238);
      lSkills.style.opacity   = String(clamp(1 - s2SkExit, 0, 1));
      lSkills.style.transform = `translateY(${lerp(0, -40, s2SkExit)}px)`;
    }

    // 12. Right card S2 content fades out (0.212 → 0.244)
    rCardS2.style.opacity = String(clamp(1 - rp(progress, 0.212, 0.244), 0, 1));

    // 13. Header S2 exit (second to leave), 0.230 → 0.256
    //     Guard: only take over after S1→2 entry is complete (0.149)
    if (progress >= 0.149) {
      const s2LhExit = rp(progress, 0.230, 0.256);
      lHeader.style.opacity   = String(clamp(1 - s2LhExit, 0, 1));
      lHeader.style.transform = `translateY(${lerp(0, -40, s2LhExit)}px)`;
    }

    // 14. Left header S3 slides up into place (0.266 → 0.294)
    const s3LhP = easeOut(rp(progress, 0.266, 0.294));
    lHeaderS3.style.opacity   = String(s3LhP);
    lHeaderS3.style.transform = `translateY(${lerp(40, 0, s3LhP)}px)`;

    // 15. Right card S3 content fades in (0.284 → 0.312)
    rCardS3.style.opacity = String(easeOut(rp(progress, 0.284, 0.312)));

    // 16. Skills S3 slides up into place (0.298 → 0.326)
    const s3SkP = easeOut(rp(progress, 0.298, 0.326));
    lSkillsS3.style.opacity   = String(s3SkP);
    lSkillsS3.style.transform = `translateY(${lerp(40, 0, s3SkP)}px)`;

    // 17. Projects footer slides up from below (0.348 → 0.380)
    if (footer) {
      // Show the footer just before its animation window
      if (progress >= 0.340 && footer.style.display !== 'flex') {
        footer.style.display = 'flex';
      }
      const fP = easeOut(rp(progress, 0.348, 0.380));
      footer.style.opacity   = String(fP);
      footer.style.transform = `translateY(${lerp(100, 0, fP)}%)`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE 3 → 4  (runs last so writes always win for S3+ progress)
    // ─────────────────────────────────────────────────────────────────────────

    // 18. S3 cards exit — all slide up + fade (0.400 → 0.427)
    //     Guard rCard: entry complete at 0.165
    //     Guard lHeaderS3 / lSkillsS3: entries complete at 0.326
    if (progress >= 0.165) {
      const rcExitP = rp(progress, 0.400, 0.427);
      rCard.style.opacity   = String(clamp(1 - rcExitP, 0, 1));
      rCard.style.transform = `translateY(${lerp(0, -40, rcExitP)}px)`;
    }

    if (progress >= 0.326) {
      const s3LhExitP = rp(progress, 0.400, 0.427);
      lHeaderS3.style.opacity   = String(clamp(1 - s3LhExitP, 0, 1));
      lHeaderS3.style.transform = `translateY(${lerp(0, -40, s3LhExitP)}px)`;

      const s3SkExitP = rp(progress, 0.400, 0.427);
      lSkillsS3.style.opacity   = String(clamp(1 - s3SkExitP, 0, 1));
      lSkillsS3.style.transform = `translateY(${lerp(0, -40, s3SkExitP)}px)`;
    }

    // 19. Bar top row fades out (0.420 → 0.440)
    //     Naturally returns 1 for progress < 0.420, no guard needed
    barTopRow.style.opacity = String(clamp(1 - rp(progress, 0.420, 0.440), 0, 1));

    // 20. S2/S3 card grid fades out (0.420 → 0.440)
    //     Guard: after S1→2 content entry is complete (0.133)
    if (progress >= 0.133) {
      s2.style.opacity = String(clamp(1 - rp(progress, 0.420, 0.440), 0, 1));
    }

    // 21. Bar slides up off the top (0.427 → 0.487)
    //     translateY(0 → -100%); bar height = 100vh so -100% = off-screen above
    //     Bottom corners round 0 → 20px as the bar exits (reverse of entry)
    const barExitP = easeOut(rp(progress, 0.427, 0.487));
    bar.style.transform = `translateY(${lerp(0, -100, barExitP)}%)`;
    const brExit = lerp(0, 20, barExitP);
    bar.style.borderRadius = `0 0 ${brExit}px ${brExit}px`;

    // 22. Projects footer label morphs as bar exits (0.427 → 0.487)
    //     font-size: 1.2rem → 0.75rem  |  color: dark → grey
    if (projLabel) {
      const pmP = rp(progress, 0.427, 0.487);
      projLabel.style.fontSize = `${lerp(1.2, 1.0, pmP)}rem`;
      projLabel.style.fontWeight = pmP < 0.5 ? '700' : '400';
      const pc = Math.round(lerp(19, 159, pmP));
      projLabel.style.color = `rgb(${pc},${pc},${pc})`;
    }

    // 23. Footer arrow fades out (0.427 → 0.447)
    if (footerArrow) {
      footerArrow.style.opacity = String(clamp(1 - rp(progress, 0.427, 0.447), 0, 1));
    }

    // ── State 4 elements enter top-to-bottom (bar is off-screen by 0.487) ──

    // 24. "Projects" label fades in (0.487 → 0.513)
    if (s4Label) {
      s4Label.style.opacity = String(easeOut(rp(progress, 0.487, 0.513)));
    }

    // 25. S4 title slides up (0.507 → 0.547)
    if (s4Title) {
      const s4TitleP = easeOut(rp(progress, 0.507, 0.547));
      s4Title.style.opacity   = String(s4TitleP);
      s4Title.style.transform = `translateY(${lerp(40, 0, s4TitleP)}px)`;
    }

    // 26. S4 description clip-path reveal + opacity + slight translateY (0.533 → 0.587)
    if (s4Desc) {
      const s4DescP = easeOut(rp(progress, 0.533, 0.587));
      s4Desc.style.opacity   = String(s4DescP);
      s4Desc.style.clipPath  = `inset(0 ${lerp(100, 0, s4DescP)}% 0 0)`;
      s4Desc.style.transform = `translateY(${lerp(10, 0, s4DescP)}px)`;
    }

    // 27. S4 right column slides up (0.547 → 0.587)
    if (s4Right) {
      const s4RightP = easeOut(rp(progress, 0.547, 0.587));
      s4Right.style.opacity   = String(s4RightP);
      s4Right.style.transform = `translateY(${lerp(40, 0, s4RightP)}px)`;
    }

    // 28. S4 skills grid slides up (0.580 → 0.627)
    if (s4Skills) {
      const s4SkillsP = easeOut(rp(progress, 0.580, 0.627));
      s4Skills.style.opacity   = String(s4SkillsP);
      s4Skills.style.transform = `translateY(${lerp(40, 0, s4SkillsP)}px)`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE 4 → 5  (runs last; guards prevent interference with S4 entry)
    // ─────────────────────────────────────────────────────────────────────────

    // 29. S4 skills exit — first to leave (0.642 → 0.675)
    //     Guard: after S4 skills entry complete (0.627)
    if (s4Skills && progress >= 0.627) {
      const s4SkExitP = rp(progress, 0.642, 0.675);
      s4Skills.style.opacity   = String(clamp(1 - s4SkExitP, 0, 1));
      s4Skills.style.transform = `translateY(${lerp(0, -40, s4SkExitP)}px)`;
    }

    // 30. S4 description exit — second to leave (0.658 → 0.700)
    //     Guard: after S4 desc entry complete (0.587)
    //     clipPath forced 'none' — no clip-path exit, just opacity + slide
    if (s4Desc && progress >= 0.587) {
      const s4DescExitP = rp(progress, 0.658, 0.700);
      s4Desc.style.opacity   = String(clamp(1 - s4DescExitP, 0, 1));
      s4Desc.style.clipPath  = 'none';
      s4Desc.style.transform = `translateY(${lerp(0, -40, s4DescExitP)}px)`;
    }

    // 31. S4 title exit — last to leave (0.683 → 0.725)
    //     Guard: after S4 title entry complete (0.547)
    if (s4Title && progress >= 0.547) {
      const s4TitleExitP = rp(progress, 0.683, 0.725);
      s4Title.style.opacity   = String(clamp(1 - s4TitleExitP, 0, 1));
      s4Title.style.transform = `translateY(${lerp(0, -40, s4TitleExitP)}px)`;
    }

    // 32. S4 image scales down to 90% (0.642 → 0.725) — stacked-card effect
    //     Guard: after S4 right entry complete (0.587)
    //     transform-origin: top (set in CSS) keeps image top-anchored
    if (s4Image && progress >= 0.587) {
      const s4ImgScaleP = rp(progress, 0.642, 0.725);
      const scale = lerp(1, 0.9, s4ImgScaleP);
      s4Image.style.transform = `scale(${scale})`;
    }

    // 33. S5 image slides up from below (0.658 → 0.733)
    if (s5Image) {
      const s5ImgP = easeOut(rp(progress, 0.658, 0.733));
      s5Image.style.opacity   = String(s5ImgP);
      s5Image.style.transform = `translateY(${lerp(vh, 0, s5ImgP)}px)`;
    }

    // 34. S5 title slides up from below (0.725 → 0.775)
    if (s5Title) {
      const s5TitleP = easeOut(rp(progress, 0.725, 0.775));
      s5Title.style.opacity   = String(s5TitleP);
      s5Title.style.transform = `translateY(${lerp(vh, 0, s5TitleP)}px)`;
    }

    // 35. S5 description slides up from below (0.742 → 0.800)
    //     clipPath always 'none' — S5 uses translateY+opacity, not clip-path reveal
    if (s5Desc) {
      const s5DescP = easeOut(rp(progress, 0.742, 0.800));
      s5Desc.style.opacity   = String(s5DescP);
      s5Desc.style.clipPath  = 'none';
      s5Desc.style.transform = `translateY(${lerp(vh, 0, s5DescP)}px)`;
    }

    // 36. S5 skills grid slides up from below (0.767 → 0.817)
    if (s5Skills) {
      const s5SkillsP = easeOut(rp(progress, 0.767, 0.817));
      s5Skills.style.opacity   = String(s5SkillsP);
      s5Skills.style.transform = `translateY(${lerp(vh, 0, s5SkillsP)}px)`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE 5 → 6  (runs last; guards prevent interference with S5 entry)
    // ─────────────────────────────────────────────────────────────────────────

    // 37. S5 skills exit — first to leave (0.833 → 0.867)
    //     Guard: after S5 skills entry complete (0.817)
    if (s5Skills && progress >= 0.817) {
      const s5SkExitP = rp(progress, 0.833, 0.867);
      s5Skills.style.opacity   = String(clamp(1 - s5SkExitP, 0, 1));
      s5Skills.style.transform = `translateY(${lerp(0, -40, s5SkExitP)}px)`;
    }

    // 38. S5 description exit — second to leave (0.850 → 0.900)
    //     Guard: after S5 desc entry complete (0.800)
    if (s5Desc && progress >= 0.800) {
      const s5DescExitP = rp(progress, 0.850, 0.900);
      s5Desc.style.opacity   = String(clamp(1 - s5DescExitP, 0, 1));
      s5Desc.style.clipPath  = 'none';
      s5Desc.style.transform = `translateY(${lerp(0, -40, s5DescExitP)}px)`;
    }

    // 39. S5 title exit — last to leave (0.883 → 0.933)
    //     Guard: after S5 title entry COMPLETE (0.775) — NOT entry start (0.725)
    //     Using entry-complete guard prevents exit code from flashing at opacity=1
    //     over the entry animation while the title is still animating in.
    if (s5Title && progress >= 0.775) {
      const s5TitleExitP = rp(progress, 0.883, 0.933);
      s5Title.style.opacity   = String(clamp(1 - s5TitleExitP, 0, 1));
      s5Title.style.transform = `translateY(${lerp(0, -40, s5TitleExitP)}px)`;
    }

    // 40. S4 image scales further to 81% (0.833 → 0.933) — stacked-card effect
    //     Guard: after S4 title exit complete / S4→5 scale complete (0.725)
    //     Runs AFTER step 32, so this block overrides 32's scale(0.9) output.
    //     At progress < 0.833, lerp(0.9, 0.81, 0) = 0.9 — no discontinuity.
    if (s4Image && progress >= 0.725) {
      const s4ImgScale2P = rp(progress, 0.833, 0.933);
      const scale = lerp(0.9, 0.81, s4ImgScale2P);
      s4Image.style.transform = `scale(${scale})`;
    }

    // 41. S5 image scales down to 90% (0.833 → 0.933) — stacked-card effect
    //     Guard: after S5 image entry complete (0.733)
    //     Runs AFTER step 33, so this block overrides 33's translateY output.
    //     At progress < 0.833, lerp(1, 0.9, 0) = 1 — no discontinuity with
    //     translateY(0) at the same visual position.
    if (s5Image && progress >= 0.733) {
      const s5ImgScaleP = rp(progress, 0.833, 0.933);
      const scale = lerp(1, 0.9, s5ImgScaleP);
      s5Image.style.transform = `scale(${scale})`;
    }

    // 42. S6 image slides up from below (0.850 → 0.933)
    if (s6Image) {
      const s6ImgP = easeOut(rp(progress, 0.850, 0.933));
      s6Image.style.opacity   = String(s6ImgP);
      s6Image.style.transform = `translateY(${lerp(vh, 0, s6ImgP)}px)`;
    }

    // 43. S6 title slides up from below (0.933 → 0.967)
    if (s6Title) {
      const s6TitleP = easeOut(rp(progress, 0.933, 0.967));
      s6Title.style.opacity   = String(s6TitleP);
      s6Title.style.transform = `translateY(${lerp(vh, 0, s6TitleP)}px)`;
    }

    // 44. S6 description slides up from below (0.950 → 0.993)
    //     clipPath always 'none' — S6 uses translateY+opacity, not clip-path reveal
    if (s6Desc) {
      const s6DescP = easeOut(rp(progress, 0.950, 0.993));
      s6Desc.style.opacity   = String(s6DescP);
      s6Desc.style.clipPath  = 'none';
      s6Desc.style.transform = `translateY(${lerp(vh, 0, s6DescP)}px)`;
    }

    // 45. S6 skills grid slides up from below (0.967 → 1.000)
    if (s6Skills) {
      const s6SkillsP = easeOut(rp(progress, 0.967, 1.000));
      s6Skills.style.opacity   = String(s6SkillsP);
      s6Skills.style.transform = `translateY(${lerp(vh, 0, s6SkillsP)}px)`;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, variant]);

  // ── CSS class helpers ─────────────────────────────────────────────────────
  const titleClass = [
    styles.title,
    shouldAnimate && !isExiting ? styles.titleEnter : '',
    isExiting && !launchCompleteRef.current ? styles.titleExit : '',
  ].filter(Boolean).join(' ');

  const descClass = [
    styles.description,
    shouldAnimate && !isExiting ? styles.descriptionEnter : '',
    isExiting && !launchCompleteRef.current ? styles.descriptionExit : '',
  ].filter(Boolean).join(' ');

  const barClass = [
    styles.bottomBar,
    shouldAnimate && !isExiting ? styles.bottomBarEnter : '',
    isExiting && !launchCompleteRef.current ? styles.bottomBarExit : '',
  ].filter(Boolean).join(' ');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={styles.stickyContainer}>

      <div className={
        variant === 'mobile' ? styles.stickyHeroMobile : styles.stickyHeroDesktop
      }>

        {/* Dark animated gradient background */}
        <HomeBackground variant={variant} />

        {/* ── Title + Description ────────────────────────────────────────── */}
        <div className={
          variant === 'mobile' ? styles.heroContentMobile : styles.heroContentDesktop
        }>
          <h1 ref={titleRef} className={titleClass}>
            My<br />Experience
          </h1>

          <p ref={descRef} className={descClass}>
            My work spans AI product development, agentic system design, and
            hands-on technical execution. I translate complex ideas into structured
            roadmaps, detailed requirements, and working proofs of concept that
            bridge product strategy and engineering implementation.
          </p>
        </div>

        {/* ── State 4 / 5 / 6 Content ──────────────────────────────────────────
            Positioned absolutely on the dark hero background, z-index:5 (below
            the white bar at z-index:10). All children start opacity:0 in CSS
            and are driven entirely by the scroll handler.
            overflow:hidden clips S4/S5/S6 elements that start off-screen below.
            Desktop only — hidden on mobile via CSS.                          */}
        <div className={styles.state4Content}>

          {/* "Projects" label at top-left */}
          <div ref={s4LabelRef} className={styles.s4Label}>Projects</div>

          {/* Two-column card layout: 1fr left / 1fr right */}
          <div className={styles.state4CardLayout}>

            {/* ── Left slot: S4 + S5 + S6 share the same grid cell ────────────
                s4LeftColumn is normal-flow and sizes the slot.
                s5LeftColumn and s6LeftColumn are position:absolute inset:0.
                S5/S6 elements start at translateY(vh) (JS) + opacity 0 (CSS).  */}
            <div className={styles.s45LeftSlot}>

              {/* S4 left content — normal flow */}
              <div className={styles.s4LeftColumn}>

                <h2 ref={s4TitleRef} className={styles.s4Title}>
                  1. Senior Project
                </h2>

                <div ref={s4DescRef} className={styles.s4Description}>
                  <ul className={styles.s4BulletList}>
                    {seniorProject.bullets.map((bullet, i) => (
                      <li key={i} className={styles.s4BulletItem}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                <div ref={s4SkillsRef} className={styles.s4SkillsGrid}>
                  {seniorProject.skills.map((skill) => (
                    <div key={skill} className={styles.s4SkillPill}>{skill}</div>
                  ))}
                </div>

              </div>
              {/* end s4LeftColumn */}

              {/* S5 left content — absolute overlay, starts below viewport */}
              <div className={styles.s5LeftColumn}>

                <h2 ref={s5TitleRef} className={styles.s4Title}>
                  2. Frontend Software Development
                </h2>

                <div ref={s5DescRef} className={styles.s4Description}>
                  <ul className={styles.s4BulletList}>
                    {frontendDev.bullets.map((bullet, i) => (
                      <li key={i} className={styles.s4BulletItem}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                <div ref={s5SkillsRef} className={styles.s4SkillsGrid}>
                  {frontendDev.skills.map((skill) => (
                    <div key={skill} className={styles.s4SkillPill}>{skill}</div>
                  ))}
                </div>

              </div>
              {/* end s5LeftColumn */}

              {/* S6 left content — absolute overlay, starts below viewport */}
              <div className={styles.s6LeftColumn}>

                <h2 ref={s6TitleRef} className={styles.s4Title}>
                  3. Usability Research and Testing
                </h2>

                <div ref={s6DescRef} className={styles.s4Description}>
                  <ul className={styles.s4BulletList}>
                    {usabilityResearch.bullets.map((bullet, i) => (
                      <li key={i} className={styles.s4BulletItem}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                <div ref={s6SkillsRef} className={styles.s4SkillsGrid}>
                  {usabilityResearch.skills.map((skill) => (
                    <div key={skill} className={styles.s4SkillPill}>{skill}</div>
                  ))}
                </div>

              </div>
              {/* end s6LeftColumn */}

            </div>
            {/* end s45LeftSlot */}

            {/* ── Right column: stacked project screenshots ─────────────────
                s4ImageWrapper: scales 100%→90% (S4→5), then 90%→81% (S5→6).
                s5ImageWrapper: slides up from translateY(vh)→0 (S4→5 entry),
                  then scales 100%→90% (S5→6). Both anchored top.
                s6ImageWrapper: slides up from translateY(vh)→0 (S5→6 entry),
                  lands on top of the stack with 30px margin from column top.  */}
            <div ref={s4RightRef} className={styles.s4RightColumn}>

              {/* S4 image wrapper — scales 90%→81% across S4→5 and S5→6 */}
              <div ref={s4ImageRef} className={styles.s4ImageWrapper}>
                <Image
                  src={seniorProject.imageSrc}
                  alt={seniorProject.imageAlt}
                  width={500}
                  height={400}
                  className={styles.s4ProjectImage}
                />
              </div>

              {/* S5 image wrapper — slides in from below, then scales to 90% */}
              <div ref={s5ImageRef} className={styles.s5ImageWrapper}>
                <Image
                  src={frontendDev.imageSrc}
                  alt={frontendDev.imageAlt}
                  width={500}
                  height={400}
                  className={styles.s4ProjectImage}
                />
              </div>

              {/* S6 image wrapper — slides in from below, 30px from column top */}
              <div ref={s6ImageRef} className={styles.s6ImageWrapper}>
                <Image
                  src={usabilityResearch.imageSrc}
                  alt={usabilityResearch.imageAlt}
                  width={500}
                  height={400}
                  className={styles.s4ProjectImage}
                />
              </div>

            </div>
            {/* end s4RightColumn */}

          </div>
          {/* end state4CardLayout */}

        </div>
        {/* end state4Content */}

        {/* ── Bottom bar ────────────────────────────────────────────────────
            Starts as a thin strip pinned to the viewport bottom.
            JS grows height: naturalBarHeight → 100 vh (becomes the white canvas).

            Internal layout (flex-column):
              • barTopRow         — always visible; label + arrow
              • barState2Content  — display:none until scroll begins
              • projectsFooter    — position:absolute at bar bottom; independent
                                    of barState2Content opacity               */}
        <div ref={bottomBarRef} className={barClass} onClick={handleBarClick}>

          {/* Top row: morphing "Internships" label + bouncing arrow */}
          <div ref={barTopRowRef} className={styles.barTopRow}>
            <span ref={barLabelRef} className={styles.barLabel}>
              Internships
              <span ref={counterRef} className={styles.barCounter}>&nbsp;1/2</span>
            </span>

            <div ref={arrowRef} className={styles.arrowWrapper} aria-hidden="true">
              <svg
                className={styles.arrow}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* ── State 2 / 3 content ─────────────────────────────────────────
              display:none until progress > 0.01, then flex.
              Entire wrapper stays opacity:1 once revealed — individual
              child elements manage their own visibility.                    */}
          <div ref={barState2Ref} className={styles.barState2Content}>
            <div className={styles.state2CardLayout}>

              {/* ── Left column ─────────────────────────────────────────────
                  Each card pair lives in a "slot" wrapper.
                  The S2 (T&W) card is normal-flow and sizes the slot.
                  The S3 (Clavata) card is position:absolute inside the slot,
                  so it perfectly overlays the S2 card during the swap.      */}
              <div className={styles.leftColumn}>

                {/* Header card slot */}
                <div className={styles.headerCardSlot}>

                  {/* S2 header — Trust & Will */}
                  <div ref={leftHeaderRef} className={styles.companyHeader}>
                    <Image
                      src={trustAndWill.logoSrc}
                      alt={trustAndWill.logoAlt}
                      width={220}
                      height={60}
                      className={styles.companyLogo}
                      priority
                    />
                    <p className={styles.companyDescText}>
                      {trustAndWill.companyDescription}
                    </p>
                    <p className={styles.companyLearnMore}>
                      Learn more at{' '}
                      <span className={styles.companyUrl}>{trustAndWill.companyUrl}</span>
                    </p>
                  </div>

                  {/* S3 header — Clavata (overlays S2 header, enters during S2→3) */}
                  <div ref={leftHeaderS3Ref} className={`${styles.companyHeader} ${styles.cardOverlay}`}>
                    <Image
                      src={clavata.logoSrc}
                      alt={clavata.logoAlt}
                      width={220}
                      height={60}
                      className={styles.companyLogo}
                    />
                    <p className={styles.companyDescText}>
                      {clavata.companyDescription}
                    </p>
                    <p className={styles.companyLearnMore}>
                      Learn more at{' '}
                      <span className={styles.companyUrl}>{clavata.companyUrl}</span>
                    </p>
                  </div>

                </div>
                {/* end headerCardSlot */}

                {/* Skills card slot */}
                <div className={styles.skillsCardSlot}>

                  {/* S2 skills — Trust & Will */}
                  <div ref={leftSkillsRef} className={styles.skillsSection}>
                    <span className={styles.skillsSectionLabel}>Key Skills Used</span>
                    <div className={styles.skillsGrid}>
                      {trustAndWill.skills.map((skill) => (
                        <div key={skill} className={styles.skillPill}>{skill}</div>
                      ))}
                    </div>
                  </div>

                  {/* S3 skills — Clavata (overlays S2 skills, enters during S2→3) */}
                  <div ref={leftSkillsS3Ref} className={`${styles.skillsSection} ${styles.cardOverlay}`}>
                    <span className={styles.skillsSectionLabel}>Key Skills Used</span>
                    <div className={styles.skillsGrid}>
                      {clavata.skills.map((skill) => (
                        <div key={skill} className={styles.skillPill}>{skill}</div>
                      ))}
                    </div>
                  </div>

                </div>
                {/* end skillsCardSlot */}

              </div>
              {/* end leftColumn */}

              {/* ── Right column (black card) ────────────────────────────────
                  The card container stays in place throughout States 2 and 3.
                  Two content wrappers overlay each other inside it:
                    • S2 content — opacity:1, fades out during S2→3
                    • S3 content — opacity:0, fades in  during S2→3            */}
              <div ref={rightCardRef} className={styles.rightColumn}>

                {/* S2 right content — Trust & Will */}
                <div ref={rightCardS2ContentRef} className={styles.rightCardContent}>
                  <h2 className={styles.jobTitle}>{trustAndWill.jobTitle}</h2>
                  <p  className={styles.dateRange}>{trustAndWill.dateRange}</p>

                  {trustAndWill.sections.map((section, i) => (
                    <div key={i} className={styles.jobSection}>
                      <h3 className={styles.jobSectionTitle}>{section.title}</h3>
                      <ul className={styles.bulletList}>
                        {section.bullets.map((bullet, j) => (
                          <li key={j} className={styles.bulletItem}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* S3 right content — Clavata (absolute overlay, initially opacity:0) */}
                <div ref={rightCardS3ContentRef} className={`${styles.rightCardContent} ${styles.rightCardContentOverlay}`}>
                  <h2 className={styles.jobTitle}>{clavata.jobTitle}</h2>
                  <p  className={styles.dateRange}>{clavata.dateRange}</p>

                  {clavata.sections.map((section, i) => (
                    <div key={i} className={styles.jobSection}>
                      <h3 className={styles.jobSectionTitle}>{section.title}</h3>
                      <ul className={styles.bulletList}>
                        {section.bullets.map((bullet, j) => (
                          <li key={j} className={styles.bulletItem}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

              </div>
              {/* end rightColumn */}

            </div>
            {/* end state2CardLayout */}

          </div>
          {/* end barState2Content */}

          {/* ── Projects footer ───────────────────────────────────────────────
              Direct child of bottomBar (NOT inside barState2Content).
              position:absolute at the bar's bottom — rides with the bar as
              it slides off the top during S3→4. This means fading
              barState2Content to opacity:0 does NOT affect this footer.

              display:none until progress ≥ 0.340, then flex.
              Slides in from below via translateY(100% → 0%) + opacity fade.  */}
          <div ref={projectsFooterRef} className={styles.projectsFooter} onClick={handleProjectsFooterClick}>
            <span ref={projectsLabelRef} className={styles.projectsLabel}>Projects</span>

            <div ref={footerArrowRef} className={styles.arrowWrapper} aria-hidden="true">
              <svg
                className={styles.arrow}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          {/* end projectsFooter */}

        </div>
        {/* end bottomBar */}

      </div>
      {/* end stickyHero */}

    </div>
    // end stickyContainer
  );
}
