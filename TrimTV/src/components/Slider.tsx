import {Image, Pressable, Text, TouchableOpacity, View} from 'react-native';
import React, {memo, useCallback} from 'react';
import type {Post} from '../lib/providers/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {HomeStackParamList} from '../App';
import useContentStore from '../lib/zustand/contentStore';
import {FlashList} from '@shopify/flash-list';
import SkeletonLoader from './Skeleton';
import useThemeStore from '../lib/zustand/themeStore';
import {Feather} from '@expo/vector-icons';

const CARD_W = 120;
const CARD_H = 178;

const Slider = ({
  isLoading,
  title,
  posts,
  filter,
  providerValue,
  isSearch = false,
  error,
}: {
  isLoading: boolean;
  title: string;
  posts: Post[];
  filter: string;
  providerValue?: string;
  isSearch?: boolean;
  error?: string;
}): React.ReactElement => {
  const {provider} = useContentStore(state => state);
  const {primary} = useThemeStore(state => state);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const handleMorePress = useCallback(() => {
    navigation.navigate('ScrollList', {
      title,
      filter,
      providerValue,
      isSearch,
    });
  }, [navigation, title, filter, providerValue, isSearch]);

  const handleItemPress = useCallback(
    (item: Post) => {
      navigation.navigate('Info', {
        link: item.link,
        provider: item.provider || providerValue || provider?.value,
        poster: item?.image,
      });
    },
    [navigation, providerValue, provider?.value],
  );

  const renderItem = useCallback(
    ({item}: {item: Post}) => (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleItemPress(item)}
        style={{marginRight: 10}}>
        {/* Poster card */}
        <View
          style={{
            width: CARD_W,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#1a1a1a',
          }}>
          <Image
            source={{
              uri:
                item?.image ||
                'https://placehold.jp/24/1a1a1a/555/120x178.png?text=TrimTV',
            }}
            style={{width: CARD_W, height: CARD_H}}
            resizeMode="cover"
          />
          {/* Subtle bottom gradient overlay on card */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />
        </View>
        {/* Title below card */}
        <Text
          numberOfLines={2}
          style={{
            color: '#e5e5e5',
            fontSize: 11,
            marginTop: 5,
            width: CARD_W,
            lineHeight: 15,
          }}>
          {item.title}
        </Text>
      </TouchableOpacity>
    ),
    [handleItemPress],
  );

  const keyExtractor = useCallback((item: Post) => item.link, []);

  return (
    <Pressable className="mt-5 px-3">
      {/* Section header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {/* Accent bar */}
          <View
            style={{width: 3, height: 18, borderRadius: 2, backgroundColor: primary}}
          />
          <Text
            className="text-white font-semibold text-base"
            numberOfLines={1}>
            {title}
          </Text>
        </View>
        {filter !== 'recent' && (
          <TouchableOpacity
            onPress={handleMorePress}
            className="flex-row items-center gap-1">
            <Text style={{color: primary, fontSize: 12}}>See all</Text>
            <Feather name="chevron-right" size={13} color={primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-row gap-2">
          {Array.from({length: 6}).map((_, i) => (
            <View key={i} className="gap-1">
              <SkeletonLoader height={CARD_H} width={CARD_W} />
              <SkeletonLoader height={12} width={CARD_W} />
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          estimatedItemSize={CARD_W + 10}
          showsHorizontalScrollIndicator={false}
          data={posts}
          horizontal
          contentContainerStyle={{paddingRight: 6}}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          removeClippedSubviews
          drawDistance={400}
          ListFooterComponent={
            !isLoading && error ? (
              <View className="w-64 h-28 justify-center items-center">
                <Text className="text-red-400 text-center text-xs">{error}</Text>
              </View>
            ) : !isLoading && posts.length === 0 ? (
              <View className="w-64 h-28 justify-center items-center">
                <Text className="text-gray-500 text-center text-xs">
                  No content found
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </Pressable>
  );
};

export default memo(Slider);
