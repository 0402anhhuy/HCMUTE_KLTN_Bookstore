
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import "./Breadcrumb.css";

/**
 * @param {Array<{ label: string, path?: string }>} items - Danh sách các nấc đường dẫn
 * @param {boolean} showHomeIcon - Có hiện icon ngôi nhà ở nấc Trang chủ không (mặc định: true)
 */
const Breadcrumb = ({ items = [], showHomeIcon = true }) => {
    return (
        <nav className="common-breadcrumb-nav" aria-label="Breadcrumb">
            <ol className="common-breadcrumb-list">
                {/* Nút mặc định về Trang chủ */}
                <li className="common-breadcrumb-item">
                    <Link to="/" className="common-breadcrumb-link">
                        {showHomeIcon && <Home size={15} />}
                        <span>Trang chủ</span>
                    </Link>
                </li>

                {/* Render các cấp đường dẫn */}
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="common-breadcrumb-item">
                            <span
                                className="common-breadcrumb-sep"
                                aria-hidden="true"
                            >
                                <ChevronRight size={14} />
                            </span>

                            {isLast || !item.path ? (
                                <span
                                    className="common-breadcrumb-current"
                                    title={item.label}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="common-breadcrumb-link"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
