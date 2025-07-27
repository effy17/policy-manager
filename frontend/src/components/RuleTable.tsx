import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import {
    TextField, FormControl, InputLabel, Select, MenuItem, Button,
    Typography, Paper, TableContainer, CircularProgress, Alert
} from "@mui/material";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useRules, useMoveRule, useDeleteRule, useEditRule } from "../hooks/useRules";
import { getDecimalIndex } from "../utils/decimalIndex";
import RuleForm from "./RuleForm";
import { Rule } from "../types/Rule";
import RuleTableInner from "./RuleTableInner";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

export default function RuleTable() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [filterField, setFilterField] = useState<keyof Rule>("name");
    const [sortBy, setSortBy] = useState<keyof Rule>("ruleIndex");
    const [order, setOrder] = useState<"ASC" | "DESC">("ASC");
    const [editingRow, setEditingRow] = useState<number | null>(null);

    const { data, isLoading, isError, error } = useRules(
        page, limit, sortBy, order, filterField, search
    );
    const moveMutation = useMoveRule();
    const deleteMutation = useDeleteRule();
    const editMutation = useEditRule();

    useEffect(() => { setPage(1); }, [search, filterField, sortBy, order, limit]);

    // Loading State
    if (isLoading) {
        return (
            <Grid container justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
                <CircularProgress />
            </Grid>
        );
    }
    // Error State
    if (isError) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {String(error)}
            </Alert>
        );
    }
    if (!data) return <div>No rules to display</div>;

    let { data: allRules, total } = data;
    if (filterField === "sources" && search) {
        allRules = allRules.filter(r => JSON.stringify(r.sources).toLowerCase().includes(search.toLowerCase()));
    }
    if (filterField === "destinations" && search) {
        allRules = allRules.filter(r => JSON.stringify(r.destinations).toLowerCase().includes(search.toLowerCase()));
    }

    // Only regular rules are draggable
    const regularRules = allRules.filter(r => r.sources.length > 0);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const from = result.source.index;
        const to = result.destination.index;
        if (from === to) return;

        const newOrder = Array.from(regularRules);
        const [removed] = newOrder.splice(from, 1);
        newOrder.splice(to, 0, removed);

        const prevIdx = newOrder[to - 1]?.ruleIndex;
        const nextIdx = newOrder[to + 1]?.ruleIndex;
        const newIndex = getDecimalIndex(prevIdx, nextIdx);

        moveMutation.mutate({ id: removed.id, newIndex });
    };

    return (
        <>
            <RuleForm open={formOpen} onClose={() => setFormOpen(false)} />
            <Typography variant="h4" align="center" sx={{ mt: 3, mb: 1 }}>
                Policy Manager
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ my: 2 }}>
                <Grid item xs={3} sm={1} md={2}>
                    <TextField fullWidth label="Search" size="small" value={search} onChange={e => setSearch(e.target.value)} />
                </Grid>
                <Grid item xs={6} sm={2} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Filter By</InputLabel>
                        <Select label="Filter By" value={filterField} onChange={e => setFilterField(e.target.value as keyof Rule)}>
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="action">Action</MenuItem>
                            <MenuItem value="sources">Sources</MenuItem>
                            <MenuItem value="destinations">Destinations</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={2} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort By</InputLabel>
                        <Select label="Sort By" value={sortBy} onChange={e => setSortBy(e.target.value as keyof Rule)}>
                            <MenuItem value="ruleIndex">Priority</MenuItem>
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="action">Action</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={2} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Order</InputLabel>
                        <Select label="Order" value={order} onChange={e => setOrder(e.target.value as "ASC" | "DESC")}>
                            <MenuItem value="ASC">Ascending</MenuItem>
                            <MenuItem value="DESC">Descending</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={2} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Rows</InputLabel>
                        <Select label="Rows" value={limit} onChange={e => setLimit(Number(e.target.value))}>
                            {PAGE_SIZE_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12} md={2} display="flex" justifyContent="flex-end">
                    <Button variant="contained" color="primary" onClick={() => setFormOpen(true)} sx={{ whiteSpace: "nowrap" }}>
                        Create Rule
                    </Button>
                </Grid>
            </Grid>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <RuleTableInner
                        allRules={allRules}
                        page={page}
                        limit={limit}
                        total={total}
                        setPage={setPage}
                        editingRow={editingRow}
                        setEditingRow={setEditingRow}
                        moveMutation={moveMutation}
                        deleteMutation={deleteMutation}
                        editMutation={editMutation}
                    />
                </DragDropContext>
            </TableContainer>
        </>
    );
}
