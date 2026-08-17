import React, { forwardRef, useMemo, useState } from "react";
import { bignumber } from "mathjs";
import TRLIcon from "./TRLIcon";
import { copyText } from "./storage";
import { formatNumber } from "./numberFormatter";

const QUICK_EXPRESSIONS = ["15% of 2500", "sqrt(144)", "2^10", "1,000,000 / 365"];

const CalculatorPanel = forwardRef(function CalculatorPanel({ draft, setDraft, result, onCalculate, precision, onPrecisionChange }, inputRef) {
  const [copied, setCopied] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (draft.trim()) onCalculate(draft, "calculator");
  };

  const copy = async (kind, value) => {
    await copyText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(""), 1300);
  };

  const resultKey = `${result?.id || `${result?.expression || "ready"}-${result?.error || result?.precise || ""}`}-${precision}`;
  const displayResult = useMemo(() => {
    if (!result || result.error || !result.precise) return result;
    return { ...result, ...formatNumber(bignumber(result.precise), { decimalPlaces: precision }) };
  }, [precision, result]);

  return (
    <section className="trl-panel trl-calculator" aria-labelledby="calculator-title">
      <div className="trl-panel-heading">
        <div>
          <p className="trl-kicker">Core utility</p>
          <h2 id="calculator-title">Calculator</h2>
        </div>
        <span className="trl-panel-index">01</span>
      </div>

      <form className="trl-command-bar" onSubmit={submit}>
        <span className="trl-command-mark" aria-hidden="true">=</span>
        <label className="trl-sr-only" htmlFor="trl-calculator-input">Mathematical expression</label>
        <input
          ref={inputRef}
          id="trl-calculator-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit(event);
          }}
          placeholder="Type any calculation…"
          autoComplete="off"
          spellCheck="false"
        />
        <span className="trl-key-hint">↵</span>
        <button type="submit" aria-label="Calculate"><TRLIcon name="arrow" /></button>
      </form>

      <div className={`trl-result ${result?.error ? "is-error" : ""}`} aria-live="polite">
        <div className="trl-result-content" key={resultKey}>
          {result ? (
            result.error ? (
              <>
              <p className="trl-result-label">Unable to calculate</p>
              <p className="trl-result-error">{result.error}</p>
              </>
            ) : (
              <>
              <div className="trl-result-heading">
                <p className="trl-result-label">Result</p>
                <button className="trl-precision-toggle" type="button" aria-pressed={precision === 12} onClick={() => onPrecisionChange(precision === 3 ? 12 : 3)}>
                  <span className="trl-precision-indicator" aria-hidden="true" /> 12 decimal places
                </button>
              </div>
              <div className="trl-result-main"><span>{displayResult.compact}</span></div>
              {displayResult.full !== displayResult.compact && <p className="trl-result-precise">{displayResult.full}</p>}
              <div className="trl-result-actions">
                <button type="button" onClick={() => copy("exact", result.precise)}>
                  <TRLIcon name={copied === "exact" ? "check" : "copy"} /> {copied === "exact" ? "Copied exact" : "Copy exact"}
                </button>
                <button type="button" onClick={() => copy("display", displayResult.display)}>
                  <TRLIcon name={copied === "display" ? "check" : "copy"} /> {copied === "display" ? "Copied result" : "Copy formatted"}
                </button>
              </div>
              </>
            )
          ) : (
            <>
            <p className="trl-result-label">Ready</p>
            <p className="trl-result-empty">Numbers, percentages, durations and functions.</p>
            </>
          )}
        </div>
      </div>

      <div className="trl-quick-row" aria-label="Example expressions">
        {QUICK_EXPRESSIONS.map((expression) => (
          <button key={expression} type="button" onClick={() => { setDraft(expression); inputRef.current?.focus(); }}>
            {expression}
          </button>
        ))}
      </div>
    </section>
  );
});

export default CalculatorPanel;
