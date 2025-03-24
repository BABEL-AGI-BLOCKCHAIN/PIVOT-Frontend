const API_BASE_URL = "https://ziopwmhohqon.usw.sealos.io/api/v1";

export const ENDPOINTS = {
    GET_TOPICS: `${API_BASE_URL}/topic/getTopics`,
    GET_COMMENTS: (topicId) => `${API_BASE_URL}/topic/getComments/${topicId}`,
    POST_COMMENT: `${API_BASE_URL}/topic/comment`,
    GET_TOPIC_BY_ID: (topicId) => `${API_BASE_URL}/topic/getTopic/${topicId}`,
    GET_POSITIONS: (topicId) => `${API_BASE_URL}/invest/getPositions`,
};
