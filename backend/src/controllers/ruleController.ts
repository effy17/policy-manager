import { Request, Response } from "express";
import * as service from "../services/ruleService";

export const listRules = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 50,
            sortBy = "ruleIndex",
            order = "ASC",
            filter,
            search,
        } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(limit);
        const result = await service.getRules({
            offset,
            limit: Number(limit),
            sortBy,
            order: order as "ASC" | "DESC",
            filter,
            search,
        });
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addRule = async (req: Request, res: Response) => {
    try {
        const rule = await service.createRule(req.body);
        res.status(201).json(rule);
    } catch (err: any) {
        if (err.message === "That priority is already taken") {
            res.status(409).json({ error: err.message });
        } else if (err.name === "SequelizeValidationError") {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

export const moveRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newIndex } = req.body;
        if (newIndex == null || isNaN(newIndex)) {
            return res.status(400).json({ error: "Invalid index" });
        }
        const rule = await service.updateRuleOrder(Number(id), newIndex);
        if (!rule) {
            res.status(404).json({ error: "Rule not found" });
        } else {
            res.json(rule);
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const editRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rule = await service.updateRule(Number(id), req.body);
        if (!rule) {
            res.status(404).json({ error: "Rule not found" });
        } else {
            res.json(rule);
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const removeRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await service.deleteRule(Number(id));
        if (!deleted) {
            res.status(404).json({ error: "Rule not found" });
        } else {
            res.status(204).send();
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
