import React, { useEffect, useState } from "react";
import './homeDesign.css';  // 相対パスでCSSファイルをインポート
import { Obi } from '../news/Obi';

import {
	collection,
	getDocs,
} from "firebase/firestore"; // deleteDoc をインポート
import { db } from "../firebase/firebaseConfig";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// 危険度の構造体の定義
type Position = {
	id: string;
	latitude: number;
	longitude: number;
	dangerlevel: number;
};

const Home: React.FC = () => {
	const [positions, setPositions] = useState<Position[]>([]);

	// Google Maps API ローダー
	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // 環境変数からAPIキーを取得
		language: 'ja'
	});

	// ピンの情報を取得
	const fetchPositionsData = async () => {
		try {
			const positionsCollection = collection(db, "locations");
			const positionsSnapshot = await getDocs(positionsCollection);
			const positionsList = positionsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Position[];
			setPositions(positionsList);
		} catch (error) {
			console.error("Error fetching positions: ", error);
		}
	};

	// コンポーネントがマウントされたらデータを取得
	useEffect(() => {
		if (isLoaded) {
			fetchPositionsData();
		}
	}, [isLoaded]);

	return (
		<div>
			<div className="home-container">
				<Obi />
				<div className={"map-box"}>
					{isLoaded && (
						<GoogleMap
							mapContainerStyle={{ width: "72vw", height: "48vh" }}
							center={{ lat: 33.96725162, lng: 134.35047543 }}
							zoom={15}
						>
							{positions.map((position) => (
								<Marker
									key={position.id}
									position={{ lat: position.latitude, lng: position.longitude }}
									label={{
										text: String(position.dangerlevel),
										fontSize: "16px",
										color: "black",
									}}
								/>
							))}
						</GoogleMap>
					)}
				</div>
			</div>
		</div>
	);
}

export default Home;