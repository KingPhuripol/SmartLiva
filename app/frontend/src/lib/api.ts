import axios from "axios";

// Type-safe environment variable access
declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_API_BASE?: string;
  };
};

// Robust API base URL resolver with fallbacks
function getBaseURL(): string {
  // Priority 1: Use /api for Vercel serverless functions
  if (typeof window !== "undefined") {
    // Client-side: always use relative /api path
    return "/api";
  }

  // Priority 2: Production environment variable (from .env.production or Vercel)
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  if (envURL && envURL.trim() && envURL !== "undefined") {
    return envURL.replace(/\/$/, "");
  }

  // Priority 3: Legacy environment variable (backward compatibility)
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  if (envBase && envBase.trim() && envBase !== "undefined") {
    return envBase.replace(/\/$/, "");
  }

  // Priority 4: Server-side fallback
  return "";
}

const baseURL = getBaseURL();

export interface PredictionResponse {
  te_kpa: number;
  fibrosis_stage: string;
  classification_label: string;
  classification_confidence: number;
  parasite_detected: boolean;
  parasite_type?: string;
  parasite_confidence?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  history: ChatMessage[];
  max_new_tokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  reply: string;
  usage_tokens?: number;
}

export async function predict(form: FormData) {
  const res = await axios.post<PredictionResponse>(`${baseURL}/predict`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const res = await axios.post<ChatResponse>(`${baseURL}/chat`, request, {
    headers: { "Content-Type": "application/json" },
    timeout: 60000,
  });
  return res.data;
}

export async function sendChatMessage(
  history: ChatMessage[]
): Promise<ChatResponse> {
  const res = await axios.post<ChatResponse>(
    `${baseURL}/chat`,
    {
      history: history.map((m) => ({ role: m.role, content: m.content })),
      max_new_tokens: 300,
      temperature: 0.7,
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    }
  );
  return res.data;
}

export async function health() {
  const res = await axios.get(`${baseURL}/health`);
  return res.data;
}

// API object for clinical dashboard
export const api = {
  get: async (endpoint: string) => {
    const res = await axios.get(`${baseURL}${endpoint}`);
    return res.data;
  },
  post: async (endpoint: string, data: any) => {
    const res = await axios.post(`${baseURL}${endpoint}`, data);
    return res.data;
  },
  put: async (endpoint: string, data: any) => {
    const res = await axios.put(`${baseURL}${endpoint}`, data);
    return res.data;
  },
  delete: async (endpoint: string) => {
    const res = await axios.delete(`${baseURL}${endpoint}`);
    return res.data;
  },
};
