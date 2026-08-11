import React, { useEffect, useState } from "react";
import "../App.css";
import "./outro.css"; // make sure this exists

function OutroTransition({ children }) {
  const [fadeState, setFadeState] = useState("fade-in");

  useEffect(() => {
    // When page first loads → fade from black to visible
    setFadeState("fade-in");
  }, []);

  const handleNavigation = (url) => (e) => {
    e.preventDefault();
    setFadeState("fade-out");

    // Wait for fade-out to finish before navigating
    setTimeout(() => {
      window.location.href = url;
    }, 900); // match with CSS duration
  };

  // Clone children and override <a> tags to trigger fade-out
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const newProps = {};
      if (child.props.children) {
        newProps.children = React.Children.map(child.props.children, (nested) => {
          if (React.isValidElement(nested) && nested.type === "a") {
            return React.cloneElement(nested, {
              onClick: handleNavigation(nested.props.href),
            });
          }
          return nested;
        });
      }
      return React.cloneElement(child, newProps);
    }
    return child;
  });

  return <div className={`page-transition ${fadeState}`}>{enhancedChildren}</div>;
}

export default OutroTransition;
