'use client'
import React, { useState } from 'react';
import './pages.css';
import SideBar from './components/sidebar/sideBar';
//　SideBarとかの最初の一文字大文字じゃないとバグるので注意
import Home from '@/app/components/homes/home';
import Map from './components/maps/map';
import SafeCheck from './components/safeCheck/SafeCheck';
import NewsBelt from './components/news/newsBelt';
import Dangerous from './components/dangerous/dangerous';

import { LocationProvider } from './components/maps/LocationContext';

const Page: React.FC = () => {
    const [mode, setMode] = useState<'home' | 'map' | 'SafeCheck' | 'newsBelt' | 'Dangerous'>('home');
    const [area, setArea] = useState<string>("");
    const [filterDistrict, setFilterDistrict] = useState<string>("");

    return (
        <div className={"main-container"}>
            <LocationProvider>
                <SideBar setMode={setMode} setArea={setArea} setFilterDistrict={setFilterDistrict} />
                <div className={"homes"}>
                    {mode === 'home' && <Home />}
                    {mode === 'map' && <Map area={area}/>}
                    {mode === 'SafeCheck' && <SafeCheck area={area} filterDistrict={filterDistrict} />}
                    {mode === 'newsBelt' && <NewsBelt area={area}/>}
                    {mode === 'Dangerous' && <Dangerous area={area}/>}
                </div>
            </LocationProvider>
        </div>
    );
};

export default Page;
