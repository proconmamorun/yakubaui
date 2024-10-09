import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// ユーザー、救助隊員、公共職員の位置情報を定義
type UserWithPosition = {
    id: string;
    name?: string;
    safety?: string;
    latitude: number;
    longitude: number;
    district: string;
};

type RescuePosition = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    doing: string;
};

type PublicServantPosition = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    doing: string;
};

// MapViewコンポーネントの実装
interface MapViewProps {
    mapCenter: { lat: number, lng: number }; // 地図の中心位置
}

const MapView: React.FC<MapViewProps> = ({ mapCenter }) => {
    // 各種ステート管理
    const [usersWithPositions, setUsersWithPositions] = useState<UserWithPosition[]>([]);
    const [rescuePositions, setRescuePositions] = useState<RescuePosition[]>([]);
    const [publicservantPositions, setPublicServantPositions] = useState<PublicServantPosition[]>([]);
    const [isRescueView, setIsRescueView] = useState<boolean>(false);
    const [isPublicServantView, setIsPublicServantView] = useState<boolean>(false);
    const [selectedUserPosition, setSelectedUserPosition] = useState<{ lat: number, lng: number } | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>(""); // 検索キーワードを保存するステート
    const [filterDistrict, setFilterDistrict] = useState<string>(""); // 地区のフィルターを保存するステート


    const mapContainerStyle = {
        width: '100vw',
        height: '100vh',
    };


    // 町民の位置情報を取得する非同期関数
    const fetchUsersWithPositionsData = async () => {
        try {
            const usersCollection = collection(db, "citizen"); // Firestoreから"citizen"コレクションを取得
            const usersSnapshot = await getDocs(usersCollection); // コレクション内の全てのドキュメントを取得
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserWithPosition[]; // 取得したデータをUserWithPosition型にキャスト

            console.log("Fetched Users With Positions:", usersList);

            // 安否情報でソートする (救助が必要な人が最初、無事な人が次)
            const sortedUsers = usersList.sort((a, b) => {
                if (a.safety === "救助が必要" && b.safety !== "救助が必要") return -1;
                if (a.safety !== "救助が必要" && b.safety === "救助が必要") return 1;
                if (a.safety === "無事" && b.safety !== "無事") return -1;
                if (a.safety !== "無事" && b.safety === "無事") return 1;
                return 0;
            });
            setUsersWithPositions(sortedUsers); // ソートしたデータをステートに保存
        } catch (error) {
            console.error("データの取得に失敗しました: ", error); // エラーが発生した場合のログ出力
        }
    };

    // 救助隊の位置情報を取得する非同期関数
    const fetchRescuePositionsData = async () => {
        try {
            const rescueCollection = collection(db, "rescue"); // Firestoreから"rescue"コレクションを取得
            const rescueSnapshot = await getDocs(rescueCollection); // コレクション内の全てのドキュメントを取得
            const rescueList = rescueSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RescuePosition[]; // 取得したデータをRescuePosition型にキャスト

            setRescuePositions(rescueList); // ステートに保存
        } catch (error) {
            console.error("データの取得に失敗しました: ", error); // エラーが発生した場合のログ出力
        }
    };

    // 役場職員の位置情報を取得する非同期関数
    const fetchPublicServantPositionsData = async () => {
        try {
            const publicservantCollection = collection(db, "publicservant"); // Firestoreから"publicservant"コレクションを取得
            const publicservantSnapshot = await getDocs(publicservantCollection); // コレクション内の全てのドキュメントを取得
            const publicservantList = publicservantSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PublicServantPosition[]; // 取得したデータをPublicServantPosition型にキャスト

            setPublicServantPositions(publicservantList); // ステートに保存
        } catch (error) {
            console.error("データの取得に失敗しました: ", error); // エラーが発生した場合のログ出力
        }
    };


    // コンポーネントがマウントされたときに位置情報データを取得
    useEffect(() => {
        fetchUsersWithPositionsData(); // 町民の位置情報を取得
        fetchRescuePositionsData(); // 救助隊の位置情報を取得
        fetchPublicServantPositionsData(); // 役場職員の位置情報を取得
    }, []);


    const filteredUsers = usersWithPositions.filter(user => {
        return (
            (!filterDistrict || user.district === filterDistrict) && // 地区フィルターの適用
            ((user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || // 名前で検索
                (user.safety && typeof user.safety === 'string' && user.safety.toLowerCase().includes(searchTerm.toLowerCase()))) // 安否情報で検索
        );
    });

    // 安否情報に応じてマーカーの色を変更する関数
    const getMarkerIcon = (safety: string) => {
        let color;
        if (safety === "救助が必要") {
            color = 'red'; // 救助が必要な場合は赤
        } else if (safety === "無事") {
            color = 'green'; // 無事な場合は緑
        } else {
            color = 'white'; // その他の場合は白
        }

        return {
            path: google.maps.SymbolPath.CIRCLE, // マーカーの形状を円形に設定
            scale: 8, // マーカーのサイズ
            fillColor: color, // 塗りつぶしの色
            fillOpacity: 1, // 塗りつぶしの透明度
            strokeColor: 'black', // 枠線の色
            strokeWeight: 0 // 枠線の太さ
        };
    };

    // 救助隊の表示を切り替えるハンドラ
    const handleToggleRescueView = () => {
        setIsRescueView(!isRescueView); // 救助隊ビューの表示/非表示を切り替え
    };

    // 役場職員の表示を切り替えるハンドラ
    const handleTogglePublicServantView = () => {
        setIsPublicServantView(!isPublicServantView); // 役場職員ビューの表示/非表示を切り替え
    };

    return (
        <div>
            {/* 救助隊と役場職員の表示切り替えボタン */}
            <div>
                <button onClick={handleToggleRescueView}>
                    救助隊を表示
                </button>
                <button onClick={handleTogglePublicServantView}>
                    役場職員を表示
                </button>
            </div>
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle = {mapContainerStyle} // マップのスタイル
                    center = {selectedUserPosition || mapCenter} // マップの中心
                    zoom = {15} // ズームレベル
                >
                    {/* 町民の位置に基づくマーカー */}
                    {usersWithPositions.map((position) => (
                        position.safety === "無事"
                            ? null // 無事な場合はマーカーを表示しない
                            : (
                                <Marker
                                    key = {position.id}
                                    position = {{lat: position.latitude, lng: position.longitude}}
                                    icon = {getMarkerIcon(position.safety!)} // 安否情報に応じたマーカーアイコン
                                />
                            )
                    ))}

                    {/* フィルタされたユーザーのマーカー */}
                    {filteredUsers.map((position) => (
                        <Marker
                            key = {position.id}
                            position = {{lat: position.latitude, lng: position.longitude}}
                            icon = {getMarkerIcon(position.safety!)} // 安否情報に応じたマーカーアイコン
                        />
                    ))}

                    {/* 救助隊のマーカー */}
                    {isRescueView && (
                        rescuePositions.map(rescue => (
                            <Marker
                                key={rescue.id}
                                position={{ lat: rescue.latitude, lng: rescue.longitude }}
                            />
                        ))
                    )}

                    {/* 役場職員のマーカー */}
                    {isPublicServantView && (
                        publicservantPositions.map(publicservant => (
                            <Marker
                                key={publicservant.id}
                                position={{ lat: publicservant.latitude, lng: publicservant.longitude }}
                            />
                        ))
                    )}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default MapView;