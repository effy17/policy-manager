import { useQuery, useMutation, useQueryClient } from "react-query";
import * as api from "../api/ruleApi";
import { Rule } from "../types/Rule";
import {fetchRules, FetchRulesResponse} from "../api/ruleApi";

export const useCreateRule = ()=> {
    const qc=useQueryClient(); return useMutation(api.createRule,{ onSuccess:()=>qc.invalidateQueries("rules") });
};
export const useMoveRule = ()=>{const qc=useQueryClient();return useMutation(({id,newIndex}:{id:number,newIndex:number})=>api.moveRule(id,newIndex),{onSuccess:()=>qc.invalidateQueries("rules")});};
export const useEditRule = ()=>{const qc=useQueryClient();return useMutation(({id,data}:{id:number,data:any})=>api.editRule(id,data),{onSuccess:()=>qc.invalidateQueries("rules")});};
export const useDeleteRule = ()=>{const qc=useQueryClient();return useMutation((id:number)=>api.deleteRule(id),{onSuccess:()=>qc.invalidateQueries("rules")});};

export function useRules(
    page: number,
    limit: number,
    sortBy: keyof Rule,
    order: "ASC" | "DESC",
    filter?: keyof Rule,
    search?: string
) {
    return useQuery<FetchRulesResponse, Error>(
        ["rules", page, limit, sortBy, order, filter, search],
        () =>
            fetchRules(
                page,
                limit,
                String(sortBy),
                order,
                filter ? String(filter) : undefined,
                search
            ),
        { keepPreviousData: true }
    );}