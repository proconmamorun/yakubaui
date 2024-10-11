import { doc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// メッセージを保存または削除するための関数
const SendAlert = async (action: 'save' | 'delete', message: string, id?: string) => {
    // メッセージの保存
    if (action === 'save' && message) {
        // メッセージが空でないことを確認
        if (!message.trim()) {
            console.log("文を入力してください。");
            return;
        }
        try {
            // Firestoreの 'alert' コレクションにメッセージを保存
            await addDoc(collection(db, 'alert'), {
                text: message,
                createdAt: new Date()
            });
            console.log("保存しました");
        } catch (error) {
            console.log("保存に失敗しました");
        }
    // メッセージの削除
    } else if (action === 'delete' && id) {
        try {
            const alertDocRef = doc(db, "alert", id); // 削除するドキュメントの参照を取得
            await deleteDoc(alertDocRef); // ドキュメントを削除
            console.log("削除しました");
        } catch (error) {
            console.error("Error deleting positions: ", error);
            console.log("削除に失敗しました");
        }
    }
};

export default SendAlert;
