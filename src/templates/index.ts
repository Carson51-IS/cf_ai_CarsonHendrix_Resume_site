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
    stylePrompt: `Create a modern, dark-themed portfolio website with these design guidelines:
- Background: Dark navy/slate (#0f172a) with lighter card sections (#1e293b)
- Accent color: Vibrant orange (#f97316) for highlights, links, and buttons
- Typography: Clean sans-serif font, large hero text with gradient effect
- Layout: Full-width hero section with name and title, followed by card-based sections
- Cards should have subtle borders and hover effects with box-shadow
- Use CSS Grid for project cards and skills
- Add smooth scroll-reveal animations using CSS @keyframes
- Include a sticky navigation bar with smooth scroll links
- Skills displayed as rounded pill badges
- Experience as a timeline layout
- Footer with social links as icon buttons`,
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
    stylePrompt: `Create a clean, minimal portfolio website with these design guidelines:
- Background: Off-white (#fafafa) with pure white (#ffffff) content sections
- Accent color: Near-black (#18181b) for headings, with subtle gray (#71717a) for body text
- Typography: Mix of serif headings (Georgia or similar) and sans-serif body text
- Layout: Centered, max-width 768px, generous padding and margins
- Hero section: Simple centered text, no background image, just typography
- Sections separated by thin horizontal lines or generous spacing
- Experience and education as clean list items with subtle left border
- Skills as a simple comma-separated list or minimal tags
- Projects as text-focused cards with minimal styling
- Subtle hover underline effects on links
- No shadows, minimal borders, focus on content
- Footer: Simple centered text with inline links`,
  },
  {
    id: 'bold-creative',
    name: 'Bold Creative',
    description: 'Vibrant colors, dynamic layouts, and eye-catching card designs with personality.',
    previewColors: {
      bg: '#faf5ff',
      accent: '#7c3aed',
      text: '#1e1b4b',
      secondary: '#ede9fe',
    },
    stylePrompt: `Create a bold, creative portfolio website with these design guidelines:
- Background: Soft lavender (#faf5ff) with violet (#ede9fe) accent sections
- Primary accent: Deep violet (#7c3aed) for buttons, links, and highlights
- Secondary accents: Use complementary colors like pink (#ec4899) and teal (#14b8a6) for variety
- Typography: Bold, modern sans-serif with large section headings and playful sizing
- Layout: Asymmetric grid sections, some full-width, some offset
- Hero: Large name with colored gradient text, animated background shapes using CSS
- Project cards: Colorful borders or gradient backgrounds, hover lift effect with rotation
- Skills: Displayed as colorful chips/badges with different background colors
- Experience: Cards with colored left accent border, alternating layout
- Include decorative CSS shapes (circles, blobs) as background elements
- Animated gradient button for CTA
- Social links as large colorful icon buttons
- Footer with gradient background`,
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
    stylePrompt: `Create a developer/terminal-themed portfolio website with these design guidelines:
- Background: Pure black (#000000) or near-black (#0a0a0a)
- Accent color: Terminal green (#22c55e) for highlights, with lime (#a3e635) for secondary
- Typography: Monospace font throughout (Fira Code, JetBrains Mono, or Courier New)
- Hero section: Simulated terminal window with typing animation using CSS
- Display name and title as if typed in a terminal prompt ($ cursor blinking)
- Sections styled as terminal/code blocks with line numbers
- Skills displayed as a JSON object or array
- Experience formatted like git commit logs
- Project cards styled as repository cards with language color dots
- Use ASCII art dividers between sections
- Navigation as terminal commands
- Subtle scanline effect overlay using CSS
- Green text on black, matrix-style aesthetic
- Links styled as hyperlinks with underline and green color`,
  },
];
