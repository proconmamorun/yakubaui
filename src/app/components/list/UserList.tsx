import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '.././firebase/firebaseConfig';

type UserWithPosition = {
    id: string;
    name?: string;
    safety?: string;
    latitude: number;
    longitude: number;
    district: string;
};

interface UserListProps {
    onUserClick: (latitude: number, longitude: number) => void;
    searchTerm: string;
    filterDistrict: string;
}

const UserList: React.FC<UserListProps> = ({ onUserClick, searchTerm, filterDistrict }) => {
    const [usersWithPositions, setUsersWithPositions] = useState<UserWithPosition[]>([]);

    const fetchUsersWithPositionsData = async () => {
        try {
            const usersCollection = collection(db, "citizen");
            const usersSnapshot = await getDocs(usersCollection);
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserWithPosition[];

            const sortedUsers = usersList.sort((a, b) => {
                if (a.safety === "救助が必要" && b.safety !== "救助が必要") return -1;
                if (a.safety !== "救助が必要" && b.safety === "救助が必要") return 1;
                return 0;
            });
            setUsersWithPositions(sortedUsers);
        } catch (error) {
            console.error("データの取得に失敗しました: ", error);
        }
    };

    useEffect(() => {
        fetchUsersWithPositionsData();
    }, []);

    const filteredUsers = usersWithPositions.filter(user => {
        return (
            (!filterDistrict || user.district === filterDistrict) &&
            ((user.name && typeof user.name === 'string' && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.safety && typeof user.safety === 'string' && user.safety.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    });

    return (
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
                    <tr key={user.id} onClick={() => onUserClick(user.latitude, user.longitude)}>
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
    );
};

export default UserList;