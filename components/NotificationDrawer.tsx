import { useInside } from "@/hooks/InsideContext";
import { format } from "date-fns";
import React from "react";
import {
  Text as RNText,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import {
  IconButton,
  List,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NotificationDrawer({ open, setOpen }: Props) {
  const theme = useTheme();
  const { notifications, removeNotification } = useInside();

  const handleClose = () => setOpen(false);

  const handleDelete = (id: string) => {
    removeNotification(id);
  };

  const renderRightActions = (id: string) => (
    <View style={styles.deleteAction}>
      <IconButton
        icon="delete"
        iconColor="#fff"
        onPress={() => handleDelete(id)}
      />
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={open}
        onDismiss={handleClose}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.background },
        ]}
        style={{
          justifyContent: "flex-end",
          margin: 0,
          padding: 0,
        }}
      >
        <View style={styles.headerModal}>
          <Text style={styles.titleModal}>Notificaciones</Text>
          <IconButton
            icon="close"
            iconColor="#fff"
            size={24}
            onPress={handleClose}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <RNText style={{ textAlign: "center", marginTop: 20 }}>
              No hay notificaciones
            </RNText>
          ) : (
            notifications.map((notif) => (
              <Swipeable
                key={notif.id}
                renderRightActions={() => renderRightActions(notif.id)}
              >
                <List.Item
                  title={notif.title}
                  description={`${notif.body}\n${format(
                    new Date(notif.receivedAt),
                    "dd MMM yyyy HH:mm"
                  )}`}
                  left={() => <List.Icon icon="bell" color="#1DB954" />}
                  titleStyle={{ fontFamily: "System" }}
                  descriptionNumberOfLines={3}
                  style={styles.notificationItem}
                />
              </Swipeable>
            ))
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    bottom: -50,
    paddingBottom: 30,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    elevation: 8,
  },
  content: {
    maxHeight: "100%",
    paddingHorizontal: 15,
  },
  headerModal: {
    backgroundColor: "#1DB954",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  titleModal: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  deleteAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
  },
  notificationItem: {
    backgroundColor: "white",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});