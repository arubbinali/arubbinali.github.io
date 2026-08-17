import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DESKTOP_BREAKPOINT = 1100;
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

function createSideSlots(ids, x, width, edge, usableHeight, gap) {
  if (!ids.length) return {};
  const height = (usableHeight - (gap * (ids.length - 1))) / ids.length;
  return Object.fromEntries(ids.map((id, index) => [id, {
    x,
    y: edge + (index * (height + gap)),
    width,
    height,
  }]));
}

function createFocusLayout(width, height, widgetIds, activeWidget) {
  if (!widgetIds.length) return {};
  const activeId = widgetIds.includes(activeWidget) ? activeWidget : widgetIds[0];
  const edge = 14;
  const gap = 14;
  const usableWidth = width - (edge * 2);
  const usableHeight = height - (edge * 2);
  const centerWidth = clamp(usableWidth * 0.48, 500, usableWidth - 540);
  const sideWidth = (usableWidth - centerWidth - (gap * 2)) / 2;
  const centerHeight = clamp(usableHeight * 0.78, 330, usableHeight);
  const centerX = edge + sideWidth + gap;
  const centerY = edge + ((usableHeight - centerHeight) / 2);
  const rightX = centerX + centerWidth + gap;
  const remaining = widgetIds.filter((id) => id !== activeId);
  const leftIds = remaining.filter((_, index) => index % 2 === 0);
  const rightIds = remaining.filter((_, index) => index % 2 === 1);

  return {
    ...createSideSlots(leftIds, edge, sideWidth, edge, usableHeight, gap),
    ...createSideSlots(rightIds, rightX, sideWidth, edge, usableHeight, gap),
    [activeId]: { x: centerX, y: centerY, width: centerWidth, height: centerHeight },
  };
}

export default function useWidgetLayout(widgetIds, expandedWidget = "") {
  const boardRef = useRef(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [activeWidget, setActiveWidgetState] = useState("calculator");

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setBounds({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) });
    });
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (widgetIds.length && !widgetIds.includes(activeWidget)) {
      setActiveWidgetState(widgetIds.includes("calculator") ? "calculator" : widgetIds[0]);
    }
  }, [activeWidget, widgetIds]);

  const setActiveWidget = useCallback((id) => {
    if (widgetIds.includes(id)) setActiveWidgetState(id);
  }, [widgetIds]);

  const layout = useMemo(() => {
    if (!bounds.width || !bounds.height || bounds.width <= DESKTOP_BREAKPOINT) return {};
    const focusedLayout = createFocusLayout(bounds.width, bounds.height, widgetIds, activeWidget);
    if (!expandedWidget || !focusedLayout[expandedWidget]) return focusedLayout;
    const edge = 24;
    return {
      ...focusedLayout,
      [expandedWidget]: {
        x: edge,
        y: edge,
        width: bounds.width - (edge * 2),
        height: bounds.height - (edge * 2),
      },
    };
  }, [activeWidget, bounds, expandedWidget, widgetIds]);

  return {
    boardRef,
    layout,
    activeWidget,
    setActiveWidget,
    ready: bounds.width > 0,
  };
}
