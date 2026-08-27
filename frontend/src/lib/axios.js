import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "https://chatting-application-ots9.onrender.com"
      : "/api",
  withCredentials: true, //this is used to send the cookie along with every request
});
