import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

/**
 * Save text as a downloadable/shareable file. Native: write to cache + share sheet.
 * Web: browser download (the one place the app touches the DOM, guarded by Platform).
 */
export async function saveTextFile(name: string, text: string, mime = "application/json") {
  if (Platform.OS === "web") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const file = new File(Paths.cache, name);
  file.write(text);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: mime, dialogTitle: name });
}

/** Let the user pick a text/JSON file and return its contents (null if cancelled). */
export async function pickTextFile(): Promise<{ name: string; text: string } | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/plain", "*/*"], copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  const text = Platform.OS === "web" ? await (await fetch(a.uri)).text() : await new File(a.uri).text();
  return { name: a.name, text };
}
