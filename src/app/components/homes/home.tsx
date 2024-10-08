import React from 'react';
import './homeDesign.css';  // 相対パスでCSSファイルをインポート

const Home: React.FC = () => {
    return (
		<div>
			<div className="home-container">
				<div className={"green-box"}>
					<div className={"alert"}>土砂崩れに警戒してください</div>
					<div className={"alert"}>土砂崩れに警戒してください</div>
				</div>
				<div className={"map-box"}>
				<p className="mapText">ここに地図テキスト</p>
				</div>
			</div>
		</div>
    );
}

export default Home;
