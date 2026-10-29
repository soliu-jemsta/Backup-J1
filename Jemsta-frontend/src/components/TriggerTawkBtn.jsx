import React from "react";

const TriggerTawkBtn = ({ children, onClick, ...props }) => {
  const openChat = (e) => {
    // Execute any custom click handler first
    onClick?.(e);

    if (e.defaultPrevented) return;

    if (window.Tawk_API) {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    } else {
      console.warn("Tawk widget has not finished loading.");
    }
  };

  return (
    <button onClick={openChat} {...props}>
      {children}
    </button>
  );
};

export default TriggerTawkBtn;