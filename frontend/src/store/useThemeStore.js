//we will save the theme to local storage so that it persists even after the user refreshes the page.
//we will also add a button to toggle the theme.
import {create} from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee", // it sets the initial state of the theme to either the saved theme from localStorage or "coffee" if no saved theme is found.
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });   //setter function to manipulate the local storage..
  },
}));
