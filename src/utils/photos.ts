import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

/** Longest edge of an uploaded photo; the server caps the file at 2 MB, this keeps us far under. */
export const PHOTO_EDGE_PX = 512;

export type PickResult = { kind: "picked"; uri: string } | { kind: "cancelled" } | { kind: "denied" };

/** Opens the library, lets the user square-crop, then downsizes to a JPEG the server accepts. */
export async function pickSquarePhoto(): Promise<PickResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { kind: "denied" };

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
    exif: false,
  });
  if (picked.canceled || !picked.assets[0]) return { kind: "cancelled" };

  const context = ImageManipulator.ImageManipulator.manipulate(picked.assets[0].uri);
  context.resize({ width: PHOTO_EDGE_PX });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: ImageManipulator.SaveFormat.JPEG, compress: 0.85 });
  image.release();

  return { kind: "picked", uri: saved.uri };
}

/** RN's FormData takes a `{ uri, name, type }` part, not a web Blob. */
export function photoFormData(uri: string): FormData {
  const form = new FormData();
  form.append("photo", { uri, name: "photo.jpg", type: "image/jpeg" } as unknown as Blob);
  return form;
}

/** Up to two initials for an avatar fallback: "Faisal Al-Amri" → "FA", "فيصل" → "ف". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  const first = Array.from(words[0] ?? "")[0] ?? "";
  const second = words.length > 1 ? (Array.from(words[words.length - 1] ?? "")[0] ?? "") : "";
  return (first + second).toUpperCase();
}
