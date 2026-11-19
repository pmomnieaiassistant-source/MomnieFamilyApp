/**
 * Momnie Family: real iPhone push notifications (Firebase Cloud Messaging), with bundling.
 *
 * Add this as a second file in the Sheet's Apps Script project (Files > + > Script > name it "Push").
 * It works alongside Code.gs; see SETUP.md for the one line to add to Code.gs and the setup steps.
 *
 * Script properties:
 *   FIREBASE_SERVICE_ACCOUNT  the whole JSON key file from Firebase (Project settings > Service accounts > Generate new private key)
 *   APP_URL                   the GitHub Pages address of the app, ending in "/"
 *
 * Each phone that turns on push saves its token in the Settings tab (row id "Paul|pushTokens" or "Shana|pushTokens").
 *
 * Bundling: alerts for a person are held for their bundling window (Settings row "<Name>|bundleMin", default 5 minutes).
 * Everything that arrives in that window goes out as one notification, e.g. "3 updates from the family app".
 * Urgent alerts skip the wait and go out right away.
 */

const PUSH_DEFAULT_BUNDLE_MIN = 5;

/**
 * Send (or queue) a push for one person. Returns 'app push' if the person has push turned on, otherwise ''
 * so the caller can fall back to email or Pushover.
 * urgent may be true/false or an object like { urgent: true }.
 */
function pushQueue_(name, title, body, urgent) {
  name = String(name || '');
  const tokens = pushTokens_(name);
  if (!tokens.length) return '';
  const isUrgent = urgent === true || urgent === '1' || (urgent && typeof urgent === 'object' && (urgent.urgent === true || urgent.urgent === '1'));
  const win = pushBundleMin_(name);
  if (isUrgent || win <= 0) { pushSendAll_(name, title, body, isUrgent); return 'app push'; }
  const key = 'PUSHQ_' + name.toUpperCase(), props = PropertiesService.getScriptProperties();
  let q = null;
  try { q = JSON.parse(props.getProperty(key) || 'null'); } catch (e) { q = null; }
  if (!q || !q.items) q = { first: Date.now(), items: [] };
  q.items.push({ title: String(title || ''), body: String(body || ''), at: Date.now() });
  if (q.items.length > 40) q.items = q.items.slice(-40);
  props.setProperty(key, JSON.stringify(q));
  return 'app push';
}

/** Runs every minute (see setupPush). Sends any bundle whose window has closed. */
function pushFlush() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    const props = PropertiesService.getScriptProperties(), all = props.getProperties();
    Object.keys(all).filter(k => k.indexOf('PUSHQ_') === 0).forEach(k => {
      let q; try { q = JSON.parse(all[k]); } catch (e) { props.deleteProperty(k); return; }
      const name = k.slice(6).charAt(0) + k.slice(7).toLowerCase();
      if (!q || !q.items || !q.items.length) { props.deleteProperty(k); return; }
      if (Date.now() - q.first < pushBundleMin_(name) * 60000) return;
      props.deleteProperty(k);
      const it = q.items;
      if (it.length === 1) { pushSendAll_(name, it[0].title, it[0].body, false); return; }
      const lines = it.slice(0, 6).map(x => '• ' + (x.body ? x.body : x.title));
      if (it.length > 6) lines.push('and ' + (it.length - 6) + ' more');
      pushSendAll_(name, it.length + ' updates in Momnie Family', lines.join('\n'), false);
    });
  } finally { lock.releaseLock(); }
}

/** Run once from the editor: approves access and turns on the every-minute bundling job. */
function setupPush() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'pushFlush').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('pushFlush').timeBased().everyMinutes(1).create();
  pushAccess_();
  Logger.log('Push is set up. Tokens: Paul ' + pushTokens_('Paul').length + ', Shana ' + pushTokens_('Shana').length);
}

/** Run from the editor to test: sends a push to Paul right away. */
function pushTest() {
  const n = pushSendAll_('Paul', 'Momnie Family', 'Push notifications are working ✅', true);
  Logger.log(n ? 'Sent to ' + n + ' phone(s).' : 'Paul has no phone with push turned on yet (Home > Settings > Notifications and Feed).');
}

// ---------- helpers ----------
function pushSettings_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!sh || sh.getLastRow() < 2) return { sh: sh, rows: [], ci: 0, cv: 1 };
  const vals = sh.getDataRange().getValues(), head = vals[0].map(h => String(h).trim().toLowerCase());
  return { sh: sh, rows: vals, ci: Math.max(0, head.indexOf('id')), cv: head.indexOf('value') < 0 ? 1 : head.indexOf('value') };
}
function pushSetting_(id) {
  const s = pushSettings_();
  for (let i = 1; i < s.rows.length; i++) if (String(s.rows[i][s.ci]) === id) return String(s.rows[i][s.cv]);
  return '';
}
function pushTokens_(name) { return pushSetting_(name + '|pushTokens').split(',').map(t => t.trim()).filter(Boolean); }
function pushBundleMin_(name) { const v = pushSetting_(name + '|bundleMin'); return v === '' ? PUSH_DEFAULT_BUNDLE_MIN : Number(v) || 0; }
function pushDropToken_(name, tok) {
  const s = pushSettings_();
  for (let i = 1; i < s.rows.length; i++) if (String(s.rows[i][s.ci]) === name + '|pushTokens') {
    const left = String(s.rows[i][s.cv]).split(',').map(t => t.trim()).filter(t => t && t !== tok);
    s.sh.getRange(i + 1, s.cv + 1).setValue(left.join(','));
  }
}

/** OAuth token for Firebase, from the service account key. Cached for 50 minutes. */
function pushAccess_() {
  const cache = CacheService.getScriptCache(), hit = cache.get('fcm_at');
  if (hit) return hit;
  const raw = PropertiesService.getScriptProperties().getProperty('FIREBASE_SERVICE_ACCOUNT');
  if (!raw) throw new Error('Add the FIREBASE_SERVICE_ACCOUNT script property (see SETUP.md).');
  const sa = JSON.parse(raw), now = Math.floor(Date.now() / 1000);
  const b64 = x => Utilities.base64EncodeWebSafe(x).replace(/=+$/, '');
  const head = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = b64(Utilities.computeRsaSha256Signature(head + '.' + claim, sa.private_key));
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', muteHttpExceptions: true, payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: head + '.' + claim + '.' + sig } });
  const j = JSON.parse(r.getContentText());
  if (!j.access_token) throw new Error('Firebase sign-in failed: ' + r.getContentText());
  cache.put('fcm_at', j.access_token, 3000);
  cache.put('fcm_project', sa.project_id, 21600);
  return j.access_token;
}

/** Sends one notification to every phone the person turned push on for. Returns how many phones got it. */
function pushSendAll_(name, title, body, urgent) {
  const tokens = pushTokens_(name);
  if (!tokens.length) return 0;
  const at = pushAccess_(), project = CacheService.getScriptCache().get('fcm_project') || JSON.parse(PropertiesService.getScriptProperties().getProperty('FIREBASE_SERVICE_ACCOUNT')).project_id;
  const app = PropertiesService.getScriptProperties().getProperty('APP_URL') || '';
  let sent = 0;
  tokens.forEach(tok => {
    const msg = { token: tok, webpush: { headers: { Urgency: urgent ? 'high' : 'normal', TTL: '86400' }, notification: { title: String(title || 'Momnie Family'), body: String(body || '') } } };
    if (/^https:\/\//.test(app)) { msg.webpush.fcm_options = { link: app }; msg.webpush.notification.icon = app.replace(/\/?$/, '/') + 'icons/icon-192.png'; }
    const r = UrlFetchApp.fetch('https://fcm.googleapis.com/v1/projects/' + project + '/messages:send', { method: 'post', contentType: 'application/json', headers: { Authorization: 'Bearer ' + at }, muteHttpExceptions: true, payload: JSON.stringify({ message: msg }) });
    const code = r.getResponseCode();
    if (code === 200) sent++;
    else if (code === 404 || /UNREGISTERED|registration-token-not-registered/.test(r.getContentText())) pushDropToken_(name, tok);
    else Logger.log('Push to ' + name + ' failed (' + code + '): ' + r.getContentText());
  });
  return sent;
}
