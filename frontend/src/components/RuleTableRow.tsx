import React, { useState } from "react";
import {
    TableRow, TableCell, TextField, FormControl, Select, MenuItem,
    Button, Chip, Box, FormHelperText, Grid
} from "@mui/material";
import { Draggable } from "react-beautiful-dnd";
import { Rule, Source, Destination } from "../types/Rule";

// Helper: Only action can be edited for any-source rules
function isAnySourceRule(rule: Rule) {
    return Array.isArray(rule.sources) && rule.sources.length === 0;
}
function deepEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

interface EditableRule {
    name: string;
    action: "Allow" | "Block";
    sources: Source[];
    destinations: Destination[];
}
interface Props {
    rule: Rule;
    index: number;
    isDraggable: boolean;
    editingRow: number | null;
    setEditingRow: (id: number | null) => void;
    editMutation: any;
    deleteMutation: any;
}

export default function RuleTableRow({
                                         rule, index, isDraggable, editingRow, setEditingRow, editMutation, deleteMutation
                                     }: Props) {
    const [buf, setBuf] = useState<EditableRule>({
        name: rule.name,
        action: rule.action,
        sources: rule.sources.map(s => ({ ...s })),
        destinations: rule.destinations.map(d => ({ ...d })),
    });

    React.useEffect(() => {
        if (editingRow !== rule.id) {
            setBuf({
                name: rule.name,
                action: rule.action,
                sources: rule.sources.map(s => ({ ...s })),
                destinations: rule.destinations.map(d => ({ ...d })),
            });
        }
    }, [editingRow, rule]);

    function isChanged(): boolean {
        if (isAnySourceRule(rule)) return rule.action !== buf.action;
        return (
            rule.name !== buf.name ||
            rule.action !== buf.action ||
            !deepEqual(rule.sources, buf.sources) ||
            !deepEqual(rule.destinations, buf.destinations)
        );
    }

    const handleFieldChange = <K extends keyof EditableRule>(field: K, value: EditableRule[K]) => {
        setBuf(prev => ({ ...prev, [field]: value }));
    };

    const saveEdit = () => {
        editMutation.mutate({ id: rule.id, data: buf }, { onSuccess: () => setEditingRow(null) });
    };

    // DRAGGABLE only if isDraggable and index >= 0
    if (isDraggable && index >= 0) {
        // Ensure draggableId is a string and unique
        const draggableId = String(rule.id);

        return (
            <Draggable draggableId={draggableId} index={index} isDragDisabled={false}>
                {(prov) => (
                    <TableRow
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        hover
                    >
                        <TableCell
                            {...prov.dragHandleProps}
                            sx={{ cursor: "grab", width: 36, textAlign: "center" }}
                        >
                            <span
                                style={{ fontSize: 20, display: "inline-block", width: 24, height: 24, lineHeight: "24px" }}
                                tabIndex={-1} aria-label="Drag"
                            >☰</span>
                        </TableCell>
                        <RuleTableRowInner
                            rule={rule}
                            buf={buf}
                            isEditing={editingRow === rule.id}
                            setEditingRow={setEditingRow}
                            setBuf={setBuf}
                            handleFieldChange={handleFieldChange}
                            saveEdit={saveEdit}
                            isChanged={isChanged()}
                            deleteMutation={deleteMutation}
                        />
                    </TableRow>
                )}
            </Draggable>
        );
    }
    // Non-draggable row (either no drag or index = -1)
    return (
        <TableRow hover>
            <TableCell>
                <span
                    style={{ fontSize: 20, color: "#999", cursor: "not-allowed" }}
                    tabIndex={-1} aria-label="No Drag"
                >☰</span>
            </TableCell>
            <RuleTableRowInner
                rule={rule}
                buf={buf}
                isEditing={editingRow === rule.id}
                setEditingRow={setEditingRow}
                setBuf={setBuf}
                handleFieldChange={handleFieldChange}
                saveEdit={saveEdit}
                isChanged={isChanged()}
                deleteMutation={deleteMutation}
            />
        </TableRow>
    );
}

// Inner component for rendering row columns
interface InnerProps {
    rule: Rule;
    buf: EditableRule;
    isEditing: boolean;
    setEditingRow: (id: number | null) => void;
    setBuf: React.Dispatch<React.SetStateAction<EditableRule>>;
    handleFieldChange: <K extends keyof EditableRule>(field: K, value: EditableRule[K]) => void;
    saveEdit: () => void;
    isChanged: boolean;
    deleteMutation: any;
}
function RuleTableRowInner({
                               rule, buf, isEditing, setEditingRow, handleFieldChange, saveEdit, isChanged, deleteMutation,
                           }: InnerProps) {
    const anySource = isAnySourceRule(rule);

    return (
        <>
            <TableCell>{Math.trunc(rule.ruleIndex)}</TableCell>
            <TableCell>
                {anySource
                    ? rule.name
                    : isEditing ? (
                        <TextField fullWidth size="small" value={buf.name} onChange={e => handleFieldChange("name", e.target.value)} />
                    ) : rule.name}
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <FormControl fullWidth size="small">
                        <Select value={buf.action} onChange={e => handleFieldChange("action", e.target.value as any)}>
                            <MenuItem value="Allow">Allow</MenuItem>
                            <MenuItem value="Block">Block</MenuItem>
                        </Select>
                        <FormHelperText>Rule Action</FormHelperText>
                    </FormControl>
                ) : rule.action}
            </TableCell>
            <TableCell>
                {anySource ? <em>Any Source</em> : isEditing ? (
                    <Grid container spacing={1} alignItems="flex-start">
                        {buf.sources.map((s, i) => (
                            <Grid item xs={12} key={i}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField label="Source name" size="small" value={s.name}
                                               onChange={e => {
                                                   const arr = [...buf.sources];
                                                   arr[i] = { ...arr[i], name: e.target.value };
                                                   handleFieldChange("sources", arr);
                                               }}
                                               sx={{ minWidth: 120 }}
                                    />
                                    <TextField label="Source email" size="small" value={s.email}
                                               onChange={e => {
                                                   const arr = [...buf.sources];
                                                   arr[i] = { ...arr[i], email: e.target.value };
                                                   handleFieldChange("sources", arr);
                                               }}
                                               sx={{ minWidth: 120 }}
                                    />
                                    <Button size="small" color="primary"
                                            onClick={() => {
                                                const arr = buf.sources.filter((_, j) => j !== i);
                                                handleFieldChange("sources", arr);
                                            }}
                                            sx={{ minWidth: 64 }}
                                    >Remove</Button>
                                </Box>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Button size="small" onClick={() => {
                                const arr = [...buf.sources, { name: "", email: "" }];
                                handleFieldChange("sources", arr);
                            }}>Add Source</Button>
                        </Grid>
                    </Grid>
                ) : (
                    <Box>
                        {rule.sources.map((s, i) => (
                            <Chip key={i} label={s.name} sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                    </Box>
                )}
            </TableCell>
            <TableCell>
                {anySource
                    ? rule.destinations.map((d, i) => (
                        <Chip key={i} label={d.name} sx={{ mr: 0.5, mb: 0.5 }} />
                    ))
                    : isEditing ? (
                        <Grid container spacing={1} alignItems="flex-start">
                            {buf.destinations.map((d, i) => (
                                <Grid item xs={12} key={i}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <TextField label="Destination name" size="small" value={d.name}
                                                   onChange={e => {
                                                       const arr = [...buf.destinations];
                                                       arr[i] = { ...arr[i], name: e.target.value };
                                                       handleFieldChange("destinations", arr);
                                                   }}
                                                   sx={{ minWidth: 120 }}
                                        />
                                        <TextField label="Destination address" size="small" value={d.address}
                                                   onChange={e => {
                                                       const arr = [...buf.destinations];
                                                       arr[i] = { ...arr[i], address: e.target.value };
                                                       handleFieldChange("destinations", arr);
                                                   }}
                                                   sx={{ minWidth: 120 }}
                                        />
                                        <Button size="small" color="primary"
                                                onClick={() => {
                                                    const arr = buf.destinations.filter((_, j) => j !== i);
                                                    handleFieldChange("destinations", arr);
                                                }}
                                                sx={{ minWidth: 64 }}
                                        >Remove</Button>
                                    </Box>
                                </Grid>
                            ))}
                            <Grid item xs={12}>
                                <Button size="small" onClick={() => {
                                    const arr = [...buf.destinations, { name: "", address: "" }];
                                    handleFieldChange("destinations", arr);
                                }}>Add Destination</Button>
                            </Grid>
                        </Grid>
                    ) : (
                        <Box>
                            {rule.destinations.map((d, i) => (
                                <Chip key={i} label={`${d.name}${d.address ? " - " + d.address : ""}`} sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                        </Box>
                    )}
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <Grid container spacing={1}>
                        <Grid item>
                            <Button size="small" variant="contained" color="primary"
                                    onClick={saveEdit} disabled={!isChanged}>Save</Button>
                        </Grid>
                        <Grid item>
                            <Button size="small" variant="outlined"
                                    onClick={() => setEditingRow(null)}>Cancel</Button>
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container spacing={1}>
                        <Grid item>
                            <Button size="small" onClick={() => setEditingRow(rule.id)}>Edit</Button>
                        </Grid>
                        <Grid item>
                            <Button size="small" color="error" onClick={() => deleteMutation.mutate(rule.id)}>Delete</Button>
                        </Grid>
                    </Grid>
                )}
            </TableCell>
        </>
    );
}
