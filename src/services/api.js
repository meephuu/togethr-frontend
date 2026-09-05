import { OpenAPI } from "./generated";

OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = "include";

export { OpenAPI };
