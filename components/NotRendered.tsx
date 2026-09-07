import React from "react";
import { View } from "react-native";
import { Page } from "./Page";
import { Card, T } from "./ui";
import { space } from "../theme";

/** Placeholder route for a page whose design doc hasn't been drafted yet. */
export function NotRendered({ page, detail }: { page: string; detail?: string }) {
  return (
    <Page>
      <View style={{ paddingTop: space.xxl }}>
        <Card>
          <T.h2>{page}</T.h2>
          {detail ? <T.body style={{ marginTop: space.sm }}>{detail}</T.body> : null}
          <T.muted style={{ marginTop: space.sm }}>Not drafted yet. Blab about this page in blab-design and it will render here.</T.muted>
        </Card>
      </View>
    </Page>
  );
}
