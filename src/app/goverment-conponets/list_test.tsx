import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Firestoreからコレクションを取得するための関数をインポート
import { db } from '../firebaseConfig'; // Firebaseの設定ファイルからデータベースの参照をインポート
import { GoogleMap, Marker } from "@react-google-maps/api"; // Googleマップのコンポーネントをインポート

// 町民の位置情報を含むユーザーの型定義
type UserWithPosition = {
    id: string;
    name?: string;
    safety?: string; // 安否情報
    latitude: number; // 緯度
    longitude: number; // 経度
    district: string; // 地区
}


// メインコンポーネント
const ListApp: React.FC = () => {
    // 各種ステート管理
    const [usersWithPositions, setUsersWithPositions] = useState<UserWithPosition[]>([]); // 町民の位置情報を保存するステート
    const [searchTerm, setSearchTerm] = useState<string>(""); // 検索キーワードを保存するステート
    const [filterDistrict, setFilterDistrict] = useState<string>(""); // 地区のフィルターを保存するステート
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>(center); // 地図の中心位置を保存するステート
    const [isMapView, setIsMapView] = useState<boolean>(false); // 地図表示フラグ
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

    // コンポーネントがマウントされたときに位置情報データを取得
    useEffect(() => {
        fetchUsersWithPositionsData(); // 町民の位置情報を取得
    }, []);

    // ユーザーをクリックしたときに位置情報をセットする関数
    //これいる
    const handleUserClick = async (latitude: number, longitude: number) => {
        setSelectedUserPosition({lat: latitude, lng: longitude}); // 選択されたユーザーの位置を保存
        setMapCenter({lat: latitude, lng: longitude}); // 地図の中心をクリックされた位置に変更
        setIsMapView(true); // 地図ビューに切り替え
    };

    // 検索ボックスの値が変更されたときのハンドラ
    //これいる
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value); // 検索キーワードをステートに保存
    };

    // 地区で安否情報をフィルタリングする関数
    const handleFilterByDistrictSafety = (district: string) => {
        setFilterDistrict(district); // フィルターとして選択された地区をステートに保存
        setIsMapView(false); // 地図ビューを無効にする
    };

    // 検索条件と地区フィルターに基づいてユーザーをフィルタリングする
    //これ必要
    const filteredUsers = usersWithPositions.filter(user => {
        return (
            (!filterDistrict || user.district === filterDistrict) && // 地区フィルターの適用
            ((user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || // 名前で検索
                (user.safety && user.safety.toLowerCase().includes(searchTerm.toLowerCase()))) // 安否情報で検索
        );
    });


    return (
        <div>
            {/* 地区ごとの安否フィルター */}
            <div className="safetydistrict">
                <label>安否</label>
                <button onClick={() => handleFilterByDistrictSafety("神領")}>神領</button>
                <button onClick={() => handleFilterByDistrictSafety("上分")}>上分</button>
                <button onClick={() => handleFilterByDistrictSafety("下分")}>下分</button>
                <button onClick={() => handleFilterByDistrictSafety("阿野")}>阿野</button>
                <button onClick={() => handleFilterByDistrictSafety("鬼籠野")}>鬼籠野</button>
            </div>            <div>
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
            </div>
            <div>
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
            </div>
        </div>
    );
};

export default ListApp;
