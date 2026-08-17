import { useCallback, useLayoutEffect, useRef } from "react";

export default function useFlipList(items, duration = 380) {
  const elementsRef = useRef(new Map());
  const positionsRef = useRef(new Map());

  const registerItem = useCallback((id, node) => {
    if (node) elementsRef.current.set(id, node);
    else elementsRef.current.delete(id);
  }, []);

  const capturePositions = useCallback(() => {
    positionsRef.current = new Map(
      [...elementsRef.current].map(([id, element]) => [id, element.getBoundingClientRect()])
    );
  }, []);

  useLayoutEffect(() => {
    if (!positionsRef.current.size) return;
    elementsRef.current.forEach((element, id) => {
      const previous = positionsRef.current.get(id);
      if (!previous || typeof element.animate !== "function") return;
      const current = element.getBoundingClientRect();
      const deltaY = previous.top - current.top;
      if (Math.abs(deltaY) < 1) return;
      element.animate(
        [
          { transform: `translateY(${deltaY}px)` },
          { transform: "translateY(0)" },
        ],
        { duration, easing: "cubic-bezier(.4,0,.2,1)" }
      );
    });
    positionsRef.current.clear();
  }, [duration, items]);

  return { registerItem, capturePositions };
}
