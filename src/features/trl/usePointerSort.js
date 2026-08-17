import { useCallback, useEffect, useRef, useState } from "react";

export default function usePointerSort({ group, onMove, ignoreSelector = "button" }) {
  const [draggingId, setDraggingId] = useState("");
  const cleanupRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => () => cleanupRef.current?.(), []);

  const beginPointerSort = useCallback((event, id) => {
    if (event.button !== 0 || event.target.closest(ignoreSelector)) return;
    cleanupRef.current?.();
    const startY = event.clientY;
    let sorting = false;
    let lastTargetId = "";

    const move = (moveEvent) => {
      if (!sorting && Math.abs(moveEvent.clientY - startY) < 7) return;
      if (!sorting) {
        sorting = true;
        setDraggingId(id);
        document.body.classList.add("trl-is-sorting");
      }
      moveEvent.preventDefault();

      const items = [...document.querySelectorAll(`[data-sortable-group="${group}"]`)];
      if (!items.length) return;
      const target = items.reduce((closest, item) => {
        const rect = item.getBoundingClientRect();
        const distance = Math.abs(moveEvent.clientY - (rect.top + (rect.height / 2)));
        return !closest || distance < closest.distance ? { item, distance } : closest;
      }, null)?.item;
      const targetId = target?.dataset.sortableId;
      if (!targetId || targetId === id || targetId === lastTargetId) return;
      lastTargetId = targetId;
      onMove(id, targetId);
    };

    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      document.body.classList.remove("trl-is-sorting");
      setDraggingId("");
      cleanupRef.current = null;
      if (sorting) {
        suppressClickRef.current = true;
        window.setTimeout(() => { suppressClickRef.current = false; }, 0);
      }
    };

    cleanupRef.current = finish;
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", finish, { once: true });
  }, [group, ignoreSelector, onMove]);

  const suppressClick = useCallback((event) => {
    if (!suppressClickRef.current) return false;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
    return true;
  }, []);

  return { draggingId, beginPointerSort, suppressClick };
}
