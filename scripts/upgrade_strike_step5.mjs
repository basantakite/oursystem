import fs from 'fs';

console.log('--- Step 5: Upgrading toggleVoterStrikeStatus to Patch voted_status directly in Supabase ---');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// Upgrade toggleVoterStrikeStatus to directly update Supabase via PATCH & update in-memory objects
const oldStrikeAction = `function toggleVoterStrikeStatus(voterId, markVoted) {
      const voter = getVoterByIdFast(voterId) || state.voters.find(v => String(v.VoterID) === String(voterId));
      if (!voter) return showToast('मतदाता भेटिएन', 'error');

      voter.HasVoted = !!markVoted;
      voter.VotedAt = markVoted ? new Date().toISOString() : null;
      voter.VotedBy = markVoted ? (currentUser?.UserID || 'booth_agent') : null;

      saveState();
      if (typeof syncVoterToCloud === 'function') {
        syncVoterToCloud(voter);
      }

      renderElectionReports();
      showToast(
        markVoted
          ? \`✅ मत खस्यो: क्र.सं. \${voter.VoterSerial || '-'} \${voter.Name} (वडा \${voter.Ward || voter.WardNo})\`
          : \`↩ मतदान हाजिरी हटाइयो: \${voter.Name}\`,
        markVoted ? 'success' : 'info'
      );
    }`;

const newStrikeAction = `async function toggleVoterStrikeStatus(voterId, markVoted) {
      const voter = (typeof getLiveOrStateVoter === 'function') ? getLiveOrStateVoter(voterId) : (getVoterByIdFast(voterId) || (state.voters || []).find(v => String(v.VoterID) === String(voterId)));
      
      const vName = voter ? (voter.Name || voter.full_name) : ('मतदाता #' + voterId);
      const vWard = voter ? (voter.Ward || voter.ward_no || '-') : '-';
      const vSerial = voter ? (voter.VoterSerial || voter.serial_no || '-') : '-';

      if (voter) {
        voter.HasVoted = !!markVoted;
        voter.voted_status = !!markVoted;
        voter.VotedAt = markVoted ? new Date().toISOString() : null;
        voter.VotedBy = markVoted ? (currentUser?.UserID || 'booth_agent') : null;
      }

      // Direct Supabase PATCH for instantaneous reliable cloud check-in
      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;
      if (url && key) {
        try {
          fetch(\`\${url}/rest/v1/voters?voter_id=eq.\${encodeURIComponent(voterId)}\`, {
            method: 'PATCH',
            headers: {
              'apikey': key,
              'Authorization': 'Bearer ' + key,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              voted_status: !!markVoted,
              voted_time: markVoted ? new Date().toISOString() : null
            })
          }).catch(e => console.warn('Strike status patch error:', e));
        } catch(e) {}
      }

      saveState();
      if (typeof renderElectionReports === 'function') renderElectionReports();
      if (typeof renderElectionDayStrikeSheet === 'function') renderElectionDayStrikeSheet();

      showToast(
        markVoted
          ? \`✅ मत खस्यो: क्र.सं. \${vSerial} \${vName} (वडा \${vWard})\`
          : \`↩ मतदान हाजिरी हटाइयो: \${vName}\`,
        markVoted ? 'success' : 'info'
      );
    }`;

if (html.includes(oldStrikeAction)) {
  html = html.replace(oldStrikeAction, newStrikeAction);
  console.log('✓ Upgraded toggleVoterStrikeStatus with direct real-time Supabase PATCH');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully wrote index.html for Step 5!');
