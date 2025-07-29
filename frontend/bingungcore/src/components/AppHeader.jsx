import React from 'react';

// Helper component for the header
const AppHeader = ({ subtitle, mode }) => {
    const isSidebar = mode === 'sidebar';
    const textColor = isSidebar ? 'white' : '#045ae2';

    return (
        <>
        <div className="text-center">
            <h1 className="text-4xl" style={{ fontFamily: 'Kollektif, sans-serif', color: textColor }}>
                MediLink
            </h1>
            <p className="mt-0" style={{ fontFamily: 'Kollektif, sans-serif', color: textColor }}>
                Hospital Management App
            </p>
            {subtitle && (
                <p className="text-xl text-gray-700 mt-8" style={{ fontFamily: 'Kollektif, sans-serif' }}>
                    {subtitle}
                </p>
            )}
        </div>
        </>
    )
    
};

export default AppHeader;
