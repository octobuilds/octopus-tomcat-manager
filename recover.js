const fs = require('fs');
const readline = require('readline');
const path = require('path');

const brainDir = 'C:\\Users\\furka\\.gemini\\antigravity-ide\\brain';
const targetDir = 'C:\\Users\\furka\\Desktop\\proje\\apm\\octopusapm_next';
const recoverOutput = 'C:\\Users\\furka\\Desktop\\proje\\apm\\recovered_files';

if (!fs.existsSync(recoverOutput)) {
    fs.mkdirSync(recoverOutput, { recursive: true });
}

async function scanTranscripts() {
    const transcripts = [];
    const dirs = fs.readdirSync(brainDir);
    for (const d of dirs) {
        const transcriptPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript_full.jsonl');
        if (fs.existsSync(transcriptPath)) {
            transcripts.push({ path: transcriptPath, time: fs.statSync(transcriptPath).mtimeMs });
        }
    }
    
    // Sort oldest to newest so later edits override earlier ones
    transcripts.sort((a, b) => a.time - b.time);

    const fileStates = {};

    for (const t of transcripts) {
        const fileStream = fs.createReadStream(t.path);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            try {
                const step = JSON.parse(line);
                
                // Track tool calls
                if (step.tool_calls) {
                    for (const call of step.tool_calls) {
                        const args = call.function.arguments;
                        let argsObj = {};
                        if (typeof args === 'string') {
                            try { argsObj = JSON.parse(args); } catch(e){}
                        } else {
                            argsObj = args;
                        }

                        if (call.function.name === 'write_to_file') {
                            if (argsObj.TargetFile && argsObj.TargetFile.includes('octopusapm_next')) {
                                fileStates[argsObj.TargetFile] = argsObj.CodeContent;
                            }
                        }
                    }
                }

                // Track tool responses (view_file)
                if (step.content && typeof step.content === 'string') {
                     // Check if it's a tool response
                     // Actually tool responses might be inside a different structure in the transcript
                     // Let's just do a naive regex search in the JSON string for view_file output
                }
                
                if (step.type === 'TOOL_RESPONSE' && step.content) {
                    const contentStr = typeof step.content === 'string' ? step.content : JSON.stringify(step.content);
                    if (contentStr.includes('File Path: `file:///c:/Users/furka/Desktop/proje/apm/octopusapm_next/')) {
                         // Parse view_file output
                         const match = contentStr.match(/File Path: `file:\/\/\/(.+?)`[\s\S]*?(?:The following code has been modified.*?: <original_line>.*?|Showing lines \d+ to \d+\n)([\s\S]+?)(?:\nThe above content does NOT show|\]\]\>|$)/);
                         if (match) {
                             let filePath = match[1].replace(/\//g, '\\');
                             // Fix drive letter case
                             if (filePath.startsWith('c:')) filePath = 'C:' + filePath.substring(2);
                             let fileContent = match[2];
                             // Remove line numbers "123: "
                             fileContent = fileContent.replace(/^\d+:\s/gm, '');
                             
                             if (!fileStates[filePath]) {
                                fileStates[filePath] = fileContent;
                             } else {
                                // Just a simple approach: if we view it, we update our state (though viewing might be partial)
                                // We'll just save it to a separate log if it's partial. 
                                // Actually, let's only keep it if we don't have it, or append for manual review.
                             }
                         }
                    }
                }
            } catch(e) {}
        }
    }

    // Write recovered files
    for (const [filePath, content] of Object.entries(fileStates)) {
        const relativePath = filePath.replace(targetDir, '').replace(/^\\+/, '');
        if (!relativePath) continue;
        const outPath = path.join(recoverOutput, relativePath);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, content);
        console.log(`Recovered: ${relativePath}`);
    }
    
    console.log('Recovery parsing complete.');
}

scanTranscripts();
