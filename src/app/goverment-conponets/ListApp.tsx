import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './MainApp';
import { containerStyle, center } from './MainApp';
import { GoogleMap, Marker } from "@react-google-maps/api";
import '../component/GoogleMapComponent';

// 町民の位置情報を含むユーザーの型
type UserWithPosition = {
    id: string;
    name?: string;
    safety?: string; // 安否情報
    latitude: number; // 緯度
    longitude: number; // 経度
    district: string; // 地区
}

// 救助隊の位置情報の型
type RescuePosition = {
    id: string;
    name: string; // 救助隊員の名前
    latitude: number; // 緯度
    longitude: number; // 経度
    doing: string; // 現在の活動内容
}

// 役場職員の位置情報の型
type PublicServantPosition = {
    id: string;
    name: string; // 役場職員の名前
    latitude: number; // 緯度
    longitude: number; // 経度
    doing: string; // 現在の活動内容
}

// 地区ごとの地図の中央座標を定義
const mapchange: { [key: string]: { lat: number; lng: number } } = {
    "神領": { lat: 33.96725162, lng: 134.35047543},
    "上分": { lat: 33.964313, lng: 134.2590853},
    "下分": { lat: 33.9598865, lng: 134.3070941},
    "阿野": { lat: 34.005311, lng: 134.355696},
    "鬼籠野": { lat: 33.9869602, lng: 134.371021}
};

// メインのコンポーネント
const ListApp: React.FC = () => {
    // ステート管理
    const [usersWithPositions, setUsersWithPositions] = useState<UserWithPosition[]>([]); // 町民の位置情報リスト
    const [rescuePositions, setRescuePositions] = useState<RescuePosition[]>([]); // 救助隊の位置情報リスト
    const [publicservantPositions, setPublicServantPositions] = useState<PublicServantPosition[]>([]); // 役場職員の位置情報リスト
    const [searchTerm, setSearchTerm] = useState<string>(""); // 検索キーワード
    const [filterDistrict, setFilterDistrict] = useState<string>(""); // 地区のフィルター
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>(center); // 地図の中心
    const [isSafetyView, setIsSafetyView] = useState<boolean>(false); // 安否情報表示フラグ
    const [isMapView, setIsMapView] = useState<boolean>(false); // 地図表示フラグ
    const [isRescueView, setIsRescueView] = useState<boolean>(false); // 救助隊表示フラグ
    const [isPublicServantView, setIsPublicServantView] = useState<boolean>(false); // 役場職員表示フラグ
    const [selectedUserPosition, setSelectedUserPosition] = useState<{ lat: number, lng: number } | null>(null); // 選択されたユーザーの位置

    // 町民の位置情報を取得する関数
    const fetchUsersWithPositionsData = async () => {
        try {
            const usersCollection = collection(db, "citizen");
            const usersSnapshot = await getDocs(usersCollection);
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserWithPosition[];

            console.log("Fetched Users With Positions:", usersList);

            // 安否情報でソートする (救助が必要な人、無事な人の順)
            const sortedUsers = usersList.sort((a, b) => {
                if (a.safety === "救助が必要" && b.safety !== "救助が必要") return -1;
                if (a.safety !== "救助が必要" && b.safety === "救助が必要") return 1;
                if (a.safety === "無事" && b.safety !== "無事") return -1;
                if (a.safety !== "無事" && b.safety === "無事") return 1;
                return 0;
            });
            setUsersWithPositions(sortedUsers); // ステートに保存
        }catch (error) {
            console.error("データの取得に失敗しました: ", error);
        }
    };

    // 救助隊の位置情報を取得する関数
    const fetchRescuePositionsData = async () => {
        try {
            const rescueCollection = collection(db, "rescue");
            const rescueSnapshot = await getDocs(rescueCollection);
            const rescueList = rescueSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RescuePosition[];

            setRescuePositions(rescueList); // ステートに保存
        }catch (error) {
            console.error("データの取得に失敗しました: ", error);
        }
    };

    // 役場職員の位置情報を取得する関数
    const fetchPublicServantPositionsData = async () => {
        try {
            const publicservantCollection = collection(db, "publicservant");
            const publicservantSnapshot = await getDocs(publicservantCollection);
            const publicservantList = publicservantSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PublicServantPosition[];

            setPublicServantPositions(publicservantList); // ステートに保存
        }catch (error) {
            console.error("データの取得に失敗しました: ", error);
        }
    };

    // ユーザーをクリックしたときに位置情報をセットする関数
    const handleUserClick = async (latitude: number, longitude: number) => {
        setSelectedUserPosition({ lat: latitude, lng: longitude });
        setMapCenter({lat: latitude, lng: longitude });
        setIsMapView(true); // 地図ビューに切り替え
    }

    // コンポーネントがマウントされたときにデータを取得
    useEffect(() => {
        fetchUsersWithPositionsData();
        fetchRescuePositionsData();
        fetchPublicServantPositionsData();
    }, []);

    // 検索条件を変更したときのハンドラ
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // 地区で安否情報をフィルタリングする関数
    const handleFilterByDistrictSafety = (district: string) => {
        setFilterDistrict(district);
        setIsSafetyView(true);
        setIsMapView(false);
        setIsRescueView(false);
        setIsPublicServantView(false);
    };

    // 地区で地図を表示する関数
    const handleFilterByDistrictMap = (district: string) => {
        setFilterDistrict(district);
        setIsSafetyView(false);
        setIsMapView(true);
        setIsRescueView(false);
        setIsPublicServantView(false);

        const location = mapchange[district];
        if (location) {
            setMapCenter(location);
        }
    };

    // 検索条件と地区フィルターに基づいてユーザーをフィルタリング
    const filteredUsers = usersWithPositions.filter(user => {
        return (
            (!filterDistrict || user.district === filterDistrict) &&
            ((user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.safety && user.safety.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    });

    // 安否情報に応じてマーカーの色を変更する関数
    const getMarkerIcon = (safety: string) => {
        let color;
        if (safety === "救助が必要") {
            color = 'red'; // 救助が必要な場合は赤
        }else if (safety === "無事") {
            color = 'green'; // 無事な場合は緑
        }else {
            color = 'white'; // その他の場合は白
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

    // 救助隊の表示を切り替えるハンドラ
    const handleToggleRescueView = () => {
        setIsRescueView(!isRescueView);
    };

    // 役場職員の表示を切り替えるハンドラ
    const handleTogglePublicServantView = () => {
        setIsPublicServantView(!isPublicServantView);
    }

    return (
        <div>
            <div className="name-order">
                <label htmlFor="search">検索: </label>
                <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="検索"
                />
            </div>
            <div className="safetydistrict">
                <label>安否</label>
                <button onClick={() => handleFilterByDistrictSafety("神領")}>神領</button>
                <button onClick={() => handleFilterByDistrictSafety("上分")}>上分</button>
                <button onClick={() => handleFilterByDistrictSafety("下分")}>下分</button>
                <button onClick={() => handleFilterByDistrictSafety("阿野")}>阿野</button>
                <button onClick={() => handleFilterByDistrictSafety("鬼籠野")}>鬼籠野</button>
            </div>
            <div className="mapdistrict">
                <label>地図</label>
                <button onClick={() => handleFilterByDistrictMap("神領")}>神領</button>
                <button onClick={() => handleFilterByDistrictMap("上分")}>上分</button>
                <button onClick={() => handleFilterByDistrictMap("下分")}>下分</button>
                <button onClick={() => handleFilterByDistrictMap("阿野")}>阿野</button>
                <button onClick={() => handleFilterByDistrictMap("鬼籠野")}>鬼籠野</button>
            </div>

            <div>
                <button onClick={handleToggleRescueView}>
                    救助隊を表示
                </button>
                <button onClick={handleTogglePublicServantView}>
                    役場職員を表示
                </button>
            </div>

            {isSafetyView && (
                <table border={1}>
                    <thead>
                    <tr>
                        <th className="label">Name</th>
                        <th className="label">Safety</th>
                    </tr>
                    </thead>
                    <tbody className="citizentable">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <tr key={user.id} onClick={() => handleUserClick(user.latitude, user.longitude)}>
                                <td className="username">{user.name}</td>
                                <td className="usersafety">{user.safety}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2}>該当する町民は見つかりません。</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}

            {isMapView && (
                <GoogleMap
                    mapContainerStyle = {containerStyle}
                    center = {selectedUserPosition || mapCenter}
                    zoom = {15}
                >
                    {usersWithPositions.map((position) => (
                        position.safety === "無事"
                            ? null
                            : (
                                <Marker
                                    key = {position.id}
                                    position = {{lat: position.latitude, lng: position.longitude}}
                                    icon = {getMarkerIcon(position.safety!)}
                                />
                            )
                    ))}

                    {filteredUsers.map((position) => (
                        <Marker
                            key = {position.id}
                            position = {{lat: position.latitude, lng: position.longitude}}
                            icon = {getMarkerIcon(position.safety!)}
                        />
                    ))}

                    {isRescueView && (
                        rescuePositions.map(rescue => (
                            <Marker
                                key={rescue.id}
                                position={{ lat: rescue.latitude, lng: rescue.longitude }}
                            />
                        ))
                    )}

                    {isPublicServantView && (
                        publicservantPositions.map(publicservant => (
                            <Marker
                                key={publicservant.id}
                                position={{ lat: publicservant.latitude, lng: publicservant.longitude }}
                            />

                        ))
                    )}
                </GoogleMap>
            )}
        </div>
    );
};

export default ListApp;