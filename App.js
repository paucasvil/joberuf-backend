import { Text, View } from "react-native";
import LoginScreen from "./components/login/Login.js";

export default function Index() {
  return (
    <LoginScreen>
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    </View>
    </LoginScreen>
  );
}
