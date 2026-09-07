import React, { useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "../lib/theme";
import { Colors, radius, space } from "../theme";
import { Button, T } from "./ui";
import { useAuth } from "../lib/auth";

/** Sign-in modal (pages/home.md). Wrong credentials shake the card. */
export function SignInDialog() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { dialogOpen, closeDialog, signIn } = useAuth();
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [err, setErr] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const submit = () => {
    if (signIn(u, p)) { setU(""); setP(""); setErr(false); return; }
    setErr(true);
    shake.setValue(0);
    Animated.sequence([-1, 1, -0.6, 0.6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: false }))).start();
  };
  return (
    <Modal visible={dialogOpen} transparent animationType="fade" onRequestClose={closeDialog}>
      <Pressable style={s.backdrop} onPress={closeDialog}>
        <Animated.View style={[s.card, { transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) }] }]}>
          <Pressable onPress={() => {}} style={{ cursor: "default" } as any}>
            <T.h2>Sign in</T.h2>
            <T.muted style={{ marginBottom: space.lg }}>Open your vault.</T.muted>
            <T.label style={{ marginBottom: 6 }}>Username</T.label>
            <TextInput value={u} onChangeText={setU} autoCapitalize="none" placeholder="admin" placeholderTextColor={colors.muted} style={s.input} onSubmitEditing={submit} />
            <T.label style={{ marginTop: space.md, marginBottom: 6 }}>Password</T.label>
            <TextInput value={p} onChangeText={setP} secureTextEntry placeholder="••••••" placeholderTextColor={colors.muted} style={s.input} onSubmitEditing={submit} />
            {err && <T.small style={{ color: colors.loss, marginTop: space.sm }}>That's not it.</T.small>}
            <Button primary onPress={submit} style={{ marginTop: space.lg }}>Sign in</Button>
            <T.small style={{ color: colors.muted, marginTop: space.md, textAlign: "center" }}>Temporary: admin / admin</T.small>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: space.lg },
  card: { width: "100%", maxWidth: 400, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.card, padding: space.lg },
  input: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.bg, fontSize: 15 },
});
