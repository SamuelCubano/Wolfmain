# Wolfmain

> **Tu playground de código en la nube.** Crea proyectos, escribe código y ve el resultado al instante. Sin configuración, sin Docker, sin complicaciones.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-0.52-007ACC?logo=visualstudiocode)](https://microsoft.github.io/monaco-editor/)

---

## ✨ Qué hace especial a Wolfmain

| Característica | Detalle |
|----------------|---------|
| **Editor Monaco real** | El mismo motor que VS Code, en el navegador |
| **Vista previa en vivo** | Cambias código → ves resultado instantáneo |
| **Historial de versiones** | Guarda snapshots con mensajes tipo git |
| **Proyectos multiarchivo** | Carpetas, HTML, CSS, JS, TS, JSON, MD... |
| **Autenticación segura** | JWT + bcrypt + cookies httpOnly |
| **Deploy en 1 click** | Vercel + Neon/Supabase = producción gratis |

---

## 🚀 Demo rápida

```bash
# 1. Clona
git clone https://github.com/TU_USUARIO/wolfmain.git
cd wolfmain

# 2. Configura variables
cp .env.example .env
# Edita .env con tu DATABASE_URL y NEXTAUTH_SECRET

# 3. Levanta BD (Docker)
docker run -d \
  --name wolfmain-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wolfmain \
  -p 5432:5432 \
  postgres:16

# 4. Instala y arranca
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) → Regístrate → Crea tu primer proyecto.

---

## 🎯 Para quién es esto

- **Devs aprendiendo** — Prueba HTML/CSS/JS sin configurar nada
- **Prototipado rápido** — Una idea → código → live en segundos
- **Entrevistas técnicas** — Comparte un link, no un zip
- **Enseñanza** — Alumnos editan, tú ves cambios en tiempo real
- **Portafolio vivo** — Tus proyectos *son* el portafolio

---

## 🏗️ Arquitectura

```
src/
├── app/
│   ├── actions/          # Server Actions (mutaciones seguras)
│   │   ├── auth.ts       # login/register/logout
│   │   ├── project.ts    # CRUD proyectos
│   │   ├── files.ts      # Archivos + historial versiones
│   │   └── profile.ts    # Perfil + cambio password
│   ├── dashboard/        # Lista proyectos (RSC)
│   ├── editor/           # Editor Monaco + preview (Client)
│   ├── settings/         # Perfil, tema, seguridad
│   └── login|register/   # Auth pages
├── components/
│   ├── editor/           # EditorClient (847 líneas de gloria)
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

## 🔐 Seguridad (resumen)

- **Passwords**: bcrypt cost 12
- **Tokens**: JWT 7d, cookies `httpOnly`, `secure`, `sameSite:lax`
- **Auth**: Middleware protege `/dashboard`, `/editor`, `/settings`
- **Autorización**: `requireAuth()` + ownership checks en cada action
- **Datos**: `select` explícito — nunca se expone `password_hash` ni `refresh_token`
- **Secrets**: Solo via `process.env` — `.env` en `.gitignore`

---

## 📦 Stack moderno (2024+)

| Capa | Tecnología | Por qué |
|------|------------|---------|
| Framework | Next.js 15 (App Router) | RSC, Server Actions, streaming |
| UI | React 19 + Tailwind 4 | Performance, DX, bundle size |
| DB | Prisma + PostgreSQL | Type-safe, migraciones, relations |
| Auth | JWT + bcrypt (custom) | Sin vendor lock-in, control total |
| Editor | Monaco Editor | VS Code experience in browser |
| Validación | Zod 4 | Schema-first, type inference |
| Temas | CSS variables + localStorage | Sin flash, system-aware |

---

## 🛠️ Scripts útiles

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build producción (prisma generate + next build)
npm run start        # Servidor producción
npm run lint         # ESLint 9 flat config
npm run contract:emit # Prisma contract para type-safety cross-service
```

---

## 🌲 Deploy en producción (gratis)

### Opción A: Vercel + Neon (recomendado)
1. Push a GitHub
2. Importa en Vercel
3. Crea BD en [Neon](https://neon.tech) (PostgreSQL serverless gratis)
4. Agrega `DATABASE_URL` y `NEXTAUTH_SECRET` en Vercel Environment Variables
5. Deploy → 🎉

### Opción B: Railway / Render / Fly.io
- Misma idea: contenedor + PostgreSQL managed
- `DATABASE_URL` interna, `NEXTAUTH_SECRET` generado

> **Genera secret seguro:**
> ```bash
> openssl rand -base64 32
> ```

---

## 🤝 Contribuir

```bash
# 1. Fork & clone
# 2. Crea branch
git checkout -b feat/mi-feature

# 3. Cambios + tests manuales
npm run lint && npm run build

# 4. PR con descripción clara
```

**Ideas bienvenidas:**
- [ ] Rate limiting en auth
- [ ] Verificación de email (Resend/SendGrid)
- [ ] Colaboración en tiempo real (WebSockets/Yjs)
- [ ] Templates de proyecto (React, Vue, Svelte, Astro...)
- [ ] Deploy a Netlify/Vercel desde la UI
- [ ] Tests (Vitest + Playwright)

---

## Contribuir

1. **Fork** el repositorio y **clone** tu copia.  
2. Crea una rama descriptiva: `git checkout -b feature/nombre`.  
3. Realiza los cambios, ejecuta `npm run lint && npm run build` y añade pruebas si son necesarias.  
4. Commitea con mensaje claro siguiendo la convención `type(scope): description`.  
5. Abre un **Pull Request** describiendo el propósito y cualquier decisión relevante.  

¡Gracias por contribuir!

---

## 📄 Licencia

**MIT** — Úsalo, modifícalo, comercialízalo.  
Solo mantén el copyright y licencia.

---

## 🙌 Créditos

- [Next.js](https://nextjs.org/) — El framework que lo hace posible
- [Prisma](https://www.prisma.io/) — DX de base de datos insuperable
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code en el navegador
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first que sí escala
- [Zod](https://zod.dev/) — Validación que no duele
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js/) — Hashing hecho bien

---

## ⭐ ¿Te gusta?

**Dale una estrella en GitHub** — ayuda a que más devs lo encuentren.

[![GitHub stars](https://img.shields.io/github/stars/TU_USUARIO/wolfmain?style=social)](https://github.com/TU_USUARIO/wolfmain/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/TU_USUARIO/wolfmain?style=social)](https://github.com/TU_USUARIO/wolfmain/network/members)

---

> **Wolfmain** — *Porque escribir código debería ser tan fácil como tener una idea.*