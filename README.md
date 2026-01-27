# William Portugal - Portfolio Website

A personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint

## Project Structure

```
src/
├── app/                  # App Router pages
│   ├── page.tsx         # Home page
│   ├── layout.tsx       # Root layout
│   ├── globals.css      # Global styles & design tokens
│   ├── about/           # About page
│   ├── projects/        # Projects page
│   └── contact/         # Contact page
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   ├── Footer.tsx       # Site footer
│   ├── Button.tsx       # Button component
│   └── ProjectCard.tsx  # Project display card
├── styles/
│   └── tokens.ts        # Design system tokens
└── lib/
    └── utils.ts         # Utility functions

public/
├── images/              # Image assets
└── resume/              # Resume files
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/williamportugal/portfolio-website.git
   cd portfolio-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Design System

The project uses a custom design system with the following color palette:

| Token | Color |
|-------|-------|
| Primary Text | `#000000` |
| Modules | `#FFFFFF` |
| Background | `#F2F2F2` |
| Clickable | `#D9D9D9` |
| Clickable Hover | `#C5C5C5` |
| Grey Text | `#9F9F9F` |
| Darkest Blue | `#1B2E48` |
| Dark Blue | `#314B6E` |
| Light Blue | `#607EA2` |
| Lightest Blue | `#7999C0` |

## License

This project is private and for personal use.
