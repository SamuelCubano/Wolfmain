import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Dev al instante</h1>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
          Playground de código web
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
          Escribe HTML, CSS y JavaScript en un editor con resaltado de sintaxis, autocompletado y vista previa en tiempo real. Ideal para aprender, probar ideas y compartir.
        </p>
        <Link
          href="/editor"
          className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-emerald-700 transition"
        >
          Probar editor
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8">
        {[
          { title: "Editor inteligente", desc: "Autocompletado de etiquetas, cierre automático y resaltado de sintaxis." },
          { title: "Vista previa en vivo", desc: "Los cambios se reflejan al instante en el panel derecho." },
          { title: "Modo claro/oscuro", desc: "Cambia el tema cuando quieras; la vista previa siempre se ve clara." },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-xl transition"
          >
            <h3 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">{f.title}</h3>
            <p className="text-slate-600 dark:text-slate-300">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-700 py-8 text-center text-slate-500 dark:text-slate-400">
        Dev al instante · Aprende programando
      </footer>
    </main>
  );
}
