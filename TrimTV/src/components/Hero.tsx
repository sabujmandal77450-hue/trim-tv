import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import React, {memo, useState, useCallback} from 'react';
import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeStackParamList, SearchStackParamList} from '../App';
import useContentStore from '../lib/zustand/contentStore';
import useHeroStore from '../lib/zustand/herostore';
import {settingsStorage} from '../lib/storage';
import {Feather, Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {useHeroMetadata} from '../lib/hooks/useHomePageData';
import useThemeStore from '../lib/zustand/themeStore';

interface HeroProps {
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
}

const Hero = memo(({isDrawerOpen, onOpenDrawer}: HeroProps) => {
  const [searchActive, setSearchActive] = useState(false);
  const {provider} = useContentStore(state => state);
  const {hero} = useHeroStore(state => state);
  const {primary} = useThemeStore(state => state);

  const [showHamburgerMenu] = useState(() =>
    settingsStorage.showHamburgerMenu(),
  );
  const [isDrawerDisabled] = useState(
    () => settingsStorage.getBool('disableDrawer') || false,
  );

  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const searchNavigation =
    useNavigation<NativeStackNavigationProp<SearchStackParamList>>();

  const {data: heroData, isLoading, error} = useHeroMetadata(
    hero?.link || '',
    provider.value,
  );

  const handleKeyboardHide = useCallback(() => {
    setSearchActive(false);
  }, []);

  React.useEffect(() => {
    const subscription = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardHide,
    );
    return () => subscription?.remove();
  }, [handleKeyboardHide]);

  const handleSearchSubmit = useCallback(
    (text: string) => {
      if (text.startsWith('https://')) {
        navigation.navigate('Info', {link: text});
      } else {
        searchNavigation.navigate('ScrollList', {
          providerValue: provider.value,
          filter: text,
          title: provider.display_name,
          isSearch: true,
        });
      }
    },
    [navigation, searchNavigation, provider.value, provider.display_name],
  );

  const handlePlayPress = useCallback(() => {
    if (hero?.link) {
      navigation.navigate('Info', {
        link: hero.link,
        provider: provider.value,
        poster: heroData?.image || heroData?.poster || heroData?.background,
      });
    }
  }, [navigation, hero?.link, provider.value, heroData]);

  const imageSource = React.useMemo(() => {
    const fallback =
      'https://placehold.jp/24/1a1a1a/ffffff/500x750.png?text=TrimTV';
    if (!heroData) {
      return {uri: fallback};
    }
    return {
      uri:
        heroData.background ||
        heroData.image ||
        heroData.poster ||
        fallback,
    };
  }, [heroData]);

  const displayGenres = React.useMemo(() => {
    if (!heroData) {
      return [];
    }
    return (heroData.genre || heroData.tags || []).slice(0, 3);
  }, [heroData]);

  return (
    <View className="relative h-[58vh]">
      {/* Hero backdrop image */}
      {isLoading ? (
        <View className="h-full w-full bg-[#111]" />
      ) : (
        <Image
          source={imageSource}
          className="h-full w-full"
          style={{resizeMode: 'cover'}}
        />
      )}

      {/* Multi-layer gradient — stronger than before */}
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.6)', 'black']}
        locations={[0, 0.25, 0.65, 1]}
        className="absolute inset-0"
      />
      {/* Side vignette */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.3)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        className="absolute inset-0"
      />

      {/* ── Top bar ── */}
      <View className="absolute top-0 left-0 right-0 pt-10 px-4 z-30 flex-row justify-between items-center">
        {/* Hamburger / brand */}
        {!searchActive && (
          <View
            style={{
              opacity:
                showHamburgerMenu && !isDrawerDisabled ? 1 : 0,
            }}>
            <Pressable
              style={{opacity: isDrawerOpen ? 0 : 1}}
              onPress={onOpenDrawer}>
              <Ionicons name="menu-sharp" size={28} color="white" />
            </Pressable>
          </View>
        )}

        {/* TrimTV wordmark — shows when search is inactive */}
        {!searchActive && (
          <View className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons
              name="television-play"
              size={18}
              color={primary}
            />
            <Text
              className="font-bold text-white text-base tracking-wide"
              style={{letterSpacing: 1}}>
              TRIM<Text style={{color: primary}}>TV</Text>
            </Text>
          </View>
        )}

        {/* Search input */}
        {searchActive && (
          <Animated.View
            entering={FadeIn.duration(200)}
            className="flex-1">
            <TextInput
              onBlur={() => setSearchActive(false)}
              autoFocus
              onSubmitEditing={e => handleSearchSubmit(e.nativeEvent.text)}
              placeholder={`Search ${provider.display_name}…`}
              className="w-full px-4 h-10 rounded-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
              }}
              placeholderTextColor="#aaa"
            />
          </Animated.View>
        )}

        {/* Search toggle */}
        {!searchActive && (
          <Pressable
            onPress={() => setSearchActive(true)}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{backgroundColor: 'rgba(255,255,255,0.15)'}}>
            <Feather name="search" size={18} color="white" />
          </Pressable>
        )}
      </View>

      {/* ── Hero content ── */}
      <View className="absolute bottom-8 left-0 right-0 z-20 px-5">
        {!isLoading && heroData && (
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            className="gap-3">
            {/* Logo or title */}
            {heroData.logo ? (
              <Image
                source={{uri: heroData.logo}}
                style={{width: 190, height: 90, resizeMode: 'contain'}}
              />
            ) : (
              <Text
                className="text-white text-2xl font-bold"
                numberOfLines={2}
                style={{textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4}}>
                {heroData.name || heroData.title}
              </Text>
            )}

            {/* Genre pills */}
            {displayGenres.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {displayGenres.map((genre: string, i: number) => (
                  <View
                    key={i}
                    className="px-3 py-1 rounded-full"
                    style={{backgroundColor: 'rgba(255,255,255,0.15)'}}>
                    <Text className="text-white text-xs font-medium">
                      {genre}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action buttons */}
            {hero?.link && (
              <View className="flex-row gap-3 mt-1">
                {/* Play — filled with theme colour */}
                <TouchableOpacity
                  onPress={handlePlayPress}
                  activeOpacity={0.8}
                  className="flex-row items-center gap-2 px-7 py-2.5 rounded-xl"
                  style={{backgroundColor: primary}}>
                  <FontAwesome6 name="play" size={14} color="white" />
                  <Text className="text-white font-bold text-base">Play</Text>
                </TouchableOpacity>

                {/* More Info — ghost */}
                <TouchableOpacity
                  onPress={handlePlayPress}
                  activeOpacity={0.8}
                  className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.25)',
                  }}>
                  <Feather name="info" size={15} color="white" />
                  <Text className="text-white font-semibold text-sm">Info</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <View className="gap-3">
            <View className="h-7 w-48 bg-white/15 rounded-lg" />
            <View className="flex-row gap-2">
              <View className="h-5 w-16 bg-white/10 rounded-full" />
              <View className="h-5 w-20 bg-white/10 rounded-full" />
            </View>
            <View className="h-10 w-32 bg-white/15 rounded-xl" />
          </View>
        )}

        {/* Error fallback */}
        {error && !isLoading && (
          <View>
            <Text className="text-white text-xl font-bold">
              {hero?.title || 'Content Unavailable'}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Unable to load details — pull to refresh
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

Hero.displayName = 'Hero';

export default Hero;
