import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Radar, Briefcase, LayoutDashboard, User } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import AvailableOrdersScreen from './src/screens/AvailableOrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();

const MyBagPlaceholder = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121415' }}>
    <Briefcase color="#abadae" size={48} />
    <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '900', color: '#FFF' }}>Mon Sac</Text>
    <Text style={{ color: '#595c5d' }}>Aucune commande acceptée</Text>
  </View>
);



function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let IconComponent = LayoutDashboard;
        if (route.name === 'Dashboard') IconComponent = LayoutDashboard;
        if (route.name === 'Missions') IconComponent = Radar;
        if (route.name === 'Mon Sac') IconComponent = Briefcase;
        if (route.name === 'Profil') IconComponent = User;

        const color = isFocused ? '#ae2900' : '#FFF';
        
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [
              isFocused ? styles.navItem : styles.navItemInactive,
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <View>
              <IconComponent color={color} size={24} />
              {route.name === 'Mon Sac' && <View style={styles.navBadge} />}
            </View>
            <Text style={[styles.navText, isFocused && { color: '#ae2900' }]}>{label.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={DarkTheme}>
          <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
          >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Missions" component={AvailableOrdersScreen} />
            <Tab.Screen name="Mon Sac" component={MyBagPlaceholder} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 80, 
    backgroundColor: '#1a1c1d', 
    borderTopWidth: 1, 
    borderTopColor: '#2c2f30', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingBottom: 10 
  },
  navItem: { alignItems: 'center', gap: 4 },
  navItemInactive: { alignItems: 'center', gap: 4, opacity: 0.4 },
  navText: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: '#FFF' },
  navBadge: { position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#ae2900', borderWidth: 2, borderColor: '#1a1c1d' },
});
