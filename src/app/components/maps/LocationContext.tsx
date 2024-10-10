import React, { createContext, useState, useContext, ReactNode } from 'react';

// Contextの型を定義
type PositionContextType = string;
type LocationContextType = {
    center: { lat: number, lng: number };
    setCenter: (center: { lat: number, lng: number }) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);
// Contextを作成
const PositionContext = createContext<PositionContextType | undefined>(undefined);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocationはLocationProvider内で使用する必要があります');
    }
    return context;
};

// usePositionフックでContextから文字列を取得
export const usePosition = () => {
    const context = useContext(PositionContext);
    if (!context) {
        throw new Error('usePositionはPositionProvider内で使用する必要があります');
    }
    return context; // 文字列 "usePosition" を返す
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [center, setCenter] = useState<{ lat: number, lng: number }>({ lat: 33.96725162, lng: 134.35047543 });
    return (
        <LocationContext.Provider value={{ center, setCenter }}>
            {children}
        </LocationContext.Provider>
    );
};