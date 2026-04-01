# AI Image Gallery

Upload images and get AI-generated tags and descriptions automatically via GPT-4o Vision. Search your gallery by tag or description in real time.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VicenteGFJ/ai-image-gallery)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://ai-image-gallery-rejuvacare.vercel.app)

**Live Demo:** [ai-image-gallery-rejuvacare.vercel.app](https://ai-image-gallery-rejuvacare.vercel.app)

---

## Setup

### Prerequisites

- Node.js >=18.17.0
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key with GPT-4o access

### 1. Clone and install

```bash
git clone https://github.com/VicenteGFJ/ai-image-gallery.git
cd ai-image-gallery
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure Supabase

In your Supabase project:

- Run the migrations: `supabase db push` (or execute the SQL files in `supabase/migrations/` manually in the dashboard)
- Create a **Storage bucket** named `images` and set it to **public**

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
```

---

## License

MIT
