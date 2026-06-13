const fs = require('fs');
let code = fs.readFileSync('src/components/RoadmapViewer.tsx', 'utf8');
code = code.replace(
  "                  onNodeClick={() => handleNodeClick(status, step.id)}",
  "                  onNodeClick={() => handleNodeClick(status, step)}"
);
fs.writeFileSync('src/components/RoadmapViewer.tsx', code);
console.log("Done");
