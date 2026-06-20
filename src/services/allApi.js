import { commonApi } from "./commomApi";
import { serverUrl } from "./serverUrl";

export const registerApi = async (reqBody) => {
    return await commonApi("POST", `${serverUrl}/api/auth/register`, reqBody);
};

export const loginApi = async (reqBody) => {
    return await commonApi("POST", `${serverUrl}/api/auth/login`, reqBody);
};

export const applyLeaveApi = async (reqBody) => {
    return await commonApi("POST", `${serverUrl}/api/leaves`, reqBody);
};

export const getMyLeavesApi = async (params = "") => {
    return await commonApi("GET", `${serverUrl}/api/leaves/my-leaves${params}`, "");
};

export const getAllLeavesApi = async (params = "") => {
    return await commonApi("GET", `${serverUrl}/api/leaves${params}`, "");
};

export const updateLeaveStatusApi = async (leaveId, reqBody) => {
    return await commonApi("PATCH", `${serverUrl}/api/leaves/${leaveId}/status`, reqBody);
};

export const getStatsApi = async () => {
    return await commonApi("GET", `${serverUrl}/api/leaves/stats`, "");
};
