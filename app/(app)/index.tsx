import AntDesign from '@expo/vector-icons/AntDesign';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

// Environment configuration (should use actual environment variables in production)
const CONFIG = {
  GEMINI_API_KEY: Constants.expoConfig?.extra?.GOOGLE_GEMINI_API_KEY || '',
  THEME_COLOR: '#10a37f', // Primary green color
  BG_COLOR: '#343541',    // Dark background color
};

interface DropdownSelectProps {
  options: string[];
  selected: number;
  onSelect: (value: number) => void;
  label: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ options, selected, onSelect, label }) => {
  const dropdownData = options.map((option, index) => ({
    label: option,
    value: index,
  }));

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-bold text-gray-300">{label}</Text>
      <Dropdown
        data={dropdownData}
        value={selected}
        onChange={(item) => onSelect(item.value)}
        labelField="label"
        valueField="value"
        placeholder="Select option"
        placeholderStyle={{ color: '#9CA3AF', fontSize: 12 }}
        selectedTextStyle={{ color: '#ffffff', fontSize: 12, fontWeight: '500' }}
        style={{
          borderColor: '#4b5563',
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 8,
          height: 32,
          backgroundColor: '#2a2b32',
          justifyContent: 'center',
        }}
        containerStyle={{
          borderRadius: 10,
          marginTop: 4,
        }}
        maxHeight={200}
        renderItem={(item, isSelected) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 6,
              paddingHorizontal: 8,
              backgroundColor: isSelected ? CONFIG.THEME_COLOR + '20' : '#2a2b32',
            }}>
            <AntDesign name="star" size={14} color={isSelected ? CONFIG.THEME_COLOR : "gray"} />
            <Text className="text-sm font-bold text-gray-300">{item.label}</Text>
            {isSelected && (
              <AntDesign name="check" size={14} color="#19C37D" style={{ marginLeft: 'auto' }} />
            )}
          </View>
        )}
        renderRightIcon={() => (
          <AntDesign name="down" size={14} color="gray" style={{ marginLeft: 4 }} />
        )}
      />
    </View>
  );
};

const MainPage = () => {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [scriptOptions, setScriptOptions] = useState({
    audience: {
      value: 0,
      options: ['General', 'Beginners', 'Professionals', 'Students', 'Entrepreneurs'],
    },
    age: {
      value: 0,
      options: ['All', 'Kids', 'Teens', 'Adults', 'Seniors', 'Parents'],
    },
    style: {
      value: 0,
      options: ['Casual', 'Professional', 'Informal', 'Humorous', 'Serious', 'Funny'],
    },
    language: {
      value: 0,
      options: [
        'English',
        'Spanish',
        'French',
        'German',
        'Italian',
        'Portuguese',
        'Russian',
        'Turkish',
        'Hindi',
        'Hinglish',
        'Arabic',
        'Japanese',
        'Korean',
        'Chinese',
        'Other',
      ],
    },
    duration: {
      value: 0,
      options: ['1-5', '5-10', '10-15'],
    },
    memes: {
      value: 0,
      options: ['Yes', 'No'],
    },
    platform: {
      value: 0,
      options: ['YouTube', 'YouTube Shorts'],
    },
  });

  const generateScript = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic before generating');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Create a YouTube script about: ${topic.trim()}
        Target Audience: ${scriptOptions.audience.options[scriptOptions.audience.value].trim()}
        Style: ${scriptOptions.style.options[scriptOptions.style.value]}
        Duration: ${scriptOptions.duration.options[scriptOptions.duration.value]} minutes
        Age Group: ${scriptOptions.age.options[scriptOptions.age.value]}
        Language: ${scriptOptions.language.options[scriptOptions.language.value]}
        Include Memes: ${scriptOptions.memes.options[scriptOptions.memes.value]}
        Platform: ${scriptOptions.platform.options[scriptOptions.platform.value]}

        Structure Requirements:
        - Engaging hook in the first 5 seconds
        - Clear introduction with topic overview
        - Main content divided into 3-5 key points
        - Summary and call-to-action in conclusion
        - Include visual cues for transitions
        - Add suggested background music type
        - Specify camera angles where appropriate

        Important Notes:
        - Use only ${scriptOptions.language.options[scriptOptions.language.value]} language
        - Format in markdown with clear section headings
        - Keep paragraphs concise for readability
      `.trim();

      if (!CONFIG.GEMINI_API_KEY) {
        throw new Error('Missing API key configuration');
      }

      const result = await model.generateContent(prompt);
      const generatedText = await result.response.text();
      setScript(generatedText);
    } catch (error) {
      console.error('Generation error:', error);
      setError('Failed to generate script. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileShare = async () => {
    try {
      const fileName = `script-${Date.now()}.md`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, script);
      await Share.share({
        title: `YouTube Script: ${topic}`,
        url: fileUri,
        message: script,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save or share the script');
    }
  };

  const updateScriptOption = (key: string, val: number) => {
    setScriptOptions(prev => ({
      ...prev,
      [key]: { ...prev[key as keyof typeof prev], value: val }
    }));
  };

  const ActionButton = ({
    icon,
    text,
    onPress,
  }: {
    icon: React.ReactNode;
    text: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center rounded-lg bg-green-500 p-2"
      accessibilityLabel={text}>
      {icon}
      <Text className="ml-2 font-bold text-white">{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#343541]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" className="px-4">
      

          {/* Topic Input */}
          <View className="mb-4">
            <Text className="mb-2 text-lg font-bold text-gray-300">Video Topic</Text>
            <TextInput
              placeholder="Enter your main topic or keyword..."
              value={topic}
              onChangeText={setTopic}
              multiline
              className="min-h-[100px] rounded-xl border border-gray-600 bg-[#2a2b32] p-4 text-white"
              accessibilityLabel="Video topic input"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Script Options */}
          <View className="flex-row flex-wrap">
            {Object.entries(scriptOptions).map(([key, option], index) => (
              <View key={`${key}-${index}`} className="mb-4 w-1/2 px-2">
                <DropdownSelect
                  label={key.toUpperCase()}
                  options={option.options}
                  selected={option.value}
                  onSelect={(val) => updateScriptOption(key, val)}
                />
              </View>
            ))}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            className="mb-6 items-center justify-center rounded-xl bg-[#10a37f] p-4 active:bg-[#0e906f]"
            onPress={generateScript}
            disabled={loading}
            accessibilityRole="button">
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <AntDesign name="arrowright" size={24} color="white" />
                <Text className="ml-2 text-lg font-bold text-white">Generate Script</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Error Message */}
          {error && <Text className="mb-4 text-center text-red-500">{error}</Text>}

          {/* Generated Script */}
          {script && (
            <ScrollView className="mb-4 rounded-xl border border-gray-600 bg-[#2a2b32] p-4">
              <Text className="mb-4 text-lg font-bold text-white">Your Script</Text>

              <View className="mb-4 flex-row justify-between gap-2">
                <ActionButton
                  icon={<AntDesign name="copy1" size={20} color="white" />}
                  text="Copy"
                  onPress={() => Clipboard.setStringAsync(script)}
                />
                <ActionButton
                  icon={<AntDesign name="sharealt" size={20} color="white" />}
                  text="Share"
                  onPress={handleFileShare}
                />
              </View>

              <Markdown
                style={{
                  body: { color: '#ffffff', lineHeight: 22 },
                  heading1: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
                  heading2: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginVertical: 10 },
                  paragraph: { color: '#ffffff', marginVertical: 8 },
                  list_item: { color: '#ffffff', marginVertical: 4 },
                  code_inline: { backgroundColor: '#4b5563', padding: 4, borderRadius: 4 },
                  blockquote: {
                    marginVertical: 8,
                    paddingLeft: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: '#4b5563',
                  },
                  blockquote_content: { color: '#ffffff', fontStyle: 'italic' },
                  blockquote_author: { color: '#ffffff', fontWeight: 'bold' },
                  blockquote_source: { color: '#ffffff', fontStyle: 'italic' },
                  blockquote_source_url_text_url_text: { color: '#ffffff', fontWeight: 'bold' },
                  paragraph_link: { color: '#10a37f', textDecorationLine: 'underline' },
                }}>
                {script}
              </Markdown>
            </ScrollView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MainPage;
