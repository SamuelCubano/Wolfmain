import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Producto",
    links: [
      { label: "Editor", href: "/editor" },
      { label: "Proyectos", href: "/dashboard" },
      { label: "Vista previa", href: "/editor" },
      { label: "Configuración", href: "/settings" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Crear cuenta", href: "/register" },
      { label: "Iniciar sesión", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Documentación", href: "/" },
      { label: "Plantillas", href: "/editor" },
      { label: "Estado", href: "/" },
      { label: "Novedades", href: "/" },
    ],
  },
  {
    title: "Comunidad",
    links: [
      { label: "Soporte", href: "/" },
      { label: "Feedback", href: "/" },
      { label: "Guías", href: "/" },
      { label: "Seguridad", href: "/" },
    ],
  },
];

export default function SiteFooter() {
  const year = 2026;
  return (
    <footer className="mt-auto border-t border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_86%,transparent)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Image src="/img/wolfmain-logo.png" alt="Wolfmain" width={30} height={30} className="h-[30px] w-[30px]" />
              <span className="font-semibold text-[15px] tracking-tight text-[var(--foreground)]">Wolfmain</span>
            </Link>
            <p className="text-sm muted leading-relaxed max-w-sm mb-5">
              Plataforma de desarrollo web para crear, editar y lanzar proyectos con una experiencia precisa, rápida y elegante.
            </p>
            <div className="flex items-center gap-2 text-xs muted">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--card-border)] px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                Disponible
              </span>
            </div>
          </div>
          <div className="col-span-2 md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-3.5">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm muted hover:text-[var(--foreground)] transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[var(--card-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs muted">© {year} Wolfmain. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Link href="/" className="muted hover:text-[var(--foreground)] transition-colors">Privacidad</Link>
            <Link href="/" className="muted hover:text-[var(--foreground)] transition-colors">Términos</Link>
            <Link href="/" className="muted hover:text-[var(--foreground)] transition-colors">Cookies</Link>
            <Link href="/settings" className="muted hover:text-[var(--foreground)] transition-colors">Preferencias</Link>
            <Link href="/" className="muted hover:text-[var(--foreground)] transition-colors">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}