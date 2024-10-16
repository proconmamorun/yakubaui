import React, { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import './dangerous.css';  // 相対パスでCSSファイルをインポート
import { storage } from "../firebase/firebaseConfig";  // Firestoreのインスタンス

const Dangerous: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
	const maxImages = 6;

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

    return (
        <div>
            <div className="container1">
                <div className="grayBox1"></div>
                <div className="greenBox1"></div>
                <div className="greenBox2"></div>
                <div className="sentakupicture">
                    <div className="text1">選択した画像</div>
                    <div className="grayBox"></div>
                </div>
                <div className="grid">
                    {images.map((image, index) => (
                        <div key={index} className="picture">
                            <img src={image} alt={`Uploaded ${index}`} />
                        </div>
                    ))}
                </div>
                <div className="kikendoBox">
                    <div className="text2">危険度を選択してください。</div>
                    <div className="box">
                        <div className="group">
                            <div className="divwrapper">
                                <div className="textwrapper">町民地図に記載</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid2">
                        <div className="box2">
                            <div className="group2">
                                <div className="divwrapper2">
                                    <div className="textwrapper2">危険度1</div>
                                </div>
                            </div>
                        </div>
                        <div className="box2">
                            <div className="group2">
                                <div className="divwrapper2">
                                    <div className="textwrapper2">危険度2</div>
                                </div>
                            </div>
                        </div>
                        <div className="box2">
                            <div className="group2">
                                <div className="divwrapper2">
                                    <div className="textwrapper2">危険度3</div>
                                </div>
                            </div>
                        </div>
                        <div className="box2">
                            <div className="group2">
                                <div className="divwrapper2">
                                    <div className="textwrapper2">危険度4</div>
                                </div>
                            </div>
                        </div>
                        <div className="box2">
                            <div className="group2">
                                <div className="divwrapper2">
                                    <div className="textwrapper2">危険度5</div>
                                </div>
                            </div>
                        </div>
                        <div className="box2">
                            <div className="group2">
                                <div className="divwrapper2">
                                    <div className="textwrapper2">安全</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dangerous;
