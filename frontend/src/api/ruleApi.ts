import axios from "axios";
import { Rule } from "../types/Rule";

const api = axios.create({
    baseURL: "/api",
    timeout: 5000,
});

export interface FetchRulesResponse {
    data: Rule[];
    total: number;
}

export const fetchRules = async (
    page: number,
    limit: number,
    sortBy: string,
    order: string,
    filter?: string,
    search?: string
): Promise<FetchRulesResponse> => {
    const params: Record<string, any> = { page, limit, sortBy, order };
    if (filter && search) {
        params.filter = filter;
        params.search = search;
    }
    const response = await api.get<FetchRulesResponse>("/rules", { params });
    return response.data;
};

export const createRule = async (
    rule: Partial<Rule>
): Promise<Rule> => {
    const response = await api.post<Rule>("/rules", rule);
    return response.data;
};

export const moveRule = async (
    id: number,
    newIndex: number
): Promise<Rule> => {
    const response = await api.patch<Rule>(`/rules/${id}/move`, { newIndex });
    return response.data;
};

export const editRule = async (
    id: number,
    data: Partial<Rule>
): Promise<Rule> => {
    const response = await api.patch<Rule>(`/rules/${id}`, data);
    return response.data;
};

export const deleteRule = async (id: number): Promise<void> => {
    await api.delete(`/rules/${id}`);
};
