// positionsService.ts
import { db } from './firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// ユーザー、救助隊、公共職員の位置情報を定義
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

// 町民の位置情報を取得する関数
export const fetchUsersWithPositionsData = async (): Promise<UserWithPosition[]> => {
    try {
        const usersCollection = collection(db, "citizen");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as UserWithPosition[];

        // Adjusted sorting logic based on the type of 'safety'
        return usersList.sort((a, b) => {
            const safetyA = a.safety === "false" ? false : a.safety === "true" ? true : undefined;
            const safetyB = b.safety === "false" ? false : b.safety === "true" ? true : undefined;

            if (safetyA === false && safetyB !== false) return -1;
            if (safetyA !== false && safetyB === false) return 1;
            if (safetyA === true && safetyB !== true) return -1;
            if (safetyA !== true && safetyB === true) return 1;
            return 0;
        });
    } catch (error) {
        console.error("町民のデータの取得に失敗しました: ", error);
        return [];
    }
};

// 救助隊の位置情報を取得する関数
export const fetchRescuePositionsData = async (): Promise<RescuePosition[]> => {
    try {
        const rescueCollection = collection(db, "rescue");
        const rescueSnapshot = await getDocs(rescueCollection);
        return rescueSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as RescuePosition[];
    } catch (error) {
        console.error("救助隊のデータの取得に失敗しました: ", error);
        return [];
    }
};

// 役場職員の位置情報を取得する関数
export const fetchPublicServantPositionsData = async (): Promise<PublicServantPosition[]> => {
    try {
        const publicservantCollection = collection(db, "publicservant");
        const publicservantSnapshot = await getDocs(publicservantCollection);
        return publicservantSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PublicServantPosition[];
    } catch (error) {
        console.error("役場職員のデータの取得に失敗しました: ", error);
        return [];
    }
};