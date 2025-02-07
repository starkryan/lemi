import { useSignIn } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Link, Redirect, useRouter } from 'expo-router';
import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Modal,
  Image,
  Pressable,
} from 'react-native';
import { Toast } from 'toastify-react-native';

import { useOAuthFlow } from '../../utils/oauth';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const onSelectOAuth = useOAuthFlow();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);

  const onEmailSubmit = React.useCallback(async () => {
    if (!isLoaded || !emailAddress) return;
    setIsLoading(true);

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: emailAddress,
      });

      const passwordFactor = supportedFirstFactors?.find((factor) => factor.strategy === 'password');

      if (passwordFactor) {
        setShowPasswordModal(true);
      } else {
        await signIn.create({
          identifier: emailAddress,
          strategy: 'email_code',
        });
        setShowOTPModal(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        Toast.error((err as any).errors?.[0]?.message || err.message);
      } else {
        Toast.error('Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress]);

  const onPasswordSubmit = React.useCallback(async () => {
    if (!isLoaded || !password) return;
    setIsLoading(true);

    try {
      const attempt = await signIn.create({
        identifier: emailAddress,
        strategy: 'password',
        password,
      });

      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        Toast.success('Welcome back!');
        try {
          router.replace('/(app)');
        } catch (navError) {
          console.error('Navigation error:', navError);
          Toast.error('Error navigating to app');
        }
      } else {
        setShowOTPModal(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        Toast.error((err as any).errors?.[0]?.message || err.message);
      } else {
        Toast.error('Invalid password');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, password]);

  const onOTPSubmit = React.useCallback(async () => {
    if (!isLoaded || !code) return;
    setIsLoading(true);

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        Toast.success('Welcome back!');
        router.replace('/(app)');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        Toast.error((err as any).errors?.[0]?.message || err.message);
      } else {
        Toast.error('Invalid code');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code]);

  // Add cleanup effect
  React.useEffect(() => {
    return () => {
      setEmailAddress('');
      setPassword('');
      setCode('');
      setIsLoading(false);
      setShowPasswordModal(false);
      setShowOTPModal(false);
    };
  }, []);

  // Update the navigation to sign-up
  const navigateToSignUp = () => {
    setEmailAddress(''); // Clear state before navigation
    setPassword('');
    router.replace('/(auth)/sign-up');
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#343541]">
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  // Add an error boundary
  if (!signIn) {
    return (
      <View className="flex-1 items-center justify-center bg-[#343541]">
        <Text className="text-white">Error loading authentication</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-[#343541]">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="flex-1 justify-center py-8">
              <View className="mb-10 px-8">
                <Text className="mb-3 text-center text-3xl font-bold text-white">Sign in</Text>
                <Text className="text-center text-base text-gray-300">to continue to Lemi</Text>
              </View>

              {/* Social Login Button */}
              <View className="mb-8 px-8">
                <TouchableOpacity
                  onPress={onSelectOAuth}
                  disabled={isLoading}
                  className="w-full flex-row items-center justify-center space-x-3 rounded-xl border-2 border-gray-600 bg-transparent px-4 py-3.5">
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Image source={require('../../assets/google.png')} className="h-6 w-6" />
                      <Text className="text-base font-medium text-white ml-2">
                        Continue with Google
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View className="mb-8 flex-row items-center px-8">
                <View className="h-[1px] flex-1 bg-gray-600" />
                <Text className="mx-4 text-gray-300">or</Text>
                <View className="h-[1px] flex-1 bg-gray-600" />
              </View>

              {/* Email Input */}
              <View className="space-y-5 px-8">
                <View>
                  <Text className="mb-2 font-medium text-gray-300">Email address</Text>
                  <TextInput
                    className="rounded-xl border-2 border-gray-600 bg-transparent p-4 text-white"
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter email"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Continue Button */}
              <View className="mt-8 px-8">
                <TouchableOpacity
                  className="rounded-xl bg-[#10a37f] p-4 shadow-sm active:bg-[#0e906f]"
                  onPress={onEmailSubmit}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-lg font-semibold text-white">Continue</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View className="mt-6 flex-row justify-center">
                <Text className="text-gray-300">Don't have an account? </Text>
                <Pressable onPress={navigateToSignUp}>
                  <Text className="font-semibold text-[#10a37f]">Sign up</Text>
                </Pressable>
              </View>

              {/* Forgot Password Link */}
              <View className="mt-4 flex-row justify-center">
                <Pressable onPress={() => router.push('/(auth)/reset-password')}>
                  <Text className="font-semibold text-[#10a37f]">Forgot password?</Text>
                </Pressable>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Password Modal */}
        <Modal
          visible={showPasswordModal}
          transparent
          statusBarTranslucent
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}>
          <TouchableWithoutFeedback onPress={() => setShowPasswordModal(false)}>
            <View className="flex-1 justify-end bg-black/50">
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View className="rounded-t-3xl bg-[#343541] p-8">
                  <View className="mb-1 items-end">
                    <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                      <FontAwesome name="times" size={24} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mb-4 text-2xl font-bold text-white">Enter Password</Text>
                  <TextInput
                    className="mb-4 rounded-xl border-2 border-gray-600 bg-transparent p-4 text-white"
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    className="rounded-xl bg-[#10a37f] p-4 shadow-sm active:bg-[#0e906f]"
                    onPress={onPasswordSubmit}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center text-lg font-semibold text-white">Sign In</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* OTP Modal */}
        <Modal
          visible={showOTPModal}
          transparent
          statusBarTranslucent
          animationType="slide"
          onRequestClose={() => setShowOTPModal(false)}>
          <TouchableWithoutFeedback onPress={() => setShowOTPModal(false)}>
            <View className="flex-1 justify-end bg-black/50">
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View className="rounded-t-3xl bg-[#343541] p-8">
                  <View className="mb-1 items-end">
                    <TouchableOpacity onPress={() => setShowOTPModal(false)}>
                      <FontAwesome name="times" size={24} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mb-2 text-2xl font-bold text-white">Enter Verification Code</Text>
                  <Text className="mb-4 text-gray-300">
                    We've sent a verification code to your email
                  </Text>
                  <TextInput
                    className="mb-4 rounded-xl border-2 border-gray-600 bg-transparent p-4 text-white"
                    placeholder="Enter verification code"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                  />
                  <TouchableOpacity
                    className="rounded-xl bg-[#10a37f] p-4 shadow-sm active:bg-[#0e906f]"
                    onPress={onOTPSubmit}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center text-lg font-semibold text-white">Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}