import AsyncStorage from "@react-native-async-storage/async-storage";

/** Tiny JSON persistence wrapper (AsyncStorage: localStorage on web, native storage on iOS/Android). */
export async function load<T>(key: string, fallback: T): Promise<T> {
  try { const raw = await AsyncStorage.getItem(`simvault:${key}`); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
export async function save(key: string, value: unknown) {
  try { await AsyncStorage.setItem(`simvault:${key}`, JSON.stringify(value)); } catch {}
}
export async function remove(key: string) { try { await AsyncStorage.removeItem(`simvault:${key}`); } catch {} }
