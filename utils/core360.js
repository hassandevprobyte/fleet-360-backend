const axios = require("axios");

// Configs
const { env } = require("../config");

const getHeaders = (accessToken) => {
  const headers = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

const core360Api = axios.create({
  baseURL: env.CORE_360_API_URL,
  headers: {
    "User-Agent": "Auth360 (support@auth360.com)",
    Accept: "application/json",
  },
});

const markCore360Error = (error) => {
  error.isCore360 = true;
  throw error;
};

exports.isTokenExpired = async (basecamp) => {
  const expiresAt = basecamp.expiresAt ? new Date(basecamp.expiresAt).getTime() : 0;

  if (Date.now() > expiresAt) {
    return true;
  }

  return false;
};

exports.core360Get = async (url, accessToken) => {
  try {
    const response = await core360Api.get(url, {
      headers: { ...getHeaders(accessToken) },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    markCore360Error(error);
  }
};

exports.core360Post = async (url, data, accessToken) => {
  try {
    const response = await core360Api.post(url, data, {
      headers: {
        ...getHeaders(accessToken),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    markCore360Error(error);
  }
};
exports.core360Put = async (url, data, accessToken) => {
  try {
    const response = await core360Api.put(url, data, {
      headers: {
        ...getHeaders(accessToken),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    markCore360Error(error);
  }
};

exports.core360Delete = async (url, accessToken) => {
  try {
    const response = await core360Api.delete(url, {
      headers: { ...getHeaders(accessToken) },
    });

    return response.data;
  } catch (error) {
    markCore360Error(error);
  }
};
