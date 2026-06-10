/**
 * SchoolMode.tsx — TrimTV School Features
 *
 * Provides:
 *  • Study Focus Mode  — toggle that saves a flag for parent screens to honour
 *  • Study Reminder    — schedule a local notification every N minutes
 *  • Session Counter   — tracks how many study sessions you've completed today
 *  • Quick Study Timer — visual countdown in-screen (no background process needed)
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  TouchableNativeFeedback,
  Alert,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import {MaterialCommunityIcons, Feather, Ionicons} from '@expo/vector-icons';
import useThemeStore from '../../lib/zustand/themeStore';
import {settingsStorage} from '../../lib/storage';
import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

/* ── Storage keys (MMKV via settingsStorage generic getBool / setString) ── */
const SCHOOL_FOCUS_KEY = 'school_focusMode';
const SCHOOL_SESSIONS_KEY = 'school_sessionsToday';
const SCHOOL_SESSION_DATE_KEY = 'school_sessionDate';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadSessionCount(): number {
  const savedDate = settingsStorage.getString(SCHOOL_SESSION_DATE_KEY);
  if (savedDate !== getTodayStr()) {
    settingsStorage.setString(SCHOOL_SESSION_DATE_KEY, getTodayStr());
    settingsStorage.setString(SCHOOL_SESSIONS_KEY, '0');
    return 0;
  }
  return parseInt(settingsStorage.getString(SCHOOL_SESSIONS_KEY) || '0', 10);
}

/* ── Timer presets (minutes) ── */
const TIMER_PRESETS = [10, 15, 25, 30, 45, 60];
const REMINDER_PRESETS = [15, 30, 45, 60, 90];

const SchoolMode = () => {
  const {primary} = useThemeStore(state => state);

  /* Focus mode */
  const [focusMode, setFocusMode] = useState(
    settingsStorage.getBool(SCHOOL_FOCUS_KEY) || false,
  );

  /* Study timer */
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Session counter */
  const [sessions, setSessions] = useState(loadSessionCount);

  /* Reminder */
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [reminderActive, setReminderActive] = useState(false);

  /* ── Timer logic ── */
  const startTimer = useCallback(() => {
    if (timerRunning) {
      return;
    }
    const total = selectedMinutes * 60;
    setSecondsLeft(total);
    setTimerRunning(true);
  }, [timerRunning, selectedMinutes]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerRunning(false);
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    if (timerRunning && secondsLeft !== null) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setTimerRunning(false);
            // Count completed session
            const next = loadSessionCount() + 1;
            settingsStorage.setString(SCHOOL_SESSION_DATE_KEY, getTodayStr());
            settingsStorage.setString(SCHOOL_SESSIONS_KEY, String(next));
            setSessions(next);
            ToastAndroid.show(
              `Session complete! 🎉 That's ${next} today.`,
              ToastAndroid.LONG,
            );
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* ── Reminder logic ── */
  const scheduleReminder = useCallback(async () => {
    try {
      await notifee.requestPermission();
      const channelId = await notifee.createChannel({
        id: 'study_reminder',
        name: 'Study Reminders',
        importance: AndroidImportance.HIGH,
      });
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + reminderMinutes * 60 * 1000,
      };
      await notifee.createTriggerNotification(
        {
          title: '📚 Study Reminder',
          body: `Time for your next ${selectedMinutes}-minute study session!`,
          android: {channelId, importance: AndroidImportance.HIGH},
        },
        trigger,
      );
      setReminderActive(true);
      ToastAndroid.show(
        `Reminder set for ${reminderMinutes} min from now`,
        ToastAndroid.SHORT,
      );
    } catch (e) {
      Alert.alert('Permission needed', 'Allow notifications to set reminders.');
    }
  }, [reminderMinutes, selectedMinutes]);

  const cancelReminder = useCallback(async () => {
    await notifee.cancelAllNotifications();
    setReminderActive(false);
    ToastAndroid.show('Reminder cancelled', ToastAndroid.SHORT);
  }, []);

  /* ── Reset sessions ── */
  const resetSessions = () => {
    Alert.alert('Reset Session Count', 'Clear today's session count?', [
      {text: 'Cancel'},
      {
        text: 'Reset',
        onPress: () => {
          settingsStorage.setString(SCHOOL_SESSIONS_KEY, '0');
          settingsStorage.setString(SCHOOL_SESSION_DATE_KEY, getTodayStr());
          setSessions(0);
        },
      },
    ]);
  };

  /* ── Preset pill helper ── */
  const Pill = ({
    value,
    unit,
    selected,
    onPress,
  }: {
    value: number;
    unit: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="px-4 py-2 rounded-full mr-2"
      style={{
        backgroundColor: selected ? primary : 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: selected ? primary : 'rgba(255,255,255,0.15)',
      }}>
      <Text
        className="text-sm font-semibold"
        style={{color: selected ? 'white' : '#aaa'}}>
        {value}
        {unit}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{
        paddingTop: StatusBar.currentHeight || 0,
        paddingBottom: 60,
      }}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <View className="flex-row items-center gap-3 mb-1">
          <MaterialCommunityIcons
            name="school-outline"
            size={28}
            color={primary}
          />
          <Text className="text-white text-2xl font-bold">School Mode</Text>
        </View>
        <Text className="text-gray-400 text-sm ml-10">
          Focus tools to help you study smarter
        </Text>
      </View>

      <View className="px-5 gap-5">
        {/* ── Focus Mode ── */}
        <View className="bg-[#111] rounded-2xl overflow-hidden">
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-1 mr-4">
              <Text className="text-white font-semibold text-base">
                Study Focus Mode
              </Text>
              <Text className="text-gray-400 text-xs mt-1 leading-4">
                When enabled, the app reminds you to limit screen time and
                prioritise study sessions.
              </Text>
            </View>
            <Switch
              value={focusMode}
              onValueChange={v => {
                setFocusMode(v);
                settingsStorage.setBool(SCHOOL_FOCUS_KEY, v);
                ToastAndroid.show(
                  v ? 'Focus mode on 🎯' : 'Focus mode off',
                  ToastAndroid.SHORT,
                );
              }}
              thumbColor={focusMode ? primary : '#555'}
              trackColor={{false: '#333', true: primary + '55'}}
            />
          </View>
          {focusMode && (
            <View
              className="mx-4 mb-4 px-3 py-2 rounded-xl flex-row items-center gap-2"
              style={{backgroundColor: primary + '22'}}>
              <Ionicons name="shield-checkmark" size={16} color={primary} />
              <Text style={{color: primary, fontSize: 12, flexShrink: 1}}>
                Focus mode active — stay on task!
              </Text>
            </View>
          )}
        </View>

        {/* ── Study Timer ── */}
        <View className="bg-[#111] rounded-2xl p-4 gap-4">
          <Text className="text-white font-semibold text-base">
            Pomodoro Timer
          </Text>

          {/* Digit display */}
          <View className="items-center py-4">
            {timerRunning && secondsLeft !== null ? (
              <Text
                style={{
                  fontSize: 64,
                  fontWeight: '700',
                  color: primary,
                  letterSpacing: 4,
                  fontVariant: ['tabular-nums'],
                }}>
                {formatTime(secondsLeft)}
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 64,
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.15)',
                  letterSpacing: 4,
                }}>
                {String(selectedMinutes).padStart(2, '0')}:00
              </Text>
            )}
            <Text className="text-gray-500 text-xs mt-1">
              {timerRunning ? 'session in progress' : 'select duration below'}
            </Text>
          </View>

          {/* Preset pills */}
          {!timerRunning && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TIMER_PRESETS.map(m => (
                <Pill
                  key={m}
                  value={m}
                  unit=" min"
                  selected={selectedMinutes === m}
                  onPress={() => setSelectedMinutes(m)}
                />
              ))}
            </ScrollView>
          )}

          {/* Start / Stop */}
          <View className="flex-row gap-3">
            {!timerRunning ? (
              <TouchableNativeFeedback
                onPress={startTimer}
                background={TouchableNativeFeedback.Ripple(
                  primary + '33',
                  false,
                )}>
                <View
                  className="flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2"
                  style={{backgroundColor: primary}}>
                  <Feather name="play" size={16} color="white" />
                  <Text className="text-white font-bold">Start Session</Text>
                </View>
              </TouchableNativeFeedback>
            ) : (
              <TouchableNativeFeedback
                onPress={stopTimer}
                background={TouchableNativeFeedback.Ripple('#ff000033', false)}>
                <View className="flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 bg-red-900/50">
                  <Feather name="square" size={16} color="#f87171" />
                  <Text className="text-red-300 font-bold">Stop Session</Text>
                </View>
              </TouchableNativeFeedback>
            )}
          </View>
        </View>

        {/* ── Session Counter ── */}
        <View className="bg-[#111] rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white font-semibold text-base">
                Sessions Today
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Each completed timer counts as one session
              </Text>
            </View>
            <View className="items-end">
              <Text
                style={{fontSize: 36, fontWeight: '800', color: primary}}>
                {sessions}
              </Text>
              <TouchableOpacity onPress={resetSessions}>
                <Text className="text-gray-500 text-xs">reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Study Reminder ── */}
        <View className="bg-[#111] rounded-2xl p-4 gap-4">
          <Text className="text-white font-semibold text-base">
            Study Reminder
          </Text>
          <Text className="text-gray-400 text-xs -mt-2">
            Get a notification to start studying after this many minutes
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {REMINDER_PRESETS.map(m => (
              <Pill
                key={m}
                value={m}
                unit=" min"
                selected={reminderMinutes === m}
                onPress={() => setReminderMinutes(m)}
              />
            ))}
          </ScrollView>

          {!reminderActive ? (
            <TouchableNativeFeedback
              onPress={scheduleReminder}
              background={TouchableNativeFeedback.Ripple(primary + '33', false)}>
              <View
                className="py-3 rounded-xl flex-row items-center justify-center gap-2"
                style={{backgroundColor: primary + '22', borderWidth: 1, borderColor: primary + '55'}}>
                <MaterialCommunityIcons
                  name="bell-ring-outline"
                  size={18}
                  color={primary}
                />
                <Text style={{color: primary, fontWeight: '600'}}>
                  Set Reminder ({reminderMinutes} min)
                </Text>
              </View>
            </TouchableNativeFeedback>
          ) : (
            <TouchableNativeFeedback
              onPress={cancelReminder}
              background={TouchableNativeFeedback.Ripple('#ff000033', false)}>
              <View className="py-3 rounded-xl flex-row items-center justify-center gap-2 bg-red-900/30">
                <MaterialCommunityIcons
                  name="bell-off-outline"
                  size={18}
                  color="#f87171"
                />
                <Text className="text-red-400 font-semibold">
                  Cancel Reminder
                </Text>
              </View>
            </TouchableNativeFeedback>
          )}
        </View>

        {/* Tips */}
        <View
          className="rounded-2xl p-4 gap-2"
          style={{backgroundColor: primary + '11', borderWidth: 1, borderColor: primary + '33'}}>
          <Text style={{color: primary, fontWeight: '700', fontSize: 13}}>
            📖  Study Tips
          </Text>
          {[
            'Use 25-min sessions with 5-min breaks (Pomodoro technique)',
            'Put your phone face-down during study sessions',
            'Review notes within 24 hours to improve retention',
            'Teach what you learned to someone else — best way to remember',
          ].map((tip, i) => (
            <Text key={i} className="text-gray-400 text-xs leading-5">
              {'• '}{tip}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SchoolMode;
