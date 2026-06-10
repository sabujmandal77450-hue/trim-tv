import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableNativeFeedback,
} from 'react-native';
import React, {useState} from 'react';
import {Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import {settingsStorage} from '../../lib/storage';
import useThemeStore from '../../lib/zustand/themeStore';
import * as Application from 'expo-application';

export const checkForUpdate = async (
  _setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  _autoDownload: boolean,
  _showToast: boolean = true,
) => {
  // No upstream update server configured for TrimTV.
  // Override this function with your own release API when you publish.
};

const About = () => {
  const {primary} = useThemeStore(state => state);
  const [autoDownload, setAutoDownload] = useState(
    settingsStorage.isAutoDownloadEnabled(),
  );
  const [autoCheckUpdate, setAutoCheckUpdate] = useState<boolean>(
    settingsStorage.isAutoCheckUpdateEnabled(),
  );

  const row = (label: string, value: string) => (
    <View className="bg-white/10 px-4 py-3 rounded-xl flex-row justify-between items-center">
      <Text className="text-white/80 text-sm">{label}</Text>
      <Text className="text-white font-semibold text-sm">{value}</Text>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{paddingBottom: 48}}>
      {/* Header */}
      <View className="px-5 pt-10 pb-6">
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{backgroundColor: primary + '22'}}>
          <MaterialCommunityIcons name="television-play" size={36} color={primary} />
        </View>
        <Text className="text-3xl font-bold text-white">TrimTV</Text>
        <Text className="text-gray-400 mt-1 text-sm">
          Your personal streaming companion
        </Text>
      </View>

      <View className="px-5 gap-3">
        {/* App Info */}
        <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">
          App Info
        </Text>
        <View className="gap-2">
          {row('Version', `v${Application.nativeApplicationVersion || '1.0.0'}`)}
          {row('Build', `${Application.nativeBuildVersion || '1'}`)}
          {row('Platform', 'Android TV')}
          {row('Engine', 'Hermes / React Native')}
        </View>

        {/* Update Preferences */}
        <Text className="text-gray-500 text-xs uppercase tracking-widest mt-4 mb-1">
          Update Preferences
        </Text>
        <View className="bg-white/10 rounded-xl overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
            <View className="flex-1 mr-4">
              <Text className="text-white text-sm font-medium">
                Auto-install Updates
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Install APK updates automatically when available
              </Text>
            </View>
            <Switch
              value={autoDownload}
              onValueChange={() => {
                setAutoDownload(v => {
                  settingsStorage.setAutoDownloadEnabled(!v);
                  return !v;
                });
              }}
              thumbColor={autoDownload ? primary : '#555'}
              trackColor={{false: '#333', true: primary + '66'}}
            />
          </View>
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-1 mr-4">
              <Text className="text-white text-sm font-medium">
                Check on Launch
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Automatically check for updates when the app starts
              </Text>
            </View>
            <Switch
              value={autoCheckUpdate}
              onValueChange={() => {
                setAutoCheckUpdate(v => {
                  settingsStorage.setAutoCheckUpdateEnabled(!v);
                  return !v;
                });
              }}
              thumbColor={autoCheckUpdate ? primary : '#555'}
              trackColor={{false: '#333', true: primary + '66'}}
            />
          </View>
        </View>

        {/* Legal */}
        <Text className="text-gray-500 text-xs uppercase tracking-widest mt-4 mb-1">
          Legal
        </Text>
        <View className="bg-white/10 rounded-xl px-4 py-4">
          <Text className="text-gray-300 text-sm leading-5">
            TrimTV does not host, store, or provide any media content. All
            content is sourced by the user via third-party provider extensions.
            TrimTV has no affiliation with or control over any external provider.
          </Text>
        </View>

        {/* Open Source */}
        <Text className="text-gray-500 text-xs uppercase tracking-widest mt-4 mb-1">
          Open Source
        </Text>
        <View className="bg-white/10 rounded-xl overflow-hidden">
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple('#ffffff15', false)}>
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons name="source-branch" size={20} color={primary} />
                <Text className="text-white text-sm">
                  Built on Vega open-source (MIT)
                </Text>
              </View>
              <Feather name="external-link" size={16} color="#666" />
            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    </ScrollView>
  );
};

export default About;
