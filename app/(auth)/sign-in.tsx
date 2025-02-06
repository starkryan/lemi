import { useSignIn } from '@clerk/clerk-expo';
import { Link, Redirect, useRouter } from 'expo-router';
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
} from 'react-native';
import React from 'react';
import { Toast } from 'toastify-react-native';
import { useOAuthFlow } from '../../utils/oauth';
import { FontAwesome } from '@expo/vector-icons';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const onSelectOAuth = useOAuthFlow();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState(null);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [signInAttempt, setSignInAttempt] = React.useState(null);

  const onEmailSubmit = React.useCallback(async () => {
    if (!isLoaded || !emailAddress) return;
    setIsLoading(true);

    try {
      // First check if the user exists
      const { supportedFirstFactors } = await signIn.create({
        identifier: emailAddress,
      });

      const passwordFactor = supportedFirstFactors.find((factor) => factor.strategy === 'password');

      if (passwordFactor) {
        setShowPasswordModal(true);
      } else {
        // If no password is set, proceed with email code
        await signIn.create({
          identifier: emailAddress,
          strategy: 'email_code',
        });
        setShowOTPModal(true);
      }
    } catch (err) {
      Toast.error(err.errors?.[0]?.message || 'Failed to sign in');
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
        router.replace('/(app)');
      } else {
        // If 2FA is enabled, show OTP modal
        setSignInAttempt(attempt);
        setShowOTPModal(true);
      }
    } catch (err) {
      Toast.error(err.errors?.[0]?.message || 'Invalid password');
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
    } catch (err) {
      Toast.error(err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  if (redirectTo) {
    return <Redirect href={redirectTo} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="flex-1 justify-center">
              <View className="mb-8 px-6">
                <Text className="mb-2 text-center text-3xl font-bold text-black">Sign in</Text>
                <Text className="text-center text-base text-gray-600">to continue to Lemi</Text>
              </View>

              {/* Social Login Button */}
              <View className="mb-8 px-6">
                <TouchableOpacity
                  onPress={() => onSelectOAuth('oauth_google')}
                  className="w-full flex-row items-center justify-center space-x-3 rounded-full border border-gray-300 bg-white px-4 py-3">
                  <Image
                    source={require('../../assets/google.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-base font-medium text-black ml-2">Continue with Google</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View className="mb-8 flex-row items-center px-6">
                <View className="h-[1px] flex-1 bg-gray-300" />
                <Text className="mx-4 text-gray-500">or</Text>
                <View className="h-[1px] flex-1 bg-gray-300" />
              </View>

              {/* Email Input */}
              <View className="mb-6 space-y-4 px-6">
                <View>
                  <Text className="mb-2 font-medium text-gray-700">Email address</Text>
                  <TextInput
                    className="rounded-lg border border-gray-300 bg-white p-4"
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Continue Button */}
              <View className="px-6">
                <TouchableOpacity
                  className="mb-6 rounded-full bg-[#FF0000] p-4"
                  onPress={onEmailSubmit}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-base font-semibold text-white">Continue</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity>
                    <Text className="font-semibold text-[#FF0000]">Sign up</Text>
                  </TouchableOpacity>
                </Link>
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
                <View className="rounded-t-3xl bg-white p-6">
                  <View className="mb-1 items-end">
                    <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                      <FontAwesome name="times" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mb-4 text-2xl font-bold text-black">Enter Password</Text>
                  <TextInput
                    className="mb-4 rounded-lg border border-gray-300 bg-white p-4"
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    className="rounded-full bg-[#FF0000] p-4"
                    onPress={onPasswordSubmit}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center text-base font-semibold text-white">
                        Sign In
                      </Text>
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
                <View className="rounded-t-3xl bg-white p-6">
                  <View className="mb-1 items-end">
                    <TouchableOpacity onPress={() => setShowOTPModal(false)}>
                      <FontAwesome name="times" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mb-2 text-2xl font-bold text-black">
                    Enter Verification Code
                  </Text>
                  <Text className="mb-4 text-gray-600">
                    We've sent a verification code to your email
                  </Text>
                  <TextInput
                    className="mb-4 rounded-lg border border-gray-300 bg-white p-4"
                    placeholder="Enter verification code"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                  />
                  <TouchableOpacity
                    className="rounded-full bg-[#FF0000] p-4"
                    onPress={onOTPSubmit}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center text-base font-semibold text-white">Verify</Text>
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
