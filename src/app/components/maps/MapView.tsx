import React, { useEffect, useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore"; // deleteDoc をインポート
import { db } from "../firebase/firebaseConfig";
import Image from 'next/image';
import legend from '/public/images/legend.png';
import {
  fetchUsersWithPositionsData,
  fetchRescuePositionsData,
  fetchPublicServantPositionsData,
} from "../positionsService";
import { create } from "domain";
import { query, orderBy } from "firebase/firestore";

interface MapViewProps {
  mapCenter: {
    lat: number;
    lng: number;
  };
}

// 危険度の構造体の定義
type Position = {
  id: string;
  latitude: number;
  longitude: number;
  dangerlevel: number;
};

// 町民の位置情報のインターフェース
export interface UserWithPosition {
  id: string;
  name?: string;
  safety?: string;
  latitude: number;
  longitude: number;
  district: string; // string型に統一
}

// 救助隊の位置情報などを定義
interface RescuePosition {
  id: string;
  latitude: number;
  longitude: number;
  doing: string;
}

// 役場職員の位置情報などを定義
interface PublicServantPosition {
  id: string;
  latitude: number;
  longitude: number;
  doing: string;
}

interface Figure {
  latitude: number;
  longitude: number;
  dangerlevel: number;
}

const MapView: React.FC<MapViewProps> = ({ mapCenter }) => {
  const [usersWithPositions, setUsersWithPositions] = useState<
    UserWithPosition[]
  >([]);
  const [rescuePositions, setRescuePositions] = useState<RescuePosition[]>([]);
  const [publicServantPositions, setPublicServantPositions] = useState<
    PublicServantPosition[]
  >([]);
  const [isRescueView, setIsRescueView] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isPublicServantView, setIsPublicServantView] =
    useState<boolean>(false);
  const [isPositionsDataView, setIsPositionsDataView] = useState<boolean>(true);
  const [isCitizen, setIsCitizenView] = useState<boolean>(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [figure, setFigure] = useState<Figure>({
    latitude: 0,
    longitude: 0,
    dangerlevel: 0,
  });

  // Google Maps API ローダー
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // 環境変数からAPIキーを取得
    language: 'ja'
  });

  // 位置情報を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await fetchUsersWithPositionsData();
        setUsersWithPositions(users);

        const rescue = await fetchRescuePositionsData();
        setRescuePositions(rescue);

        const publicServants = await fetchPublicServantPositionsData();
        setPublicServantPositions(publicServants);

        fetchPositionsData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ピンの情報を取得
	const fetchPositionsData = async () => {
		try {
			const positionsCollection = collection(db, "locations");

      // タイムスタンプでソート
      const q = query(positionsCollection, orderBy("createdAt", "desc"));
      const positionsSnapshot = await getDocs(q);

      // 最新の危険箇所のみを保持
			const positionsList = new Map<string, Position>();
      positionsSnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Position, 'id'>;
        const key = `${data.latitude},${data.longitude}`;
        if (!positionsList.has(key)) {
          positionsList.set(key, {id: doc.id, ...data});
        }
      });
      setPositions(Array.from(positionsList.values()));
		} catch (error) {
			console.error("Error fetching positions: ", error);
		}
	};

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof Figure,
  ) => {
    setFigure({
      ...figure,
      [field]: parseInt(event.target.value, 10),
    });
  };

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const position = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        try {
          const newFigure = {
            latitude: position.lat,
            longitude: position.lng,
            dangerlevel: figure.dangerlevel,
            createdAt: new Date(),
          };
          if (newFigure.dangerlevel === 0) {
            alert("危険度を設定してください");
            return;
          }
          await addDoc(collection(db, "locations"), newFigure);
          fetchPositionsData();
          setFigure({
            latitude: 0,
            longitude: 0,
            dangerlevel: 0,
          });
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      }
    },
    [figure],
  );

  // ピンをクリックして削除する処理
  const handleMarkerClick = async (id: string) => {
    try {
      const confirmDelete = window.confirm("削除してもよろしいですか？");
      if (confirmDelete) {
        await deleteDoc(doc(db, "locations", id)); // Firestoreから削除
        setPositions(positions.filter((position) => position.id !== id)); // ローカルステートから削除
      }
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  // 町民のマーカーアイコンを安否情報に基づいて設定
  const getMarkerIcon = (safety: string) => {
    if (typeof google === "undefined" || !google.maps) {
      // Google Mapsがまだ準備できていない場合はundefinedを返す
      return undefined;
    }

    const color =
      safety === "救助が必要" ? "red" : safety === "無事" ? "green" : "white";
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "black",
      strokeWeight: 0,
    };
  };

  // 救助隊のマーカーアイコンを現在の状況に基づいて設定
	const getRescueIcon = (doing: string) => {
		const RescueiconUrl = doing === "救助中" ? "/images/MAMORUN_map_icon.png" : doing === "待機中" ? "/images/MAMORUN_map_icon_495960.png" : 'white';

		return {
			url: RescueiconUrl,
			scaledSize: new google.maps.Size(30, 30),
		}
	};

	// 役場職員のマーカーアイコンを現在の状況に基づいて設定
	const getPublicServantIcon = (doing: string) => {
		const PublicServantUrl = doing === "見回り中" ? "/images/MAMORUN_MAP_ICON_YAKUIN.png" : doing === "待機中" ? "/images/MAMORUN_MAP_ICON_YAKUIN_GRAY2.png" : 'white';

		return {
			url: PublicServantUrl,
			scaledSize: new google.maps.Size(30, 30),
		}
	};

  return (
    <div>
      <Image src={legend} className="lagend-png" alt="legend" />
    <div className={"container-lagend"}>
      <div className={"buttons"}>
        <div>
          <p className={`label ${isRescueView ? "label-on" : ""}`}>救助</p>
          <div
              className={`toggle ${isRescueView ? "toggle-on" : ""}`}
              onClick={() => setIsRescueView(!isRescueView)}
          >
            <div className="toggle-text-off">OFF</div>
            <div className="glow-comp"></div>
            <div className="toggle-button"></div>
            <div className="toggle-text-on">ON</div>
          </div>
        </div>
        <div>
          <p className={`label ${isPublicServantView ? "label-on" : ""}`}>
            役場
          </p>
          <div
              className={`toggle ${isPublicServantView ? "toggle-on" : ""}`}
              onClick={() => setIsPublicServantView(!isPublicServantView)}
          >
            <div className="toggle-text-off">OFF</div>
            <div className="glow-comp"></div>
            <div className="toggle-button"></div>
            <div className="toggle-text-on">ON</div>
          </div>
        </div>
        <div>
          <p className={`label ${isCitizen ? "city-label-on" : ""}`}>
            町民
          </p>
          <div
              className={`toggle ${isCitizen ? "city-toggle-on" : ""}`}
              onClick={() => setIsCitizenView(!isCitizen)}
          >
            <div className="toggle-text-off">OFF</div>
            <div className="glow-comp"></div>
            <div className="toggle-button"></div>
            <div className="toggle-text-on">ON</div>
          </div>
        </div>
        <div>
          <p className={`label ${isPositionsDataView ? "label-on" : ""}`}>危険箇所</p>
          <div
              className={`toggle ${isPositionsDataView ? "toggle-on" : ""}`}
              onClick={() => setIsPositionsDataView(!isPositionsDataView)}
          >
            <div className="toggle-text-off">OFF</div>
            <div className="glow-comp"></div>
            <div className="toggle-button"></div>
            <div className="toggle-text-on">ON</div>
          </div>
        </div>
      </div>
      </div>

      <div className={"maps"}>
        {isLoaded && (
            <GoogleMap
                mapContainerStyle={{width: "70vw", height: "70vh"}}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
            >
              {isCitizen &&
                  usersWithPositions.map((position) => (
                  <Marker
                      key={position.id}
                      position={{lat: position.latitude, lng: position.longitude}}
                      icon={getMarkerIcon(position.safety ?? "")}
                      /*label={{
                        text: String(position.dangerlevel),
                        fontSize: "16px",
                        color: "black",
                      }}*/
                      onClick={() => handleMarkerClick(position.id)}
                  />
              ))}
            
            {/*危険箇所のマーカー*/}
            {isPositionsDataView &&
              positions.map((position) => (
              <Marker
                key={position.id}
                position={{ lat: position.latitude, lng: position.longitude }}
                label={{
                  text: String(position.dangerlevel),
                  fontSize: "16px",
                  color: "black",
                }}
                onClick={() => handleMarkerClick(position.id)} // マーカーをクリックして削除
              />
            ))}

            {/* 救助隊のマーカー（丸いマーカーを使用） */}
            {isRescueView &&
              rescuePositions.map((rescue) => (
                <Marker
                  key={rescue.id}
                  position={{ lat: rescue.latitude, lng: rescue.longitude }}
                  icon={
                    getRescueIcon(rescue.doing)}
                />
              ))}

            {/* 役場の人のマーカー*/}
            {isPublicServantView &&
              publicServantPositions.map(
                (publicServant: PublicServantPosition) => (
                  <Marker
                    key={publicServant.id}
                    position={{
                      lat: publicServant.latitude,
                      lng: publicServant.longitude,
                    }}
                    icon={getPublicServantIcon(publicServant.doing)}
                  />
                ),
              )}
          </GoogleMap>
        )}

        <div className={"publish-container"}>
          <button
            className={"publish"}
            onClick={() => setIsPublished(!isPublished)}
          >
            町民地図に掲載
          </button>
          <div
            className={`${isPublished ? "publish-buttons-on" : "publish-buttons-off"} publish-buttons`}
          >
            <button
              onClick={() =>
                handleInputChange(
                  {
                    target: { value: "1" },
                  } as React.ChangeEvent<HTMLInputElement>,
                  "dangerlevel",
                )
              }
            >
              危険度１
            </button>
            <button
              onClick={() =>
                handleInputChange(
                  {
                    target: { value: "2" },
                  } as React.ChangeEvent<HTMLInputElement>,
                  "dangerlevel",
                )
              }
            >
              危険度２
            </button>
            <button
              onClick={() =>
                handleInputChange(
                  {
                    target: { value: "3" },
                  } as React.ChangeEvent<HTMLInputElement>,
                  "dangerlevel",
                )
              }
            >
              危険度３
            </button>
            <button
              onClick={() =>
                handleInputChange(
                  {
                    target: { value: "4" },
                  } as React.ChangeEvent<HTMLInputElement>,
                  "dangerlevel",
                )
              }
            >
              危険度４
            </button>
            <button
              onClick={() =>
                handleInputChange(
                  {
                    target: { value: "5" },
                  } as React.ChangeEvent<HTMLInputElement>,
                  "dangerlevel",
                )
              }
            >
              危険度５
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
