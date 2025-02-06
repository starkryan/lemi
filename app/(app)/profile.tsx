import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import React, { useState } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isLoaded } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const defaultImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center space-y-8 px-4 py-10">
        {/* Profile Picture */}
        <View className="relative">
          <Image 
            source={{ uri: user?.imageUrl || defaultImage }} 
            style={{ width: 120, height: 120, borderRadius: 60 }} 
            className="border-4 border-white shadow-md"
          />
          <TouchableOpacity 
            className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full"
            onPress={() => alert("Change photo coming soon!")}

          >
            <Text className="text-white text-xs">Edit</Text>
          </TouchableOpacity>
        </View>
        
        {/* User Info */}
        <View className="items-center space-y-3">
          <Text className="text-3xl font-bold text-gray-800">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-lg text-gray-600">{user?.emailAddresses[0].emailAddress}</Text>
          <Text className="text-sm text-green-500">
            Status: Active
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-3 px-4 mt-4">
          <TouchableOpacity
            onPress={() => alert("Edit Profile feature coming soon!")}
            className="px-6 py-3 rounded-xl bg-blue-500 shadow-sm"
          >
            <Text className="text-white text-center font-semibold">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSignOutModal(true)}
            className="px-6 py-3 rounded-xl bg-red-500 shadow-sm"
          >
            <Text className="text-white text-center font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSignOutModal}
          onRequestClose={() => setShowSignOutModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-2xl w-[80%] items-center space-y-4">
              <Text className="text-xl font-bold text-gray-800">Sign Out</Text>
              <Text className="text-gray-600 text-center">
                Are you sure you want to sign out?
              </Text>
              <View className="flex-row gap-4 w-full mt-2">
                <TouchableOpacity
                  onPress={() => setShowSignOutModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-200"
                >
                  <Text className="text-center font-semibold text-gray-800">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowSignOutModal(false);
                    signOut();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500"
                >
                  <Text className="text-center font-semibold text-white text-lg">Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
