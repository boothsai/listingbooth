import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, Alert, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// For local testing on a physical device, replace with your machine's IPv4 address.
// Automatically detected IP: 192.168.2.210
const DEV_URL = __DEV__ ? 'http://192.168.2.210:4200' : 'http://10.0.2.2:4200';
const TARGET_URL = __DEV__ ? DEV_URL : 'https://listingbooth.com';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });

    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true; 
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Inject the push token directly into the Next.js window object so the PWA can use it
  const injectedJavaScript = `
    window.__EXPO_PUSH_TOKEN__ = '${expoPushToken}';
    window.__IS_NATIVE_APP__ = true;
    // Dispatch a custom event so the PWA knows the token is ready
    window.dispatchEvent(new CustomEvent('ExpoTokenReady', { detail: '${expoPushToken}' }));
    true;
  `;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <WebView
        ref={webViewRef}
        source={{ uri: TARGET_URL }}
        style={styles.webview}
        injectedJavaScript={expoPushToken ? injectedJavaScript : undefined}
        onMessage={(event) => {
          // Listen for messages from Next.js (e.g., triggering haptics, saving sessions)
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'CONSOLE') {
              console.log('[Next.js Webview]:', data.message);
            }
          } catch (e) {}
        }}
        geolocationEnabled={true}
        allowsInlineMediaPlayback={true}
        bounces={false}
        overScrollMode="never"
        pullToRefreshEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 24 : 0, 
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#da291c',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Push notifications blocked by user');
      return undefined;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'listingbooth-mobile', // Replace with EAS projectId later
      })).data;
      console.log('Expo Push Token generated:', token);
    } catch (e: any) {
      console.log('Push token generation failed:', e.message);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
