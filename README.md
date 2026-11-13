# Wolfmain

> **Your cloud code playground.** Create projects, write code, and see results instantly. No configuration, no Docker, no hassle.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-0.52-007ACC?logo=visualstudiocode)](https://microsoft.github.io/monaco-editor/)

---

## ✨ What makes Wolfmain special

| Feature | Details |
|---------|---------|
| **Real Monaco Editor** | The same engine that powers VS Code, in the browser |
| **Live preview** | Change code → see result instantly |
| **Version history** | Save snapshots with git‑style messages |
| **Multi‑file projects** | Folders, HTML, CSS, JS, TS, JSON, MD, … |
| **Secure authentication** | JWT + bcrypt + httpOnly cookies |
| **1‑click Deploy** | Vercel + Neon/Supabase = free production |

---

## 🚀 Quick demo

```bash
# 1. Clone
git clone https://github.com/TU_USUARIO/wolfmain.git
cd wolfmain

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Start DB (Docker)
docker run -d \
  --name wolfmain-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wolfmain \
  -p 5432:5432 \
  postgres:16

# 4. Install and start
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Register → Create your first project.

---

## 🎯 Who is this for

- **Developers learning** — Try HTML/CSS/JS without setting up anything
- **Fast prototyping** — Idea → code → live in seconds
- **Technical interviews** — Share a link, not a zip
- **Teaching** — Students edit, you see changes in real time
- **Living portfolio** — Your projects *are* the portfolio

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── actions/          # Server Actions (secure mutations)
│   │   ├── auth.ts       # login/register/logout
│   │   ├── project.ts    # CRUD projects
│   │   ├── files.ts      # Files + version history
│   │   └── profile.ts    # Profile + password change
│   ├── dashboard/        # Project list (RSC)
│   ├── editor/           # Monaco editor + preview (Client)
│   ├── settings/         # Profile, theme, security
│   └── login|register/   # Auth pages
├── components/
│   ├── editor/           # EditorClient (847 lines of glory)
│   ├── dashboard/        # DashboardClient
│   ├── settings/         # SettingsClient
│   ├── auth/             # LoginForm, RegisterForm
│   └── theme/            # ThemeProvider (light/dark/system)
├── lib/
│   ├── auth.ts           # JWT, bcrypt, cookies, sessions
│   └── validations.ts    # Zod schemas
└── prisma/
    ├── client.ts         # Singleton PrismaClient
    └── schema.prisma     # Models: User, Project, File, FileVersion, Session, Tags
```

---

## 🔐 Security (summary)

- **Passwords**: bcrypt cost 12
- **Tokens**: JWT 7d, httpOnly, secure, sameSite lax cookies
- **Auth**: Middleware protects `/dashboard`, `/editor`, `/settings`
- **Authorization**: `requireAuth()` + ownership checks in each action
- **Data**: explicit `select` — never expose `password_hash` or `refresh_token`
- **Secrets**: only via `process.env` — `.env` in `.gitignore`

---

## 📦 Modern stack (2024+)

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Next.js 15 (App Router) | RSC, Server Actions, streaming |
| UI | React 19 + Tailwind 4 | Performance, DX, bundle size |
| DB | Prisma + PostgreSQL | Type‑safe, migrations, relations |
| Auth | JWT + bcrypt (custom) | No vendor lock‑in, full control |
| Editor | Monaco Editor | VS Code experience in browser |
| Validation | Zod 4 | Schema‑first, type inference |
| Themes | CSS variables + localStorage | No flash, system‑aware |

---

## 🛠️ Useful scripts

```bash
npm run dev          # Development with Turbopack
npm run build        # Production build (prisma generate + next build)
npm run start        # Production server
npm run lint         # ESLint 9 flat config
npm run contract:emit # Prisma contract for cross‑service type safety
```

---

## 🌲 Production deployment (free)

### Option A: Vercel + Neon (recommended)

1. Push to GitHub  
2. Import into Vercel  
3. Create DB on [Neon](https://neon.tech) (free serverless PostgreSQL)  
4. Add `DATABASE_URL` and `NEXTAUTH_SECRET` as environment variables in Vercel  
5. Deploy → 🎉  

### Option B: Railway / Render / Fly.io

- Same idea: container + managed PostgreSQL  
- `DATABASE_URL` internal, `NEXTAUTH_SECRET` generated  

> **Generate a secure secret:**  
> ```bash
> openssl rand -base64 32
> ```

---

## 🤝 Contributing

```bash
# 1. Fork & clone
# 2. Create a descriptive branch
git checkout -b feature/mi-feature

# 3. Make changes, run manual tests
npm run lint && npm run build

# 4. PR with clear description
```

Ideas welcome:

- [ ] Rate limiting on auth  
- [ ] Email verification (Resend/SendGrid)  
- [ ] Real‑time collaboration (WebSockets/Yjs)  
- [ ] Project templates (React, Vue, Svelte, Astro…)  
- [ ] Deploy to Netlify/Vercel from UI  
- [ ] Tests (Vitest + Playwright)

---

## 📄 License

**MIT** — Use, modify, commercialize.  
Keep copyright and license.

---

## 🙌 Credits

- [Next.js](https://nextjs.org/) — The framework that makes it possible  
- [Prisma](https://www.prisma.io/) — Unmatched DB DX  
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code in the browser  
- [Tailwind CSS](https://tailwindcss.com/) — Utility‑first that scales  
- [Zod](https://zod.dev/) — Validation without pain  
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js/) — Proper hashing  

---

## ⭐ Like it?

**Star it on GitHub** — helps more devs find it.

[![GitHub stars](https://img.shields.io/github/stars/TU_USUARIO/wolfmain?style=social)](https://github.com/TU_USUARIO/wolfmain/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/TU_USUARIO/wolfmain?style=social)](https://github.com/TU_USUARIO/wolfmain/network/members)

---

> **Wolfmain** — *Because writing code should be as easy as having an idea.*