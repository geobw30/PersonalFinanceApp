import React, { useEffect, useRef } from "react";
import { Animated, Image, Modal, StyleSheet, View } from "react-native";
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
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);
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

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    );

    rotate.start();

    return () => {
      rotate.stop();
    };
  }, [visible, scaleAnim, opacityAnim, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
          <Animated.Image
            source={require("../../assets/app-icon.png")}
            style={[
              styles.image,
              { transform: [{ rotate: rotateInterpolate }] },
            ]}
          />
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
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
  image: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  message: {
    fontSize: 15,
    color: "#444",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});