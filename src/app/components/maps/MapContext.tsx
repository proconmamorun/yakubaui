import React, { createContext, useState, useContext, ReactNode } from 'react';

type MapContextType = {
    mapCenter: { lat: number, lng: number };
    setMapCenter: (center: { lat: number, lng: number }) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapはMapProvider内で使用する必要があります');
    }
    return context;
};


export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({ lat: 33.96725162, lng: 134.35047543 });
    return (
        <MapContext.Provider value={{ mapCenter, setMapCenter }}>
            {children}
        </MapContext.Provider>
    );
};