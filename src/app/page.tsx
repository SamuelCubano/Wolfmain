import Link from "next/link";

const features = [
  {
    icon: "✨",
    title: "Editor inteligente",
    desc: "Autocompletado, resaltado de sintaxis y una experiencia fluida para escribir HTML, CSS y JS.",
  },
  {
    icon: "⚡",
    title: "Vista previa en vivo",
    desc: "Cada cambio se refleja al instante. Itera rápido sin salir del flujo.",
  },
  {
    icon: "🎨",
    title: "Tema adaptable",
    desc: "Modo claro, oscuro o automático. Tu entorno, a tu manera.",
  },
  {
    icon: "📁",
    title: "Proyectos",
    desc: "Crea y organiza tus proyectos. Abre el editor con contexto de proyecto.",
  },
  {
    icon: "🔒",
    title: "Cuenta segura",
    desc: "Registro, inicio de sesión y gestión de perfil con sesiones protegidas.",
  },
  {
    icon: "🚀",
    title: "Listo para crecer",
    desc: "Base sólida con Next.js y base de datos para escalar funcionalidades.",
  },
];

export default function Home() {
  return (
    <main className="flex-1 app-bg">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-emerald-500/15 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Nuevo: centro de configuración y proyectos
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Crea, prueba y
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              publica al instante
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Un playground web con editor profesional, vista previa en tiempo real, cuentas de usuario
            y un centro de configuración para personalizar tu experiencia.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register" className="btn btn-primary !px-6 !py-3 text-base">
              Empezar gratis
            </Link>
            <Link href="/editor" className="btn btn-ghost !px-6 !py-3 text-base">
              Abrir editor
            </Link>
            <Link href="/dashboard" className="btn btn-ghost !px-6 !py-3 text-base">
              Mis proyectos
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group card p-6 hover:-translate-y-0.5 hover:border-emerald-500/30 transition duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-8 text-center text-sm muted">
        Wolfmain · Aprende, construye y comparte
      </footer>
    </main>
  );
}
