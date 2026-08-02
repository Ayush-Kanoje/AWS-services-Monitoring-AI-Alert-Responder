# Deprecated File Notice

## File: `src/incident-response-dashboard.jsx`

**Status:** ⚠️ DEPRECATED - Do Not Use

### Replacement
This file has been replaced by: **`src/monitoring-dashboard.jsx`**

### Reason for Deprecation
The application has been transformed from an incident simulation interface to a real-time monitoring dashboard:

#### Old Approach (Deprecated)
- ❌ Manual incident simulation with buttons
- ❌ Frontend triggers infrastructure failures
- ❌ Single incident display
- ❌ Complex simulation progress workflow
- ❌ Manual resolve button

#### New Approach (Current)
- ✅ Monitoring-only interface
- ✅ Backend automatically detects real incidents
- ✅ Multiple incident cards (newest first)
- ✅ Expandable/collapsible incident details
- ✅ Automatic polling every 7 seconds
- ✅ Clean separation of concerns

### What Was Commented Out

The following components and functions have been commented out in the deprecated file:

1. **`simulateIncident()`** - No longer triggers incidents from frontend
2. **`IncidentSimulation`** - Removed simulation UI components
3. **`PROGRESS_STEPS`** - No longer shows simulation progress
4. **`PIPELINE_STAGES`** - Pipeline visualization removed
5. **`PipelineFlow`** - Visual pipeline component removed
6. **`SimulationProgress`** - Progress tracking removed
7. **`HeroSection`** - Replaced with simpler header
8. **`GuidedWorkflow`** - 4-step workflow diagram removed
9. **`WORKFLOW_STEPS`** - Workflow definition removed
10. **`App`** - Entire main component replaced

### Components Still Active

These components are still functional and were reused in the new dashboard:

- `StatusBadge` - Health status indicators
- `SectionHeading` - Section headers
- `Card` - Base card component
- `CommandBlock` - Copy-to-clipboard commands
- `Toast` / `ToastStack` - Notification system
- `Header` - App header with theme toggle
- `InfrastructureHealth` - Service health display
- `Field` - Form field component
- `AnalysisCard` - AI analysis display
- `ResolutionStepCard` - Resolution steps
- `AIIncidentAnalysis` - Complete analysis view
- `IncidentHistory` - Historical incidents table
- `Footer` - App footer

### Migration Guide

If you need to reference the old code:

1. Look at the commented sections in `src/incident-response-dashboard.jsx`
2. Compare with the new implementation in `src/monitoring-dashboard.jsx`
3. Note that `App.jsx` now imports `MonitoringDashboard` instead

### File Cleanup Recommendation

This deprecated file can be safely deleted after:
- [ ] All team members are aware of the change
- [ ] The new monitoring dashboard is fully tested
- [ ] No references to this file exist in the codebase
- [ ] Documentation has been updated

### Questions?

Refer to `FRONTEND_TRANSFORMATION.md` for complete details on the transformation.
