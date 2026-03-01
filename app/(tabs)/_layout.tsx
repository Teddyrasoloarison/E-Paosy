import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="label" />
      <Stack.Screen name="portefeuille" />
      <Stack.Screen name="transaction" />
      <Stack.Screen name="objectif" />
      <Stack.Screen name="configuration" />
      <Stack.Screen name="projet" />
      <Stack.Screen name="projet/[id]" />
    </Stack>
  );
}
