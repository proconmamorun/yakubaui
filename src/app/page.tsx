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
	const [mode, setMode] = useState<'home' | 'map' | 'SafeCheck' | 'newsBelt' | 'Dangerous'>('home');  // 'home' または 'map' の値を持つ
	const [area, setArea] = useState<string>("");
    return (
        <div className={"main-container"}>
            <LocationProvider>
                <SideBar setMode={setMode} setArea={setArea}/>
                <div className={"homes"}>
                    {mode === 'home' && <Home />}
                    {mode === 'map' && <Map area={area}/>}
                    {mode === 'SafeCheck' && <SafeCheck area={area}/>}
                    {mode === 'newsBelt' && <NewsBelt area={area}/>}
                    {mode === 'Dangerous' && <Dangerous area={area}/>}
                </div>
            </LocationProvider>
        </div>
    );
};

export default Page;
