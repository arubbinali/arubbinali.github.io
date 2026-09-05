import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CalculatorPanel from "../features/trl/CalculatorPanel";
import CreateWidgetDialog from "../features/trl/CreateWidgetDialog";
import CustomWidgetPanel from "../features/trl/CustomWidgetPanel";
import HistoryPanel from "../features/trl/HistoryPanel";
import NotesPanel from "../features/trl/NotesPanel";
import TimezonePanel from "../features/trl/TimezonePanel";
import TRLContextMenu from "../features/trl/TRLContextMenu";
import TRLIcon from "../features/trl/TRLIcon";
import WidgetFrame from "../features/trl/WidgetFrame";
import SiteNav from "../components/SiteNav";
import { calculate } from "../features/trl/mathEngine";
import { readLocalValue, writeLocalValue } from "../features/trl/storage";
import useWidgetLayout from "../features/trl/useWidgetLayout";
import "../features/trl/trl.css";

const HISTORY_KEY = "trl.calculationHistory.v1";
const CUSTOM_WIDGETS_KEY = "trl.customWidgets.v1";
const HIDDEN_WIDGETS_KEY = "trl.hiddenWidgets.v1";
const PRECISION_KEY = "trl.displayPrecision.v1";
const HISTORY_LIMIT = 80;
const CORE_WIDGETS = [
  { id: "calculator", title: "Calculator", custom: false },
  { id: "notes", title: "Notes", custom: false },
  { id: "history", title: "History", custom: false },
  { id: "timezones", title: "Timezones", custom: false },
];

function createId(prefix = "item") {
  return `${prefix}-${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function readHistory() {
  const history = readLocalValue(HISTORY_KEY, []);
  return Array.isArray(history) ? history.slice(0, HISTORY_LIMIT) : [];
}

function readCustomWidgets() {
  const widgets = readLocalValue(CUSTOM_WIDGETS_KEY, []);
  return Array.isArray(widgets)
    ? widgets.filter((widget) => widget?.id && widget?.title).map((widget) => ({ ...widget, content: widget.content || "" }))
    : [];
}

function TRLPage() {
  const [history, setHistory] = useState(readHistory);
  const [currentResult, setCurrentResult] = useState(() => readHistory()[0] || null);
  const [calculatorDraft, setCalculatorDraft] = useState("");
  const [precision, setPrecisionState] = useState(() => readLocalValue(PRECISION_KEY, 3) === 12 ? 12 : 3);
  const [customWidgets, setCustomWidgets] = useState(readCustomWidgets);
  const [hiddenWidgetIds, setHiddenWidgetIds] = useState(() => {
    const stored = readLocalValue(HIDDEN_WIDGETS_KEY, []);
    return Array.isArray(stored) ? stored : [];
  });
  const [contextMenu, setContextMenu] = useState(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [pendingFocus, setPendingFocus] = useState("");
  const [expandedWidget, setExpandedWidget] = useState("");
  const [departingWidgetIds, setDepartingWidgetIds] = useState([]);
  const [enteringWidgetIds, setEnteringWidgetIds] = useState([]);
  const calculatorInputRef = useRef(null);
  const motionTimersRef = useRef(new Set());

  const widgets = useMemo(() => [
    ...CORE_WIDGETS,
    ...customWidgets.map((widget) => ({ id: widget.id, title: widget.title, custom: true })),
  ].map((widget) => ({ ...widget, visible: !hiddenWidgetIds.includes(widget.id) })), [customWidgets, hiddenWidgetIds]);
  const visibleWidgetIds = useMemo(() => widgets.filter((widget) => widget.visible).map((widget) => widget.id), [widgets]);
  const { boardRef, layout, activeWidget, setActiveWidget, ready: layoutReady } = useWidgetLayout(visibleWidgetIds, expandedWidget);

  useEffect(() => {
    const previousTitle = document.title;
    const motionTimers = motionTimersRef.current;
    document.title = "TRL — doaor";
    document.body.classList.add("trl-page-active");
    const focusTimer = window.setTimeout(() => calculatorInputRef.current?.focus(), 80);
    return () => {
      window.clearTimeout(focusTimer);
      document.title = previousTitle;
      document.body.classList.remove("trl-page-active");
      motionTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!pendingFocus || !visibleWidgetIds.includes(pendingFocus)) return;
    setActiveWidget(pendingFocus);
    setPendingFocus("");
  }, [pendingFocus, setActiveWidget, visibleWidgetIds]);

  useEffect(() => {
    const keyboardShortcuts = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && visibleWidgetIds.includes("calculator")) {
        event.preventDefault();
        setActiveWidget("calculator");
        calculatorInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", keyboardShortcuts);
    return () => window.removeEventListener("keydown", keyboardShortcuts);
  }, [setActiveWidget, visibleWidgetIds]);

  const executeCalculation = useCallback((expression) => {
    try {
      const result = calculate(expression);
      const entry = {
        id: createId("calculation"),
        expression: result.expression,
        compact: result.compact,
        display: result.display,
        precise: result.precise,
        full: result.full,
        createdAt: new Date().toISOString(),
      };
      setCurrentResult(entry);
      setHistory((previous) => {
        const next = [entry, ...previous].slice(0, HISTORY_LIMIT);
        writeLocalValue(HISTORY_KEY, next);
        return next;
      });
      return true;
    } catch (error) {
      setCurrentResult({ error: error?.message || "Invalid expression", expression });
      return false;
    }
  }, []);

  const scheduleMotion = (callback, delay) => {
    const timer = window.setTimeout(() => {
      motionTimersRef.current.delete(timer);
      callback();
    }, delay);
    motionTimersRef.current.add(timer);
  };

  const updateHiddenWidgets = (updater) => {
    setHiddenWidgetIds((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      writeLocalValue(HIDDEN_WIDGETS_KEY, next);
      return next;
    });
  };

  const hideWidgets = (ids) => {
    const targets = ids.filter((id) => !hiddenWidgetIds.includes(id) && !departingWidgetIds.includes(id));
    if (!targets.length) return;
    if (targets.includes(expandedWidget)) setExpandedWidget("");
    setDepartingWidgetIds((current) => [...new Set([...current, ...targets])]);
    scheduleMotion(() => {
      updateHiddenWidgets((current) => [...new Set([...current, ...targets])]);
      setDepartingWidgetIds((current) => current.filter((id) => !targets.includes(id)));
    }, 360);
  };

  const showWidgets = (ids) => {
    const targets = ids.filter((id) => hiddenWidgetIds.includes(id));
    if (!targets.length) return;
    updateHiddenWidgets((current) => current.filter((id) => !targets.includes(id)));
    setEnteringWidgetIds((current) => [...new Set([...current, ...targets])]);
    scheduleMotion(() => setEnteringWidgetIds((current) => current.filter((id) => !targets.includes(id))), 520);
  };

  const toggleWidget = (id, visible) => {
    if (visible) {
      showWidgets([id]);
      setPendingFocus(id);
    } else hideWidgets([id]);
  };

  const createWidget = ({ title, content }) => {
    const widget = { id: createId("custom"), title, content, createdAt: new Date().toISOString() };
    const next = [...customWidgets, widget];
    setCustomWidgets(next);
    writeLocalValue(CUSTOM_WIDGETS_KEY, next);
    updateHiddenWidgets((current) => current.filter((id) => id !== widget.id));
    setEnteringWidgetIds((current) => [...current, widget.id]);
    scheduleMotion(() => setEnteringWidgetIds((current) => current.filter((id) => id !== widget.id)), 520);
    setPendingFocus(widget.id);
    setCreatorOpen(false);
  };

  const updateCustomWidget = (id, content) => {
    setCustomWidgets((current) => {
      const next = current.map((widget) => widget.id === id ? { ...widget, content } : widget);
      writeLocalValue(CUSTOM_WIDGETS_KEY, next);
      return next;
    });
  };

  const deleteCustomWidget = (id) => {
    if (expandedWidget === id) setExpandedWidget("");
    setDepartingWidgetIds((current) => [...new Set([...current, id])]);
    scheduleMotion(() => {
      setCustomWidgets((current) => {
        const next = current.filter((widget) => widget.id !== id);
        writeLocalValue(CUSTOM_WIDGETS_KEY, next);
        return next;
      });
      updateHiddenWidgets((current) => current.filter((item) => item !== id));
      setDepartingWidgetIds((current) => current.filter((item) => item !== id));
    }, 360);
  };

  const openContextMenu = (event, widgetId = null) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, widgetId });
  };

  const setPrecision = (next) => {
    setPrecisionState(next);
    writeLocalValue(PRECISION_KEY, next);
  };

  const expandWidget = (id) => {
    setActiveWidget(id);
    setExpandedWidget(id);
  };

  const reuseExpression = (expression) => {
    if (hiddenWidgetIds.includes("calculator")) toggleWidget("calculator", true);
    else setActiveWidget("calculator");
    setCalculatorDraft(expression);
    window.setTimeout(() => calculatorInputRef.current?.focus(), 0);
  };

  const clearHistory = () => { setHistory([]); writeLocalValue(HISTORY_KEY, []); };
  const deleteHistory = (id) => setHistory((previous) => {
    const next = previous.filter((entry) => entry.id !== id);
    writeLocalValue(HISTORY_KEY, next);
    return next;
  });

  return (
    <div className="trl-app" onContextMenu={(event) => openContextMenu(event)}>
      <a className="trl-home-link" href="/" aria-label="Back to home">
        <TRLIcon name="arrow" />
        <span>Home</span>
      </a>
      <SiteNav site="main" currentKey="trl" />
      <main className={`trl-workspace ${layoutReady ? "is-ready" : ""} ${expandedWidget ? "has-expanded" : ""}`} ref={boardRef}>
        {!visibleWidgetIds.length && (
          <div className="trl-empty-workspace">
            <span>Workspace hidden</span>
            <small>Right-click anywhere to show or create a widget.</small>
          </div>
        )}

        {widgets.find((widget) => widget.id === "notes")?.visible && (
          <WidgetFrame id="notes" title="Notes" layout={layout.notes} active={activeWidget === "notes"} expanded={expandedWidget === "notes"} hiding={departingWidgetIds.includes("notes")} entering={enteringWidgetIds.includes("notes")} onActivate={setActiveWidget} onContextMenu={openContextMenu} onCollapse={() => setExpandedWidget("")}>
            <NotesPanel />
          </WidgetFrame>
        )}
        {widgets.find((widget) => widget.id === "history")?.visible && (
          <WidgetFrame id="history" title="History" layout={layout.history} active={activeWidget === "history"} expanded={expandedWidget === "history"} hiding={departingWidgetIds.includes("history")} entering={enteringWidgetIds.includes("history")} onActivate={setActiveWidget} onContextMenu={openContextMenu} onCollapse={() => setExpandedWidget("")}>
            <HistoryPanel history={history} onReuse={reuseExpression} onDelete={deleteHistory} onClear={clearHistory} />
          </WidgetFrame>
        )}
        {widgets.find((widget) => widget.id === "calculator")?.visible && (
          <WidgetFrame id="calculator" title="Calculator" layout={layout.calculator} active={activeWidget === "calculator"} expanded={expandedWidget === "calculator"} hiding={departingWidgetIds.includes("calculator")} entering={enteringWidgetIds.includes("calculator")} onActivate={setActiveWidget} onContextMenu={openContextMenu} onCollapse={() => setExpandedWidget("")}>
            <CalculatorPanel ref={calculatorInputRef} draft={calculatorDraft} setDraft={setCalculatorDraft} result={currentResult} onCalculate={executeCalculation} precision={precision} onPrecisionChange={setPrecision} />
          </WidgetFrame>
        )}
        {widgets.find((widget) => widget.id === "timezones")?.visible && (
          <WidgetFrame id="timezones" title="Timezones" layout={layout.timezones} active={activeWidget === "timezones"} expanded={expandedWidget === "timezones"} hiding={departingWidgetIds.includes("timezones")} entering={enteringWidgetIds.includes("timezones")} onActivate={setActiveWidget} onContextMenu={openContextMenu} onCollapse={() => setExpandedWidget("")}>
            <TimezonePanel />
          </WidgetFrame>
        )}
        {customWidgets.filter((widget) => !hiddenWidgetIds.includes(widget.id)).map((widget) => (
          <WidgetFrame key={widget.id} id={widget.id} title={widget.title} layout={layout[widget.id]} active={activeWidget === widget.id} expanded={expandedWidget === widget.id} hiding={departingWidgetIds.includes(widget.id)} entering={enteringWidgetIds.includes(widget.id)} onActivate={setActiveWidget} onContextMenu={openContextMenu} onCollapse={() => setExpandedWidget("")}>
            <CustomWidgetPanel widget={widget} onChange={updateCustomWidget} />
          </WidgetFrame>
        ))}
      </main>

      {contextMenu && (
        <TRLContextMenu
          menu={contextMenu}
          widgets={widgets}
          expandedWidget={expandedWidget}
          onClose={() => setContextMenu(null)}
          onCreate={() => setCreatorOpen(true)}
          onHideAll={() => hideWidgets(widgets.filter((widget) => widget.visible).map((widget) => widget.id))}
          onShowAll={() => { showWidgets(widgets.map((widget) => widget.id)); setPendingFocus("calculator"); }}
          onToggle={toggleWidget}
          onExpand={expandWidget}
          onCollapse={() => setExpandedWidget("")}
          onDelete={deleteCustomWidget}
        />
      )}
      <CreateWidgetDialog open={creatorOpen} onClose={() => setCreatorOpen(false)} onCreate={createWidget} />
    </div>
  );
}

export default TRLPage;
