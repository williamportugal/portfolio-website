'use client';

/**
 * AboutHeroSection
 *
 * Scrollytelling canvas for the About Me page.
 *
 * Scroll is split into two phases:
 *   Phase 1 — 800 vh of scroll range (progress 0→1).  States 1–4.
 *   Phase 2 — 500 vh of scroll range (phase2Progress 0→1).  State 5.
 * Container total: 1400 vh  (100 vh viewport + 800 vh S1-4 + 500 vh S5).
 *
 * ─── STATE 1 (launch — CSS-driven) ─────────────────────────────────────────
 *   • Title slides up + fades in  (bottom-left)
 *   • Profile photo fades in      (right side)
 *   • Bottom bar slides up from below the viewport
 *
 * ─── STATE 1 → 2 (scroll-driven, phase1: 0 → 0.15) ──────────────────────────
 *   • Bar expands upward (natural height → 100 vh)
 *   • Title + profile fade out
 *   • Arrow fades out
 *   • "My Background" label shrinks + lightens; " 1/3" counter fades in
 *
 * ─── STATE 2 (dwell, phase1: 0.15 → 0.38) ────────────────────────────────────
 *   • "Growing Up" text section slides in (left)
 *   • growingUp.png slides in (right)
 *
 * ─── STATE 2 → 3 (scroll-driven, phase1: 0.38 → 0.52) ───────────────────────
 *   • S2 image scales 1→0.9; S3 image slides up on top; S3 section slides in
 *   • "Growing Up" title morphs → inactive; counter 1/3→2/3
 *
 * ─── STATE 3 (dwell, phase1: 0.52 → 0.63) ────────────────────────────────────
 *   • Both sections visible; "In High School" is active
 *
 * ─── STATE 3 → 4 (scroll-driven, phase1: 0.63 → 0.78) ───────────────────────
 *   • S2 scales 0.9→0.81; S3 scales 1→0.9; S4 image slides in; S4 section slides in
 *   • "In High School" title morphs → inactive; counter 2/3→3/3
 *
 * ─── STATE 4 (resting, phase1: 0.78 → 1.00) ──────────────────────────────────
 *   • All three sections visible; "Today" is active
 *   • "My Education" footer slides in from below (phase1: 0.82→0.90)
 *
 * ─── STATE 4 → 5 (scroll-driven, phase2: 0.00 → 0.50) ───────────────────────
 *   • Education arrow fades out (0.00→0.06); label morphs small+grey (0.00→0.12)
 *   • White bar slides up off the top (0.05→0.18)
 *   • Dark background fully exposed; S5 elements enter top-to-bottom
 *
 * ─── STATE 5 (resting, phase2: 0.50 → 1.00) ──────────────────────────────────
 *   • "My Education" grey pill label, degree card, bullet points, coursework pills
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTransition } from '@/context/TransitionContext';
import HomeBackground from './HomeBackground';
import styles from './AboutHeroSection.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Content data
// ─────────────────────────────────────────────────────────────────────────────

const growingUp = {
  title: 'Growing Up',
  description:
    'I was raised in Menlo Park, right in the heart of Silicon Valley, where conversations about new startups and emerging technologies were a part of everyday life. Being surrounded by that energy sparked my interest early on. As long as I can remember, I’ve found myself wanting to understand how technology actually works.',
  imageSrc: '/cards/growingUp.png',
  imageAlt: 'Growing up in Menlo Park',
};

const highSchool = {
  title: 'High School',
  description:
    "At Menlo Atherton High School, my curiosity for technology drew me to enjoy STEM classes like AP Comp Sci, AP Physics, and AP Calculus. Outside of the classroom, I spent most of my time in the pool playing water polo or swimming, where I learned how compete while supporting my team. At the same time, I developed a deep appreciation for being outside -- whether that meant hiking, exploring, or being at the beach.",
  imageSrc: '/cards/highSchool.png',
  imageAlt: 'High school at Menlo Atherton',
};

const today = {
  title: 'Today',
  description:
    "At Cal Poly, I've been able to continue growing my love for the outdoors with places like Big Sur nearby, while finally diving deeper into how technology actually works through my studies in Computer Science and Graphic Communications.",
  imageSrc: '/cards/today.png',
  imageAlt: 'Today at Cal Poly',
};

const coursework = [
  'Calculus I–IV',
  'JavaScript',
  'Physics I–III',
  'Python',
  'Agile Methodology',
  'CSS',
  'Data Structures',
  'HTML',
  'Design & Analysis of Algorithms',
  'Object-Oriented Programming',
];

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

interface AboutHeroSectionProps {
  variant: 'mobile' | 'desktop';
}

export default function AboutHeroSection({ variant }: AboutHeroSectionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { isExiting } = useTransition();
  const pathname     = usePathname();
  const prevPathname = useRef(pathname);

  // Flags & measurements
  const launchCompleteRef   = useRef(false);
  const naturalBarHeightRef = useRef(0);
  const counterChangedTo2   = useRef(false); // tracks "1/3" → "2/3" swap
  const counterChangedTo3   = useRef(false); // tracks "2/3" → "3/3" swap

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const containerRef  = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLHeadingElement>(null);
  const profileRef    = useRef<HTMLDivElement>(null);
  const bottomBarRef  = useRef<HTMLDivElement>(null);
  const barTopRowRef  = useRef<HTMLDivElement>(null);
  const barLabelRef   = useRef<HTMLSpanElement>(null);
  const counterRef    = useRef<HTMLSpanElement>(null);
  const arrowRef      = useRef<HTMLDivElement>(null);

  // Bar content area — display:none in CSS, revealed by JS on first scroll
  const barContentAreaRef = useRef<HTMLDivElement>(null);

  // Left column — text sections
  const s2SectionRef  = useRef<HTMLDivElement>(null);
  const s2TitleRef    = useRef<HTMLHeadingElement>(null);
  const s3SectionRef  = useRef<HTMLDivElement>(null);
  const s3TitleRef    = useRef<HTMLHeadingElement>(null);
  const s4SectionRef  = useRef<HTMLDivElement>(null);

  // Right column — image wrappers (stacking card pattern mirrors ExperienceHeroSection S4/S5/S6)
  const s2ImageRef    = useRef<HTMLDivElement>(null); // normal flow, scales 1→0.9→0.81
  const s3ImageRef    = useRef<HTMLDivElement>(null); // absolute top:0, slides in then scales 1→0.9
  const s4ImageRef    = useRef<HTMLDivElement>(null); // absolute top:0, slides in

  // Education footer — slides in during State 4 dwell
  const educationFooterRef = useRef<HTMLDivElement>(null);
  const educationLabelRef  = useRef<HTMLSpanElement>(null);
  const educationArrowRef  = useRef<HTMLDivElement>(null);

  // State 5 elements — on dark background, outside the bar
  const s5LabelRef      = useRef<HTMLDivElement>(null);
  const s5DegreeCardRef = useRef<HTMLDivElement>(null);
  const s5LeftRef       = useRef<HTMLDivElement>(null);
  const s5SkillsRef     = useRef<HTMLDivElement>(null);

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
      counterChangedTo2.current = false;
      counterChangedTo3.current = false;
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
      const profile = profileRef.current;

      if (title) {
        title.style.animation = 'none';
        title.style.opacity   = '1';
        title.style.transform = 'none';
      }

      if (profile) {
        profile.style.animation = 'none';
        profile.style.opacity   = '1';
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
    const profile = profileRef.current;
    const bar     = bottomBarRef.current;

    if (title)   { title.style.transition   = 'opacity 0.35s ease'; title.style.opacity   = '0'; }
    if (profile) { profile.style.transition = 'opacity 0.35s ease'; profile.style.opacity = '0'; }
    if (bar)     { bar.style.transition     = 'transform 0.35s ease'; bar.style.transform = 'translateY(100%)'; }
  }, [isExiting]);

  // ── Bar click — scroll to State 2 (start of content dwell) ─────────────
  const handleBarClick = useCallback(() => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const target = containerTop + 8 * window.innerHeight;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // ── Education footer click — scroll to State 5 (education content visible) ──
  const handleEducationFooterClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // prevent bar's handleBarClick from firing
    if (!containerRef.current) return;
    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    // phase1Range=8vh, then phase2Range=5vh; education content fully visible at phase2Progress=0.50
    const target = containerTop + 8 * vh + 5 * vh * 0.50;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // ── Scroll-driven animation ────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!launchCompleteRef.current || !containerRef.current) return;

    const vh = window.innerHeight;
    const { top } = containerRef.current.getBoundingClientRect();
    const scrolled = -top; // px scrolled into the container

    // ── Two-phase progress ────────────────────────────────────────────────────
    // Phase 1: 800 vh of scroll → States 1–4 (same as the original 900vh design)
    // Phase 2: 500 vh of scroll → State 4 → 5 transition + State 5 dwell
    const phase1Range = 8 * vh;
    const phase2Range = 5 * vh;
    const progress       = clamp(scrolled / phase1Range, 0, 1);        // States 1–4
    const phase2Progress = clamp((scrolled - phase1Range) / phase2Range, 0, 1); // State 5

    const bar            = bottomBarRef.current;
    const barLabel       = barLabelRef.current;
    const counter        = counterRef.current;
    const arrow          = arrowRef.current;
    const title          = titleRef.current;
    const profile        = profileRef.current;
    const barContentArea = barContentAreaRef.current;
    const s2Section      = s2SectionRef.current;
    const s2Title        = s2TitleRef.current;
    const s3Section      = s3SectionRef.current;
    const s3Title        = s3TitleRef.current;
    const s4Section      = s4SectionRef.current;
    const s2Image        = s2ImageRef.current;
    const s3Image        = s3ImageRef.current;
    const s4Image        = s4ImageRef.current;

    if (!bar || !barLabel || !counter || !arrow || !title) return;

    const barH = naturalBarHeightRef.current;

    // ─────────────────────────────────────────────────────────────────────────
    // ══  PHASE 1: STATES 1 → 4  ══════════════════════════════════════════════
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
      barContentArea.style.opacity = String(easeOut(rp(progress, 0, 0.15)));
    }

    // 1. Bar expands upward; top corners flatten as bar fills the viewport
    const barP = easeOut(rp(progress, 0, 0.15));
    bar.style.height = `${lerp(barH, vh, barP)}px`;
    const br = lerp(20, 0, barP);
    bar.style.borderRadius = `${br}px ${br}px 0 0`;

    // 2. Title fades out (0 → 0.10)
    title.style.opacity = String(clamp(1 - rp(progress, 0, 0.10), 0, 1));

    // 3. Profile fades out (0 → 0.10)
    if (profile) {
      profile.style.opacity = String(clamp(1 - rp(progress, 0, 0.10), 0, 1));
    }

    // 4. Arrow fades out (0 → 0.08)
    arrow.style.opacity = String(clamp(1 - rp(progress, 0, 0.08), 0, 1));

    // 5. "My Background" label morphs: 1.2rem/700/dark → 0.75rem/400/grey (0 → 0.15)
    const labelP = easeOut(rp(progress, 0, 0.15));
    barLabel.style.fontSize   = `${lerp(1.2, 1.0, labelP)}rem`;
    barLabel.style.fontWeight = labelP < 0.5 ? '700' : '400';
    const lch = Math.round(lerp(19, 159, labelP));
    barLabel.style.color = `rgb(${lch},${lch},${lch})`;

    // 6. Counter opacity — multi-phase across States 1→2→3→4
    let cOp: number;
    if      (progress < 0.10) cOp = 0;
    else if (progress < 0.15) cOp = easeOut(rp(progress, 0.10, 0.15));
    else if (progress < 0.41) cOp = 1;
    else if (progress < 0.44) cOp = 1 - rp(progress, 0.41, 0.44);
    else if (progress < 0.47) cOp = easeOut(rp(progress, 0.44, 0.47));
    else if (progress < 0.65) cOp = 1;
    else if (progress < 0.68) cOp = 1 - rp(progress, 0.65, 0.68);
    else                       cOp = easeOut(rp(progress, 0.68, 0.71));
    counter.style.opacity = String(cOp);

    // Counter text swap "1/3" ↔ "2/3"
    if (progress >= 0.44 && !counterChangedTo2.current) {
      counter.textContent = '\xa02/3';
      counterChangedTo2.current = true;
    } else if (progress < 0.44 && counterChangedTo2.current) {
      counter.textContent = '\xa01/3';
      counterChangedTo2.current = false;
    }

    // Counter text swap "2/3" ↔ "3/3"
    if (progress >= 0.68 && !counterChangedTo3.current) {
      counter.textContent = '\xa03/3';
      counterChangedTo3.current = true;
    } else if (progress < 0.68 && counterChangedTo3.current) {
      counter.textContent = '\xa02/3';
      counterChangedTo3.current = false;
    }

    // ─── STATE 2 content enters  (0.15 → 0.27) ───────────────────────────────

    // 7. S2 section slides up + fades in (0.15 → 0.25)
    if (s2Section) {
      const s2P = easeOut(rp(progress, 0.15, 0.25));
      s2Section.style.opacity   = String(s2P);
      s2Section.style.transform = `translateY(${lerp(50, 0, s2P)}px)`;
    }

    // 8. S2 image slides up + fades in (0.17 → 0.27)
    if (s2Image) {
      const s2ImgP = easeOut(rp(progress, 0.17, 0.27));
      s2Image.style.opacity   = String(s2ImgP);
      s2Image.style.transform = `translateY(${lerp(40, 0, s2ImgP)}px)`;
    }

    // ─── STATE 2 → 3  (0.38 → 0.52) — later writes win ──────────────────────

    // 9. S2 image scales 1→0.9 (guard: after S2 entry at 0.27)
    if (s2Image && progress >= 0.27) {
      const s2ScaleP = rp(progress, 0.38, 0.50);
      s2Image.style.transform = `scale(${lerp(1, 0.9, s2ScaleP)})`;
    }

    // 10. S2 title morphs → inactive (0.38 → 0.44, guard: 0.25)
    if (s2Title && progress >= 0.25) {
      const inactiveP = rp(progress, 0.38, 0.44);
      s2Title.style.fontSize   = `${lerp(1.5, 1.0, inactiveP)}rem`;
      s2Title.style.fontWeight = inactiveP < 0.5 ? '700' : '400';
      const tch = Math.round(lerp(19, 159, inactiveP));
      s2Title.style.color = `rgb(${tch},${tch},${tch})`;
    }

    // 11. S3 section slides up + fades in (0.40 → 0.52)
    if (s3Section) {
      const s3P = easeOut(rp(progress, 0.40, 0.52));
      s3Section.style.opacity   = String(s3P);
      s3Section.style.transform = `translateY(${lerp(50, 0, s3P)}px)`;
    }

    // 12. S3 image slides in from below (0.40 → 0.52)
    if (s3Image) {
      const s3ImgP = easeOut(rp(progress, 0.40, 0.52));
      s3Image.style.opacity   = String(s3ImgP);
      s3Image.style.transform = `translateY(${lerp(vh, 0, s3ImgP)}px)`;
    }

    // ─── STATE 3 → 4  (0.63 → 0.78) — later writes win ──────────────────────

    // 13. S2 image scales further 0.9→0.81 (guard: 0.50)
    if (s2Image && progress >= 0.50) {
      const s2Scale2P = rp(progress, 0.63, 0.78);
      s2Image.style.transform = `scale(${lerp(0.9, 0.81, s2Scale2P)})`;
    }

    // 14. S3 image scales 1→0.9 (guard: 0.52)
    if (s3Image && progress >= 0.52) {
      const s3ScaleP = rp(progress, 0.63, 0.78);
      s3Image.style.transform = `scale(${lerp(1, 0.9, s3ScaleP)})`;
    }

    // 15. S3 title morphs → inactive (0.63 → 0.70, guard: 0.52)
    if (s3Title && progress >= 0.52) {
      const inactiveP = rp(progress, 0.63, 0.70);
      s3Title.style.fontSize   = `${lerp(1.5, 1.0, inactiveP)}rem`;
      s3Title.style.fontWeight = inactiveP < 0.5 ? '700' : '400';
      const tch = Math.round(lerp(19, 159, inactiveP));
      s3Title.style.color = `rgb(${tch},${tch},${tch})`;
    }

    // 16. S4 section slides up + fades in (0.65 → 0.78)
    if (s4Section) {
      const s4P = easeOut(rp(progress, 0.65, 0.78));
      s4Section.style.opacity   = String(s4P);
      s4Section.style.transform = `translateY(${lerp(50, 0, s4P)}px)`;
    }

    // 17. S4 image slides in from below (0.65 → 0.78)
    if (s4Image) {
      const s4ImgP = easeOut(rp(progress, 0.65, 0.78));
      s4Image.style.opacity   = String(s4ImgP);
      s4Image.style.transform = `translateY(${lerp(vh, 0, s4ImgP)}px)`;
    }

    // ─── "My Education" footer slides in during State 4 dwell  (0.82 → 0.90) ─

    // 18. Education footer slides up from below
    const educationFooter = educationFooterRef.current;
    if (educationFooter) {
      if (progress >= 0.82 && educationFooter.style.display !== 'flex') {
        educationFooter.style.display = 'flex';
      } else if (progress < 0.82 && educationFooter.style.display !== 'none') {
        educationFooter.style.display = 'none';
      }
      const efP = easeOut(rp(progress, 0.84, 0.90));
      educationFooter.style.opacity   = String(efP);
      educationFooter.style.transform = `translateY(${lerp(100, 0, efP)}%)`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ══  PHASE 2: STATE 4 → 5  ═══════════════════════════════════════════════
    // (phase2Progress 0→1 over 500 vh of scroll, starting after 800 vh)
    // ─────────────────────────────────────────────────────────────────────────

    const eduLabel = educationLabelRef.current;
    const eduArrow = educationArrowRef.current;
    const s5Label  = s5LabelRef.current;
    const s5Degree = s5DegreeCardRef.current;
    const s5Left   = s5LeftRef.current;
    const s5Skills = s5SkillsRef.current;

    // P1. Education arrow fades out (p2: 0.00 → 0.06)
    if (eduArrow) {
      eduArrow.style.opacity = String(clamp(1 - rp(phase2Progress, 0, 0.06), 0, 1));
    }

    // P2. Education label morphs small + grey (p2: 0.00 → 0.12)
    if (eduLabel) {
      const morphP = rp(phase2Progress, 0, 0.12);
      eduLabel.style.fontSize   = `${lerp(1.2, 1.0, morphP)}rem`;
      eduLabel.style.fontWeight = morphP < 0.5 ? '700' : '400';
      const ec = Math.round(lerp(19, 159, morphP));
      eduLabel.style.color = `rgb(${ec},${ec},${ec})`;
    }

    // P3. White bar slides up off the top (p2: 0.05 → 0.18)
    //     Bottom corners round 0 → 20px as the bar exits (reverse of entry)
    if (phase2Progress > 0) {
      const barExitP = easeOut(rp(phase2Progress, 0.05, 0.18));
      bar.style.transform = `translateY(${lerp(0, -100, barExitP)}%)`;
      const brExit = lerp(0, 20, barExitP);
      bar.style.borderRadius = `0 0 ${brExit}px ${brExit}px`;
    }

    // P4. S5 "My Education" grey label fades in (p2: 0.18 → 0.28)
    if (s5Label) {
      s5Label.style.opacity = String(easeOut(rp(phase2Progress, 0.18, 0.28)));
    }

    // P5. S5 degree card slides up (p2: 0.22 → 0.36)
    if (s5Degree) {
      const degP = easeOut(rp(phase2Progress, 0.22, 0.36));
      s5Degree.style.opacity   = String(degP);
      s5Degree.style.transform = `translateY(${lerp(40, 0, degP)}px)`;
    }

    // P6. S5 left column — clip-path "written in real time" reveal (p2: 0.28 → 0.44)
    if (s5Left) {
      const leftP = easeOut(rp(phase2Progress, 0.28, 0.44));
      s5Left.style.opacity   = String(leftP);
      s5Left.style.clipPath  = `inset(0 ${lerp(100, 0, leftP)}% 0 0)`;
      s5Left.style.transform = `translateY(${lerp(10, 0, leftP)}px)`;
    }

    // P7. S5 skills/coursework grid slides up (p2: 0.36 → 0.52)
    if (s5Skills) {
      const skillsP = easeOut(rp(phase2Progress, 0.36, 0.52));
      s5Skills.style.opacity   = String(skillsP);
      s5Skills.style.transform = `translateY(${lerp(40, 0, skillsP)}px)`;
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

  const profileClass = [
    styles.profileWrapper,
    shouldAnimate && !isExiting ? styles.profileEnter : '',
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

        {/* ── Profile photo ───────────────────────────────────────────────── */}
        <div ref={profileRef} className={profileClass}>
          <Image
            src="/cards/pfp.png"
            alt="Memo Portugal"
            width={340}
            height={340}
            className={styles.profileCircle}
            priority
          />
        </div>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div className={
          variant === 'mobile' ? styles.heroContentMobile : styles.heroContentDesktop
        }>
          <h1 ref={titleRef} className={titleClass}>
            About<br />Me
          </h1>
        </div>

        {/* ── State 5 content ────────────────────────────────────────────────
            Positioned absolutely on the dark background (z-index:5, below bar:10).
            All children start opacity:0 in CSS; JS drives them in after the bar
            has exited off the top during the S4→5 transition.
            overflow:hidden clips S5 elements that start off-screen below.
            Desktop only — hidden on mobile via CSS.                          */}
        <div className={styles.state5Content}>

          {/* "My Education" grey pill label at top */}
          <div ref={s5LabelRef} className={styles.s5Label}>My Education</div>

          {/* Degree card — white card spanning full width */}
          <div ref={s5DegreeCardRef} className={styles.s5DegreeCard}>
            <div className={styles.s5DegreeLeft}>
              <h2 className={styles.s5DegreeTitle}>
                B.S. Computer Science &amp; Graphic Communications
              </h2>
              <p className={styles.s5DegreeSubtitle}>Cal Poly, San Luis Obispo</p>
            </div>
            <div className={styles.s5DegreeLogoWrapper}>
              <Image
                src="/cards/calpoly-logo.png"
                alt="Cal Poly San Luis Obispo"
                width={200}
                height={100}
                className={styles.s5CalPolyLogo}
              />
            </div>
          </div>

          {/* Two-column layout: left = bullets, right = coursework pills */}
          <div className={styles.s5TwoColumn}>

            {/* Left column: bullet points with clip-path reveal */}
            <div ref={s5LeftRef} className={styles.s5Left}>
              <ul className={styles.s5BulletList}>
                <li className={styles.s5BulletItem}>
                  In my fourth year majoring in Liberal Arts Engineering Studies, with a concentration in Computer Science and Graphic Communications. 
                </li>
                <li className={styles.s5BulletItem}>
                  The Liberal Arts Engineering Studies program is unique to Cal Poly, as students are simultaneously members of the College of Engineering and the College of Liberal Arts.
                </li>

              </ul>
            </div>

            {/* Right column: "Coursework" label + 2×5 pills */}
            <div ref={s5SkillsRef} className={styles.s5Right}>
              <span className={styles.s5CourseLabel}>Coursework</span>
              <div className={styles.s5CourseGrid}>
                {coursework.map((course) => (
                  <div key={course} className={styles.s5CoursePill}>{course}</div>
                ))}
              </div>
            </div>

          </div>
          {/* end s5TwoColumn */}

        </div>
        {/* end state5Content */}

        {/* ── Bottom bar ─────────────────────────────────────────────────────
            Starts as a thin strip pinned to the viewport bottom.
            JS grows height: naturalBarHeight → 100 vh (becomes white canvas).

            Internal layout (flex-column):
              • barTopRow      — always visible; "My Background" label + arrow
              • barContentArea — flex: 1; holds the two-column card layout     */}
        <div ref={bottomBarRef} className={barClass} onClick={handleBarClick}>

          {/* Top row: morphing "My Background" label + bouncing arrow */}
          <div ref={barTopRowRef} className={styles.barTopRow}>
            <span ref={barLabelRef} className={styles.barLabel}>
              My Background
              <span ref={counterRef} className={styles.barCounter}>&nbsp;1/3</span>
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
            <div className={styles.cardLayout}>

              {/* ── Left column: accumulating text sections ─────────────────
                  All three sections live in normal flow and stack vertically.
                  As new sections slide in, older titles morph → inactive style
                  (1rem, weight 400, grey color) via JS, while new sections
                  remain at active style (1.5rem, weight 700, dark color).    */}
              <div className={styles.leftTextColumn}>

                {/* S2: Growing Up */}
                <div ref={s2SectionRef} className={styles.textSection}>
                  <h2 ref={s2TitleRef} className={styles.sectionTitle}>
                    {growingUp.title}
                  </h2>
                  <p className={styles.sectionDesc}>
                    {growingUp.description}
                  </p>
                </div>

                {/* S3: In High School */}
                <div ref={s3SectionRef} className={styles.textSection}>
                  <h2 ref={s3TitleRef} className={styles.sectionTitle}>
                    {highSchool.title}
                  </h2>
                  <p className={styles.sectionDesc}>
                    {highSchool.description}
                  </p>
                </div>

                {/* S4: Today */}
                <div ref={s4SectionRef} className={styles.textSection}>
                  <h2 className={styles.sectionTitle}>
                    {today.title}
                  </h2>
                  <p className={styles.sectionDesc}>
                    {today.description}
                  </p>
                </div>

              </div>
              {/* end leftTextColumn */}

              {/* ── Right column: stacking images ────────────────────────────
                  imageWrapper1: normal flow — scales 1→0.9→0.81 (anchored top).
                  imageWrapper2: position:absolute top:0 — slides up from 100vh,
                                 then scales 1→0.9.
                  imageWrapper3: position:absolute top:0 — slides up from 100vh.
                  Mirrors the s4/s5/s6 ImageWrapper pattern in ExperienceHeroSection. */}
              <div className={styles.rightImageColumn}>

                {/* S2 image — normal flow; scales as S3/S4 stack on top */}
                <div ref={s2ImageRef} className={styles.imageWrapper1}>
                  <Image
                    src={growingUp.imageSrc}
                    alt={growingUp.imageAlt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 767px) calc(100vw - 3rem), calc(50vw - 5rem)"
                    quality={90}
                    className={styles.stateImage}
                    priority
                  />
                </div>

                {/* S3 image — slides in on top of S2, then scales to 90% */}
                <div ref={s3ImageRef} className={styles.imageWrapper2}>
                  <Image
                    src={highSchool.imageSrc}
                    alt={highSchool.imageAlt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 767px) calc(100vw - 3rem), calc(50vw - 5rem)"
                    quality={90}
                    className={styles.stateImage}
                  />
                </div>

                {/* S4 image — slides in on top of S3 */}
                <div ref={s4ImageRef} className={styles.imageWrapper3}>
                  <Image
                    src={today.imageSrc}
                    alt={today.imageAlt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 767px) calc(100vw - 3rem), calc(50vw - 5rem)"
                    quality={90}
                    className={styles.stateImage}
                  />
                </div>

              </div>
              {/* end rightImageColumn */}

            </div>
            {/* end cardLayout */}
          </div>
          {/* end barContentArea */}

          {/* ── Education footer ───────────────────────────────────────────────
              Direct child of bottomBar — position:absolute at bar's bottom edge.
              Independent of barContentArea so its opacity is unaffected by any
              content-area transitions.
              display:none → flex (JS at progress ≥ 0.82).
              Slides in from below: translateY(100% → 0%) + opacity fade.
              As phase2 begins, the label morphs and the bar slides off the top,
              taking this footer with it.                                       */}
          <div ref={educationFooterRef} className={styles.educationFooter} onClick={handleEducationFooterClick}>
            <span ref={educationLabelRef} className={styles.educationLabel}>
              My Education
            </span>

            <div ref={educationArrowRef} className={styles.arrowWrapper} aria-hidden="true">
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
          {/* end educationFooter */}

        </div>
        {/* end bottomBar */}

      </div>
      {/* end stickyHero */}

    </div>
    // end stickyContainer
  );
}
