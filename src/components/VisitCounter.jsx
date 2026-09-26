import React, { useEffect, useState } from "react";
import "./visitCounter.css";

const VISITS_API = "https://visits.doaor.com/";

export default function VisitCounter() {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const isLiveSite = ["doaor.com", "www.doaor.com"].includes(window.location.hostname);

    fetch(VISITS_API, {
      method: isLiveSite ? "POST" : "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Visit counter unavailable");
        return response.json();
      })
      .then((data) => {
        if (Number.isSafeInteger(data.visits) && data.visits >= 0) {
          setVisits(data.visits);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return <div className="gateway-visit-counter" aria-label={visits === null ? "Visits unavailable" : `${visits.toLocaleString()} visits`}>
    <span>Visits</span>
    <strong>{visits === null ? "--" : visits.toLocaleString()}</strong>
  </div>;
}
