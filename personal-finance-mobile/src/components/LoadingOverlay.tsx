import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@rneui/themed";

interface Props {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  visible,
  message = "Loading…",
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!visible) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      ringScale.setValue(1);
      ringOpacity.setValue(0.7);
      return;
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 90,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, {
            toValue: 1.6,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [visible, scaleAnim, opacityAnim, ringScale, ringOpacity]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <View style={styles.spinnerWrap}>
            <Animated.View
              style={[
                styles.ring,
                { transform: [{ scale: ringScale }], opacity: ringOpacity },
              ]}
            />
            <ActivityIndicator size="large" color="#1976d2" />
          </View>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 50, 0.48)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 34,
    paddingHorizontal: 44,
    alignItems: "center",
    gap: 18,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 14,
  },
  spinnerWrap: {
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: "#1976d2",
  },
  message: {
    fontSize: 15,
    color: "#444",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
