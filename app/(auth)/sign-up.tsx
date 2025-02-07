import { useSignUp } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
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
  Image,
  Pressable,
} from 'react-native';
import { Toast } from 'toastify-react-native';

import { useOAuthFlow } from '../../utils/oauth';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-[#343541]">
          <Text className="text-white">Something went wrong. Please try again.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const onSelectOAuth = useOAuthFlow();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [isPasswordValid, setIsPasswordValid] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Add cleanup effect
  React.useEffect(() => {
    return () => {
      setEmailAddress('');
      setPassword('');
      setCode('');
      setIsLoading(false);
      setPendingVerification(false);
      setIsPasswordValid(true);
      setShowPassword(false);
    };
  }, []);

  // Password validation
  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const isLongEnough = pass.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
  };

  const onPasswordChange = (pass: string) => {
    setPassword(pass);
    setIsPasswordValid(validatePassword(pass));
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    if (!isPasswordValid) {
      Toast.error(
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
      );
      setIsLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      Toast.info('Check your email for a verification code');
    } catch (err: any) {
      if (err.errors?.[0]?.code === 'form_password_pwned') {
        Toast.error('Please choose a more secure password. This one has been compromised.');
      } else {
        Toast.error(err.errors?.[0]?.message || 'Failed to sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        Toast.success('Account created successfully!');
        router.replace('/(app)');
      } else {
        Toast.error('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      Toast.error(err.errors?.[0]?.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the navigation to sign-in
  const navigateToSignIn = () => {
    setEmailAddress(''); // Clear state before navigation
    setPassword('');
    router.replace('/(auth)/sign-in');
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#343541]">
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
                {pendingVerification ? (
                  <View className="px-8">
                    <View className="mb-10">
                      <Text className="mb-3 text-center text-3xl font-bold text-white">
                        Verify Email
                      </Text>
                      <Text className="text-center text-base text-gray-300">
                        Please enter the verification code sent to your email
                      </Text>
                    </View>

                    <View className="mb-6">
                      <TextInput
                        className="rounded-xl border-2 border-gray-600 bg-transparent p-4 text-white"
                        value={code}
                        placeholder="Enter verification code"
                        placeholderTextColor="#9ca3af"
                        onChangeText={setCode}
                        keyboardType="number-pad"
                      />
                    </View>

                    <TouchableOpacity
                      className="rounded-xl bg-[#10a37f] p-4 shadow-sm active:bg-[#0e906f]"
                      onPress={onVerifyPress}
                      disabled={isLoading}>
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-center text-lg font-semibold text-white">
                          Verify Email
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View className="mb-10 px-8">
                      <Text className="mb-3 text-center text-3xl font-bold text-white">Sign up</Text>
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

                    {/* Form */}
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

                      <View>
                        <Text className="mb-2 mt-2 font-medium text-gray-300">Password</Text>
                        <View className="relative">
                          <TextInput
                            className={`rounded-xl border-2 bg-transparent p-4 pr-12 text-white ${
                              !isPasswordValid && password.length > 0
                                ? 'border-red-500'
                                : 'border-gray-600'
                            }`}
                            value={password}
                            placeholder="Enter password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            onChangeText={onPasswordChange}
                          />
                          <TouchableOpacity
                            className="absolute right-4 top-4"
                            onPress={() => setShowPassword(!showPassword)}>
                            <FontAwesome
                              name={showPassword ? 'eye-slash' : 'eye'}
                              size={20}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        </View>
                        {!isPasswordValid && password.length > 0 && (
                          <Text className="mt-2 text-sm text-red-500">
                            Password must contain at least 8 characters, including uppercase,
                            lowercase, number, and special character
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Sign Up Button */}
                    <View className="mt-8 px-8">
                      <TouchableOpacity
                        className="rounded-xl bg-[#10a37f] p-4 shadow-sm active:bg-[#0e906f]"
                        onPress={onSignUpPress}
                        disabled={isLoading}>
                        {isLoading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text className="text-center text-lg font-semibold text-white">
                            Create Account
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Sign In Link */}
                    <View className="mt-6 flex-row justify-center">
                      <Text className="text-gray-300">Already have an account? </Text>
                      <Pressable onPress={navigateToSignIn}>
                        <Text className="font-semibold text-[#10a37f]">Sign in</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </ErrorBoundary>
  );
}
