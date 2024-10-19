import React, { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import './dangerous.css';  // 相対パスでCSSファイルをインポート
import { db, storage } from "../firebase/firebaseConfig";  // Firestoreのインスタンス

const Dangerous: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
	const [selectedImage, setSelectedImage] = useState<string | null>(null); // 選択された画像を保存
	const [danger, setDanger] = useState<number | null>(null); // 危険度保存関数 
	const maxImages = 6;
	const dangerLevels = [1, 2, 3, 4, 5];

    useEffect(() => {
        const fetchImages = async () => {
            const storageRef = ref(storage, ''); // 画像が保存されているフォルダを指定
            const imageList = await listAll(storageRef);
			const limitedItems = imageList.items.slice(0, maxImages); // 最初の maxImages 件を取得
            const urls = await Promise.all(limitedItems.map(item => getDownloadURL(item)));
            setImages(urls);
        };

        fetchImages();
    }, []);

	const handleImageClick = (image: string) => {
        setSelectedImage(image);
    };
	const dangerousChoice = (level: number) => {
		setDanger(level);
		console.log(`危険度: ${level}`);
	}
	const dangerSend = async () => {
		if (selectedImage && danger !== null) {
			try {
				// Firestoreのコレクション「dangerousImages」にデータを追加
				await addDoc(collection(firestore, "dangerousImages"), {
					imageUrl: selectedImage,
					dangerLevel: danger,
				});
				console.log("データが保存されました！");
			} catch (error) {
				console.error("エラーが発生しました: ", error);
			}
		} else {
			console.log("画像と危険度を入力してね");
		}
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
                        {selectedImage && ( // 選択された画像のみを表示
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
                    </div>
                    <div className="box">
                        <div className="group">
                            <div className="divwrapper">
								<button onClick={Dangerous} className="textwrapper">送信</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dangerous;

