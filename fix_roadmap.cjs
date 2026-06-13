const fs = require('fs');
let code = fs.readFileSync('src/components/RoadmapViewer.tsx', 'utf8');
code = code.replace(
  "  const handleNodeClick = (status: NodeStatus, nodeId: string) => {\r\n    if (status === 'locked') return;\r\n    if (status === 'current') navigate('/practice', { state: { nodeId } });\r\n    if (status === 'completed' || status === 'skipped') navigate('/history', { state: { nodeId } });\r\n  };",
  "  const handleNodeClick = (status: NodeStatus, step: MainStep) => {\r\n    if (status === 'locked') return;\r\n    if (status === 'current') navigate('/practice', { state: { nodeId: step.id, nodeTitle: step.title } });\r\n    if (status === 'completed' || status === 'skipped') navigate('/history', { state: { nodeId: step.id, nodeTitle: step.title } });\r\n  };"
);
fs.writeFileSync('src/components/RoadmapViewer.tsx', code);
console.log("Done");
