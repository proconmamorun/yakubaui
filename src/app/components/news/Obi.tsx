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
                const alertQuery = query(collection(db, "alert"), orderBy("createdAt", "desc"), limit(1));
                const querySnapshot = await getDocs(alertQuery);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const alertData = doc.data();
                    const alertMessage = alertData.text || "警告: データがありません";
                    setMessages([alertMessage]);
                } else {
                    setMessages(["警告: データがありません"]);
                }
            } catch (error) {
                console.error("Firestoreからメッセージの取得に失敗しました:", error);
                setMessages(["エラー: メッセージを取得できません"]);
            }
        };

        // ???秒ごとにFirestoreのデータを取得
        const intervalId = setInterval(() => {
            fetchAlertMessage();
        }, 5000);  // 現在:5秒

        // Intersection Observer を設定して、最後の帯が画面に入ったら新しいメッセージを追加
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setMessages((prevMessages) => {
                        const newMessage = `新しい警告: ${Math.random()}`;
                        const updatedMessages = [...prevMessages.slice(1), newMessage];
                        return updatedMessages;
                    });
                }
            },
            { root: null, threshold: 1.0 }
        );

        if (lastItemRef.current) {
            observer.observe(lastItemRef.current);
        }

        // コンポーネントがアンマウントされたときにintervalとobserverを解除
        return () => {
            clearInterval(intervalId);  // インターバルをクリア
            if (lastItemRef.current) {
                observer.unobserve(lastItemRef.current);
            }
        };
    }, []);
    return (
		<div>
			<div className="obiContainer">
				<h2 className="mokuzi">最終確認</h2>
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
