import { Folder, Home, Plus, Settings } from "lucide-react";
import { useState } from "react";

export function GooeyQuickNav({
  onHome,
  onProjects,
  onSettings,
}: {
  onHome: () => void;
  onProjects: () => void;
  onSettings: () => void;
}) {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: "Home", icon: Home, run: onHome },
    { label: "Projects", icon: Folder, run: onProjects },
    { label: "Settings", icon: Settings, run: onSettings },
  ];

  return (
    <div className={`gooey-quick-nav ${open ? "is-open" : ""}`}>
      <div className="gooey-quick-liquid">
        {actions.map(({ label, icon: Icon, run }, index) => (
          <span
            className="gooey-quick-item"
            key={label}
            style={{
              transform: open
                ? `translateX(-${(index + 1) * 38}px) scale(1)`
                : "translateX(0) scale(.7)",
              transitionDelay: `${open ? index * 35 : (actions.length - index) * 22}ms`,
            }}
          >
            <button
              type="button"
              aria-label={label}
              title={label}
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              onClick={() => {
                run();
                setOpen(false);
              }}
            >
              <Icon size={14} />
            </button>
          </span>
        ))}
        <span className="gooey-quick-item gooey-quick-toggle">
          <button
            type="button"
            aria-label={open ? "Close quick actions" : "Open quick actions"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Plus size={15} />
          </button>
        </span>
      </div>
    </div>
  );
}
