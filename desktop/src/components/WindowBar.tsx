import { getCurrentWindow } from "@tauri-apps/api/window";
import { ChevronLeft, ChevronRight, Minus, PanelLeft, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { native } from "../api";

interface WindowBarProps {
  sidebarOpen?: boolean; canGoBack?: boolean; canGoForward?: boolean;
  onToggleSidebar?: () => void; onBack?: () => void; onForward?: () => void;
  onAddProject?: () => void; onSettings?: () => void; onHome?: () => void;
  onAbout?: () => void; onExit?: () => void; onZen?: () => void; onReset?: () => void;
  zen?: boolean;
}
export function WindowBar(props: WindowBarProps) {
  const [menu, setMenu] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openMenu = (name: string) => { clearTimeout(closeTimer.current); setClosing(false); setMenu(name); };
  const closeMenu = () => { setClosing(true); clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => { setMenu(null); setClosing(false); }, 140); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const root = useRef<HTMLElement>(null);
  const run = (action: "minimize" | "toggleMaximize" | "close") => {
    if (native) void getCurrentWindow()[action]().catch(console.error);
  };
  const menus = [
    {name: "File", items: [["Add project", props.onAddProject], ["Settings", props.onSettings], ["Exit", props.onExit]]},
    {name: "View", items: [[props.sidebarOpen ? "Compact navigation" : "Expand navigation", props.onToggleSidebar],
      [props.zen ? "Leave Zen mode" : "Zen mode", props.onZen], ["Reset view", props.onReset],
      ["Focus assistant", props.onHome], ["Fullscreen", () => { if (native) void getCurrentWindow().isFullscreen().then(v => getCurrentWindow().setFullscreen(!v)); }]]},
    {name: "Help", items: [["About Doaorel", props.onAbout]]}
  ] as {name:string; items:[string, (() => void) | undefined][]}[];
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (!root.current?.querySelector(".window-menus")?.contains(e.target as Node)) closeMenu(); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape" && menu) { e.preventDefault(); closeMenu(); root.current?.querySelector<HTMLButtonElement>(`[data-menu="${menu}"]`)?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [menu]);
  return <header ref={root} className="window-bar" data-tauri-drag-region>
    <div className="window-navigation">
      <button aria-label={props.sidebarOpen ? "Compact navigation" : "Expand navigation"} title="Toggle sidebar · Ctrl B" onClick={props.onToggleSidebar}><PanelLeft size={15}/></button>
      <button aria-label="Go back" disabled={!props.canGoBack} onClick={props.onBack}><ChevronLeft size={16}/></button>
      <button aria-label="Go forward" disabled={!props.canGoForward} onClick={props.onForward}><ChevronRight size={16}/></button>
    </div>
    <nav className="window-menus" aria-label="Application menu" onMouseLeave={() => { if (!root.current?.querySelector(".window-menu-popover:focus-within")) closeMenu(); }}>
      {menus.map((entry, i) => <div className="window-menu" key={entry.name} onMouseEnter={() => openMenu(entry.name)}>
        <button className="window-menu-trigger" data-menu={entry.name} aria-haspopup="menu" aria-expanded={menu === entry.name}
          onClick={() => openMenu(entry.name)}
          onKeyDown={e => {
            if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); setMenu(entry.name); requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>(".window-menu-popover button")?.focus()); }
            if (["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); const name = menus[(i + (e.key === "ArrowRight" ? 1 : 2)) % 3].name; setMenu(name); root.current?.querySelector<HTMLButtonElement>(`[data-menu="${name}"]`)?.focus(); }
          }}>{entry.name}</button>
        {menu === entry.name && <div className={`window-menu-popover ${closing ? "menu-closing" : ""}`} role="menu" inert={closing} onKeyDown={e => {
          const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); buttons[(index + (e.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length]?.focus(); }
          if (e.key === "Tab") setMenu(null);
        }}>
          {entry.items.map(([label, action]) => <button role="menuitem" key={label} onClick={() => { clearTimeout(closeTimer.current); setMenu(null); setClosing(false); action?.(); }}>{label}</button>)}
        </div>}
      </div>)}
    </nav>
    <div className="window-drag" data-tauri-drag-region onDoubleClick={() => run("toggleMaximize")}/>
    {native && <div className="window-controls">
      <button aria-label="Minimize window" onClick={() => run("minimize")}><Minus size={13}/></button>
      <button aria-label="Maximize or restore window" onClick={() => run("toggleMaximize")}><Square size={11}/></button>
      <button className="window-close" aria-label="Close window" onClick={props.onExit}><X size={13}/></button>
    </div>}
  </header>;
}
