# Quickstart: Wedding CRUD Interface

**Feature**: 002-wedding-crud
**Estimated Setup**: 15-20 minutes
**Prerequisites**: Node.js 18+, Supabase project from Phase 1

---

## Prerequisites Checklist

- [ ] Phase 1 database schema applied (32 tables exist)
- [ ] Supabase project URL available
- [ ] Supabase anon key available
- [ ] Node.js 18+ installed
- [ ] Git repository cloned

---

## Quick Setup

### 1. Initialize Vite Project

```bash
# From repository root
npm create vite@latest . -- --template react-ts

# Or if project exists, skip to dependencies
```

### 2. Install Dependencies

```bash
npm install react-router-dom @supabase/supabase-js @tanstack/react-query react-hook-form @hookform/resolvers zod zustand date-fns lucide-react sonner clsx tailwind-merge class-variance-authority

npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
```

### 3. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

### 4. Configure Environment

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Create `.env.example`:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 5. Initialize Shadcn/ui

```bash
npx shadcn@latest init
```

Select options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### 6. Add Required Components

```bash
npx shadcn@latest add button card input select badge dialog textarea label
npm install sonner
```

### 7. Create Test User in Database

Run in Supabase SQL Editor:
```sql
-- Insert test user (if not exists)
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce',
  'test@vowsync.com',
  'Test Consultant',
  'consultant'
)
ON CONFLICT (id) DO NOTHING;
```

### 8. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

---

## Configuration Files

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#D4A5A5',
          secondary: '#A8B8A6',
        },
        accent: {
          gold: '#C9A961',
        },
        background: {
          light: '#FAFAFA',
        },
        border: {
          light: '#E8E8E8',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
      },
    },
  },
  plugins: [],
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## Key Files to Create

### src/lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### src/lib/constants.ts

```typescript
// Temporary user ID until authentication (Phase 14)
export const TEMP_USER_ID = 'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce';

export const WEDDING_STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const EVENTS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} event${i > 0 ? 's' : ''}`,
}));
```

### src/App.tsx

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { WeddingListPage } from './pages/WeddingListPage';
import { CreateWeddingPage } from './pages/CreateWeddingPage';
import { EditWeddingPage } from './pages/EditWeddingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WeddingListPage />} />
          <Route path="/weddings/new" element={<CreateWeddingPage />} />
          <Route path="/weddings/:id/edit" element={<EditWeddingPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
```

---

## Verification Steps

### 1. Environment Check

```typescript
// In browser console
console.log(import.meta.env.VITE_SUPABASE_URL); // Should show URL
```

### 2. Database Connection

```typescript
// Test query in component
const { data, error } = await supabase.from('weddings').select('count');
console.log({ data, error }); // Should show count or empty array
```

### 3. Test User Exists

```sql
-- In Supabase SQL Editor
SELECT * FROM public.users WHERE id = 'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce';
-- Should return 1 row
```

---

## Common Issues

### Issue: "supabase is not defined"
**Fix**: Check that `.env` file exists and variables are prefixed with `VITE_`

### Issue: "RLS policy violation"
**Fix**: Ensure test user exists in users table with correct ID

### Issue: "Module not found @/"
**Fix**: Add path alias to tsconfig.json and vite.config.ts

### Issue: Tailwind styles not applying
**Fix**: Ensure `@tailwind` directives in src/index.css and content paths in config

---

## Development Workflow

1. Start dev server: `npm run dev`
2. Make changes - HMR will reload
3. Test manually with Playwright MCP
4. Build for production: `npm run build`

---

## Next Steps

After setup, run `/speckit.tasks` to generate implementation tasks organized by user story.
