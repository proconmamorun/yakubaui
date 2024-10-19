import React from 'react';
import { useLocation } from '../maps/LocationContext';
import './sideBarDesign.css';

// SideBarのプロパティインターフェース
interface SideBarProps {
	setMode: (mode: 'home' | 'map' | 'SafeCheck' | 'newsBelt' | 'Dangerous') => void;
	setArea: (area: string) => void;
	setFilterDistrict: (district: string) => void; // 地区フィルタリング用の関数
}

const SideBar: React.FC<SideBarProps> = ({ setMode, setArea, setFilterDistrict }) => {
	// 地図の中心を設定する関数を取得
	const { setCenter } = useLocation();

	// 地区ごとの地図の中央座標を定義
	const mapchange: { [key: string]: { lat: number; lng: number } } = {
		"神領": { lat: 33.96725162, lng: 134.35047543 },
		"上分": { lat: 33.964313, lng: 134.2590853 },
		"下分": { lat: 33.9598865, lng: 134.3070941 },
		"阿野": { lat: 34.005311, lng: 134.355696 },
		"鬼籠野": { lat: 33.9869602, lng: 134.371021 }
	};

	// 地図の中心を変化する関数
	const changeMapCenter = (district: string) => {
		const location = mapchange[district];
		if (location) {
			setCenter(location); // マップの中心を変更
		}
	};

	return (
		<div className="side">
			<div className="bar">
				<button className={"white-button"} onClick={() => setMode('home')}>Home</button>

				<h1 className={"green-title"}>地図</h1>
				<div className={"white-area"}>
					{/* 各地区ごとにボタンを配置 */}
					<button onClick={() => {
						setMode('map');  // マップ表示モードに切り替え
						setArea('神領'); // 地区名をセット
						changeMapCenter('神領'); // マップの中心を変更
					}}>神領
					</button>
					<button onClick={() => {
						setMode('map');
						setArea('上分');
						changeMapCenter('上分');
					}}>上分
					</button>
					<button onClick={() => {
						setMode('map');
						setArea('下分');
						changeMapCenter('下分');
					}}>下分
					</button>
					<button onClick={() => {
						setMode('map');
						setArea('阿野');
						changeMapCenter('阿野');
					}}>阿野
					</button>
					<button onClick={() => {
						setMode('map');
						setArea('鬼籠野');
						changeMapCenter('鬼籠野');
					}}>鬼籠野
					</button>
				</div>

				<h1 className={"green-title"}>安否</h1>
				<div className={"white-area"}>
					{/* SafeCheck表示時に地区をフィルタリングする */}
					<button onClick={() => {
						setMode('SafeCheck');  // SafeCheckモードに切り替え
						setArea('神領');      // 地区名をセット
						setFilterDistrict('神領'); // SafeCheckのフィルタリング用に地区をセット
					}}>神領
					</button>
					<button onClick={() => {
						setMode('SafeCheck');
						setArea('上分');
						setFilterDistrict('上分');
					}}>上分
					</button>
					<button onClick={() => {
						setMode('SafeCheck');
						setArea('下分');
						setFilterDistrict('下分');
					}}>下分
					</button>
					<button onClick={() => {
						setMode('SafeCheck');
						setArea('阿野');
						setFilterDistrict('阿野');
					}}>阿野
					</button>
					<button onClick={() => {
						setMode('SafeCheck');
						setArea('鬼籠野');
						setFilterDistrict('鬼籠野');
					}}>鬼籠野
					</button>
				</div>

				<button onClick={() => {
					setMode('newsBelt')  // ニュースベルトモード
				}} className={"white-button"}>緊急速報
				</button>
				<button onClick={() => {
					setMode('Dangerous')  // 危険モード
				}} className={"white-button"}>危険確認
				</button>
			</div>
			<div className="greenBox1"></div>
			<div className="greenBox2"></div>
		</div>
	);
};

export default SideBar;