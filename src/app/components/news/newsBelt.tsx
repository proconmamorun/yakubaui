import React, { useState } from 'react'; 
import './newsBeltDesign.css';
import SendAlert from './SendAlert';
import { Obi } from './Obi';

interface MapProps {
	area: string;
}

const NewsBelt: React.FC<MapProps> = ({ area }) => {
    const [message, setMessage] = useState(''); // 入力されたメッセージを保存

    // メッセージをFirestoreに送信
    const handleSend = async () => {
        if (message) {
            await SendAlert('save', message);
            setMessage(''); // 送信後に入力フィールドをリセット
        }
    };

    return (
        <div>
            <div className="container">
				<Obi />
                <div className="frame">
                    <div className="nyuuryokutext"><span className="EmergencyNews">緊急速報</span>を入力してください。</div>
                    <input
                        type="text"
                        className="nyuuryokusikaku"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)} // 入力値を更新
                    />
                </div>
				<button onClick={handleSend} className="textwrapper">送信</button>
			</div>
        </div>
    );
}

export default NewsBelt;
