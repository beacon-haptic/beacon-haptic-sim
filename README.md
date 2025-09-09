
## 📝 各ファイル・フォルダの役割

- **app/**  
  アプリの本体コード。画面ごとのコンポーネントをここに配置。  
  `app/(tabs)/index.tsx` がトップ画面（Home）になる。

- **assets/**  
  アプリで使う画像やアイコン類。`app.json` で参照される `icon.png` と `splash.png` は必須。

- **components/**  
  UI 部品（テンプレートに含まれるもの）。未使用なら削除してもOK。

- **constants/**  
  共通で使う定数（色設定など）。未使用なら削除してもOK。

- **hooks/**  
  独自のカスタムフック。テンプレのままなら未使用。

- **scripts/**  
  開発補助スクリプト。Expo テンプレの `reset-project.js` が入っている。

- **.gitignore**  
  Git に含めないファイルを指定。`node_modules/` や `.expo/` を除外。

- **app.json**  
  Expo の設定ファイル。アプリ名、アイコン、スプラッシュ画面などを定義。

- **package.json**  
  プロジェクトの依存関係一覧と `npm run start` などのスクリプト定義。

- **package-lock.json**  
  依存ライブラリの正確なバージョンを固定。基本的に自動生成。

- **tsconfig.json**  
  TypeScript の設定。型チェックやビルド対象を制御。

- **eslint.config.js**  
  コードの書き方を統一するためのルール定義。

- **README.md**  
  プロジェクトの説明書。セットアップ方法やフォルダ構成を記載。

---


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
