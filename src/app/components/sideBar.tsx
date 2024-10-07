import React from 'react';
import './sideBarDesign.css'

// chatGPTなのでわからん
interface SideBarProps {
    setMode: (mode: 'home' | 'map' | 'SafeCheck') => void; // モード切り替え用の関数を受け取る
    setArea: (area: string) => void; 
}

const SideBar: React.FC<SideBarProps> = ({ setMode, setArea }) => {
  return (
    <div className="side">
		<div className="bar">
			<button className={"white-button"} onClick={() => setMode('home')}>Home</button>

			<button className={"big-button"} onClick={() => setMode('map')}>地図</button>

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

			<button className={"big-button"} onClick={() => setMode('SafeCheck')}>安否</button>

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

			<button className={"white-button"}>帯表示</button>
			<button className={"white-button"}>危険を特定</button>
		</div>
	</div>
  );
};

export default SideBar;
