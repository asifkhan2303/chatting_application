import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],

  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false, //while messages are loading we can show some skeletons...

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance("/messages/users");
      set({ users: res.data.users });
      console.log("users", res.data);
    } catch (error) {
      // console.log("response", error.response.data.message);
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    //userId--> id of the person whom I am chatting with...
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance(`messages/${userId}`);
      console.log("messages", res.data);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get(); //get the selected user and messages from the store...
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] }); //add the new message to the messages array
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    //optimise This later....
    socket.on("newMessage", (newMessage) => {
      const isMessageSendFromActualUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSendFromActualUser) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
