import axios from "axios";
export const request = axios.create({
    baseURL: "/",
    timeout: 10000, // 10秒
});
