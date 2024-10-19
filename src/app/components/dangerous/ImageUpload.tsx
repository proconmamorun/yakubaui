/*import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import {storage, db } from "../firebase/firebaseconfig";

const uploadImage = async (file: File) => {
    if (!file) return;

    try {
        try {
            //アップロード
            const storageRef = ref(storage, `images/${file.name}`);
            await uploadBytes(storageRef, file);

            //ダウンロードURLを取得
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "images"), {
                url: downloadURL,
                path: `images/${file.name}`,
                createdAt: new Date().toISOString(),
            });

            console.log("画像が正常にアップロードされました");
    } catch (error) {
        console.error("エラーが発生しました: ", error);
    }
}
};*/

export {};