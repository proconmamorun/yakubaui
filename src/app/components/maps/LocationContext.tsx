import React, { createContext, useState, useContext, ReactNode } from 'react';

// Contextの型を定義
type PositionContextType = string;
type LocationContextType = {
    center: { lat: number, lng: number };
    setCenter: (center: { lat: number, lng: number }) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocationはLocationProvider内で使用する必要があります');
    }
    return context;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [center, setCenter] = useState<{ lat: number, lng: number }>({ lat: 33.96725162, lng: 134.35047543 });
    return (
        <LocationContext.Provider value={{ center, setCenter }}>
                {children}
        </LocationContext.Provider>
    );
};