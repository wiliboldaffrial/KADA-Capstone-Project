import React from 'react';
import { Link } from 'react-router-dom';

const SideBar = ({isCollapsed, toggleSideBar}) => {
    const role = localStorage.getItem('role');

    const commonLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/addAnnouncement', label: 'Add Announcement' }
    ]

    const roleBasedLinks = {
        admin: [
            { path: '/patientManagement', label: 'Patient Management' },
            { path: '/appointmentSchedule', label: 'Appointment Schedule' },
            { path: '/roomManagement', label: 'Room Management' },
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
            <aside className={`${isCollapsed ? "w-14" : "w-64"} h-full bg-gray-800 transition-all duration-300`}>
                <button onClick={toggleSideBar} className="absolute -right-2.5 top-0 w-6 h-6 flex justify-center items-center hover:bg-gray-300 rounded-full transition">
                    Toggle
                </button>
                <div className="w-64 bg-blue-100 h-screen p-4">
                    <h2 className="text-lg font-bold mb-4 capitalize">{role} Menu</h2>
                    <ul>
                        {linksToShow.map((link) => (
                            <li key={link.path} className="mb-2">
                                <Link to={link.path} className="text-blue-800 hover:underline">{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
        
    )
}

export default SideBar;