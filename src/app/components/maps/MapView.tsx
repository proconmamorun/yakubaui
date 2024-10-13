import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { fetchUsersWithPositionsData, fetchRescuePositionsData, fetchPublicServantPositionsData } from '../positionsService';

//このconst MapViewの引数のmapCenterの構造を定義
interface MapViewProps {
    mapCenter: {
        lat: number;
        lng: number;
    };
}

//町民の位置情報などを定義
interface UserWithPosition {
    id: string;
    latitude: number;
    longitude: number;
    district: string;
    safety?: string;
}

//救助隊の位置情報などを定義
interface RescuePosition {
    id: string;
    latitude: number;
    longitude: number;
}

//役場職員の位置情報などを定義
interface PublicServantPosition {
    id: string;
    latitude: number;
    longitude: number;
}

const MapView: React.FC<MapViewProps> = ({ mapCenter }) => {
    const [usersWithPositions, setUsersWithPositions] = useState<UserWithPosition[]>([]);
    const [rescuePositions, setRescuePositions] = useState<RescuePosition[]>([]);
    const [publicServantPositions, setPublicServantPositions] = useState<PublicServantPosition[]>([]);
    const [isRescueView, setIsRescueView] = useState<boolean>(false);
    const [isPublicServantView, setIsPublicServantView] = useState<boolean>(false);

    //positionServiceから位置情報を読み取る
    useEffect(() => {
        const fetchData = async () => {
            setUsersWithPositions(await fetchUsersWithPositionsData());
            setRescuePositions(await fetchRescuePositionsData());
            setPublicServantPositions(await fetchPublicServantPositionsData());
        };
        fetchData();
    }, []);

    //町民のマーカーを定義する
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

    document.addEventListener('DOMContentLoaded', () => {
        const toggles = document.querySelectorAll('.toggle');

        toggles.forEach((toggle) => {
            toggle.addEventListener('click', (e: Event) => {
                e.preventDefault(); // The flicker is a codepen thing
                (e.currentTarget as HTMLElement).classList.toggle('toggle-on');
            });
        });
    });

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

            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <GoogleMap mapContainerStyle={{width: '70vw', height: '80vh'}} center={mapCenter} zoom={15}>
                    {usersWithPositions.map((position) => (
                        <Marker
                            key={position.id}
                            position={{lat: position.latitude, lng: position.longitude}}
                            icon={getMarkerIcon(position.safety ?? "")}
                        />
                    ))}
                    {isRescueView && rescuePositions.map((rescue) => (
                        <Marker key={rescue.id} position={{lat: rescue.latitude, lng: rescue.longitude}}/>
                    ))}
                    {isPublicServantView && publicServantPositions.map((publicServant: PublicServantPosition) => (
                        <Marker key={publicServant.id}
                                position={{lat: publicServant.latitude, lng: publicServant.longitude}}/>
                    ))}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default MapView;