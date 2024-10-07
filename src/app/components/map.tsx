import React from 'react'; 
import './mapDesign.css';

interface MapProps {
	area: string; // areaを受け取る
}

const Map: React.FC<MapProps> = ({ area }) => {
	return (
		<div>
			<p>Map</p>
			<p>現在のエリア: {area}</p>
			<div className="container">
			  <div className="grayBox"></div>
			  <div className="greenBox1"></div>
			  <div className="greenBox2"></div>
			</div>
		</div>
	);
}

export default Map;
