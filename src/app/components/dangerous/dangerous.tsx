import React, { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import './dangerous.css';
import { storage, db } from "../firebase/firebaseConfig";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import EXIF from 'exif-js';  // EXIFライブラリをインポート

const Dangerous: React.FC = () => {
    const [images, setImages] = useState<{ url: string, coords: { lat: number, lng: number } | null }[]>([]);
    const [selectedImage, setSelectedImage] = useState<{ url: string, coords: { lat: number, lng: number } | null } | null>(null);
    const [danger, setDanger] = useState<number | null>(null);
    const maxImages = 6;
    const dangerLevels = [1, 2, 3, 4, 5];

    useEffect(() => {
        const fetchImages = async () => {
            const storageRef = ref(storage, ''); // Firebase Storageのルート参照
            const imageList = await listAll(storageRef);
            const limitedItems = imageList.items.slice(0, maxImages); // 画像の取得制限
            const urls = await Promise.all(limitedItems.map(item => getDownloadURL(item)));

            // Firestoreから各画像の座標を取得
            const imagesWithCoords = await Promise.all(urls.map(async (url) => {
                const q = query(collection(db, "dangerousImages"), where("imageUrl", "==", url));
                const querySnapshot = await getDocs(q);
                let coords = null;
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.latitude && data.longitude) {
                        coords = { lat: data.latitude, lng: data.longitude };
                        console.log(`座標取得成功: 緯度 ${data.latitude}, 経度 ${data.longitude}`); // デバッグ用ログ
                    } else {
                        console.log("座標データが見つかりませんでした。");
                    }
                });
                return { url, coords };
            }));

            setImages(imagesWithCoords);
        };

        fetchImages();
    }, []);

    const handleImageClick = (image: { url: string, coords: { lat: number, lng: number } | null }) => {
        setSelectedImage(image);
        if (image.coords) {
            console.log(`選択された画像の座標: 緯度 ${image.coords.lat}, 経度 ${image.coords.lng}`); // デバッグ用ログ
        } else {
            console.log("選択された画像には座標がありません。");
        }
    };

    const extractCoordinatesFromImage = async (file: File) => {
        return new Promise<{ lat: number, lng: number } | null>(async (resolve, reject) => {
            if (!(file instanceof File)) {
                return reject(new Error('Input is not a valid File'));
            }

            try {
                const arrayBuffer = await file.arrayBuffer(); // Convert file to ArrayBuffer
                const exifData = EXIF.readFromBinaryFile(arrayBuffer); // Read EXIF from ArrayBuffer
                const latitude = getGps(exifData, 'Latitude');
                const longitude = getGps(exifData, 'Longitude');

                if (latitude && longitude) {
                    resolve({ lat: latitude, lng: longitude });
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('Error reading EXIF data:', error);
                reject(error);
            }
        });
    };

    const getGps = (exifData: any, key: string) => {
        const gps = exifData[`GPS${key}`];
        const ref = exifData[`GPS${key}Ref`];

        if (gps instanceof Array) {
            const degrees = gps[0];
            const minutes = gps[1];
            const seconds = gps[2];
            let dd = degrees + minutes / 60 + seconds / (60 * 60);

            if (['S', 'W'].includes(ref)) {
                dd *= -1;
            }
            return dd;
        }
        return null;
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];

            // EXIFデータから座標を取得
            const coords = await extractCoordinatesFromImage(file);
            if (coords) {
                console.log(`画像から取得された座標: 緯度 ${coords.lat}, 経度 ${coords.lng}`);
                setSelectedImage({ url: URL.createObjectURL(file), coords });
            } else {
                console.log("EXIFデータに座標が含まれていませんでした。");
            }
        }
    };

    const takeImageMeta = async (image: { url: string, coords: { lat: number, lng: number } | null }) => {
        // メタデータを取得する関数
        if (image.coords) {
            return {
                lat: image.coords.lat,
                lon: image.coords.lng
            };
        } else {
            // EXIFデータなどからメタデータを抽出するロジックをここに追加できます
            return {
                lat: null,
                lon: null
            };
        }
    };

    const dangerousChoice = (level: number) => {
        setDanger(level);
        console.log(`危険度: ${level}`);
    };
    
    const dangerSend = async () => {
        if (selectedImage && danger !== null) {
            try {
                // メタデータの取得
                const imageMeta = await takeImageMeta(selectedImage);
    
                const imageMetadata = {
                    latitude: imageMeta.lat,  // 緯度
                    longitude: imageMeta.lon,  // 経度
                    dangerLevel: danger,  // 危険度
                    imageUrl: selectedImage.url, // 画像URL
                    timestamp: new Date().toISOString() // 日時を追加
                };
    
                await addDoc(collection(db, "dangerousImages"), imageMetadata);
                console.log("危険度データが正常に保存されました。");
    
            } catch (error) {
                console.error("データの保存中にエラーが発生しました:", error);
            }
        } else {
            console.error("画像か危険度が選択されていません。");
        }
    };
    

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <div className="container1">
                <div className="sentakupicture">
                    <div className="text1">選択した画像</div>
                    <div className="grayBox">
                        {selectedImage && (
                            <div className="choicePicture">
                                <img src={selectedImage.url} alt="Selected" />
                                {selectedImage.coords ? (
                                    <p>座標: 緯度 {selectedImage.coords.lat}, 経度 {selectedImage.coords.lng}</p>
                                ) : (
                                    <p>座標がありません</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid">
                    {images.map((image, index) => (
                        <div key={index} className="picture" onClick={() => handleImageClick(image)}>
                            <img src={image.url} alt={`Uploaded ${index}`} />
                        </div>
                    ))}
                </div>
                <div className="kikendoBox">
                    <div className="text2">危険度を選択してください。
                    </div>
                        <div className="grid2">
                            <div className="group2">
                                <div className="divwrapper2">
									{dangerLevels.map((level) => (
										<div key={level} className="textwrapper2">
											<button onClick={() => dangerousChoice(level)} className="textwrapper2">危険度{level}</button>
										</div>
									))}
								<button onClick={() => dangerousChoice(0)} className="textwrapper2">安全</button>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default Dangerous;
