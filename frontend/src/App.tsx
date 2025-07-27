import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import RuleTable from "./components/RuleTable";
const qc=new QueryClient();
function App(){return <QueryClientProvider client={qc}><RuleTable/></QueryClientProvider>;}
export default App;