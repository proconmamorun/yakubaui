import React from 'react';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './MainApp';
import { containerStyle, center } from './MainApp';
import { GoogleMap, Marker } from "@react-google-maps/api";
import '../component/GoogleMapComponent';
import './sideBarDesign.css'

// chatGPTなのでわからん
interface SideBarProps {
    setMode: (mode: 'home' | 'map' | 'SafeCheck' | 'newsBelt') => void; // モード切り替え用の関数を受け取る
    setArea: (area: string) => void; 
}




const SideBar: React.FC<SideBarProps> = ({ setMode, setArea }) => {

	return (
	  <div className="side">
		  <div className="bar">
			  <button className={"white-button"} onClick={() => setMode('home')}>Home</button>

			  <h1 className={"green-title"}>地図</h1>

			  <div className={"white-area"}>
				  <button onClick={() => {
					  setMode('map');
					  setArea('神領')
				  }}>神領
				  </button>
				  <button onClick={() => {
					  setMode('map');
					  setArea('上分')
				  }}>上分
				  </button>
				  <button onClick={() => {
					  setMode('map');
					  setArea('下分')
				  }}>下分
				  </button>
				  <button onClick={() => {
					  setMode('map');
					  setArea('阿野')
				  }}>阿野
				  </button>
				  <button onClick={() => {
					  setMode('map');
					  setArea('鬼籠野')
				  }}>鬼籠野
				  </button>
			  </div>

			  <h1 className={"green-title"}>安否</h1>

			  <div className={"white-area"}>
				  <button onClick={() => {
					  setMode('SafeCheck');
					  setArea('神領')
				  }}>神領
				  </button>
				  <button onClick={() => {
					  setMode('SafeCheck');
					  setArea('上分')
				  }}>上分
				  </button>
				  <button onClick={() => {
					  setMode('SafeCheck');
					  setArea('下分')
				  }}>下分
				  </button>
				  <button onClick={() => {
					  setMode('SafeCheck');
					  setArea('阿野')
				  }}>阿野
				  </button>
				  <button onClick={() => {
					  setMode('SafeCheck');
					  setArea('鬼籠野')
				  }}>鬼籠野
				  </button>
			  </div>

			  <button onClick={() => {
				  setMode('newsBelt')
			  }} className={"white-button"}>帯表示
			  </button>
			  <button className={"white-button"}>危険を特定</button>
		  </div>
		  <div className="greenBox1"></div>
		  <div className="greenBox2"></div>
	  </div>
  );
};

export default SideBar;
