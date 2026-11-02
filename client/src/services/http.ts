import { api } from "./api";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await api.get<ApiEnvelope<T>>(url);
  return res.data.data;
}

export async function apiSend<T>(
  method: "post" | "put" | "delete",
  url: string,
  body?: unknown
): Promise<T> {
  const res = await api.request<ApiEnvelope<T>>({ method, url, data: body });
  return res.data.data;
}

