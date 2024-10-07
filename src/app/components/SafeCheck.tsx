import React from 'react'; 
import './SafeCheckDesign.css';

interface SafeCheckProps {
	area: string; // areaを受け取る
}

const SafeCheck: React.FC<SafeCheckProps> = ({ area }) => {
	return (
		<div>
			<p>SafeCheck</p>
			<p>現在のエリア: {area}</p>
			<div className="container">
				<div className="hyouBox">
					<p>SafeCheck コンポーネントの内容</p>
				</div>
				<div className="searchBox">
					<input type="text" placeholder="検索ボックス" />
				</div>
				<div className="greenBox1"></div>
				<div className="greenBox2"></div>
			</div>
		</div>
	);
}

export default SafeCheck;
