import { ChevronLeft, ChevronRight } from "lucide-react";
import "./CarouselArrow.css";

const CarouselArrow = ({
    direction = "next",
    onClick,
    disabled = false,
    ariaLabel,
    className = "",
}) => {
    const isPrev = direction === "prev";
    const Icon = isPrev ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            className={`carousel-arrow-btn ${className}`.trim()}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel || (isPrev ? "Previous" : "Next")}
        >
            <Icon size={18} />
        </button>
    );
};

export default CarouselArrow;
