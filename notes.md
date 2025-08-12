//
to start app: npm run android
to start server: npm run servStart
to rebuild: npx expo prebuild
npx expo start ??
//
was created metro.config.js and added:
defaultConfig.resolver.assetExts.push('pte')
defaultConfig.resolver.assetExts.push('bin')
///
can't change recommended limits of ubuntu for mongodb:
-u (processes/threads): 64000 - only 23033
-l max locked memory : unlimited - I have 747004 limitation
///
fonts:
npx expo install @expo-google-fonts/montserrat
import { Montserrat_600semibold } from "@expo-google-fonts/montserrat;
const [fontsLoaded] = useFonts({
Montserrat_600SemiBold
});
Text style={[styles.something,{ fontFamily: "Montserrat_600SemiBold" }]}>
