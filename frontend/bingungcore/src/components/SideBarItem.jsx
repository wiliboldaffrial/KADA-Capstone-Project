import { Link, useLocation } from 'react-router-dom';

const SideBarItem = ({path, label, isCollapsed, icon}) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <li className={`group`}>
            <Link to={path} className={`flex items-center rounded-full py-2 px-4 mx-2 hover:bg-blue-500 transition ${isActive ? "bg-blue-700": ""}`}>
                {icon}
                <span className={`text-white ml-4 ${isCollapsed ? "hidden" : "block"}`}>{label}</span>
            </Link>
        </li>
    )
}

export default SideBarItem;