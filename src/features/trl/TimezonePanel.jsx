import React, { memo, useCallback, useEffect, useState } from "react";
import { formatTimezone, getDefaultTimezones } from "./timezoneData";
import { readLocalValue, writeLocalValue } from "./storage";
import TimezoneSelector from "./TimezoneSelector";
import TRLIcon from "./TRLIcon";
import useFlipList from "./useFlipList";
import usePointerSort from "./usePointerSort";

const TIMEZONE_KEY = "trl.timezones.v1";

function validStoredZones() {
  const stored = readLocalValue(TIMEZONE_KEY, null);
  if (!Array.isArray(stored) || !stored.length) return getDefaultTimezones();
  const valid = stored.filter((zone) => zone?.id && zone?.city && zone?.country);
  return valid.length ? valid : getDefaultTimezones();
}

function TimezonePanel() {
  const [zones, setZones] = useState(validStoredZones);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [enteringIds, setEnteringIds] = useState([]);
  const [removingIds, setRemovingIds] = useState([]);
  const { registerItem, capturePositions } = useFlipList(zones);
  const animationTimersRef = React.useRef(new Set());

  useEffect(() => {
    let interval;
    const delay = 60000 - (Date.now() % 60000) + 20;
    const timeout = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), 60000);
    }, delay);
    return () => { window.clearTimeout(timeout); window.clearInterval(interval); };
  }, []);

  useEffect(() => () => animationTimersRef.current.forEach((timer) => window.clearTimeout(timer)), []);

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      animationTimersRef.current.delete(timer);
      callback();
    }, delay);
    animationTimersRef.current.add(timer);
  };

  const updateZones = (updater) => {
    setZones((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      writeLocalValue(TIMEZONE_KEY, next);
      return next;
    });
  };

  const closeSelector = useCallback(() => setSelectorOpen(false), []);
  const addZone = (zone) => {
    if (zones.some((item) => item.id === zone.id)) return;
    capturePositions();
    updateZones([...zones, zone]);
    setEnteringIds((current) => [...current, zone.id]);
    schedule(() => setEnteringIds((current) => current.filter((id) => id !== zone.id)), 520);
  };
  const removeZone = (id) => {
    if (removingIds.includes(id)) return;
    setRemovingIds((current) => [...current, id]);
    schedule(() => {
      capturePositions();
      updateZones((current) => current.filter((zone) => zone.id !== id));
      setRemovingIds((current) => current.filter((item) => item !== id));
    }, 300);
  };
  const moveDraggedZone = (activeId, targetId) => {
    capturePositions();
    updateZones((current) => {
      const fromIndex = current.findIndex((zone) => zone.id === activeId);
      const toIndex = current.findIndex((zone) => zone.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [dragged] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, dragged);
      return next;
    });
  };

  const { draggingId, beginPointerSort } = usePointerSort({
    group: "timezones",
    onMove: moveDraggedZone,
    ignoreSelector: ".trl-timezone-controls",
  });

  return (
    <section className="trl-panel trl-timezones" aria-labelledby="timezones-title">
      <div className="trl-panel-heading">
        <div><p className="trl-kicker">Live reference</p><h2 id="timezones-title">Timezones</h2></div>
        <button className="trl-add-timezone" type="button" onClick={() => setSelectorOpen(true)}><TRLIcon name="plus" /> Add timezone</button>
      </div>
      <div className="trl-timezone-list">
        {zones.map((zone) => (
          <TimezoneCard
            key={zone.id}
            zone={zone}
            now={now}
            dragging={draggingId === zone.id}
            entering={enteringIds.includes(zone.id)}
            removing={removingIds.includes(zone.id)}
            registerItem={registerItem}
            onPointerDown={beginPointerSort}
            onRemove={removeZone}
          />
        ))}
      </div>
      <TimezoneSelector open={selectorOpen} selectedIds={zones.map((zone) => zone.id)} onAdd={addZone} onClose={closeSelector} />
    </section>
  );
}

const TimezoneCard = memo(function TimezoneCard({ zone, now, dragging, entering, removing, registerItem, onPointerDown, onRemove }) {
  let formatted;
  try {
    formatted = formatTimezone(zone, now);
  } catch {
    formatted = { time: "Unavailable", calendar: "Invalid timezone", offset: zone.id };
  }

  return (
    <article
      className={`trl-timezone-card trl-sortable-item ${dragging ? "is-dragging" : ""} ${entering ? "is-entering" : ""} ${removing ? "is-removing" : ""}`}
      ref={(node) => registerItem(zone.id, node)}
      data-sortable-group="timezones"
      data-sortable-id={zone.id}
      onPointerDown={(event) => onPointerDown(event, zone.id)}
      title={`Drag to reorder ${zone.city}`}
    >
      <div className="trl-timezone-location">
        <span className="trl-timezone-dot" aria-hidden="true" />
        <div><h3>{zone.city}</h3><p>{zone.country}</p></div>
      </div>
      <div className="trl-timezone-clock"><strong>{formatted.time}</strong><span>{formatted.offset}</span></div>
      <p className="trl-timezone-date">{formatted.calendar}</p>
      <div className="trl-timezone-controls">
        <button type="button" onClick={() => onRemove(zone.id)} aria-label={`Remove ${zone.city}`}><TRLIcon name="close" /></button>
      </div>
    </article>
  );
});

export default TimezonePanel;
