# PyQuiz Admin Web Application

Admin panel for managing PyQuiz platform - questions, quizzes, users, and analytics.

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Supabase account

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=development
```

### Development

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See [VERCEL_QUICK_DEPLOY.md](./VERCEL_QUICK_DEPLOY.md) for detailed instructions.

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- Supabase
- React Query
- Zustand
- Recharts

## Project Structure

```
pyq-admin/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── store/          # State management
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── config/         # Configuration
├── public/             # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## License

Private - All rights reserved
