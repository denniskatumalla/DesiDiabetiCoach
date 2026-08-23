import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { router } from 'expo-router';
import { scannedItemToMealItem, type ScannedFoodItem, type MealType } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

type ScanState =
  | { step: 'camera' }
  | { step: 'analyzing'; uri: string; base64: string }
  | { step: 'review'; uri: string; base64: string; items: (ScannedFoodItem & { needsConfirmation: boolean })[] };

export default function ScanMealScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [state, setState] = useState<ScanState>({ step: 'camera' });
  const [mealType] = useState<MealType>(inferMealType());

  const scanMutation = trpc.foodScan.scan.useMutation();
  const createMealMutation = trpc.meals.create.useMutation({
    onSuccess: () => router.back(),
  });

  async function handleCapture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
    if (!photo) return;

    // Resize + compress so the upload/vision call stays well under 2MB (spec §5.5.1)
    const manipulated = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!manipulated.base64) return;

    setState({ step: 'analyzing', uri: manipulated.uri, base64: manipulated.base64 });

    try {
      const result = await scanMutation.mutateAsync({ imageBase64: manipulated.base64 });
      setState({ step: 'review', uri: manipulated.uri, base64: manipulated.base64, items: result.items });
    } catch {
      setState({ step: 'camera' });
    }
  }

  async function handleConfirm() {
    if (state.step !== 'review') return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const path = `${user.id}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('meal-photos')
      .upload(path, decodeBase64(state.base64), { contentType: 'image/jpeg' });

    createMealMutation.mutate({
      mealType,
      // The object path, not a signed URL — signed URLs expire, and persisting
      // one left every photo in the history broken a day later. meals.list
      // signs the path on read.
      photoPath: uploadError ? undefined : path,
      aiAnalysis: { items: state.items },
      // scannedItemToMealItem converts Claude's whole-portion figures into the
      // per-unit values meal_items stores; passing them through raw alongside
      // `quantity: estimatedKatori` double-counted the carbohydrates.
      items: state.items.map(scannedItemToMealItem),
    });
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permissionText}>DesiDiabetiCoach needs camera access to scan meals.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  if (state.step === 'camera') {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <Pressable style={styles.captureButton} onPress={handleCapture} />
      </View>
    );
  }

  if (state.step === 'analyzing') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Image source={{ uri: state.uri }} style={styles.preview} />
        <ActivityIndicator size="large" color={COLORS.teal} style={{ marginTop: 20 }} />
        <Text style={styles.permissionText}>Identifying your meal…</Text>
      </View>
    );
  }

  // step === 'review'
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Image source={{ uri: state.uri }} style={styles.preview} />
      <Text style={styles.reviewTitle}>Confirm what we found</Text>
      {state.items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>
              {item.name}
              {item.needsConfirmation ? ' ⚠️' : ''}
            </Text>
            <Text style={styles.itemDetail}>
              ~{item.estimatedKatori} katori · {item.carbsG}g carbs · GL {item.glScore}
              {item.needsConfirmation ? ' · low confidence, please verify' : ''}
            </Text>
          </View>
        </View>
      ))}
      <Pressable style={styles.button} onPress={handleConfirm} disabled={createMealMutation.isPending}>
        <Text style={styles.buttonText}>{createMealMutation.isPending ? 'Saving…' : 'Log This Meal'}</Text>
      </Pressable>
      <Pressable style={styles.retakeButton} onPress={() => setState({ step: 'camera' })}>
        <Text style={styles.retakeText}>Retake Photo</Text>
      </Pressable>
    </ScrollView>
  );
}

function inferMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  captureButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: COLORS.teal,
  },
  permissionText: { color: '#fff', textAlign: 'center', marginTop: 12 },
  button: { backgroundColor: COLORS.teal, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: '600' },
  preview: { width: '100%', height: 260, borderRadius: 12 },
  reviewTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  itemRow: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 8 },
  itemName: { color: '#fff', fontWeight: '600' },
  itemDetail: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  retakeButton: { alignItems: 'center', marginTop: 12, marginBottom: 40 },
  retakeText: { color: 'rgba(255,255,255,0.7)' },
});
