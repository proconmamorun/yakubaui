import React, { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import './dangerous.css';  
import { db, storage } from "../firebase/firebaseConfig";  
import { addDoc, collection } from 'firebase/firestore';

const Dangerous: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [danger, setDanger] = useState<number | null>(null); 
	const [popupVisible, setPopupVisible] = useState<boolean>(false);
	const [popupMessage, setPopupMessage] = useState<string>('');
    const maxImages = 6;
    const dangerLevels = [1, 2, 3, 4, 5];

    useEffect(() => {
        const fetchImages = async () => {
            try {
            const storageRef = ref(storage, ''); 
            const imageList = await listAll(storageRef);
            const limitedItems = imageList.items.reverse().slice(0, maxImages); 
            const urls = await Promise.all(limitedItems.map(item => getDownloadURL(item)));
            setImages(urls);
            } catch (error) {
                console.error("画像の取得中にエラーが発生しました: ", error);
            }
        };

        fetchImages();
    }, []);

	const dangerSend = async () => {
		if (!selectedImage) {
			showPopup("画像を選択してください！");
		} else if (danger === null) {
			showPopup("危険度を選択してください！");
		} else {
			try {
				const { latitude, longitude } = extractCoordinatesFromFilename(selectedImage);

				await addDoc(collection(db, "locations"), {
					latitude,
					longitude,
					dangerlevel: danger,
				});
				console.log("データが保存されました！");
				
				showPopup("危険度データが送信されました！");
			} catch (error) {
				console.error("エラーが発生しました: ", error);
				showPopup("データ送信中にエラーが発生しました！");
			}
		}
		setDanger(null);  // 選択をリセット
	};

	const showPopup = (message: string) => {
		setPopupMessage(message);
		setPopupVisible(true);
		setTimeout(() => {
			setPopupVisible(false);
		}, 3000);
	};

    const handleImageClick = (image: string) => {
        setSelectedImage(image);
    };

    const dangerousChoice = (level: number) => {
        setDanger(level);
        console.log(`危険度: ${level}`);
    };

    return (
        <div>
            <div className="container1">
                <div className="grayBox1"></div>
                <div className="greenBox1"></div>
                <div className="greenBox2"></div>
                <div className="sentakupicture">
                    <div className="text1">選択した画像</div>
                    <div className="grayBox">
                        {selectedImage && (
                            <div className="choicePicture">
                                <img src={selectedImage} alt="Selected" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid">
                    {images.map((image, index) => (
                        <div key={index} className="picture" onClick={() => handleImageClick(image)}>
                            <img src={image} alt={`Uploaded ${index}`} />
                        </div>
                    ))}
                </div>
                <div className="kikendoBox">
                    <div className="text2">危険度を選択してください。</div>
					<div className="group2">
						{dangerLevels.map((level) => (
							<div key={level} className={`textwrapper2 ${danger === level ? 'textwrapper2selected' : ''}`}>
								<button onClick={() => dangerousChoice(level)}>
									危険度{level}
								</button>
							</div>
						))}
						<div className={`textwrapper2 ${danger === 0 ? 'textwrapper2selected' : ''}`}>
							<button onClick={() => dangerousChoice(0)}>
								安全
							</button>
						</div>
						<button className="send-button" onClick={dangerSend}>送信</button>
					</div>
					{popupVisible && (  // ポップアップの表示条件
						<div className="popup">
							{popupMessage}
						</div>
					)}
                </div>
            </div>
        </div>
    );
};

export default Dangerous;

function extractCoordinatesFromFilename(url: string): { latitude: number; longitude: number } {
    try {
        // 1. URLからファイル名を抽出（拡張子を除く）
        const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? '');  // クエリパラメータを除去
        const nameWithoutExtension = fileName.split('.')[0];  // 拡張子を除去

        console.log(nameWithoutExtension.replace('_', '\.'));
        // 2. カンマ区切りでファイル名を分割
        const [_, latStr, lngStr] = nameWithoutExtension.replace(/_/g, '\.').split(',');

        // 3. 緯度と経度を数値に変換
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lngStr);

        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('無効な座標形式');
        }

        console.log(`抽出された座標: 緯度 ${latitude}, 経度 ${longitude}`);
        return { latitude, longitude };
    } catch (error) {
        console.error('ファイル名から座標を抽出できませんでした:', error);
        return { latitude: 0, longitude: 0 }; // デフォルト値を返す
    }
}
