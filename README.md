# CampusEx

A campus-exclusive marketplace for students built with Next.js 16, React 19, and Supabase.

## Tech Stack

- **Next.js 16** - App Router with TypeScript
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Supabase** - Authentication and database
- **Lucide React** - Icons
- **CSS Modules** - Styling

## Prerequisites

- Node.js 20.9+
- npm or yarn
- A Supabase account and project

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd campus-ex
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from your Supabase project settings:

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL, anon/public key, and service_role key

**⚠️ Security Note**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Keep it secret! Never commit it to Git.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
campus-ex/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Auth pages (sign-in)
│   ├── (app)/               # Protected app pages
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── ui/                  # Reusable UI primitives
│   └── marketplace/         # Marketplace components
├── lib/
│   ├── supabase/            # Supabase clients and config
│   └── marketplace/         # Business logic
├── types/                   # TypeScript types
├── supabase/
│   └── migrations/          # Database migrations
└── docs/                    # Documentation
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Features

### Phase One: Core Marketplace

- Student authentication (Supabase magic link)
- Create, edit, delete listings with images
- Browse and search marketplace
- Category and condition filters
- Report inappropriate content
- Image upload and storage
- Row-level security (RLS) policies

### Phase Two: Community Features

- **In-app messaging** - Direct buyer-seller communication
- **Saved listings** - Bookmark items for later
- **User profiles** - Display name, grad year, bio, verification badges
- **Notifications** - Alerts for new messages and key events
- **Admin moderation** - Content safety and user protection

See [docs/PHASE_TWO.md](docs/PHASE_TWO.md) for detailed Phase Two documentation.

## Authentication

The app uses Supabase magic link authentication:

1. Users enter their email on the sign-in page
2. Supabase sends a magic link to their email
3. Clicking the link authenticates and redirects to the marketplace

All routes under `/marketplace`, `/profile`, `/inbox`, `/saved`, and `/notifications` require authentication.

## Database Migrations

Store SQL migrations in `supabase/migrations/` directory.

To run migrations:

1. Install Supabase CLI: `npm i -g supabase`
2. Link your project: `supabase link --project-ref your-project-ref`
3. Apply migrations: `supabase db push`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the production bundle:

```bash
npm run build
```

Then deploy the `.next` folder and run:

```bash
npm run start
```

## Environment Variables

| Variable                        | Description                                | Required |
| ------------------------------- | ------------------------------------------ | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                  | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key              | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (for admin operations) 🔒 | Yes      |

## Supabase Configuration

### Required Auth Settings

Before deploying, configure these in Supabase Dashboard → Authentication:

**URL Configuration**:

- Site URL: `https://your-domain.vercel.app` (your production URL)
- Redirect URLs: Add `https://your-domain.vercel.app/auth/callback`

**Email Auth**:

- Provider: Enable Email (Magic Link)
- Confirm email: Recommended for production
- Email templates: Verify magic link redirects to `/auth/callback`

**Security**:

- Only @augustana.edu emails can sign in (enforced in code)
- All routes require authentication except sign-in page

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests if applicable
4. Submit a pull request

## License

MIT
