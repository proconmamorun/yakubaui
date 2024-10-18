import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Firestoreからコレクションを取得するための関数をインポート
import './MainApp'; // メインアプリのスタイルや設定ファイルをインポート
import { GoogleMap, Marker } from "@react-google-maps/api"; // Googleマップのコンポーネントをインポート
import '../component/GoogleMapComponent'; // GoogleMapComponentをインポート
import { db } from '../components/firebase/firebaseConfig';

// 町民の位置情報を含むユーザーの型定義
type UserWithPosition = {
    id: string;
    name?: string;
    safety?: string; // 安否情報
    latitude: number; // 緯度
    longitude: number; // 経度
    district: string; // 地区
}

// 救助隊の位置情報の型定義
type RescuePosition = {
    id: string;
    name: string; // 救助隊員の名前
    latitude: number; // 緯度
    longitude: number; // 経度
    doing: string; // 現在の活動内容
}

// 役場職員の位置情報の型定義
type PublicServantPosition = {
    id: string;
    name: string; // 役場職員の名前
    latitude: number; // 緯度
    longitude: number; // 経度
    doing: string; // 現在の活動内容
}

// 地区ごとの地図の中央座標を定義するオブジェクト
const mapchange: { [key: string]: { lat: number; lng: number } } = {
    "神領": { lat: 33.96725162, lng: 134.35047543},
    "上分": { lat: 33.964313, lng: 134.2590853},
    "下分": { lat: 33.9598865, lng: 134.3070941},
    "阿野": { lat: 34.005311, lng: 134.355696},
    "鬼籠野": { lat: 33.9869602, lng: 134.371021}
};

// メインコンポーネント
const ListApp: React.FC = () => {
    // 各種ステート管理
    const [usersWithPositions, setUsersWithPositions] = useState<UserWithPosition[]>([]); // 町民の位置情報を保存するステート
    const [rescuePositions, setRescuePositions] = useState<RescuePosition[]>([]); // 救助隊の位置情報を保存するステート
    const [publicservantPositions, setPublicServantPositions] = useState<PublicServantPosition[]>([]); // 役場職員の位置情報を保存するステート
    const [searchTerm, setSearchTerm] = useState<string>(""); // 検索キーワードを保存するステート
    const [filterDistrict, setFilterDistrict] = useState<string>(""); // 地区のフィルターを保存するステート
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({lat:0,lng:0}); // 地図の中心位置を保存するステート
    const [isSafetyView, setIsSafetyView] = useState<boolean>(false); // 安否情報を表示するかどうかのフラグ
    const [isMapView, setIsMapView] = useState<boolean>(false); // 地図表示フラグ
    const [isRescueView, setIsRescueView] = useState<boolean>(false); // 救助隊表示フラグ
    const [isPublicServantView, setIsPublicServantView] = useState<boolean>(false); // 役場職員表示フラグ
    const [selectedUserPosition, setSelectedUserPosition] = useState<{ lat: number, lng: number } | null>(null); // 選択されたユーザーの位置

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

    // ユーザーをクリックしたときに位置情報をセットする関数
    const handleUserClick = async (latitude: number, longitude: number) => {
        setSelectedUserPosition({ lat: latitude, lng: longitude }); // 選択されたユーザーの位置を保存
        setMapCenter({ lat: latitude, lng: longitude }); // 地図の中心をクリックされた位置に変更
        setIsMapView(true); // 地図ビューに切り替え
    };

    // コンポーネントがマウントされたときに位置情報データを取得
    useEffect(() => {
        fetchUsersWithPositionsData(); // 町民の位置情報を取得
        fetchRescuePositionsData(); // 救助隊の位置情報を取得
        fetchPublicServantPositionsData(); // 役場職員の位置情報を取得
    }, []);

    // 検索ボックスの値が変更されたときのハンドラ
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value); // 検索キーワードをステートに保存
    };

    // 地区で安否情報をフィルタリングする関数
    const handleFilterByDistrictSafety = (district: string) => {
        setFilterDistrict(district); // フィルターとして選択された地区をステートに保存
        setIsSafetyView(true); // 安否ビューを有効にする
        setIsMapView(false); // 地図ビューを無効にする
        setIsRescueView(false); // 救助隊ビューを無効にする
        setIsPublicServantView(false); // 役場職員ビューを無効にする
    };

    // 地区で地図を表示する関数
    const handleFilterByDistrictMap = (district: string) => {
        setFilterDistrict(district); // フィルターとして選択された地区をステートに保存
        setIsSafetyView(false); // 安否ビューを無効にする
        setIsMapView(true); // 地図ビューを有効にする
        setIsRescueView(false); // 救助隊ビューを無効にする
        setIsPublicServantView(false); // 役場職員ビューを無効にする

        const location = mapchange[district]; // 選択された地区の中心座標を取得
        if (location) {
            setMapCenter(location); // 地図の中心を変更
        }
    };

    // 検索条件と地区フィルターに基づいてユーザーをフィルタリングする
    const filteredUsers = usersWithPositions.filter(user => {
        return (
            (!filterDistrict || user.district === filterDistrict) && // 地区フィルターの適用
            ((user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || // 名前で検索
                (user.safety && user.safety.toLowerCase().includes(searchTerm.toLowerCase()))) // 安否情報で検索
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
            {/* 検索ボックス */}
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

            {/* 地区ごとの安否フィルター */}
            <div className="safetydistrict">
                <label>安否</label>
                <button onClick={() => handleFilterByDistrictSafety("神領")}>神領</button>
                <button onClick={() => handleFilterByDistrictSafety("上分")}>上分</button>
                <button onClick={() => handleFilterByDistrictSafety("下分")}>下分</button>
                <button onClick={() => handleFilterByDistrictSafety("阿野")}>阿野</button>
                <button onClick={() => handleFilterByDistrictSafety("鬼籠野")}>鬼籠野</button>
            </div>

            {/* 地区ごとの地図フィルター */}
            <div className="mapdistrict">
                <label>地図</label>
                <button onClick={() => handleFilterByDistrictMap("神領")}>神領</button>
                <button onClick={() => handleFilterByDistrictMap("上分")}>上分</button>
                <button onClick={() => handleFilterByDistrictMap("下分")}>下分</button>
                <button onClick={() => handleFilterByDistrictMap("阿野")}>阿野</button>
                <button onClick={() => handleFilterByDistrictMap("鬼籠野")}>鬼籠野</button>
            </div>

            {/* 救助隊と役場職員の表示切り替えボタン */}
            <div>
                <button onClick={handleToggleRescueView}>
                    救助隊を表示
                </button>
                <button onClick={handleTogglePublicServantView}>
                    役場職員を表示
                </button>
            </div>

            {/* 安否情報のテーブル表示 */}
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

            {/* Google Mapの表示 */}
            {isMapView && (
                <GoogleMap
                    mapContainerStyle = {{
                        width: '100%',
                        height: '70vh'
                      }} // マップのスタイル
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
            )}
        </div>
    );
};

export default ListApp;
