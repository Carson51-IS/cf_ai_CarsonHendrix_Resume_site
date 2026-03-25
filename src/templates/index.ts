import type { Template } from '../types';

export const templates: Template[] = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Sleek dark theme with gradient accents, smooth animations, and a bold hero section.',
    previewColors: {
      bg: '#0f172a',
      accent: '#f97316',
      text: '#e2e8f0',
      secondary: '#1e293b',
    },
    stylePrompt: `Design a premium dark-themed portfolio. Be creative — this should feel like a high-end product landing page, not a boring resume.

COLOR PALETTE: Dark navy (#0f172a) base, slate (#1e293b) cards, vibrant orange (#f97316) accents. Use orange gradients creatively.

HERO: Full-viewport height. The person's name should be HUGE (clamp(3rem, 8vw, 6rem)). Add a subtle animated gradient background or floating geometric shapes using CSS. Include the profile image placeholder as a large circle.

LAYOUT IDEAS (pick what fits the person's data):
- Experience as a vertical timeline with glowing orange dots and connecting lines
- Skills as an animated grid of cards that glow on hover, or circular progress indicators
- Projects as large featured cards with hover effects that reveal details (CSS-only)
- Use CSS Grid with interesting layouts — not everything needs to be the same width

VISUAL FLAIR: Subtle particle/dot background pattern using CSS radial-gradient. Glassmorphism effects on cards (backdrop-filter: blur). Animated underlines on navigation. Orange glow effects on hover states.`,
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Light and airy with elegant typography, generous whitespace, and refined details.',
    previewColors: {
      bg: '#fafafa',
      accent: '#18181b',
      text: '#3f3f46',
      secondary: '#ffffff',
    },
    stylePrompt: `Design an elegantly minimal portfolio. Think high-end design agency or editorial magazine layout. Every pixel of whitespace is intentional.

COLOR PALETTE: Off-white (#fafafa) background, pure white (#fff) content areas, near-black (#18181b) headings, warm gray (#71717a) body text. One single accent color only when needed.

TYPOGRAPHY: This design lives or dies by typography. Use system serif for headings (Georgia, "Times New Roman") and system sans-serif for body. Vary font sizes dramatically — section titles should be very large, body text medium. Use letter-spacing and line-height thoughtfully.

HERO: Simple but powerful. Just the name in large serif type, title below in lighter weight, maybe a single thin horizontal line. Profile image placeholder as a refined square with subtle border.

LAYOUT: Max-width 720px centered. Generous vertical rhythm (4rem+ between sections). Experience as clean entries with company name prominent, subtle left border accent. Projects as two-column text blocks. Skills as a simple flowing list with subtle separators.

THE FEEL: Like reading a beautifully typeset book. No shadows except maybe one very subtle one. Thin hairline borders. Elegant transitions on hover (opacity, not movement).`,
  },
  {
    id: 'bold-creative',
    name: 'Bold Creative',
    description: 'Vibrant colors, dynamic layouts, and eye-catching designs bursting with personality.',
    previewColors: {
      bg: '#faf5ff',
      accent: '#7c3aed',
      text: '#1e1b4b',
      secondary: '#ede9fe',
    },
    stylePrompt: `Design a bold, energetic, creative portfolio that screams personality. This should feel fun and memorable — like the person behind it is someone you want to meet.

COLOR PALETTE: Soft lavender (#faf5ff) base, deep violet (#7c3aed) primary, with pops of pink (#ec4899), teal (#14b8a6), and amber (#f59e0b). Use color liberally and joyfully.

HERO: Go big — oversized text with a multi-color gradient, CSS-animated background shapes (circles, blobs floating using @keyframes). Profile image placeholder as a circle with a colorful rotating border using conic-gradient.

LAYOUT: Break the grid! Use asymmetric layouts, overlapping elements, rotated cards (transform: rotate(1-3deg)), varying card sizes. Some sections could have colored backgrounds that extend full-width.

PROJECTS: Large featured cards with gradient borders. Each card could have a different accent color. Hover effects should be playful — lift, rotate slightly, glow.

SKILLS: Colorful pill badges with different background colors, arranged in a flowing masonry-like layout.

EXPERIENCE: Cards with thick left borders in alternating colors. Maybe a zigzag or bento-grid layout.

DECORATIVE: CSS-only decorative elements — circles, dots, squiggly lines (using border-radius and transforms). Animated gradient buttons. Fun cursor effects.`,
  },
  {
    id: 'developer',
    name: 'Developer Terminal',
    description: 'Terminal-inspired design with monospace fonts, code aesthetics, and hacker vibes.',
    previewColors: {
      bg: '#000000',
      accent: '#22c55e',
      text: '#a3e635',
      secondary: '#0a0a0a',
    },
    stylePrompt: `Design a developer terminal-themed portfolio that looks like a beautifully styled terminal/IDE. This should feel authentic to developer culture, not gimmicky.

COLOR PALETTE: True black (#000) or near-black (#0a0a0a) background. Terminal green (#22c55e) primary, lime (#a3e635) secondary, with occasional amber (#fbbf24) for warnings/highlights. Very subtle dark gray (#111) for card backgrounds.

TYPOGRAPHY: Monospace only — use "Courier New", monospace. Vary brightness/color instead of font weight for hierarchy.

HERO: A terminal window with realistic window chrome (three dots top-left, title bar). Show a typing animation for the person's name using CSS @keyframes with steps(). Include a blinking cursor. Below: "whoami" output showing their title and summary.

SECTIONS AS CLI OUTPUT: Format each section header like a command ($ cat experience.json, $ ls projects/, $ echo $SKILLS). Content appears as command output.

EXPERIENCE: Formatted like git log entries with commit hashes (use short random hex), dates, and messages.

PROJECTS: Styled like GitHub repository cards with a colored language dot, star count placeholder, and fork icon.

SKILLS: Displayed as a JSON object or as output of a package manager (npm list style).

VISUAL FLAIR: Subtle CRT scanline overlay using repeating-linear-gradient. A faint green glow (text-shadow) on headings. ASCII art section dividers. The whole page wrapped in a terminal window frame.`,
  },
];
