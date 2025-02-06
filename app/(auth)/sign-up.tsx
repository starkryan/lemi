import * as React from 'react'
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
  Image
} from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, Redirect, useRouter } from 'expo-router'
import { Toast } from 'toastify-react-native'
import { useOAuthFlow } from '../../utils/oauth'
import { FontAwesome } from '@expo/vector-icons'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const onSelectOAuth = useOAuthFlow()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [isPasswordValid, setIsPasswordValid] = React.useState(true)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Password validation
  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass)
    const hasLowerCase = /[a-z]/.test(pass)
    const hasNumber = /[0-9]/.test(pass)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    const isLongEnough = pass.length >= 8

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough
  }

  const onPasswordChange = (pass: string) => {
    setPassword(pass)
    setIsPasswordValid(validatePassword(pass))
  }

  const onSignUpPress = async () => {
    if (!isLoaded) return
    setIsLoading(true)

    if (!isPasswordValid) {
      Toast.error('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character')
      setIsLoading(false)
      return
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      Toast.info('Check your email for a verification code')
    } catch (err: any) {
      if (err.errors?.[0]?.code === 'form_password_pwned') {
        Toast.error('Please choose a more secure password. This one has been compromised.')
      } else {
        Toast.error(err.errors?.[0]?.message || 'Failed to sign up')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return
    setIsLoading(true)

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        Toast.success('Account created successfully!')
        router.replace('/(app)')
      } else {
        Toast.error('Verification incomplete. Please try again.')
      }
    } catch (err: any) {
      Toast.error(err.errors?.[0]?.message || 'Failed to verify email')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    )
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
              {pendingVerification ? (
                <View className="px-6">
                  <View className="mb-8">
                    <Text className="mb-2 text-center text-3xl font-bold text-black">
                      Verify Email
                    </Text>
                    <Text className="text-center text-base text-gray-600">
                      Please enter the verification code sent to your email
                    </Text>
                  </View>

                  <View className="mb-6">
                    <TextInput
                      className="rounded-lg border border-gray-300 bg-white p-4"
                      value={code}
                      placeholder="Enter verification code"
                      placeholderTextColor="#9ca3af"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                    />
                  </View>

                  <TouchableOpacity
                    className="rounded-full bg-[#FF0000] p-4"
                    onPress={onVerifyPress}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center text-base font-semibold text-white">
                        Verify Email
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View className="mb-8 px-6">
                    <Text className="mb-2 text-center text-3xl font-bold text-black">Sign up</Text>
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
                      <Text className="text-base font-medium text-black ml-2">
                        Continue with Google
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View className="mb-8 flex-row items-center px-6">
                    <View className="h-[1px] flex-1 bg-gray-300" />
                    <Text className="mx-4 text-gray-500">or</Text>
                    <View className="h-[1px] flex-1 bg-gray-300" />
                  </View>

                  {/* Form */}
                  <View className="space-y-4 px-6">
                    <View>
                      <Text className="mb-2 font-medium text-gray-700">Email address</Text>
                      <TextInput
                        className="rounded-lg border border-gray-300 bg-white p-4"
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Enter email"
                        placeholderTextColor="#9ca3af"
                        onChangeText={setEmailAddress}
                        keyboardType="email-address"
                      />
                    </View>

                    <View>
                      <Text className="mb-2 font-medium text-gray-700">Password</Text>
                      <View className="relative">
                        <TextInput
                          className={`rounded-lg border bg-white p-4 pr-12 ${
                            !isPasswordValid && password.length > 0
                              ? 'border-red-500'
                              : 'border-gray-300'
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
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                      {!isPasswordValid && password.length > 0 && (
                        <Text className="mt-2 text-sm text-red-500">
                          Password must contain at least 8 characters, including uppercase, lowercase,
                          number, and special character
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Sign Up Button */}
                  <View className="mt-6 px-6">
                    <TouchableOpacity
                      className="mb-6 rounded-full bg-[#FF0000] p-4"
                      onPress={onSignUpPress}
                      disabled={isLoading}>
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-center text-base font-semibold text-white">
                          Create Account
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Sign In Link */}
                  <View className="flex-row justify-center">
                    <Text className="text-gray-600">Already have an account? </Text>
                    <Link href="/(auth)/sign-in" asChild>
                      <TouchableOpacity>
                        <Text className="font-semibold text-[#FF0000]">Sign in</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  )
}
