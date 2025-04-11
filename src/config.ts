import { Address } from "viem";

const API_BASE_URL = "https://ziopwmhohqon.usw.sealos.io/api/v1";
// const API_BASE_URL = "http://localhost:5001/api/v1";

export const ENDPOINTS = {
    SIGN_IN: `${API_BASE_URL}/auth/signIn`,
    GET_TOPICS: `${API_BASE_URL}/topic/getTopics`,
    UPDATE_TOPIC: `${API_BASE_URL}/topic/updateTopic`,
    GET_COMMENTS: (topicId: string) => `${API_BASE_URL}/topic/getComments/${topicId}`,
    POST_COMMENT: `${API_BASE_URL}/topic/comment`,
    GET_TOPIC_BY_ID: (topicId: string) => `${API_BASE_URL}/topic/getTopic/${topicId}`,
    GET_POSITIONS: `${API_BASE_URL}/invest/getPositions`,
    BIND_TWITTER: (walletAddress: Address) => `${API_BASE_URL}/auth/twitter?walletAddress=${walletAddress}`,
};
