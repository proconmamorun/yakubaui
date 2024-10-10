import React from 'react';
import './mapDesign.css';
import MapView from './MapView';
import { useLocation } from './LocationContext';

interface MapProps {
	area: string; // areaを受け取る
}

const Map: React.FC<MapProps> = ({ area }) => {
	const { center } = useLocation();// コンテキストからマップの中心座標とsetterを取得

	return (
		<div>
			<p>Map</p>
			<p>現在のエリア: {area}</p>
			<div className="container">
				<MapView
					mapCenter={center}
				/>
			</div>
		</div>
	);
};

export default Map;