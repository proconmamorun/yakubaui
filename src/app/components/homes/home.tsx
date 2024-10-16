import React from 'react';
import './homeDesign.css';  // 相対パスでCSSファイルをインポート
import { Obi } from '../news/Obi';

const Home: React.FC = () => {
    return (
		<div>
			<div className="home-container">
				<Obi />
				<div className={"map-box"}>
				<p className="mapText">ここに地図テキスト</p>
				</div>
			</div>
		</div>
    );
}

export default Home;
