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

## Configuration Google (Sign in / Sign up)

1. Ouvre https://console.cloud.google.com
2. Cree un projet Google Cloud (ou utilise un projet existant).
3. Va dans `APIs & Services` > `OAuth consent screen`, puis configure l'ecran de consentement.
4. Va dans `APIs & Services` > `Credentials` > `Create Credentials` > `OAuth client ID`.
5. Cree ces clients OAuth:
   - `Web application` (pour `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`)
   - `Android` (pour `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`)
   - `iOS` (pour `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`)
6. Recopie les client IDs dans le fichier `.env`.
7. Pour `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`, mets le meme client ID que Web si tu testes d'abord en Expo Go.
8. Redemarre Expo apres modification:

```bash
npx expo start -c
```
