"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useT, useLocaleTag } from "@/components/locale/translate";
import type { Translate } from "@/lib/i18n";
import {
  getProjectEditorDataAction,
  createProjectFileAction,
  saveProjectFileAction,
  deleteProjectFileAction,
  renameProjectFileAction,
  getProjectHistoryAction,
  type ProjectFile,
  type FileHistoryEntry,
} from "@/app/actions/files";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type FileNode = ProjectFile & { children?: FileNode[] };
type EditorView = "code" | "split" | "preview";

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

function buildPreviewHtml(files: ProjectFile[], active: ProjectFile | null, t: Translate): string {
  const byPath = new Map(files.filter((f) => !f.is_folder).map((f) => [f.path, f]));
  const htmlFile =
    (active?.name.endsWith(".html") ? active : null) ??
    files.find((f) => !f.is_folder && f.name === "index.html") ??
    files.find((f) => !f.is_folder && f.name.endsWith(".html"));
  if (!htmlFile) {
    return `<!doctype html><html><body style="font-family:system-ui;padding:24px;color:#334155"><h3>${t("editor.emptyHtmlTitle")}</h3><p>${t("editor.emptyHtmlDesc")}</p></body></html>`;
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
  const navScript = `<script>(function(){
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function isExternal(href){
  if(/^https?:\\/\\//i.test(href)||href.startsWith('//')) return true;
  if(/^www\\./i.test(href)) return 'https://'+href;
  if(/^[a-z0-9-]+(\\.[a-z0-9-]+)+([\\/?#].*)?$/i.test(href)){
    var m = href.match(/^([^\\/?#]+)/);
    var host = (m?m[1]:href).toLowerCase();
    var last = host.split('.').pop();
    var fileExts = {html:1,htm:1,css:1,js:1,mjs:1,cjs:1,json:1,md:1,txt:1,svg:1,png:1,jpg:1,jpeg:1,gif:1,webp:1,ico:1,map:1,xml:1,ts:1,tsx:1,jsx:1};
    if(!fileExts[last]) return 'https://'+href;
  }
  return false;
}
function showExternalOverlay(href){
  var existing=document.getElementById('__wolf_ext_overlay'); if(existing) existing.remove();
  var dest=String(href||'');
  if(!/^https?:\\/\\//i.test(dest)&&!dest.startsWith('//')) dest='https://'+dest.replace(/^\\/*/,'');
  var wrap=document.createElement('div');
  wrap.id='__wolf_ext_overlay';
  wrap.innerHTML=''
    +'<div style="position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.55);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif">'
    +'<div style="width:min(720px,100%);background:#0b0b0b;color:#fafafa;border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.55);overflow:hidden">'
    +'<div style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.04),transparent)">'
    +'<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:rgba(16,185,129,.18);color:#34d399;font-weight:700">✓</span>'
    +'<span style="font-size:13px;font-weight:600;letter-spacing:.01em">'+esc(t("editor.externalTitle"))+'</span>'
    +'</div>'
    +'<div style="padding:20px 18px 8px">'
    +'<p style="margin:0 0 10px;font-size:18px;line-height:1.35;font-weight:600;color:#fff">'+esc(t("editor.externalDesc"))+'</p>'
    +'<p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:rgba(255,255,255,.72)">'+esc(t("editor.externalInfo"))+'</p>'
    +'<div style="margin:0 0 6px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;color:#a7f3d0;word-break:break-all">'+esc(dest)+'</div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;justify-content:flex-end;padding:14px 18px 18px">'
    +'<button id="__wolf_ext_back" style="appearance:none;border:1px solid rgba(255,255,255,.16);background:#fff;color:#111;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer">'+esc(t("editor.externalBack"))+'</button>'
    +'</div></div></div>';
  document.body.appendChild(wrap);
  var back=document.getElementById('__wolf_ext_back');
  if(back) back.addEventListener('click',function(){ wrap.remove(); });
  wrap.addEventListener('click',function(e){ if(e.target===wrap.firstChild) wrap.remove(); });
}
const send=(path)=>{try{parent.postMessage({type:'wolf-preview-nav',path:String(path||'')},'*')}catch(e){}};
document.addEventListener('click',function(e){
  const a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  if(!a) return;
  const href=(a.getAttribute('href')||'').trim();
  if(!href||href.startsWith('#')||href.startsWith('javascript:')||href.startsWith('mailto:')||href.startsWith('tel:')) return;
  var ext=isExternal(href);
  if(ext){ e.preventDefault(); e.stopPropagation(); showExternalOverlay(ext===true?href:ext); return; }
  e.preventDefault();
  send(href);
},true);
})();</script>`;
  if (/<\/body\s*>/i.test(html)) html = html.replace(/<\/body\s*>/i, `${navScript}\n</body>`);
  else html += `\n${navScript}`;
  return html;
}

export default function EditorClient({ projectId }: { projectId: string | null }) {
  const { resolved } = useTheme();
  const t = useT();
  const locale = useLocaleTag();
  const isDark = resolved === "dark";
  const [projectName, setProjectName] = useState<string | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<string>("");
  const [statusTone, setStatusTone] = useState<"muted" | "ok" | "err">("muted");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState<null | { parentId: string | null; folder: boolean }>(null);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [wrap, setWrap] = useState(false);
  const [wrapReady, setWrapReady] = useState(false);
  const [view, setView] = useState<EditorView>("split");
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [history, setHistory] = useState<FileHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<{ message: string; at: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingProject, startProjectLoad] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSuccessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeFile = useMemo(() => files.find((f) => f.id === activeId && !f.is_folder) ?? null, [files, activeId]);
  const tree = useMemo(() => buildTree(files), [files]);
  const showExplorer = !!projectId;

  const setNotice = useCallback((msg: string, tone: "muted" | "ok" | "err" = "muted") => {
    setStatus(msg);
    setStatusTone(tone);
  }, []);

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

  const refreshHistory = useCallback(async (pid: string) => {
    setHistoryLoading(true);
    const res = await getProjectHistoryAction(pid);
    if (res.entries) setHistory(res.entries);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    startProjectLoad(async () => {
      setNotice("", "muted");
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
        const hist = await getProjectHistoryAction(projectId);
        if (!cancelled && hist.entries) setHistory(hist.entries);
      } catch (e: unknown) {
        if (!cancelled) setNotice(e instanceof Error ? e.message : t("editor.loadingProject"), "err");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, startProjectLoad, refreshHistory, setNotice, t]);

  useEffect(() => {
    if (!projectId) return;
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const data = e.data as { type?: string; path?: string } | null;
      if (!data || data.type !== "wolf-preview-nav") return;
      const raw = (data.path || "").trim();
      if (!raw || /^https?:\/\//i.test(raw) || raw.startsWith("//")) return;
      const clean = raw.split("#")[0].split("?")[0].replace(/\\/g, "/");
      const baseDir = (activeFile?.path || "/").replace(/\/[^/]*$/, "") || "/";
      const joined = clean.startsWith("/") ? clean : `${baseDir}/${clean}`.replace(/\/+/g, "/");
      const parts: string[] = [];
      for (const seg of joined.split("/")) {
        if (!seg || seg === ".") continue;
        if (seg === "..") parts.pop();
        else parts.push(seg);
      }
      const normalized = "/" + parts.join("/");
      const target = files.find(
        (f) =>
          !f.is_folder &&
          (f.path === normalized || f.name === clean || f.path.endsWith("/" + clean.replace(/^\.\//, "")))
      );
      if (target) setActiveId(target.id);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [projectId, files, activeFile]);

  useEffect(() => {
    return () => {
      if (saveSuccessTimer.current) clearTimeout(saveSuccessTimer.current);
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      if (projectId) iframeRef.current.srcdoc = buildPreviewHtml(files, activeFile, t);
      else {
        const solo = files[0]?.content ?? activeFile?.content ?? t("editor.sampleHtml");
        iframeRef.current.srcdoc = solo;
      }
    }
  }, [files, activeFile, projectId, t]);

  const onChangeCode = useCallback(
    (value: string) => {
      if (!activeId) return;
      setFiles((prev) => prev.map((f) => (f.id === activeId ? { ...f, content: value } : f)));
      if (projectId) setDirtyIds((prev) => new Set(prev).add(activeId));
    },
    [activeId, projectId]
  );

  const commitSave = useCallback(async () => {
    if (!projectId || !activeFile) return;
    const message = commitMessage.trim();
    if (!message) {
      setNotice(t("editor.writeMessage"), "err");
      return;
    }
    const content = activeFile.content ?? "";
    const fileId = activeFile.id;
    startTransition(async () => {
      setNotice(`${t("editor.saving")}`, "muted");
      const res = await saveProjectFileAction({
        projectId,
        fileId,
        content,
        recordHistory: true,
        commitMessage: message,
      });
      if (res?.error) {
        setNotice(res.error, "err");
        return;
      }
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
      setSaveOpen(false);
      setCommitMessage("");
      setNotice(t("editor.savedOk"), "ok");
      const at = Date.now();
      setSaveSuccess({ message, at });
      if (saveSuccessTimer.current) clearTimeout(saveSuccessTimer.current);
      saveSuccessTimer.current = setTimeout(() => {
        setSaveSuccess((current) => (current?.at === at ? null : current));
      }, 4200);
      void refreshHistory(projectId);
    });
  }, [projectId, activeFile, commitMessage, refreshHistory, setNotice, t]);

  async function handleCreate() {
    if (!projectId || !creating) return;
    const name = newName.trim();
    if (!name) return;
    setNotice("", "muted");
    startTransition(async () => {
      const res = await createProjectFileAction({
        projectId,
        name,
        parentId: creating.parentId,
        isFolder: creating.folder,
      });
      if (res.error) setNotice(res.error, "err");
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
    if (!confirm(t("editor.confirmDelete", { type: file.is_folder ? t("editor.folder") : t("editor.file"), name: file.name }))) return;
    startTransition(async () => {
      const res = await deleteProjectFileAction({ projectId, fileId: file.id });
      if (res.error) setNotice(res.error, "err");
      else {
        setFiles((prev) =>
          prev.filter((f) => f.id !== file.id && f.parent_id !== file.id && !f.path.startsWith(file.path + "/"))
        );
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
      if (res.error) setNotice(res.error, "err");
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
          className={`group flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm cursor-pointer select-none transition ${
            isActive
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={() => {
            if (node.is_folder) toggleFolder(node.id);
            else {
              setActiveId(node.id);
              if (typeof window !== "undefined" && window.innerWidth < 1024) setExplorerOpen(false);
            }
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
              className="flex-1 min-w-0 rounded bg-white dark:bg-slate-900 border border-emerald-500/40 px-1 py-0.5 text-xs outline-none"
            />
          ) : (
            <span className="flex-1 truncate" title={node.path}>
              {node.name}
              {isDirty ? <span className="ml-1 text-emerald-500">•</span> : null}
            </span>
          )}
          {projectId && !isRenaming && (
            <span className="flex lg:hidden lg:group-hover:flex items-center gap-0.5">
              {node.is_folder && (
                <button
                  title={t("editor.newFileTitle")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFolders((s) => new Set(s).add(node.id));
                    setCreating({ parentId: node.id, folder: false });
                    setNewName("");
                  }}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                >
                  +
                </button>
              )}
              <button
                title={t("editor.rename")}
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(node.id);
                  setRenameValue(node.name);
                }}
                className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
              >
                ✎
              </button>
              <button
                title={t("editor.deleteTitle")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(node);
                }}
                className="px-1.5 py-0.5 rounded text-red-500 hover:bg-red-500/10 text-xs"
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
              placeholder={creating.folder ? t("editor.folderNamePlaceholder") : t("editor.fileNamePlaceholder")}
              className="w-full rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/40 px-2 py-1.5 text-xs outline-none"
            />
          </div>
        )}
      </div>
    );
  }

  const canSave = !!projectId && !!activeFile && dirtyIds.has(activeFile.id);
  const statusClass =
    statusTone === "ok" ? "text-emerald-600 dark:text-emerald-400" : statusTone === "err" ? "text-red-600 dark:text-red-400" : "muted";

  return (
    <main className="flex-1 app-bg flex flex-col min-h-0">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
            {showExplorer && (
              <button
                onClick={() => setExplorerOpen((v) => !v)}
                className="btn btn-ghost !py-1.5 !px-2.5 text-sm lg:hidden"
                aria-label={t("editor.explorer")}
              >
                ☰
              </button>
            )}
            <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
              {projectName ? projectName : t("editor.quick")}
            </h1>
            {projectId ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {t("editor.project")}
              </span>
            ) : (
              <span className="text-[11px] muted">{t("editor.notSavedToCloud")}</span>
            )}
            {canSave && <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{t("editor.unsavedChanges")}</span>}
            {status && <span className={`text-[11px] ${statusClass}`}>{status}</span>}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900">
              {([
                ["code", t("editor.view.code")],
                ["split", t("editor.view.split")],
                ["preview", t("editor.view.preview")],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition ${
                    view === id ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setWrap(!wrap)} className="btn btn-ghost !py-1.5 text-xs sm:text-sm" suppressHydrationWarning>
              Wrap: {wrap ? "ON" : "OFF"}
            </button>
            {projectId && (
              <>
                <button
                  onClick={async () => {
                    const next = !historyOpen;
                    setHistoryOpen(next);
                    if (next) await refreshHistory(projectId);
                  }}
                  className="btn btn-ghost !py-1.5 text-xs sm:text-sm"
                >
                  {t("editor.history")}
                </button>
                <button
                  onClick={() => setSaveOpen(true)}
                  disabled={!activeFile || isPending}
                  className="btn btn-primary !py-1.5 text-xs sm:text-sm"
                >
                  {t("editor.saveChanges")}
                </button>
              </>
            )}
            <Link href="/dashboard" className="btn btn-ghost !py-1.5 text-xs sm:text-sm">
              {t("editor.exitToDashboard")}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-2 sm:p-4 relative">
        <div
          className={`grid gap-2 sm:gap-4 h-[calc(100dvh-11.5rem)] min-h-[420px] ${
            showExplorer
              ? view === "split"
                ? "grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)]"
                : "grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]"
              : view === "split"
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
          }`}
        >
          {showExplorer && (
            <aside
              className={`${explorerOpen ? "flex" : "hidden lg:flex"} card overflow-hidden flex-col min-h-0 absolute inset-x-2 top-2 bottom-2 z-20 lg:static lg:z-auto`}
            >
              <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold muted uppercase tracking-wider">{t("editor.explorer")}</span>
                <div className="flex gap-1">
                  <button
                    title={t("editor.newFileTitle")}
                    onClick={() => {
                      setCreating({ parentId: null, folder: false });
                      setNewName("");
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t("editor.newFileShort")}
                  </button>
                  <button
                    title={t("editor.newFolder")}
                    onClick={() => {
                      setCreating({ parentId: null, folder: true });
                      setNewName("");
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t("editor.newFolderShort")}
                  </button>
                  <button onClick={() => setExplorerOpen(false)} className="lg:hidden text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {t("editor.close")}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {loadingProject ? (
                  <p className="text-sm muted px-2 py-3">{t("editor.loadingFiles")}</p>
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
                          placeholder={creating.folder ? t("editor.folderNamePlaceholder") : t("editor.fileNamePlaceholder")}
                          className="w-full rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/40 px-2 py-1.5 text-xs outline-none"
                        />
                      </div>
                    )}
                    {!loadingProject && files.length === 0 && !creating && (
                      <p className="text-sm muted px-2 py-3">{t("editor.noFiles")}</p>
                    )}
                  </>
                )}
              </div>
            </aside>
          )}

          {(view === "code" || view === "split") && (
            <section className="card overflow-hidden flex flex-col min-h-0">
              <div className="px-3 sm:px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold muted uppercase tracking-wide truncate">
                  {activeFile ? activeFile.path : t("editor.editor")}
                </span>
                {dirtyIds.has(activeFile?.id || "") && <span className="text-[10px] text-amber-600 dark:text-amber-400">{t("editor.unsaved")}</span>}
                {isPending && <span className="text-[10px] muted">…</span>}
              </div>
              <div className="flex-1 min-h-0">
                {projectId && !activeFile && !loadingProject ? (
                  <div className="h-full flex items-center justify-center p-6 text-center">
                    <div>
                      <p className="font-semibold mb-1">{t("editor.selectFile")}</p>
                      <p className="text-sm muted">{t("editor.selectFileDesc")}</p>
                    </div>
                  </div>
                ) : (
                  <MonacoEditor
                    height="100%"
                    language={projectId ? languageFor(activeFile) : "html"}
                    theme={isDark ? "vs-dark" : "light"}
                    value={activeFile?.content ?? (projectId ? "" : t("editor.sampleHtml"))}
                    onChange={(v) => {
                      if (projectId) onChangeCode(v || "");
                      else
                        setFiles([
                          {
                            id: "local",
                            name: "index.html",
                            path: "/index.html",
                            content: v || "",
                            is_folder: false,
                            parent_id: null,
                            file_type: "html",
                            language: "html",
                            updated_at: new Date(),
                          },
                        ]);
                    }}
                    options={{
                      wordWrap: wrap ? "on" : "off",
                      automaticLayout: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      padding: { top: 12 },
                      readOnly: !!projectId && !activeFile,
                      scrollBeyondLastLine: false,
                    }}
                    loading={<div className="p-4 text-sm muted">{t("editor.loadingEditor")}</div>}
                  />
                )}
              </div>
            </section>
          )}

          {(view === "preview" || view === "split") && (
            <section className="card overflow-hidden flex flex-col min-h-0">
              <div className="px-3 sm:px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <span className="text-xs font-semibold muted uppercase tracking-wide">{t("editor.preview")}</span>
              </div>
              <div className="flex-1 min-h-0 p-2 bg-slate-100 dark:bg-slate-900">
                <iframe
                  ref={iframeRef}
                  title={t("editor.preview")}
                  className="w-full h-full border border-slate-200 dark:border-slate-800 rounded-xl bg-white"
                  sandbox="allow-scripts"
                />
              </div>
            </section>
          )}
        </div>

        {saveSuccess && (
          <div
            className="fixed right-4 bottom-4 z-[60] w-[min(420px,calc(100vw-2rem))] pointer-events-none"
            aria-live="polite"
            role="status"
          >
            <div className="pointer-events-auto rounded-2xl border border-emerald-500/25 bg-white/95 dark:bg-slate-950/95 shadow-[0_20px_60px_-20px_rgba(16,185,129,.55)] backdrop-blur-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />
              <div className="p-4 flex gap-3 items-start">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.415l-7.2 7.2a1 1 0 01-1.415 0l-3.2-3.2a1 1 0 111.415-1.414l2.492 2.492 6.493-6.493a1 1 0 011.415 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{t("editor.saveSuccess")}</p>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                    {t("editor.saveSuccessDesc")}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate" title={saveSuccess.message}>
                    “{saveSuccess.message}”
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveSuccess(null)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
                  aria-label={t("editor.dismiss")}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {saveOpen && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/20">
            <div className="w-full max-w-lg card p-5 sm:p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
              <h2 className="text-lg font-bold">{t("editor.saveToHistory")}</h2>
              <p className="text-sm muted mt-1">
                {t("editor.saveToHistoryDesc")}
              </p>
              <div className="mt-4">
                <label className="text-sm font-semibold">{t("editor.changeMessage")}</label>
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  rows={4}
                  placeholder={t("editor.changeMessagePlaceholder")}
                  className="input mt-1.5 resize-y"
                  autoFocus
                />
              </div>
              {statusTone === "err" && status && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{status}</p>}
              <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button onClick={() => setSaveOpen(false)} className="btn btn-ghost">
                  {t("dashboard.cancel")}
                </button>
                <button onClick={commitSave} disabled={isPending || !commitMessage.trim()} className="btn btn-primary">
                  {isPending ? t("editor.saving") : t("editor.saveVersion")}
                </button>
              </div>
            </div>
          </div>
        )}

        {historyOpen && (
          <div className="absolute inset-y-2 right-2 sm:right-4 z-20 w-[min(420px,calc(100%-1rem))]">
            <div className="card h-full flex flex-col overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-bold">{t("editor.changeHistory")}</h2>
                  <p className="text-xs muted">{t("editor.historySubtitle")}</p>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="btn btn-ghost !py-1.5 !px-2.5 text-sm">
                  {t("editor.close")}
                </button>
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {historyLoading ? (
                  <p className="text-sm muted p-2">{t("editor.loadingHistory")}</p>
                ) : history.length === 0 ? (
                  <p className="text-sm muted p-2">{t("editor.noHistory")}</p>
                ) : (
                  history.map((h) => (
                    <article key={h.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/70 dark:bg-slate-900/50">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug">{h.commit_message || t("editor.noMessage")}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0">
                          v{h.version_number}
                        </span>
                      </div>
                      <p className="text-xs muted mt-1 truncate" title={h.file_path}>
                        {h.file_path}
                      </p>
                      <p className="text-[11px] muted mt-1">
                        {new Date(h.created_at).toLocaleString(locale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
