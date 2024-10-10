import React from 'react'; 
import './newsBeltDesign.css';
import { db } from '../firebase/firebaseConfig';

interface MapProps {
	area: string; // areaを受け取る
}

const newsBelt: React.FC<MapProps> = ({ area }) => {
	return (
		<div>
			<p>Map</p>
			<p>現在のエリア: {area}</p>
			<div className="container">
				<div className="container">
				  <div className="greenBox1"></div>
				  <div className="greenBox2"></div>
				  <div className="frame">
					<div className="nyuuryokutext">文を入力してください。</div>
					<div className="nyuuryokusikaku" ></div>
				  </div>
				  <div className="finalcheck"></div>
				  <div className="finalchecktext">最終確認</div>
				  <div className="box">
					<div className="group">
					  <div className="divwrapper">
						<div className="textwrapper">町民側へ送信</div>
					  </div>
					</div>
				  </div>
				</div>
			</div>
		</div>
	);
}

export default newsBelt;
