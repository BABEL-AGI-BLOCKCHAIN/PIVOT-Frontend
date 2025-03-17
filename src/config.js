const API_BASE_URL = 'https://ziopwmhohqon.usw.sealos.io/api/v1';

export const ENDPOINTS = {
    GET_TOPICS: `${API_BASE_URL}/topic/getTopics`,
    GET_COMMENTS: (topicId) => `${API_BASE_URL}/comments/${topicId}`,
    // Add other endpoints as needed
};