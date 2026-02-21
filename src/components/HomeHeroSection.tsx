'use client';

/**
 * HomeHeroSection
 *
 * Scrollytelling canvas for the Home page.
 * Mirrors the exact pattern used by AboutHeroSection and ExperienceHeroSection.
 *
 * Container total: 1000 vh  (100 vh viewport + 300 vh S1-2 + 600 vh S2-3).
 *
 * ─── STATE 1 (launch — CSS-driven) ─────────────────────────────────────────
 *   • "Hi! I'm" label + name + job title fade/slide in (bottom-left)
 *   • LinkedIn button fades in (right side)
 *   • Bottom bar slides up from below the viewport
 *
 * ─── STATE 1 → 2 (scroll-driven, phase1: 0 → 0.15) ──────────────────────────
 *   • Bar expands upward (natural height → 100 vh)
 *   • Title + LinkedIn fade out
 *   • Arrow fades out
 *   • "What I Do" label shrinks + lightens
 *   • Module carousel content slides in
 *
 * ─── STATE 2 (dwell, phase1: 0.15 → 0.70) ────────────────────────────────────
 *   • Module carousel visible
 *   • "My Workflow" footer slides in from below
 *
 * ─── STATE 2 → 3 (scroll-driven, phase2: 0.00 → 0.20) ───────────────────────
 *   • Workflow arrow fades out; label morphs small + grey
 *   • White bar slides up off the top
 *   • Workflow shell enters on dark background
 *
 * ─── STATE 3 (resting, phase2: 0.20 → 1.00) ──────────────────────────────────
 *   • WorkflowShell visible on dark background
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTransition } from '@/context/TransitionContext';
import HomeBackground from './HomeBackground';
import ModuleCarousel from './ModuleCarousel';
import WorkflowShell from './WorkflowShell';
import styles from './HomeHeroSection.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Scroll animation utilities (module-level — no closure captures)
// ─────────────────────────────────────────────────────────────────────────────

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp   = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rp      = (p: number, s: number, e: number)   => clamp((p - s) / (e - s), 0, 1);
const lerp    = (a: number, b: number, t: number)   => a + (b - a) * t;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface HomeHeroSectionProps {
  variant: 'mobile' | 'desktop';
}

export default function HomeHeroSection({ variant }: HomeHeroSectionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const activeStepRef = useRef(0);
  const { isExiting } = useTransition();
  const pathname     = usePathname();
  const prevPathname = useRef(pathname);

  // Flags & measurements
  const launchCompleteRef   = useRef(false);
  const naturalBarHeightRef = useRef(0);

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const containerRef  = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLDivElement>(null);
  const linkedinRef   = useRef<HTMLDivElement>(null);
  const bottomBarRef  = useRef<HTMLDivElement>(null);
  const barTopRowRef  = useRef<HTMLDivElement>(null);
  const barLabelRef   = useRef<HTMLSpanElement>(null);
  const arrowRef      = useRef<HTMLDivElement>(null);

  // Bar content area — display:none in CSS, revealed by JS on first scroll
  const barContentAreaRef  = useRef<HTMLDivElement>(null);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);

  // Workflow footer — slides in during State 2 dwell
  const workflowFooterRef = useRef<HTMLDivElement>(null);
  const workflowLabelRef  = useRef<HTMLSpanElement>(null);
  const workflowArrowRef  = useRef<HTMLDivElement>(null);

  // State 3 elements — WorkflowShell on dark background
  const s3LabelRef       = useRef<HTMLDivElement>(null);
  const s3WorkflowRef    = useRef<HTMLDivElement>(null);

  // ── Scroll-to-top on mount ────────────────────────────────────────────────
  // Prevents browser scroll restoration from triggering the scroll handler
  // right after launchCompleteRef becomes true at 1350ms.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── Launch animation trigger ──────────────────────────────────────────────
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setShouldAnimate(false);
      launchCompleteRef.current = false;
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
      const title   = titleRef.current;
      const bar     = bottomBarRef.current;
      const row     = barTopRowRef.current;
      const linkedin = linkedinRef.current;

      if (title) {
        title.style.animation = 'none';
        title.style.opacity   = '1';
        title.style.transform = 'none';
      }

      if (linkedin) {
        linkedin.style.animation = 'none';
        linkedin.style.opacity   = '1';
      }

      if (bar && row) {
        const h = row.getBoundingClientRect().height;
        naturalBarHeightRef.current = h;
        // Set height + transform BEFORE removing the animation to prevent a
        // one-frame flash where clearing the animation reverts the element to
        // the CSS base state (transform: translateY(100%)).
        bar.style.height    = `${h}px`;
        bar.style.transform = 'none';
        bar.style.animation = 'none';
      }

      launchCompleteRef.current = true;
    }, 1350);

    return () => clearTimeout(timer);
  }, [shouldAnimate]);

  // ── JS-driven exit ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExiting || !launchCompleteRef.current) return;

    const title   = titleRef.current;
    const linkedin = linkedinRef.current;
    const bar     = bottomBarRef.current;

    if (title)   { title.style.transition   = 'opacity 0.35s ease'; title.style.opacity   = '0'; }
    if (linkedin) { linkedin.style.transition = 'opacity 0.35s ease'; linkedin.style.opacity = '0'; }
    if (bar)     { bar.style.transition     = 'transform 0.35s ease'; bar.style.transform = 'translateY(100%)'; }
  }, [isExiting]);

  // ── Bar click — scroll to State 2 (start of carousel dwell) ─────────────
  const handleBarClick = useCallback(() => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const target = containerTop + 3 * window.innerHeight;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // ── Workflow footer click — scroll to State 3 (WorkflowShell visible) ────
  const handleWorkflowFooterClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // prevent bar's handleBarClick from firing
    if (!containerRef.current) return;
    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    // phase1Range=3vh, then phase2Range=6vh; WorkflowShell fully visible at phase2Progress=0.60
    const target = containerTop + 3 * vh + 6 * vh * 0.60;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // ── Scroll-driven animation ────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!launchCompleteRef.current || !containerRef.current) return;

    const vh = window.innerHeight;
    const { top } = containerRef.current.getBoundingClientRect();
    const scrolled = -top; // px scrolled into the container

    // ── Two-phase progress ────────────────────────────────────────────────────
    // Phase 1: 300 vh of scroll → States 1–2 (bar expands, carousel enters)
    // Phase 2: 600 vh of scroll → State 2 → 3 transition + State 3 dwell
    const phase1Range = 3 * vh;
    const phase2Range = 6 * vh;
    const progress       = clamp(scrolled / phase1Range, 0, 1);        // States 1–2
    const phase2Progress = clamp((scrolled - phase1Range) / phase2Range, 0, 1); // State 3

    const bar             = bottomBarRef.current;
    const barLabel        = barLabelRef.current;
    const arrow           = arrowRef.current;
    const title           = titleRef.current;
    const linkedin        = linkedinRef.current;
    const barContentArea  = barContentAreaRef.current;
    const carouselWrapper = carouselWrapperRef.current;

    if (!bar || !barLabel || !arrow || !title) return;

    const barH = naturalBarHeightRef.current;

    // ─────────────────────────────────────────────────────────────────────────
    // ══  PHASE 1: STATES 1 → 2  ══════════════════════════════════════════════
    // ─────────────────────────────────────────────────────────────────────────

    // Reveal bar content area on first scroll — exactly like barState2Content
    // in ExperienceHeroSection. display:none keeps it out of the layout during
    // the CSS launch animation, preventing the bar from being taller than barTopRow.
    if (barContentArea) {
      if (progress > 0 && barContentArea.style.display !== 'flex') {
        barContentArea.style.display = 'flex';
      } else if (progress === 0 && barContentArea.style.display !== 'none') {
        barContentArea.style.display = 'none';
      }
    }

    // 1. Bar expands upward; top corners flatten as bar fills the viewport (0 → 0.40)
    const barP = easeOut(rp(progress, 0, 0.40));
    bar.style.height = `${lerp(barH, vh, barP)}px`;
    const br = lerp(20, 0, barP);
    bar.style.borderRadius = `${br}px ${br}px 0 0`;

    // 2. Title fades out (0 → 0.25)
    title.style.opacity = String(clamp(1 - rp(progress, 0, 0.25), 0, 1));

    // 3. LinkedIn fades out (0 → 0.25)
    if (linkedin) {
      linkedin.style.opacity = String(clamp(1 - rp(progress, 0, 0.25), 0, 1));
    }

    // 4. Arrow fades out (0 → 0.20)
    arrow.style.opacity = String(clamp(1 - rp(progress, 0, 0.20), 0, 1));

    // 5. "What I Do" label morphs: large/bold/dark → small/normal/grey (0 → 0.40)
    const labelP = easeOut(rp(progress, 0, 0.40));
    barLabel.style.fontSize   = `${lerp(1.2, 1.0, labelP)}rem`;
    barLabel.style.fontWeight = labelP < 0.5 ? '700' : '400';
    const lch = Math.round(lerp(19, 159, labelP));
    barLabel.style.color = `rgb(${lch},${lch},${lch})`;

    // 6. barContentArea fades in (0 → 0.40), carousel slides up (0.40 → 0.65)
    if (barContentArea) {
      barContentArea.style.opacity = String(easeOut(rp(progress, 0, 0.40)));
    }
    if (carouselWrapper) {
      const carP = easeOut(rp(progress, 0.40, 0.65));
      carouselWrapper.style.opacity   = String(carP);
      carouselWrapper.style.transform = `translateY(${lerp(50, 0, carP)}px)`;
    }

    // ─── "My Workflow" footer slides in during State 2 dwell  (0.75 → 0.88) ─
    const workflowFooter = workflowFooterRef.current;
    if (workflowFooter) {
      if (progress >= 0.75 && workflowFooter.style.display !== 'flex') {
        workflowFooter.style.display = 'flex';
      } else if (progress < 0.75 && workflowFooter.style.display !== 'none') {
        workflowFooter.style.display = 'none';
      }
      const wfP = easeOut(rp(progress, 0.77, 0.88));
      workflowFooter.style.opacity   = String(wfP);
      workflowFooter.style.transform = `translateY(${lerp(100, 0, wfP)}%)`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ══  PHASE 2: STATE 2 → 3  ═══════════════════════════════════════════════
    // (phase2Progress 0→1 over 600 vh of scroll, starting after 800 vh)
    // ─────────────────────────────────────────────────────────────────────────

    const wfLabel = workflowLabelRef.current;
    const wfArrow = workflowArrowRef.current;
    const s3Label = s3LabelRef.current;
    const s3Workflow = s3WorkflowRef.current;

    // P1. Workflow arrow fades out (p2: 0.00 → 0.15)
    if (wfArrow) {
      wfArrow.style.opacity = String(clamp(1 - rp(phase2Progress, 0, 0.15), 0, 1));
    }

    // P2. Workflow label morphs small + grey (p2: 0.00 → 0.25)
    if (wfLabel) {
      const morphP = rp(phase2Progress, 0, 0.25);
      wfLabel.style.fontSize   = `${lerp(1.2, 1.0, morphP)}rem`;
      wfLabel.style.fontWeight = morphP < 0.5 ? '700' : '400';
      const ec = Math.round(lerp(19, 159, morphP));
      wfLabel.style.color = `rgb(${ec},${ec},${ec})`;
    }

    // P3. White bar slides up off the top (p2: 0.10 → 0.40)
    if (phase2Progress > 0) {
      const barExitP = easeOut(rp(phase2Progress, 0.10, 0.40));
      bar.style.transform = `translateY(${lerp(0, -100, barExitP)}%)`;
      const brExit = lerp(0, 20, barExitP);
      bar.style.borderRadius = `0 0 ${brExit}px ${brExit}px`;
    }

    // P4. S3 "My Workflow" grey label fades in (p2: 0.35 → 0.50)
    if (s3Label) {
      s3Label.style.opacity = String(easeOut(rp(phase2Progress, 0.35, 0.50)));
    }

    // P5. S3 WorkflowShell slides up (p2: 0.40 → 0.60)
    if (s3Workflow) {
      const wfP = easeOut(rp(phase2Progress, 0.40, 0.60));
      s3Workflow.style.opacity   = String(wfP);
      s3Workflow.style.transform = `translateY(${lerp(60, 0, wfP)}px)`;
    }

    // P6. Step progression — 3 steps spread across phase2: 0.60 → 1.00
    // Each step occupies 1/3 of the remaining range (~80 vh per step).
    const stepIdx = Math.min(2, Math.floor(rp(phase2Progress, 0.60, 1.00) * 3));
    if (stepIdx !== activeStepRef.current) {
      activeStepRef.current = stepIdx;
      setActiveWorkflowStep(stepIdx);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, variant]);

  // ── CSS class helpers ─────────────────────────────────────────────────────
  const titleClass = [
    styles.heroTitle,
    shouldAnimate && !isExiting ? styles.heroTitleEnter : '',
    isExiting && !launchCompleteRef.current ? styles.heroTitleExit : '',
  ].filter(Boolean).join(' ');

  const linkedinClass = [
    styles.linkedinWrapper,
    shouldAnimate && !isExiting ? styles.linkedinEnter : '',
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

        {/* ── LinkedIn button ─────────────────────────────────────────────── */}
        <div ref={linkedinRef} className={linkedinClass}>
          <a
            href="https://www.linkedin.com/in/william-portugal"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedinButton}
          >
            <Image
              src="/images/linkedin-logo.png"
              alt="LinkedIn"
              width={72}
              height={72}
            />
          </a>
          <p className={styles.heroBio}>
            I prototype and build AI-powered systems, designing agent workflows and testing ideas through hands-on experimentation. I focus on making complex technology practical, reliable, and useful in real product experiences.
          </p>
        </div>

        {/* ── Hero title content ──────────────────────────────────────────── */}
        <div className={
          variant === 'mobile' ? styles.heroContentMobile : styles.heroContentDesktop
        }>
          <div ref={titleRef} className={titleClass}>
            <span className={styles.hiLabel}>Hi! I&apos;m</span>
            <h1 className={styles.name}>
              William<br />Portugal
            </h1>
            <p className={styles.jobTitle}>Product Manager</p>
          </div>
        </div>

        {/* ── State 3 content ────────────────────────────────────────────────
            Positioned absolutely on the dark background (z-index:5, below bar:10).
            All children start opacity:0 in CSS; JS drives them in after the bar
            has exited off the top during the S2→3 transition.
            overflow:hidden clips S3 elements that start off-screen below.     */}
        <div className={styles.state3Content}>

          {/* "My Workflow" grey label at top */}
          <div ref={s3LabelRef} className={styles.s3Label}>My Workflow</div>

          {/* WorkflowShell */}
          <div ref={s3WorkflowRef} className={styles.s3WorkflowWrapper}>
            <WorkflowShell activeStep={activeWorkflowStep} />
          </div>

        </div>
        {/* end state3Content */}

        {/* ── Bottom bar ─────────────────────────────────────────────────────
            Starts as a thin strip pinned to the viewport bottom.
            JS grows height: naturalBarHeight → 100 vh (becomes white canvas).

            Internal layout (flex-column):
              • barTopRow          — always visible; "What I Do" label + arrow
              • barContentArea     — flex: 1; holds the carousel               */}
        <div ref={bottomBarRef} className={barClass} data-white-section onClick={handleBarClick}>

          {/* Top row: morphing "What I Do" label + bouncing arrow */}
          <div ref={barTopRowRef} className={styles.barTopRow}>
            <span ref={barLabelRef} className={styles.barLabel}>
              What I Do
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

          {/* ── Content area ──────────────────────────────────────────────── */}
          <div ref={barContentAreaRef} className={styles.barContentArea}>
            <div ref={carouselWrapperRef} className={styles.carouselWrapper}>
              <ModuleCarousel />
            </div>
          </div>
          {/* end barContentArea */}

          {/* ── Workflow footer ─────────────────────────────────────────────────
              Direct child of bottomBar — position:absolute at bar's bottom edge.
              Independent of barContentArea so its opacity is unaffected by any
              content-area transitions.
              display:none → flex (JS at progress ≥ 0.65).
              Slides in from below: translateY(100% → 0%) + opacity fade.       */}
          <div ref={workflowFooterRef} className={styles.workflowFooter} onClick={handleWorkflowFooterClick}>
            <span ref={workflowLabelRef} className={styles.workflowLabel}>
              My Workflow
            </span>

            <div ref={workflowArrowRef} className={styles.arrowWrapper} aria-hidden="true">
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
          {/* end workflowFooter */}

        </div>
        {/* end bottomBar */}

      </div>
      {/* end stickyHero */}

    </div>
    // end stickyContainer
  );
}
