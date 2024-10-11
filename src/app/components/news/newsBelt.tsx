import React, { useState } from 'react'; 
import './newsBeltDesign.css';
import SendAlert from './SendAlert';

interface MapProps {
	area: string; // areaを受け取る
}

const NewsBelt: React.FC<MapProps> = ({ area }) => {
    const [message, setMessage] = useState(''); // 入力されたメッセージを保存
    const [alertId, setAlertId] = useState<string | undefined>(undefined); // メッセージID（削除に使用）

    // メッセージをFirestoreに送信
    const handleSend = async () => {
        if (message) {
            await SendAlert('save', message);
            setMessage(''); // 送信後に入力フィールドをリセット
        }
    };

    // メッセージをFirestoreから削除
    const handleDelete = async () => {
        if (alertId) {
            await SendAlert('delete', '', alertId);
            setAlertId(undefined); // 削除後にIDをリセット
        }
    };

    return (
        <div>
            <p>Map</p>
            <p>現在のエリア: {area}</p>
            <div className="container">
                <div className="container">
                    <div className="greenBox1"></div>
                    <div className="greenBox2"></div>
                    <div className="frame">
                        <div className="nyuuryokutext">文を入力してください。</div>
                        <input
                            type="text"
                            className="nyuuryokusikaku"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)} // 入力値を更新
                        />
                    </div>
                    <div className="finalcheck"></div>
                    <div className="finalchecktext">最終確認</div>
                    <div className="box">
                        <div className="group">
                            <div className="divwrapper">
                                <button onClick={handleSend} className="textwrapper">町民側へ送信</button>
                            </div>
                            <div className="divwrapper">
                                <button onClick={handleDelete} className="textwrapper">削除</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default NewsBelt;
