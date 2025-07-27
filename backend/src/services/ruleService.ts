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

    // Fetch all existing rules, sorted by ruleIndex
    const allRules = await Rule.findAll({
        where: { tenantId: tid },
        order: [["ruleIndex", "ASC"]],
    });

    const anySourceRules = allRules.filter(r => Array.isArray(r.sources) && r.sources.length === 0);
    const regularRules = allRules.filter(r => Array.isArray(r.sources) && r.sources.length > 0);

    let desiredIndex: number;
    if (Array.isArray(ruleData.sources) && ruleData.sources.length === 0) {
        // Any Source rule: put after ALL existing rules
        const maxIndex = allRules.length
            ? Math.max(...allRules.map(r => Number(r.ruleIndex)))
            : 0;
        desiredIndex = maxIndex + 1;
    } else {
        // Normal rule
        // If user gave a ruleIndex, use it, else after last regular rule (or before any "Any Source" rule)
        if (typeof ruleData.ruleIndex === "number") {
            desiredIndex = ruleData.ruleIndex;
        } else if (regularRules.length) {
            // After last regular
            const maxRegular = Math.max(...regularRules.map(r => Number(r.ruleIndex)));
            // But before anySource min
            const minAnySource = anySourceRules.length
                ? Math.min(...anySourceRules.map(r => Number(r.ruleIndex)))
                : Infinity;
            desiredIndex = minAnySource === Infinity ? maxRegular + 1 : minAnySource - 1;
        } else {
            // No regulars, put at 1
            desiredIndex = 1;
        }

        // If desiredIndex overlaps with anySourceRules or is above, we must bump anySourceRules to the end
        const minAnySource = anySourceRules.length
            ? Math.min(...anySourceRules.map(r => Number(r.ruleIndex)))
            : Infinity;
        if (desiredIndex >= minAnySource) {
            // Get max ruleIndex after insert
            let maxIndex = allRules.length
                ? Math.max(desiredIndex, ...allRules.map(r => Number(r.ruleIndex)))
                : desiredIndex;
            // For each anySource, update to maxIndex+1, maxIndex+2, ...
            for (let i = 0; i < anySourceRules.length; ++i) {
                maxIndex = maxIndex + 1;
                await anySourceRules[i].update({ ruleIndex: maxIndex });
            }
            // Now, the new rule's index can stay as desiredIndex (since bumped all anySource rules)
        }
    }

    // Ensure there are NO duplicates (shouldn't happen, but just in case, auto-increment)
    let existing = allRules.find(r => Number(r.ruleIndex) === desiredIndex);
    while (existing) {
        desiredIndex += 1;
        existing = allRules.find(r => Number(r.ruleIndex) === desiredIndex);
    }

    // Create the new rule
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
