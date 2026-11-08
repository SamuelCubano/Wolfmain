"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorPage() {
  const [code, setCode] = useState("<h1>Hola mundo</h1>\n<p>Escribe tu HTML aquí.</p>");
  const [dark, setDark] = useState(false);
  const [wrap, setWrap] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dev-theme");
    if (saved === "dark") setDark(true);
    const w = localStorage.getItem("dev-wrap");
    if (w === "1") setWrap(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("dev-theme", dark ? "dark" : "light");
  }, [dark]);

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

  return (
    <main className={`min-h-screen ${dark ? "dark bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Editor HTML en vivo</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setWrap(!wrap)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm font-medium"
            >
              Wrap: {wrap ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Editor</span>
            </div>
            <div className="h-[60vh] md:h-[70vh]">
              <MonacoEditor
                height="100%"
                defaultLanguage="html"
                theme={dark ? "vs-dark" : "light"}
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{ wordWrap: wrap ? "on" : "off", automaticLayout: true, minimap: { enabled: false } }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Vista previa</span>
            </div>
            <div className="h-[60vh] md:h-[70vh] p-2">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0 rounded-lg bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
