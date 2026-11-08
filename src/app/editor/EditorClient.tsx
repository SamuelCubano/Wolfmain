"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorClient() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const { resolved } = useTheme();

  const [code, setCode] = useState("<h1>Hola mundo</h1>\n<p>Escribe tu HTML aquí.</p>");
  const [wrap, setWrap] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dev-wrap") === "1";
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    localStorage.setItem("dev-wrap", wrap ? "1" : "0");
  }, [wrap]);

  useEffect(() => {
    if (iframeRef.current) {
      let html = code.replace(/\bsrc\s*"/g, 'src="').replace(/\bhref\s*"/g, 'href="');
      const base = window.location.href.replace(/[^/]*$/, "");
      if (!/<base\s/i.test(html)) {
        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(/<head[^>]*>/i, (m) => m + `<base href="${base}">`);
        } else {
          html = `<base href="${base}">\n` + html;
        }
      }
      iframeRef.current.srcdoc = html;
    }
  }, [code]);

  const isDark = resolved === "dark";

  return (
    <main className="flex-1 app-bg">
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold tracking-tight">Editor en vivo</h1>
            {projectId && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                Proyecto {projectId.slice(0, 8)}…
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/dashboard" className="btn btn-ghost !py-1.5 text-sm">
              Mis proyectos
            </Link>
            <button onClick={() => setWrap(!wrap)} className="btn btn-ghost !py-1.5 text-sm">
              Wrap: {wrap ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
              </span>
              <span className="text-xs font-semibold muted uppercase tracking-wide">Editor</span>
            </div>
            <div className="h-[55vh] lg:h-[72vh]">
              <MonacoEditor
                height="100%"
                defaultLanguage="html"
                theme={isDark ? "vs-dark" : "light"}
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{ wordWrap: wrap ? "on" : "off", automaticLayout: true, minimap: { enabled: false }, fontSize: 14, padding: { top: 12 } }}
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
              </span>
              <span className="text-xs font-semibold muted uppercase tracking-wide">Vista previa</span>
            </div>
            <div className="h-[55vh] lg:h-[72vh] p-2 bg-slate-50 dark:bg-slate-900/40">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0 rounded-xl bg-white shadow-sm"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
