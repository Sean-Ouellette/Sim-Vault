import React from "react";
import { View } from "react-native";
import { Page } from "./Page";
import { Button, Card, T } from "./ui";
import { space } from "../theme";
import { useAuth } from "../lib/auth";

/** Gate for every page except Home (design.md → Auth). */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, openDialog } = useAuth();
  if (user) return <>{children}</>;
  return (
    <Page>
      <View style={{ paddingTop: space.xxl, alignItems: "center" }}>
        <Card style={{ alignItems: "center", paddingVertical: space.xl, width: "100%", maxWidth: 520 }}>
          <T.h2 style={{ textAlign: "center" }}>Sign in to open your vault</T.h2>
          <T.muted style={{ marginTop: space.sm, textAlign: "center" }}>This page shows your saved teams and players.</T.muted>
          <Button primary onPress={openDialog} style={{ marginTop: space.lg }}>Sign in</Button>
        </Card>
      </View>
    </Page>
  );
}
