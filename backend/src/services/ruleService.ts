import { Rule } from "../models/Rule";
import { Op } from "sequelize";

interface QueryParams {
    offset: number;
    limit: number;
    sortBy: string;
    order: "ASC" | "DESC";
    filter?: string;
    search?: string;
    tenantId?: number;
}

export const getRules = async ({
                                   offset,
                                   limit,
                                   sortBy,
                                   order,
                                   filter,
                                   search,
                                   tenantId,
                               }: QueryParams) => {
    const tid = tenantId ?? 1;
    const where: any = { tenantId: tid };

    // We want to fetch all and filter in-memory only for sources/destinations
    let allRows: Rule[] = [];

    // For normal filters, use SQL
    if (
        (filter === "name" || filter === "action" || !filter) &&
        search
    ) {
        if (filter === "name") {
            where.name = { [Op.like]: `%${search}%` };
        } else if (filter === "action") {
            where.action = search;
        }
        const { rows, count } = await Rule.findAndCountAll({
            where,
            offset,
            limit,
            order: [[sortBy, order]],
        });
        return { data: rows, total: count };
    } else if (filter === "sources" || filter === "destinations") {
        // Fetch all for this tenant (could optimize with pagination if huge)
        allRows = await Rule.findAll({
            where,
            order: [[sortBy, order]],
        });

        // Do in-memory substring search inside JSON arrays
        const filteredRows = allRows.filter((rule) => {
            const arr = filter === "sources" ? rule.sources : rule.destinations;
            if (!Array.isArray(arr)) return false;
            // Search in all fields of all objects
            return arr.some(obj =>
                Object.values(obj || {}).some(val =>
                    typeof val === "string" &&
                    val.toLowerCase().includes(search?.toLowerCase() || "")
                )
            );
        });

        // Pagination
        const total = filteredRows.length;
        const paged = filteredRows.slice(offset, offset + limit);
        return { data: paged, total };
    } else {
        // No search or unrecognized filter
        const { rows, count } = await Rule.findAndCountAll({
            where,
            offset,
            limit,
            order: [[sortBy, order]],
        });
        return { data: rows, total: count };
    }
};


// CREATE RULE -- ENFORCE "ANY SOURCE" IS LAST
export const createRule = async (ruleData: Partial<Rule>) => {
    const tid = ruleData.tenantId ?? 1;

    // Fetch all existing rules sorted by ruleIndex
    const allRules = await Rule.findAll({
        where: { tenantId: tid },
        order: [["ruleIndex", "ASC"]],
    });

    const anySourceRules = allRules.filter(r => Array.isArray(r.sources) && r.sources.length === 0);
    const regularRules = allRules.filter(r => Array.isArray(r.sources) && r.sources.length > 0);

    const isAnySource = Array.isArray(ruleData.sources) && ruleData.sources.length === 0;

    let desiredIndex: number;

    if (isAnySource) {
        // CASE 1: any-source rule → always added last
        const maxIndex = allRules.length
            ? Math.max(...allRules.map(r => Number(r.ruleIndex)))
            : 0;
        desiredIndex = maxIndex + 1;
    } else {
        // CASE 2: regular rule
        const minAnySourceIndex = anySourceRules.length
            ? Math.min(...anySourceRules.map(r => Number(r.ruleIndex)))
            : Infinity;

        if (typeof ruleData.ruleIndex === "number") {
            desiredIndex = ruleData.ruleIndex;

            // If duplicate with a regular rule, reject
            const duplicate = regularRules.find(r => Number(r.ruleIndex) === desiredIndex);
            if (duplicate) {
                throw new Error("That priority is already taken");
            }

            // If overlaps any-source rules → bump any-source rules
            if (desiredIndex >= minAnySourceIndex) {
                let nextIndex = desiredIndex + 1;
                for (const rule of anySourceRules.sort((a, b) => Number(a.ruleIndex) - Number(b.ruleIndex))) {
                    await rule.update({ ruleIndex: nextIndex++ });
                }
            }

        } else {
            // No ruleIndex specified → insert after last regular, before any-source
            const maxRegular = regularRules.length
                ? Math.max(...regularRules.map(r => Number(r.ruleIndex)))
                : 0;

            desiredIndex = minAnySourceIndex === Infinity ? maxRegular + 1 : minAnySourceIndex - 1;

            // If overlaps any-source rules → bump them
            if (desiredIndex >= minAnySourceIndex) {
                let nextIndex = desiredIndex + 1;
                for (const rule of anySourceRules.sort((a, b) => Number(a.ruleIndex) - Number(b.ruleIndex))) {
                    await rule.update({ ruleIndex: nextIndex++ });
                }
            }
        }
    }

    // Double check uniqueness in allRules
    const conflict = allRules.find(r => Number(r.ruleIndex) === desiredIndex);
    if (conflict) {
        throw new Error("That priority is already taken");
    }

    return Rule.create({
        ...ruleData,
        tenantId: tid,
        ruleIndex: desiredIndex,
    });
};





export const updateRuleOrder = async (id: number, newIndex: number) => {
    const rule = await Rule.findByPk(id);
    if (!rule) return null;
    rule.ruleIndex = newIndex;
    return rule.save();
};

export const updateRule = async (id: number, data: Partial<Rule>) => {
    const rule = await Rule.findByPk(id);
    if (!rule) return null;
    return rule.update(data);
};

export const deleteRule = async (id: number) => {
    const rule = await Rule.findByPk(id);
    if (!rule) return null;
    await rule.destroy();
    return true;
};
