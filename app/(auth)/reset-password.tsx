import { useSignIn } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Toast } from 'toastify-react-native';

const ResetPassword = () => {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showResetModal, setShowResetModal] = React.useState(false);

  const onRequestReset = React.useCallback(async () => {
    if (!isLoaded || !emailAddress) return;
    setIsLoading(true);

    try {
      await signIn.create({
        identifier: emailAddress,
        strategy: 'reset_password_email_code',
      });
      setShowResetModal(true);
      Toast.success('Reset code sent to your email');
    } catch (err: unknown) {
      if (err instanceof Error) {
        Toast.error((err as any).errors?.[0]?.message || err.message);
      } else {
        Toast.error('Failed to send reset code');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress]);

  const onResetPassword = React.useCallback(async () => {
    if (!isLoaded || !code || !password) return;
    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        Toast.success('Password successfully updated! You can now sign in with your new password');
        setShowResetModal(false);
        router.replace('/(auth)/sign-in');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        Toast.error((err as any).errors?.[0]?.message || err.message);
      } else {
        Toast.error('Failed to reset password');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code, password]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#343541]">
        <ActivityIndicator size="large" color="#10a37f" />
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
                <Text className="mb-3 text-center text-3xl font-bold text-white">Reset Password</Text>
                <Text className="text-center text-base text-gray-300">
                  Enter your email to reset your password
                </Text>
              </View>

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

              <View className="mt-8 px-8">
                <TouchableOpacity
                  className="rounded-xl bg-[#10a37f] p-4 shadow-sm active:bg-[#0e906f]"
                  onPress={onRequestReset}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-lg font-semibold text-white">
                      Send Reset Link
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mt-6 flex-row justify-center">
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="font-semibold text-[#10a37f]">Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Reset Password Modal */}
        <Modal
          visible={showResetModal}
          transparent
          statusBarTranslucent
          animationType="slide"
          onRequestClose={() => setShowResetModal(false)}>
          <TouchableWithoutFeedback onPress={() => setShowResetModal(false)}>
            <View className="flex-1 justify-end bg-black/50">
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View className="rounded-t-3xl bg-[#343541] p-8">
                  <View className="mb-1 items-end">
                    <TouchableOpacity onPress={() => setShowResetModal(false)}>
                      <FontAwesome name="times" size={24} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mb-2 text-2xl font-bold text-white">Reset Your Password</Text>
                  <Text className="mb-4 text-gray-300">
                    Enter the verification code sent to your email and your new password
                  </Text>
                  <TextInput
                    className="mb-4 rounded-xl border-2 border-gray-600 bg-transparent p-4 text-white"
                    placeholder="Enter verification code"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                  />
                  <TextInput
                    className="mb-4 rounded-xl border-2 border-gray-600 bg-transparent p-4 text-white"
                    placeholder="Enter new password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    className="rounded-xl bg-[#10a37f] p-4 shadow-sm active:bg-[#0e906f]"
                    onPress={onResetPassword}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center text-lg font-semibold text-white">
                        Reset Password
                      </Text>
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
};

export default ResetPassword;
