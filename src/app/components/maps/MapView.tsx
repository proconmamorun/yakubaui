import React, { useEffect, useState, useCallback} from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { fetchRescuePositionsData, fetchPublicServantPositionsData } from '../positionsService';

interface MapViewProps {
    mapCenter: {
        lat: number;
        lng: number;
    };
}

// 危険度の構造体の定義
type Position = {
    id: string;
    latitude: number;
    longitude: number;
    dangerlevel: number;
};

// 救助隊の位置情報などを定義
interface RescuePosition {
    id: string;
    latitude: number;
    longitude: number;
}

// 役場職員の位置情報などを定義
interface PublicServantPosition {
    id: string;
    latitude: number;
    longitude: number;
}

interface Figure {
    latitude: number;
    longitude: number;
    dangerlevel: number;
}

const MapView: React.FC<MapViewProps> = ({ mapCenter }) => {
    const [rescuePositions, setRescuePositions] = useState<RescuePosition[]>([]);
    const [publicServantPositions, setPublicServantPositions] = useState<PublicServantPosition[]>([]);
    const [isRescueView, setIsRescueView] = useState<boolean>(false);
    const [isPublished, setIsPublished] = useState<boolean>(false);
    const [isPublicServantView, setIsPublicServantView] = useState<boolean>(false);
    const [positions, setPositions] = useState<Position[]>([]);
    const [figure, setFigure] = useState<Figure>({
        latitude: 0,
        longitude: 0,
        dangerlevel: 0,
        dangerkinds: 0
    });

    // 位置情報を取得
    useEffect(() => {
        const fetchData = async () => {
            setRescuePositions(await fetchRescuePositionsData());
            setPublicServantPositions(await fetchPublicServantPositionsData());
        };
        fetchData();
    }, []);

    // ピンの情報を取得
    const fetchPositionsData = async () => {
        try {
            const positionsCollection = collection(db, "positions");
            const positionsSnapshot = await getDocs(positionsCollection);
            const positionsList = positionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Position[];
            setPositions(positionsList);
        } catch (error) {
            console.error("Error fetching positions: ", error);
        }
    };

    useEffect(() => {
        fetchPositionsData();
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof Figure) => {
        setFigure({
            ...figure,
            [field]: parseInt(event.target.value, 10)
        });
    };

    const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const position = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            try {
                const newFigure = {
                    latitude: position.lat,
                    longitude: position.lng,
                    dangerlevel: figure.dangerlevel,
                };
                if (newFigure.dangerlevel === 0 ) {
                    alert("危険度を設定してください");
                    return;
                }
                await addDoc(collection(db, "positions"), newFigure);
                fetchPositionsData();
                setFigure({
                    latitude: 0,
                    longitude: 0,
                    dangerlevel: 0,
                });
            }catch (error) {
                console.error("Error adding document: ", error);
            }
        }
    }, [figure]);

    return (
        <div className={"container"}>
            <div className={"buttons"}>
                <div>
                    <p className={`label ${isRescueView ? 'label-on' : ''}`}>救助</p>
                    <div className={`toggle ${isRescueView ? 'toggle-on' : ''}`}
                         onClick={() => setIsRescueView(!isRescueView)}>
                        <div className='toggle-text-off'>OFF</div>
                        <div className='glow-comp'></div>
                        <div className='toggle-button'></div>
                        <div className='toggle-text-on'>ON</div>
                    </div>
                </div>
                <div>
                    <p className={`label ${isPublicServantView ? 'label-on' : ''}`}>役場</p>
                    <div className={`toggle ${isPublicServantView ? 'toggle-on' : ''}`}
                         onClick={() => setIsPublicServantView(!isPublicServantView)}>
                        <div className='toggle-text-off'>OFF</div>
                        <div className='glow-comp'></div>
                        <div className='toggle-button'></div>
                        <div className='toggle-text-on'>ON</div>
                    </div>
                </div>
            </div>

            <div className={"maps"}>
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={{ width: '70vw', height: '80vh' }}
                        center={mapCenter}
                        zoom={15}
                        onClick={handleMapClick}
                    >
                        {positions.map((position) => (
                            <Marker
                                key={position.id}
                                position={{ lat: position.latitude, lng: position.longitude }}
                                label={{
                                    text: String(position.dangerlevel),
                                    fontSize: "16px",
                                    color: "black"
                                }}
                            />
                        ))}

                        {/* 救助隊のマーカー（丸いマーカーを使用） */}
                        {isRescueView && rescuePositions.map((rescue) => (
                            <Marker
                                key={rescue.id}
                                position={{ lat: rescue.latitude, lng: rescue.longitude }}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,  // 丸いマーカーの形状
                                    scale: 10,  // アイコンのサイズ
                                    fillColor: 'blue',  // 塗りつぶしの色
                                    fillOpacity: 1,  // 塗りつぶしの不透明度
                                    strokeWeight: 2,  // 枠線の太さ
                                    strokeColor: 'white'  // 枠線の色
                                }}
                            />
                        ))}

                        {/* 役場の人のマーカー（丸いマーカーを使用） */}
                        {isPublicServantView && publicServantPositions.map((publicServant: PublicServantPosition) => (
                            <Marker
                                key={publicServant.id}
                                position={{ lat: publicServant.latitude, lng: publicServant.longitude }}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,  // 丸いマーカーの形状
                                    scale: 10,  // アイコンのサイズ
                                    fillColor: 'red',  // 塗りつぶしの色
                                    fillOpacity: 1,  // 塗りつぶしの不透明度
                                    strokeWeight: 2,  // 枠線の太さ
                                    strokeColor: 'white'  // 枠線の色
                                }}
                            />
                        ))}
                    </GoogleMap>
                </LoadScript>

                <div className={"publish-container"}>
                    <button className={"publish"} onClick={() => setIsPublished(!isPublished)}>
                        町民地図に掲載
                    </button>
                    <div className={`${isPublished ? 'publish-buttons-on' : 'publish-buttons-off'} publish-buttons`}>
                        <button
                            onClick={() => handleInputChange({target: {value: '1'}} as React.ChangeEvent<HTMLInputElement>, 'dangerlevel')}>
                            危険度１
                        </button>
                        <button
                            onClick={() => handleInputChange({target: {value: '2'}} as React.ChangeEvent<HTMLInputElement>, 'dangerlevel')}>
                            危険度２
                        </button>
                        <button
                            onClick={() => handleInputChange({target: {value: '3'}} as React.ChangeEvent<HTMLInputElement>, 'dangerlevel')}>
                            危険度３
                        </button>
                        <button
                            onClick={() => handleInputChange({target: {value: '4'}} as React.ChangeEvent<HTMLInputElement>, 'dangerlevel')}>
                            危険度４
                        </button>
                        <button onClick={() => handleInputChange({target: {value: '5'}} as React.ChangeEvent<HTMLInputElement>, 'dangerlevel')}>
                            危険度５
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;