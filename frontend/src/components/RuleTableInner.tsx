import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Grid, Button } from "@mui/material";
import { Droppable } from "react-beautiful-dnd";
import { Rule } from "../types/Rule";
import RuleTableRow from "./RuleTableRow";

interface Props {
    allRules: Rule[];
    page: number;
    limit: number;
    total: number;
    setPage: (page: number) => void;
    editingRow: number | null;
    setEditingRow: React.Dispatch<React.SetStateAction<number | null>>;
    moveMutation: any;
    deleteMutation: any;
    editMutation: any;
}

function isAnySourceRule(rule: Rule) {
    return Array.isArray(rule.sources) && rule.sources.length === 0;
}

export default function RuleTableInner({
                                           allRules,
                                           page,
                                           limit,
                                           total,
                                           setPage,
                                           editingRow,
                                           setEditingRow,
                                           moveMutation,
                                           deleteMutation,
                                           editMutation,
                                       }: Props) {
    const regularRules = allRules.filter((r) => !isAnySourceRule(r));
    const anySourceRules = allRules.filter(isAnySourceRule);

    // Defensive fallback to avoid React-Beautiful-DND errors
    // Make sure we always render the Droppable body even if no draggable items
    return (
        <>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell width={36} />
                        <TableCell>
                            <strong>#</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Name</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Action</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Sources</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Destinations</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Actions</strong>
                        </TableCell>
                    </TableRow>
                </TableHead>

                <Droppable droppableId="rules" direction="vertical" type="RULE">
                    {(provided) => (
                        <TableBody
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            // Make sure style is not missing - add minHeight to avoid zero-height issues
                            style={{ minHeight: "100px" }}
                        >
                            {regularRules.length === 0 && anySourceRules.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No rules to display
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Draggable rows */}
                            {regularRules.map((rule, idx) => {
                                // Make sure id is string
                                const id = rule.id != null ? String(rule.id) : `temp-${idx}`;

                                return (
                                    <RuleTableRow
                                        key={id}
                                        rule={rule}
                                        index={idx}
                                        isDraggable={true}
                                        editingRow={editingRow}
                                        setEditingRow={setEditingRow}
                                        editMutation={editMutation}
                                        deleteMutation={deleteMutation}
                                    />
                                );
                            })}

                            {/* This placeholder MUST be here for correct droppable height */}
                            {provided.placeholder}

                            {/* Non-draggable rows */}
                            {anySourceRules.map((rule) => (
                                <RuleTableRow
                                    key={rule.id}
                                    rule={rule}
                                    index={-1} // no drag for these
                                    isDraggable={false}
                                    editingRow={editingRow}
                                    setEditingRow={setEditingRow}
                                    editMutation={editMutation}
                                    deleteMutation={deleteMutation}
                                />
                            ))}
                        </TableBody>
                    )}
                </Droppable>
            </Table>

            {/* Pagination controls */}
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Grid item>
                    <Button size="small" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Prev
                    </Button>
                </Grid>
                <Grid item>
                    Page {page} of {Math.max(1, Math.ceil(total / limit))}
                </Grid>
                <Grid item>
                    <Button size="small" disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
                        Next
                    </Button>
                </Grid>
            </Grid>
        </>
    );
}
