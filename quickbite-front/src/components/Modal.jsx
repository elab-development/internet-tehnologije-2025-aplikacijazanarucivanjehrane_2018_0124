import React, { useEffect } from "react";

export default function Modal({
  open,
  title = "Modal",
  children,
  footer,          
  onClose,
  closeText = "Close",
  showCloseButton = true,
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) onClose?.();
  };

  return (
    <div
      className="qb-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="qb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qb-modal-header">
          <h3 className="qb-modal-title">{title}</h3>

          {showCloseButton && (
            <button className="qb-btn qb-btn-ghost qb-btn-sm" onClick={onClose}>
              {closeText}
            </button>
          )}
        </div>

        <div className="qb-modal-body">{children}</div>

        {footer && <div className="qb-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
