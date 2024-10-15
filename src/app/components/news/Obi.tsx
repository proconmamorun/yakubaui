"use client";
import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";  // Firestoreのインスタンス
import "./Obi.css";

export function Obi() {
    const [messages, setMessages] = useState<string[]>([]);  // 初期状態は空
    const sliderRef = useRef(null);  // スライダーのDOM参照用
    const lastItemRef = useRef(null); // 最後のアイテムを参照

    useEffect(() => {
        // Firestoreから最新のアラートメッセージを取得
        const fetchAlertMessage = async () => {
            try {
                // Firestoreから `alert` コレクションの最新ドキュメントを取得
                const alertQuery = query(collection(db, "alert"), orderBy("createdAt", "desc"), limit(1));
                const querySnapshot = await getDocs(alertQuery);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const alertData = doc.data();
                    const alertMessage = alertData.text || "警告: データがありません";  // `text`フィールドを取得、ない場合はデフォルト値
                    setMessages([alertMessage]);  // 初期メッセージを設定
                } else {
                    setMessages(["警告: データがありません"]); // データがない場合の処理
                }
            } catch (error) {
                console.error("Firestoreからメッセージの取得に失敗しました:", error);
                setMessages(["エラー: メッセージを取得できません", "エラー: メッセージを取得できません", "エラー: メッセージを取得できません"]); // エラーハンドリング
            }
        };

        fetchAlertMessage();  // Firestoreからデータを取得

        // Intersection Observer を設定して、最後の帯が画面に入ったら新しいメッセージを追加
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // 新しいメッセージを追加し、古いメッセージを削除して無限にスライド
                    setMessages((prevMessages) => {
                        const newMessage = `新しい警告: ${Math.random()}`;  // 動的に新しいメッセージを生成
                        const updatedMessages = [...prevMessages.slice(1), newMessage];
                        return updatedMessages;
                    });
                }
            },
            { root: null, threshold: 1.0 } // 3枚目が完全に表示されたら発火
        );

        if (lastItemRef.current) {
            observer.observe(lastItemRef.current);
        }

        return () => {
            if (lastItemRef.current) {
                observer.unobserve(lastItemRef.current);
            }
        };
    }, []);

    return (
		<div>
			<div className="obiContainer">
				<p>最終確認</p>
				<div className= "obiPreview">
					<div className="textSlider" ref={sliderRef}>
						<img src="/images/obi-arrow.png" alt="矢印" className="arrowIcon" />
						<img src="/images/warning.png" alt="警告" className="warningIcon" />
						{messages.map((msg, index) => (
							<div key={index} className="sliderTextWithIcon">
								{msg}
							</div>
						))}
						<img src="/images/obi-arrow.png" alt="矢印" className="arrowIcon" />
					</div>

					<div className="textSliderBottom">
						<img src="/images/obi-arrow.png" alt="矢印" className="arrowIcon" />
						<img src="/images/warning.png" alt="警告" className="warningIcon" />
						{messages.map((msg, index) => (
							<div key={index} className="sliderTextWithIcon">
								{msg}
							</div>
						))}
						<img src="/images/obi-arrow.png" alt="矢印" className="arrowIcon" />
					</div>
				</div>
			</div>
		</div>
    );
}
