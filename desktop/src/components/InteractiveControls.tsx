import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export interface SquishSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  trackColor?: string;
  trackOnColor?: string;
  thumbColor?: string;
  thumbOnColor?: string;
  width?: number;
  height?: number;
  radius?: number;
  speed?: number;
  stretch?: number;
  hoverScale?: number;
  colorDuration?: number;
  className?: string;
  id?: string;
}

export function SquishSwitch({
  checked,
  onChange,
  label,
  ariaLabel,
  trackColor = "#252630",
  trackOnColor = "#373544",
  thumbColor = "#f2f1ed",
  thumbOnColor = "#ff5875",
  width = 56,
  height = 30,
  radius = 18,
  speed = 52,
  stretch = 20,
  hoverScale = 1.035,
  colorDuration = 500,
  className = "",
  id,
}: SquishSwitchProps) {
  const autoId = useId();
  const buttonId = id ?? autoId;
  const reduced = useReducedMotion();
  const inset = Math.max(3, Math.round(height * 0.12));
  const thumbSize = height - inset * 2;
  const end = width - thumbSize - inset * 2;

  return (
    <span className={`squish-switch-wrap ${className}`.trim()}>
      {label && <label htmlFor={buttonId}>{label}</label>}
      <button
        id={buttonId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        className="squish-switch"
        style={{
          "--switch-width": `${width}px`,
          "--switch-height": `${height}px`,
          "--switch-radius": `${Math.min(radius, height / 2)}px`,
          "--switch-inset": `${inset}px`,
          "--switch-thumb": `${thumbSize}px`,
          "--switch-track": checked ? trackOnColor : trackColor,
          "--switch-thumb-color": checked ? thumbOnColor : thumbColor,
          "--switch-color-time": `${reduced ? 1 : colorDuration}ms`,
        } as CSSProperties}
        onClick={() => onChange(!checked)}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            event.currentTarget.style.setProperty("--switch-hover-scale", String(hoverScale));
          }
        }}
        onPointerLeave={(event) => event.currentTarget.style.removeProperty("--switch-hover-scale")}
      >
        <motion.span
          className="squish-switch-thumb"
          aria-hidden="true"
          animate={{ x: checked ? end : 0, scaleX: reduced ? 1 : [1, 1 + Math.min(0.14, stretch / 300), 1] }}
          transition={reduced ? { duration: 0 } : { x: { type: "spring", stiffness: 300 + speed, damping: 29, mass: 0.52 }, scaleX: { duration: 0.35 } }}
        />
      </button>
    </span>
  );
}

export interface RubberSegmentProps {
  items: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, index: number) => void;
  trackColor?: string;
  thumbColor?: string;
  textColor?: string;
  activeTextColor?: string;
  size?: "sm" | "md" | "lg";
  radius?: number;
  inset?: number;
  stretch?: number;
  squash?: number;
  speed?: number;
  glide?: number;
  draggable?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function RubberSegment({
  items,
  value,
  defaultValue,
  onChange,
  trackColor = "#18191f",
  thumbColor = "#e9e9ed",
  textColor = "#9899a6",
  activeTextColor = "#16171d",
  size = "md",
  radius = 11,
  inset = 3,
  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,
  draggable = true,
  ariaLabel = "Choose period",
  className = "",
}: RubberSegmentProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue ?? items[0] ?? "");
  const current = value ?? inner;
  const selected = Math.max(0, items.indexOf(current));
  const commit = (index: number) => {
    const next = items[index];
    if (next === undefined) return;
    if (value === undefined) setInner(next);
    onChange?.(next, index);
  };
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? Math.min(last, index + 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? Math.max(0, index - 1)
        : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (next >= 0) { event.preventDefault(); commit(next); document.getElementById(`${id}-${next}`)?.focus(); }
  };

  return (
    <div
      className={`rubber-segment rubber-segment-${size} ${className}`.trim()}
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        "--segment-track": trackColor,
        "--segment-thumb": thumbColor,
        "--segment-text": textColor,
        "--segment-active-text": activeTextColor,
        "--segment-radius": `${radius}px`,
        "--segment-inset": `${inset}px`,
        "--segment-spring": `${speed}`,
        "--segment-glide": `${glide}ms`,
        "--segment-stretch": `${stretch}`,
        "--segment-squash": `${squash}`,
        "--segment-count": items.length,
      } as CSSProperties}
    >
      <motion.span className="rubber-segment-thumb" animate={{ x: `${selected * 100}%` }} transition={{ type: "spring", stiffness: 470, damping: 35, mass: 0.7 }} aria-hidden="true" />
      {items.map((item, index) => (
        <button
          id={`${id}-${index}`}
          key={item}
          type="button"
          role="radio"
          aria-checked={item === current}
          tabIndex={item === current ? 0 : -1}
          className={item === current ? "is-active" : ""}
          onClick={() => commit(index)}
          onKeyDown={(event) => keyDown(event, index)}
          data-draggable={draggable ? "true" : "false"}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export interface GlideSelectOption {
  value: string;
  label: ReactNode;
  tag?: string;
}
export interface GlideSelectProps {
  options: (string | GlideSelectOption)[];
  value: string;
  onChange: (value: string, option: GlideSelectOption) => void;
  placeholder?: string;
  showTags?: boolean;
  accentColor?: string;
  surfaceColor?: string;
  highlightColor?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  radius?: number;
  menuWidth?: number;
  placement?: "top" | "bottom";
  align?: "left" | "right";
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}

const normalizeOption = (option: string | GlideSelectOption): GlideSelectOption =>
  typeof option === "string" ? { value: option, label: option } : option;

export function GlideSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  showTags = true,
  accentColor = "#a8aaff",
  surfaceColor = "#171820",
  highlightColor = "#313342",
  textColor = "#f2f1ed",
  size = "md",
  radius = 10,
  menuWidth = 210,
  placement = "bottom",
  align = "left",
  ariaLabel,
  className = "",
  disabled = false,
}: GlideSelectProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(0, options.map(normalizeOption).findIndex((item) => item.value === value)));
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const normalized = options.map(normalizeOption);
  const selected = Math.max(0, normalized.findIndex((option) => option.value === value));
  const sizeMap = { sm: 32, md: 38, lg: 44 };
  const menuHeight = Math.min(300, normalized.length * 38 + 8);

  const updatePosition = useCallback(() => {
    if (!trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const side = placement === "bottom" && window.innerHeight - rect.bottom < menuHeight + 16 ? "top"
      : placement === "top" && rect.top < menuHeight + 16 ? "bottom" : placement;
    const top = side === "bottom" ? rect.bottom + 7 : rect.top - menuHeight - 7;
    const left = align === "right" ? rect.right - menuWidth : rect.left;
    setPosition({
      top: Math.max(8, Math.min(window.innerHeight - menuHeight - 8, top)),
      left: Math.max(8, Math.min(window.innerWidth - menuWidth - 8, left)),
    });
  }, [align, menuHeight, menuWidth, placement]);
  useLayoutEffect(() => { if (open) updatePosition(); }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const choose = (index: number) => {
    const option = normalized[index];
    if (!option) return;
    onChange(option.value, option);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  const handleKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" || event.key === "Tab") { setOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) { setActive(selected); setOpen(true); return; }
      setActive((index) => (index + (event.key === "ArrowDown" ? 1 : normalized.length - 1)) % normalized.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) setOpen(true); else choose(active);
    } else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(normalized.length - 1); }
  };

  return (
    <div ref={root} className={`glide-select glide-select-${size} ${className}`.trim()} style={{ "--glide-accent": accentColor, "--glide-surface": surfaceColor, "--glide-highlight": highlightColor, "--glide-text": textColor, "--glide-radius": `${radius}px`, "--glide-height": `${sizeMap[size]}px` } as CSSProperties}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        disabled={disabled}
        className="glide-select-trigger"
        onClick={() => { setActive(selected); setOpen((current) => !current); }}
        onKeyDown={handleKeys}
      >
        <span>{normalized[selected]?.label ?? placeholder}</span>
        <ChevronDown size={15} className={open ? "is-open" : ""} aria-hidden="true" />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popup}
              className="glide-select-menu"
              style={{ top: position.top, left: position.left, width: menuWidth, borderRadius: radius, background: surfaceColor, color: textColor } as CSSProperties}
              initial={{ opacity: 0, y: -5, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              role="listbox"
              id={`${id}-options`}
              aria-label={ariaLabel}
            >
              {normalized.map((option, index) => (
                <button key={option.value} type="button" role="option" aria-selected={index === selected} className={index === active ? "is-active" : ""} onPointerEnter={() => setActive(index)} onClick={() => choose(index)}>
                  <span>{option.label}</span>
                  {showTags && option.tag && <small>{option.tag}</small>}
                  {index === selected && <Check size={14} aria-hidden="true" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
