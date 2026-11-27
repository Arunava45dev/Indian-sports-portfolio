const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

async function request(path, options) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data;
}

export const getAthletes = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return request(`/athletes${qs ? "?" + qs : ""}`);
};
export const getAthlete = (slug) => request(`/athletes/${slug}`);
export const askScout = (body) => request("/ai/scout", { method: "POST", body: JSON.stringify(body) });
export const getMatches = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return request(`/matches${qs ? "?" + qs : ""}`);
};
export const getMatch = (id) => request(`/matches/${id}`);
export const saveMatch = (body, token, id = "") => request(`/matches${id ? `/${id}` : ""}`, {
  method: id ? "PUT" : "POST",
  headers: { "X-Admin-Token": token },
  body: JSON.stringify(body),
});
export const getSports = () => request("/sports");
export const sendMessage = (body) =>
  request("/contact", { method: "POST", body: JSON.stringify(body) });
