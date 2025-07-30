import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {ChevronLeft, ChevronRight, Hospital} from 'lucide-react';
import AppHeader from './AppHeader';
import SideBarItem from './SideBarItem';

const SideBar = ({isCollapsed, toggleSideBar}) => {
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login')
    }

    const commonLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/addAnnouncement', label: 'Add Announcement' }
    ]

    const roleBasedLinks = {
        admin: [
            { path: '/admin/patientManagement', label: 'Patient Management' },
            { path: '/admin/appointmentSchedule', label: 'Appointment Schedule' },
            { path: '/admin/roomManagement', label: 'Room Management' },
        ],

        doctor: [
            { path: '/patientList', label: 'Patient List'}
        ],

        nurse: [
            { path: '/patientList', label: 'Patient List' }

        ]
    }

    const linksToShow = [...commonLinks, ...(roleBasedLinks[role] || [])];

    return (
        <>
            <div className="flex min-h-screen">
                <aside className={`${isCollapsed ? "w-16" : "w-64"} bg-blue-800 text-white transition-all duration-300 h-screen flex flex-col fixed left-0 top-0`}>
                    <button onClick={toggleSideBar} className="absolute top-4 right-[-12px] w-6 h-6 flex items-center justify-center bg-white text-blue-800 rounded-full shadow hover:bg-gray-200 transition">
                        {isCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
                    </button>
                    <nav className="mt-16 px-2">

                        {/* MediLink Logo */}
                        <div className="flex justify-center items-center mb-4">
                            {isCollapsed ? (<Hospital size={24} className="text-white"/>) : (
                                <h2 className="text-white text-sm">
                                    <AppHeader mode='sidebar'/>
                            </h2>)}
                        </div>

                        {/* Pages */}
                        <ul className="space-y-2">
                            {linksToShow.map((item) => (
                                <SideBarItem key={item.path} path={item.path} label={item.label} isCollapsed={isCollapsed}/>
                            ))}
                        </ul>
                    </nav>

                    {/* Profile and logout button */}
                    <div className="mt-auto p-4 border-t border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img className="w-8 h-8 rounded-full border border-white object-cover"/>
                                {!isCollapsed && (
                                    <div className="text-white text-sm">
                                        <p className="font-semibold">Username</p>
                                        
                                    </div>
                                )}
                            </div>

                            {/* Logout button */}
                            {!isCollapsed && (
                                <button onClick={handleLogout} className="ml-2 px-2 py-1 text-sm font-semibold text-white hover:text-red-500 transition">
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>

                    
                </aside>
            </div>
        </>
        
    )
}

export default SideBar;