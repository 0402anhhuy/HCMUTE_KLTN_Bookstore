import "./EmptyState.css";

const EmptyState = ({
    icon: Icon,
    title,
    description,
    variant = "default", // "default" | "danger"
    actionText,
    onAction,
    actionIcon: ActionIcon,
    secondaryText,
    onSecondary,
    className = "",
}) => {
    return (
        <div className={`common-empty-state ${className}`}>
            {Icon && (
                <div className={`common-empty-icon-wrap ${variant === "danger" ? "danger" : ""}`}>
                    <Icon size={44} strokeWidth={1.5} />
                </div>
            )}

            {title && <h3 className="common-empty-title">{title}</h3>}
            {description && <p className="common-empty-desc">{description}</p>}

            {(actionText || secondaryText) && (
                <div className="common-empty-actions">
                    {actionText && onAction && (
                        <button
                            type="button"
                            onClick={onAction}
                            className="common-empty-btn-primary"
                        >
                            {ActionIcon && <ActionIcon size={16} />}
                            <span>{actionText}</span>
                        </button>
                    )}

                    {secondaryText && onSecondary && (
                        <button
                            type="button"
                            onClick={onSecondary}
                            className="common-empty-btn-secondary"
                        >
                            <span>{secondaryText}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
