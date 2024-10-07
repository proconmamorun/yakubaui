'use client';

import React, { useState } from 'react';
import SideBar from './components/sideBar';
//　SideBarとかの最初の一文字大文字じゃないとバグるので注意
import Home from './components/home';
import Map from './components/map';
import SafeCheck from './components/SafeCheck';
import NewsBelt from './components/newsBelt';

const Page: React.FC = () => {
	const [mode, setMode] = useState<'home' | 'map' | 'SafeCheck' | 'newsBelt'>('home');  // 'home' または 'map' の値を持つ
	const [area, setArea] = useState<string>("");
    return (
        <div>
			<SideBar setMode={setMode} setArea={setArea}/>
			{mode === 'home' && <Home />}
            {mode === 'map' && <Map area={area}/>}
			{mode === 'SafeCheck' && <SafeCheck area={area}/>}
			{mode === 'newsBelt' && <NewsBelt area={area}/>}
        </div>
    );
};

export default Page;
