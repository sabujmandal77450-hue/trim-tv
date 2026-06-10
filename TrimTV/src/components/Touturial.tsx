import {View, Text, StatusBar, TouchableOpacity} from 'react-native';
import React from 'react';
import {useState} from 'react';
import useContentStore from '../lib/zustand/contentStore';
import useThemeStore from '../lib/zustand/themeStore';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {MaterialCommunityIcons, Feather} from '@expo/vector-icons';
import {settingsStorage} from '../lib/storage';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {RootStackParamList} from '../App';

const STEPS = [
  {
    icon: 'puzzle-outline' as const,
    title: 'Install a Provider',
    desc: 'Go to Settings → Extensions and paste a provider URL to unlock streaming sources.',
  },
  {
    icon: 'play-circle-outline' as const,
    title: 'Browse & Watch',
    desc: 'Once a provider is installed, head to Home to discover movies, series, and more.',
  },
  {
    icon: 'television-play' as const,
    title: 'Android TV Ready',
    desc: 'Navigate with your D-pad remote — left/right seeks, OK toggles controls.',
  },
];

const Tutorial = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {primary} = useThemeStore(state => state);
  const {provider: currentProvider, installedProviders} = useContentStore(
    state => state,
  );
  const [showTutorial, setShowTutorial] = useState<boolean>(!currentProvider);

  React.useEffect(() => {
    if (
      !currentProvider?.value ||
      !installedProviders ||
      installedProviders.length === 0
    ) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [installedProviders, currentProvider]);

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#000');
      StatusBar.setBarStyle('light-content');
    }, []),
  );

  const handleGoToExtensions = () => {
    if (settingsStorage.isHapticFeedbackEnabled()) {
      ReactNativeHapticFeedback.trigger('effectClick', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }
    navigation.navigate('TabStack', {
      screen: 'SettingsStack',
      params: {screen: 'Extensions'},
    });
  };

  if (!showTutorial) {
    return null;
  }

  return (
    <View className="flex-1 bg-black justify-center items-center px-6">
      <Animated.View
        entering={FadeInUp.duration(500).springify()}
        className="w-full max-w-sm items-center">
        {/* Brand mark */}
        <View className="mb-6 items-center">
          <MaterialCommunityIcons
            name="television-play"
            size={56}
            color={primary}
          />
          <Text
            className="text-white text-3xl font-bold mt-3"
            style={{letterSpacing: 2}}>
            TRIM<Text style={{color: primary}}>TV</Text>
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Your streaming companion
          </Text>
        </View>

        {/* Steps */}
        <View className="w-full gap-4 mb-8">
          {STEPS.map((step, i) => (
            <View
              key={i}
              className="flex-row items-start gap-4 bg-white/5 rounded-2xl p-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
                style={{backgroundColor: primary + '22'}}>
                <MaterialCommunityIcons
                  name={step.icon}
                  size={22}
                  color={primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">
                  {step.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-1 leading-4">
                  {step.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleGoToExtensions}
          activeOpacity={0.85}
          className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
          style={{backgroundColor: primary}}>
          <Feather name="download" size={18} color="white" />
          <Text className="text-white font-bold text-base">
            Install First Provider
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-600 text-xs mt-5 text-center">
          Providers are external — TrimTV does not host any content
        </Text>
      </Animated.View>
    </View>
  );
};

export default Tutorial;
