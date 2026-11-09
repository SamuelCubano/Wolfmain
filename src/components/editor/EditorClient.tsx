"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  getProjectEditorDataAction,
  createProjectFileAction,
  saveProjectFileAction,
  deleteProjectFileAction,
  renameProjectFileAction,
  type ProjectFile,
} from "@/app/actions/files";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type FileNode = ProjectFile & { children?: FileNode[] };

function buildTree(files: ProjectFile[]): FileNode[] {
  const byId = new Map<string, FileNode>();
  for (const f of files) byId.set(f.id, { ...f, children: f.is_folder ? [] : undefined });
  const roots: FileNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      const parent = byId.get(node.parent_id)!;
      (parent.children ??= []).push(node);
    } else {
      roots.push(node);
    }
  }
  const sortNodes = (arr: FileNode[]) => {
    arr.sort((a, b) => (a.is_folder === b.is_folder ? a.name.localeCompare(b.name) : a.is_folder ? -1 : 1));
    for (const n of arr) if (n.children) sortNodes(n.children);
  };
  sortNodes(roots);
  return roots;
}

function iconFor(file: Pick<ProjectFile, "is_folder" | "name">, open?: boolean) {
  if (file.is_folder) return open ? "📂" : "📁";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "html" || ext === "htm") return "🌐";
  if (ext === "css") return "🎨";
  if (ext === "js" || ext === "jsx") return "📜";
  if (ext === "ts" || ext === "tsx") return "🧩";
  if (ext === "json") return "🧾";
  if (ext === "md") return "📝";
  return "📄";
}

function languageFor(file: ProjectFile | null): string {
  if (!file) return "html";
  if (file.language) return file.language;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "css") return "css";
  if (ext === "js" || ext === "jsx") return "javascript";
  if (ext === "ts" || ext === "tsx") return "typescript";
  if (ext === "json") return "json";
  if (ext === "md") return "markdown";
  return "plaintext";
}

function buildPreviewHtml(files: ProjectFile[], active: ProjectFile | null): string {
  const byPath = new Map(files.filter((f) => !f.is_folder).map((f) => [f.path, f]));
  const htmlFile =
    (active?.name.endsWith(".html") ? active : null) ??
    files.find((f) => !f.is_folder && f.name === "index.html") ??
    files.find((f) => !f.is_folder && f.name.endsWith(".html"));
  if (!htmlFile) {
    return `<!doctype html><html><body style="font-family:system-ui;padding:24px;color:#334155"><h3>Sin archivo HTML</h3><p>Crea un <code>index.html</code> para ver la vista previa del proyecto.</p></body></html>`;
  }
  let html = htmlFile.content || "";
  html = html.replace(/<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi, (m, href) => {
    if (/^https?:|^data:|^\/\//i.test(href)) return m;
    const key = href.startsWith("/") ? href : `/${href.replace(/^\.\//, "")}`;
    const css = byPath.get(key);
    if (css && key.endsWith(".css")) return `<style data-src="${key}">\n${css.content || ""}\n</style>`;
    return m;
  });
  html = html.replace(/<script\s+([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (m, pre, src, post) => {
    if (/^https?:|^data:|^\/\//i.test(src)) return m;
    const key = src.startsWith("/") ? src : `/${src.replace(/^\.\//, "")}`;
    const js = byPath.get(key);
    if (js && (key.endsWith(".js") || key.endsWith(".mjs"))) return `<script ${pre}${post} data-src="${key}">\n${js.content || ""}\n</script>`;
    return m;
  });
  return html;
}

export default function EditorClient({ projectId }: { projectId: string | null }) {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";
  const [projectName, setProjectName] = useState<string | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<string>("");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState<null | { parentId: string | null; folder: boolean }>(null);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [wrap, setWrap] = useState(false);
  const [wrapReady, setWrapReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingProject, startProjectLoad] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const localDrafts = useRef<Map<string, string>>(new Map());

  const activeFile = useMemo(() => files.find((f) => f.id === activeId && !f.is_folder) ?? null, [files, activeId]);
  const tree = useMemo(() => buildTree(files), [files]);

  useEffect(() => {
    startTransition(() => {
      setWrap(localStorage.getItem("dev-wrap") === "1");
      setWrapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!wrapReady) return;
    localStorage.setItem("dev-wrap", wrap ? "1" : "0");
  }, [wrap, wrapReady]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    startProjectLoad(async () => {
      setStatus("");
      try {
        const data = await getProjectEditorDataAction(projectId);
        if (cancelled) return;
        setProjectName(data.project.name);
        setFiles(data.files);
        const first =
          data.files.find((f) => !f.is_folder && f.name === "index.html") ??
          data.files.find((f) => !f.is_folder);
        setActiveId(first?.id ?? null);
        if (data.files.length === 0) {
          const created = await createProjectFileAction({ projectId, name: "index.html" });
          if (!cancelled && created.file) {
            setFiles([created.file]);
            setActiveId(created.file.id);
          }
        }
      } catch (e: unknown) {
        if (!cancelled) setStatus(e instanceof Error ? e.message : "Error cargando proyecto");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, startProjectLoad]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = projectId ? buildPreviewHtml(files, activeFile) : files[0]?.content || (activeFile?.content ?? "<h1>Hola mundo</h1>");
    }
  }, [files, activeFile, projectId]);

  const flushSave = useCallback(
    async (fileId: string, content: string) => {
      if (!projectId) return;
      setStatus("Guardando...");
      const res = await saveProjectFileAction({ projectId, fileId, content });
      if (res?.error) {
        setStatus(res.error);
      } else {
        setDirtyIds((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
        setStatus("Guardado");
        setTimeout(() => setStatus((s) => (s === "Guardado" ? "" : s)), 1500);
      }
    },
    [projectId]
  );

  const onChangeCode = useCallback(
    (value: string) => {
      if (!activeId) return;
      localDrafts.current.set(activeId, value);
      setFiles((prev) => prev.map((f) => (f.id === activeId ? { ...f, content: value } : f)));
      setDirtyIds((prev) => new Set(prev).add(activeId));
      if (projectId) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => flushSave(activeId, value), 700);
      }
    },
    [activeId, projectId, flushSave]
  );

  async function handleCreate() {
    if (!projectId || !creating) return;
    const name = newName.trim();
    if (!name) return;
    setStatus("");
    startTransition(async () => {
      const res = await createProjectFileAction({
        projectId,
        name,
        parentId: creating.parentId,
        isFolder: creating.folder,
      });
      if (res.error) setStatus(res.error);
      else if (res.file) {
        setFiles((prev) => [...prev, res.file!]);
        if (creating.folder) setOpenFolders((s) => new Set(s).add(res.file!.id));
        else setActiveId(res.file.id);
        if (creating.parentId) setOpenFolders((s) => new Set(s).add(creating.parentId!));
        setCreating(null);
        setNewName("");
      }
    });
  }

  async function handleDelete(file: ProjectFile) {
    if (!projectId) return;
    if (!confirm(`¿Eliminar ${file.is_folder ? "la carpeta" : "el archivo"} "${file.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteProjectFileAction({ projectId, fileId: file.id });
      if (res.error) setStatus(res.error);
      else {
        setFiles((prev) => prev.filter((f) => f.id !== file.id && f.parent_id !== file.id && !f.path.startsWith(file.path + "/")));
        if (activeId === file.id) setActiveId(null);
      }
    });
  }

  async function handleRename(file: ProjectFile) {
    if (!projectId) return;
    const name = renameValue.trim();
    if (!name || name === file.name) {
      setRenamingId(null);
      return;
    }
    startTransition(async () => {
      const res = await renameProjectFileAction({ projectId, fileId: file.id, name });
      if (res.error) setStatus(res.error);
      else if (res.file) {
        setFiles((prev) => prev.map((f) => (f.id === file.id ? res.file! : f)));
        setRenamingId(null);
      }
    });
  }

  function toggleFolder(id: string) {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderNode(node: FileNode, depth: number): React.ReactNode {
    const isOpen = openFolders.has(node.id);
    const isActive = node.id === activeId;
    const isDirty = dirtyIds.has(node.id);
    const isRenaming = renamingId === node.id;
    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm cursor-pointer select-none ${
            isActive
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/70"
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={() => {
            if (node.is_folder) toggleFolder(node.id);
            else setActiveId(node.id);
          }}
        >
          <span className="w-4 text-center text-xs opacity-70">{node.is_folder ? (isOpen ? "▾" : "▸") : ""}</span>
          <span>{iconFor(node, isOpen)}</span>
          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => handleRename(node)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(node);
                if (e.key === "Escape") setRenamingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 rounded bg-white/80 dark:bg-slate-900/60 border border-emerald-500/40 px-1 py-0.5 text-xs outline-none"
            />
          ) : (
            <span className="flex-1 truncate" title={node.path}>
              {node.name}
              {isDirty ? <span className="ml-1 text-emerald-500">•</span> : null}
            </span>
          )}
          {projectId && !isRenaming && (
            <span className="hidden group-hover:flex items-center gap-0.5">
              {node.is_folder && (
                <button
                  title="Nuevo archivo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFolders((s) => new Set(s).add(node.id));
                    setCreating({ parentId: node.id, folder: false });
                    setNewName("");
                  }}
                  className="px-1 rounded hover:bg-slate-300/50 dark:hover:bg-slate-700"
                >
                  +f
                </button>
              )}
              <button
                title="Renombrar"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(node.id);
                  setRenameValue(node.name);
                }}
                className="px-1 rounded hover:bg-slate-300/50 dark:hover:bg-slate-700"
              >
                ✎
              </button>
              <button
                title="Eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(node);
                }}
                className="px-1 rounded text-red-500 hover:bg-red-500/10"
              >
                ×
              </button>
            </span>
          )}
        </div>
        {node.is_folder && isOpen && node.children?.map((c) => renderNode(c, depth + 1))}
        {node.is_folder && isOpen && creating?.parentId === node.id && (
          <div style={{ paddingLeft: `${20 + (depth + 1) * 12}px` }} className="px-2 py-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setCreating(null);
              }}
              placeholder={creating.folder ? "nombre-carpeta" : "archivo.html"}
              className="w-full rounded-lg bg-white/80 dark:bg-slate-900/60 border border-emerald-500/40 px-2 py-1 text-xs outline-none"
            />
          </div>
        )}
      </div>
    );
  }

  const showExplorer = !!projectId;

  return (
    <main className="flex-1 app-bg flex flex-col min-h-0">
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/30 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2.5 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
              {projectName ? projectName : "Editor en vivo"}
            </h1>
            {projectId ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                Proyecto
              </span>
            ) : (
              <span className="text-[11px] muted">Modo rápido (sin guardar)</span>
            )}
            {status && <span className="text-[11px] muted">{status}</span>}
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/dashboard" className="btn btn-ghost !py-1.5 text-sm">Dashboard</Link>
            <button onClick={() => setWrap(!wrap)} className="btn btn-ghost !py-1.5 text-sm" suppressHydrationWarning>
              Wrap: {wrap ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-3 sm:p-4">
        <div className={`grid gap-3 sm:gap-4 h-[calc(100vh-10.5rem)] min-h-[520px] ${showExplorer ? "grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-1 lg:grid-cols-2"}`}>
          {showExplorer && (
            <aside className="card overflow-hidden flex flex-col min-h-0">
              <div className="px-3 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-[11px] font-bold muted uppercase tracking-wider">Explorador</span>
                <div className="flex gap-1">
                  <button
                    title="Nuevo archivo"
                    onClick={() => {
                      setCreating({ parentId: null, folder: false });
                      setNewName("");
                    }}
                    className="text-xs px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    + Archivo
                  </button>
                  <button
                    title="Nueva carpeta"
                    onClick={() => {
                      setCreating({ parentId: null, folder: true });
                      setNewName("");
                    }}
                    className="text-xs px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    + Carpeta
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {loadingProject ? (
                  <p className="text-sm muted px-2 py-3">Cargando archivos...</p>
                ) : (
                  <>
                    {tree.map((n) => renderNode(n, 0))}
                    {creating?.parentId === null && (
                      <div className="px-2 py-1">
                        <input
                          autoFocus
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate();
                            if (e.key === "Escape") setCreating(null);
                          }}
                          placeholder={creating.folder ? "nombre-carpeta" : "archivo.html"}
                          className="w-full rounded-lg bg-white/80 dark:bg-slate-900/60 border border-emerald-500/40 px-2 py-1 text-xs outline-none"
                        />
                      </div>
                    )}
                    {!loadingProject && files.length === 0 && !creating && (
                      <p className="text-sm muted px-2 py-3">Sin archivos. Crea uno para empezar.</p>
                    )}
                  </>
                )}
              </div>
            </aside>
          )}

          <section className="card overflow-hidden flex flex-col min-h-0">
            <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2 min-w-0">
              <span className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
              </span>
              <span className="text-xs font-semibold muted uppercase tracking-wide truncate">
                {activeFile ? activeFile.path : "Editor"}
              </span>
              {isPending && <span className="text-[10px] muted">…</span>}
            </div>
            <div className="flex-1 min-h-0">
              {projectId && !activeFile && !loadingProject ? (
                <div className="h-full flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="font-semibold mb-1">Selecciona un archivo</p>
                    <p className="text-sm muted">Elige un archivo del explorador o crea uno nuevo.</p>
                  </div>
                </div>
              ) : (
                <MonacoEditor
                  height="100%"
                  language={projectId ? languageFor(activeFile) : "html"}
                  theme={isDark ? "vs-dark" : "light"}
                  value={activeFile?.content ?? (projectId ? "" : "<h1>Hola mundo</h1>\n<p>Escribe tu HTML aquí.</p>")}
                  onChange={(v) => {
                    if (projectId) onChangeCode(v || "");
                    else setFiles([{ id: "local", name: "index.html", path: "/index.html", content: v || "", is_folder: false, parent_id: null, file_type: "html", language: "html", updated_at: new Date() }]);
                  }}
                  options={{
                    wordWrap: wrap ? "on" : "off",
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 12 },
                    readOnly: !!projectId && !activeFile,
                  }}
                  loading={<div className="p-4 text-sm muted">Cargando editor…</div>}
                />
              )}
            </div>
          </section>

          <section className="card overflow-hidden flex flex-col min-h-0">
            <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
              </span>
              <span className="text-xs font-semibold muted uppercase tracking-wide">Vista previa</span>
            </div>
            <div className="flex-1 min-h-0 p-2 bg-slate-50 dark:bg-slate-900/40">
              <iframe
                ref={iframeRef}
                title="Vista previa"
                className="w-full h-full border-0 rounded-xl bg-white shadow-sm"
                sandbox="allow-scripts"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
