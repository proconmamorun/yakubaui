import React from 'react';
import { useLocation } from '../maps/LocationContext';
import './sideBarDesign.css'

// chatGPTなのでわからん
interface SideBarProps {
    setMode: (mode: 'home' | 'map' | 'SafeCheck' | 'newsBelt' | 'Dangerous') => void; // モード切り替え用の関数を受け取る
    setArea: (area: string) => void; 
}


const SideBar: React.FC<SideBarProps> = ({ setMode }) => {

	//useLocationからMap用の関数を読み込む
	const { setCenter } = useLocation();

	// 地区ごとの地図の中央座標を定義
	const mapchange: { [key: string]: { lat: number; lng: number } } = {
		"神領": { lat: 33.96725162, lng: 134.35047543},
		"上分": { lat: 33.964313, lng: 134.2590853},
		"下分": { lat: 33.9598865, lng: 134.3070941},
		"阿野": { lat: 34.005311, lng: 134.355696},
		"鬼籠野": { lat: 33.9869602, lng: 134.371021}
	};

	// 地図の中心を変化する関数
	const setArea = (district: string) => {
		//Mapの中心を引数に応じて動かす
		const location = mapchange[district];
		if (location) {
			setCenter(location);
		}
	};

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
			  <button onClick={() => {
				  setMode('Dangerous')
			  }} className={"white-button"}>危険を特定</button>
		  </div>
		  <div className="greenBox1"></div>
		  <div className="greenBox2"></div>
	  </div>
  );
};

export default SideBar;
