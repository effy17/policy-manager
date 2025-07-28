import React, { ChangeEvent, FormEvent, useState } from "react";
import {
    Card, CardContent, CardActions, Grid, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, Checkbox, FormControlLabel, Paper, Typography, Dialog, Alert
} from "@mui/material";
import { useCreateRule } from "../hooks/useRules";
import { Source, Destination } from "../types/Rule";
import axios from "axios";

interface RuleFormProps {
    open: boolean;
    onClose: () => void;
}

export default function RuleForm({ open, onClose }: RuleFormProps) {
    const createMutation = useCreateRule();
    const [tenantId, setTenantId] = useState<number | "">("");
    const [priority, setPriority] = useState<number | "">("");
    const [name, setName] = useState<string>("");
    const [action, setAction] = useState<"Allow" | "Block">("Allow");
    const [sources, setSources] = useState<Source[]>([{ name: "", email: "" }]);
    const [destinations, setDestinations] = useState<Destination[]>([{ name: "", address: "" }]);
    const [anySource, setAnySource] = useState<boolean>(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createMutation.mutate(
            {
                tenantId: tenantId === "" ? undefined : tenantId,
                ruleIndex: anySource || priority === "" ? undefined : priority as number,
                name,
                action,
                sources: anySource ? [] : sources,
                destinations,
            },
            {
                onSuccess: () => {
                    setTenantId("");
                    setPriority("");
                    setName("");
                    setAction("Allow");
                    setSources([{ name: "", email: "" }]);
                    setDestinations([{ name: "", address: "" }]);
                    setAnySource(false);
                    onClose();
                },
            }
        );
    };

    const handleSourceChange = (idx: number, field: keyof Source, value: string) => {
        setSources(prev => prev.map((src, i) => i === idx ? { ...src, [field]: value } : src));
    };

    const handleDestinationChange = (idx: number, field: keyof Destination, value: string) => {
        setDestinations(prev => prev.map((dst, i) => i === idx ? { ...dst, [field]: value } : dst));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <Card sx={{ mb: 3, boxShadow: "none" }}>
                    <CardContent>
                        <Typography variant="h5" component="div" gutterBottom align="center">
                            Create New Rule
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Rule Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField
                                    fullWidth
                                    label="Priority"
                                    type="number"
                                    value={priority}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setPriority(e.target.value === "" ? "" : Number(e.target.value))
                                    }
                                    required={!anySource}
                                    disabled={anySource}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Action</InputLabel>
                                    <Select
                                        label="Action"
                                        value={action}
                                        onChange={e => setAction(e.target.value as any)}
                                    >
                                        <MenuItem value="Allow">Allow</MenuItem>
                                        <MenuItem value="Block">Block</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={anySource}
                                            onChange={e => setAnySource(e.target.checked)}
                                        />
                                    }
                                    label="Any Source"
                                />
                            </Grid>
                            {!anySource && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, mb: 2 }}>
                                        <strong>Sources</strong>
                                        {sources.map((src, idx) => (
                                            <Grid container spacing={1} key={idx} alignItems="center" sx={{ mt: 1 }}>
                                                <Grid item xs={5}>
                                                    <TextField
                                                        fullWidth label="Source Name" size="small"
                                                        value={src.name}
                                                        onChange={e => handleSourceChange(idx, "name", e.target.value)}
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField
                                                        fullWidth label="Source Email" size="small"
                                                        type="email"
                                                        value={src.email}
                                                        onChange={e => handleSourceChange(idx, "email", e.target.value)}
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Button
                                                        size="small"
                                                        onClick={() => setSources(prev => prev.filter((_, i) => i !== idx))}
                                                    >Remove</Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button onClick={() => setSources(prev => [...prev, { name: "", email: "" }])} size="small" sx={{ mt: 1 }}>
                                            Add Source
                                        </Button>
                                    </Paper>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2 }}>
                                    <strong>Destinations</strong>
                                    {destinations.map((dst, idx) => (
                                        <Grid container spacing={1} key={idx} alignItems="center" sx={{ mt: 1 }}>
                                            <Grid item xs={5}>
                                                <TextField
                                                    fullWidth label="Destination Name" size="small"
                                                    value={dst.name}
                                                    onChange={e => handleDestinationChange(idx, "name", e.target.value)}
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <TextField
                                                    fullWidth label="Destination Address" size="small"
                                                    value={dst.address}
                                                    onChange={e => handleDestinationChange(idx, "address", e.target.value)}
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setDestinations(prev => prev.filter((_, i) => i !== idx))}
                                                >Remove</Button>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Button onClick={() => setDestinations(prev => [...prev, { name: "", address: "" }])} size="small" sx={{ mt: 1 }}>
                                        Add Destination
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                        {createMutation.isError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {axios.isAxiosError(createMutation.error)
                                    ? createMutation.error.response?.data?.error || createMutation.error.message
                                    : String(createMutation.error)}
                            </Alert>
                        )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: "center" }}>
                        <Button type="submit" variant="contained" color="primary" disabled={createMutation.isLoading}>
                            Create Rule
                        </Button>
                        <Button variant="outlined" onClick={onClose}>
                            Cancel
                        </Button>
                    </CardActions>
                </Card>
            </form>
        </Dialog>
    );
}
