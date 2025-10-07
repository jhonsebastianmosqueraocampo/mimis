import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export default async function registerPushToken(
  registerNotificationToken: (token: string) => Promise<any>
): Promise<void> {
  try {
    if (!Device.isDevice){
      console.log(
        "❌ Debes usar un dispositivo físico para recibir notificaciones"
      );
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Permiso de notificaciones denegado");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    const response = await registerNotificationToken(token);
    if (!response) {
      console.log("error");
      return;
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  } catch (error) {
    console.log("error", error);
  }
}
