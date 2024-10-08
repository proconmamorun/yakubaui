This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 開発メモ

ここに開発で共有しておく文章を書く



実行はこれで
```bash
npm run dev
```


### コードの格納方法について

基本app/srcにアプリのファイルはすべてあります。

componentsに要素に分けて入れるようにしています。

なっちゃんから来たコードは一旦goverment-componetsに入れています。
→なっちゃんのコードから分割、npm installして使えるようになったら自然に消えていくと思う

要するに一旦置いてあるので、移行の時は今後ともそうしてください



### 今後の方針
一旦sidebar周りは見た目のみ完成、→ボタンを押してプロパティを変更できるように

map周り、なっちゃんからgooglemapを引っ張ってきた　→grayboxと書いてあるdivにこれを表示できるように

list周り、muiというコンポーネントかなんかでlistを作りたい　楽だから

