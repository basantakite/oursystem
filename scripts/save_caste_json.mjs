import fs from 'fs';

const transcriptPath = 'C:/Users/Global Era/.gemini/antigravity/brain/7ef38526-1aca-4186-b3c9-628f86c124ad/.system_generated/logs/transcript.jsonl';
const fullTranscriptPath = 'C:/Users/Global Era/.gemini/antigravity/brain/7ef38526-1aca-4186-b3c9-628f86c124ad/.system_generated/logs/transcript_full.jsonl';

const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
let lastUserLine = null;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('USER_EXPLICIT')) {
    lastUserLine = JSON.parse(lines[i]);
    break;
  }
}

let content = lastUserLine ? lastUserLine.content : '';
if (lastUserLine && lastUserLine.truncated_fields && lastUserLine.truncated_fields.includes('content')) {
  const fullLines = fs.readFileSync(fullTranscriptPath, 'utf8').trim().split('\n');
  for (const fl of fullLines) {
    try {
      const p = JSON.parse(fl);
      if (p.step_index === lastUserLine.step_index) {
        content = p.content;
        break;
      }
    } catch(e) {}
  }
}

const s = content.indexOf('{');
const e = content.lastIndexOf('}');
if (s !== -1 && e !== -1) {
  const jsonStr = content.slice(s, e + 1);
  const casteData = JSON.parse(jsonStr);
  console.log('Title:', casteData.title);
  console.log('Record count:', casteData.records ? casteData.records.length : 0);
  console.log('Groups:', casteData.group_counts);
  console.log('Collisions:', casteData.collision_keys);
  fs.writeFileSync('data/nepal_caste_master_v2.json', JSON.stringify(casteData, null, 2), 'utf8');
  console.log('✓ Successfully written data/nepal_caste_master_v2.json');
} else {
  console.error('Could not find JSON in content');
}
