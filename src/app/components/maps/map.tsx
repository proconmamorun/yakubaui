import React, { useState } from 'react';
import './mapDesign.css';
import MapView from './MapView';
import { useMap } from './MapContext';

interface MapProps {
	area: string; // areaを受け取る
}

const Map: React.FC<MapProps> = ({ area }) => {
	const { mapCenter } = useMap(); // コンテキストからマップの中心座標とsetterを取得

	//
	const [selectedUserPosition, setSelectedUserPosition] = useState<{ lat: number, lng: number } | null>(null);
	const [rescuePositions, setRescuePositions] = useState([]);
	const [publicservantPositions, setPublicServantPositions] = useState([]);
	const [isRescueView, setIsRescueView] = useState<boolean>(false);
	const [isPublicServantView, setIsPublicServantView] = useState<boolean>(false);

	const getMarkerIcon = (safety: string) => {
		let color;
		if (safety === "救助が必要") {
			color = 'red';
		} else if (safety === "無事") {
			color = 'green';
		} else {
			color = 'white';
		}

		return {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 8,
			fillColor: color,
			fillOpacity: 1,
			strokeColor: 'black',
			strokeWeight: 0
		};
	};

	return (
		<div>
			<p>Map</p>
			<p>現在のエリア: {area}</p>
			<div className="container">
				<div className="grayBox">
					<MapView
						usersWithPositions={[]}
						mapCenter={mapCenter}
						selectedUserPosition={selectedUserPosition}
						isRescueView={isRescueView}
						isPublicServantView={isPublicServantView}
						rescuePositions={rescuePositions}
						publicservantPositions={publicservantPositions}
						getMarkerIcon={getMarkerIcon}
					/>
				</div>
				<div className="greenBox1"></div>
				<div className="greenBox2"></div>
			</div>
		</div>
	);
};

export default Map;