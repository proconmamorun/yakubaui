import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { fetchUsersWithPositionsData, fetchRescuePositionsData, fetchPublicServantPositionsData } from '../positionsService';
import "./SafeCheckDesign.css";

//muiコンポーネントのインストール
import { Input as BaseInput } from '@mui/base/Input';
import { styled, Theme } from '@mui/system';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';

// SafeCheckコンポーネントの引数で使用するインターフェース
interface SafeCheckProps {
	area: string;
	filterDistrict: string;
}

// 町民の位置情報のインターフェース
interface UserWithPosition {
	id: string;
	name?: string;
	latitude: number; // 緯度
	longitude: number; // 経度
	district: string; // 地区
	safety?: string;  // 安否情報 ("無事" など)
}

// 救助隊の位置情報のインターフェース
interface RescuePosition {
	id: string;
	latitude: number;
	longitude: number;
}

// 役場職員の位置情報のインターフェース
interface PublicServantPosition {
	id: string;
	latitude: number;
	longitude: number;
}

// grey カラーパレットの定義
const grey = {
	50: '#F3F6F9',
	100: '#E5EAF2',
	200: '#DAE2ED',
	300: '#C7D0DD',
	400: '#B0B8C4',
	500: '#9DA8B7',
	600: '#6B7A90',
	700: '#434D5B',
	800: '#303740',
	900: '#1C2025',
};

// blue カラーパレットの定義
const blue = {
	100: '#DAECFF',
	200: '#b6daff',
	400: '#3399FF',
	500: '#007FFF',
	600: '#0072E5',
	900: '#003A75',
};

const InputElement = styled('input')(({ theme }: { theme: Theme }) => `
  width: 320px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 4px ${
	theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
};

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  &:focus-visible {
    outline: 0;
  }
`);

const SafeCheck: React.FC<SafeCheckProps> = ({ area, filterDistrict }) => {
	// 各種ステート管理
	const [usersWithPositions, setUsersWithPositions] = useState<UserWithPosition[]>([]);
	const [rescuePositions, setRescuePositions] = useState<RescuePosition[]>([]);
	const [publicServantPositions, setPublicServantPositions] = useState<PublicServantPosition[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number } | null>(null);
	const [isMapView, setIsMapView] = useState<boolean>(false);
	const [filter, setFilter] = useState<string>('all');

	// Google Maps API ローダー
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // 環境変数からAPIキーを取得
	});

	console.log(area);

	// データのフェッチ処理
	useEffect(() => {
		const fetchData = async () => {
			setUsersWithPositions(await fetchUsersWithPositionsData());
			setRescuePositions(await fetchRescuePositionsData());
			setPublicServantPositions(await fetchPublicServantPositionsData());
		};
		fetchData();
	}, []);

	// 町民をクリックした際の位置情報を設定する処理
	const handleUserClick = (latitude: number, longitude: number) => {
		setMapCenter({ lat: latitude, lng: longitude });
		setIsMapView(true);
	};

	// 検索ボックスの値が変更された際の処理
	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};


	// フィルターボタンがクリックされた際の処理
	const handleFilterChange = (
		event: React.MouseEvent<HTMLElement>,
		newFilter: string | null
	) => {
		// newFilterがnullではない場合にのみフィルタを更新する
		if (newFilter !== null) {
			setFilter(newFilter);
		}
	};

	// 検索条件と地区フィルター、安否フィルターに基づいて町民をフィルタリング
	const filteredUsers = usersWithPositions.filter(user => {
		// 地区フィルターの適用
		const matchesDistrict = !filterDistrict || user.district === filterDistrict;

		// 検索フィルターの適用
		const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(typeof user.safety === 'string' && user.safety.toLowerCase().includes(searchTerm.toLowerCase()));

		// 安否フィルターの適用
		const matchesSafety = filter === 'all' ||
			(filter === 'safe' && (user.safety?.toLowerCase() === '無事' || user.safety === undefined || user.safety === null)) ||
			(filter === 'danger' && user.safety?.toLowerCase() === '救助が必要');

		return matchesDistrict && matchesSearch && matchesSafety;
	});

	// 町民のマーカーアイコンを安否情報に基づいて設定
	const getMarkerIcon = (safety: string) => {
		if (typeof google === 'undefined' || !google.maps) {
			// Google Mapsがまだ準備できていない場合はundefinedを返す
			return undefined;
		}
	
		const color = safety === "救助が必要" ? 'red' : safety === "無事" ? 'green' : 'white';
		return {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 8,
			fillColor: color,
			fillOpacity: 1,
			strokeColor: 'black',
			strokeWeight: 0
		};
	};
	

	return (
		<div className={"safe-container"}>
			<p>SafeCheck - 現在のエリア: {area || '未指定'}</p>

			{/* 検索ボックス */}
			<div className="base-Input-root">
				<BaseInput
					slots={{ input: InputElement }}
					aria-label="search"
					placeholder="名前や安否で検索"
					value={searchTerm}
					onChange={handleSearchChange}
				/>
			</div>
			{/* フィルターボタン */}
			<ToggleButtonGroup
				value={filter}
				exclusive
				onChange={handleFilterChange}
				aria-label="filter"
			>
				<ToggleButton value="all" aria-label="全員">
					全員
				</ToggleButton>
				<ToggleButton value="safe" aria-label="無事">
					無事
				</ToggleButton>
				<ToggleButton value="danger" aria-label="危険">
					危険
				</ToggleButton>
			</ToggleButtonGroup>

			{/* 町民の安否情報テーブル */}
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell className="name">Name</TableCell>
							<TableCell className="safety">Safety</TableCell>
							<TableCell className="position">Position</TableCell>
						</TableRow>
					</TableHead>
					<TableBody className="citizentable">
						{filteredUsers.length > 0 ? (
							filteredUsers.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="username">{user.name ?? '名前なし'}</TableCell>
									{/* 名前がない場合のデフォルト値 */}
									<TableCell className="usersafety">{user.safety ?? '不明'}</TableCell>
									{/* 安否がない場合のデフォルト値 */}
									<TableCell className="userposition">
										緯度 {user.latitude}, 経度 {user.longitude}
										<Button
											variant="contained"
											onClick={() => handleUserClick(user.latitude, user.longitude)}
											size="small"
											sx={{ ml: 2 }}
										>
											位置情報
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={3}>該当する町民は見つかりません。</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* 地図表示 */}
			{isMapView && mapCenter && isLoaded && (
				<GoogleMap mapContainerStyle={{width: '70vw', height: '60vh'}} center={mapCenter} zoom={20}>
					{usersWithPositions.map(position => (
						<Marker
							key={position.id}
							position={{lat: position.latitude, lng: position.longitude}}
							icon={getMarkerIcon(position.safety ?? "")}
						/>
					))}
					{/* 救助隊のマーカー（無条件表示） */}
					{rescuePositions.map(rescue => (
						<Marker
							key={rescue.id}
							position={{ lat: rescue.latitude, lng: rescue.longitude }}
							icon={{
								path: google.maps.SymbolPath.CIRCLE,  // 丸いマーカーの形状
								scale: 10,  // アイコンのサイズ
								fillColor: '#E69F00',  // 塗りつぶしの色
								fillOpacity: 1,  // 塗りつぶしの不透明度
								strokeWeight: 2,  // 枠線の太さ
								strokeColor: 'white'  // 枠線の色
							}}
						/>
					))}
					{/* 役場職員のマーカー（無条件表示） */}
					{publicServantPositions.map(publicServant => (
						<Marker
							key={publicServant.id}
							position={{ lat: publicServant.latitude, lng: publicServant.longitude }}
							icon={{
								path: google.maps.SymbolPath.CIRCLE,  // 丸いマーカーの形状
								scale: 10,  // アイコンのサイズ
								fillColor: '#2FA268',  // 塗りつぶしの色
								fillOpacity: 1,  // 塗りつぶしの不透明度
								strokeWeight: 2,  // 枠線の太さ
								strokeColor: 'white'  // 枠線の色
							}}
						/>
					))}
				</GoogleMap>
			)}
		</div>
	);
};

export default SafeCheck;
