import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ProfileScreen from './src/screens/ProfileScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import TopNavBar from './src/components/TopNavBar';
import BottomNavBar from './src/components/BottomNavBar';
import { Colors } from './src/components/UIPrimitives';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoreScreen from './src/screens/StoreScreen';
import FloatingCartButton from './src/components/FloatingCartButton';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import { useDirectoryStore } from './src/store/directoryStore';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DiscoveryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoveryHome" component={DiscoveryScreen} />
      <Stack.Screen name="Store" component={StoreScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [bootState, setBootState] = React.useState<'splash' | 'login' | 'app'>('splash');

  if (bootState === 'splash') {
    return (
      <SplashScreen 
        onFinish={(all, nearby) => {
          useDirectoryStore.getState().initDirectory(all, nearby);
          setBootState('app');
        }} 
        onNavigateToLogin={() => setBootState('login')}
      />
    );
  }

  if (bootState === 'login') {
    return <LoginScreen onLoginSuccess={() => setBootState('splash')} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <View style={styles.container}>
              <TopNavBar />
              <NavigationContainer>
                <Tab.Navigator
                  tabBar={(props) => (
                    <View>
                      <FloatingCartButton state={props.state} />
                      <BottomNavBar {...props} />
                    </View>
                  )}
                  screenOptions={{ headerShown: false }}
                >
                  <Tab.Screen name="Discovery" component={DiscoveryStack} />
                  <Tab.Screen name="Cart" component={CartScreen} />
                  <Tab.Screen name="Orders" component={OrdersScreen} />
                  <Tab.Screen name="Profile" component={ProfileScreen} />
                </Tab.Navigator>
              </NavigationContainer>
            </View>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f7',
  },
  content: {
    flex: 1,
  }
});
