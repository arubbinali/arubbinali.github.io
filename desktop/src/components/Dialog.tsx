import { X } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
export const DialogFeedback = createContext("");
export function Dialog({
  title,
  onClose,
  children,
  wide = false,
  closing = false,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  closing?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const error = useContext(DialogFeedback);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog${wide ? " wide" : ""}${closing ? " closing" : ""} ${className}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </header>
      {error && (
        <p className="warning" role="alert">
          {error}
        </p>
      )}
      {children}
    </dialog>
  );
}
