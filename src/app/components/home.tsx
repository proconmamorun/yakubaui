import React from 'react';
import './homeDesign.css';  // 相対パスでCSSファイルをインポート

const Home: React.FC = () => {
    return (
		<div>
			<p>home</p>
			<div className="container">
				<div className="grayBox">
					<p className="mapText">ここに地図テキスト</p>
				</div>
				<div className="grayBox2"></div>
				<div className="greenBox1"></div>
				<div className="greenBox2"></div>
			</div>
		</div>
    );
}

export default Home;
