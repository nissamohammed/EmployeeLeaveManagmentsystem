import axios from "axios";

export const commonApi = async (httpRequest, url, reqBody, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    } else {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            headers.Authorization = `Bearer ${storedToken}`;
        }
    }

    const reqConfig = {
        method: httpRequest,
        url,
        data: reqBody,
        headers
    };

    try {
        return await axios(reqConfig);
    } catch (err) {
        return err.response || { status: 500, data: { error: "Network error" } };
    }
};
