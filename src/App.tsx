import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Incidents } from './pages/Incidents';
import { InvestigationStudio } from './pages/InvestigationStudio';
import { ServiceTopology } from './pages/ServiceTopology';
import { Workflows } from './pages/Workflows';
import { AIOperations } from './pages/AIOperations';
import { ScenarioLab } from './pages/ScenarioLab';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { TeamPermissions } from './pages/TeamPermissions';
import { ActivityHistory } from './pages/ActivityHistory';
import { Administration } from './pages/Administration';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<InvestigationStudio />} />
          <Route path="/investigation" element={<InvestigationStudio />} />
          <Route path="/topology" element={<ServiceTopology />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/ai" element={<AIOperations />} />
          <Route path="/scenarios" element={<ScenarioLab />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/team" element={<TeamPermissions />} />
          <Route path="/activity" element={<ActivityHistory />} />
          <Route path="/admin" element={<Administration />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
