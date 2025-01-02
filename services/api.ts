const API_BASE_URL = "/api";

export const api = {
  async get(endpoint: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
