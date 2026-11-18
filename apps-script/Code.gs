/**
 * Momnie Family app backend
 * Version 3.14 (2026-11-18)
 *   3.14: AI Today card. For each person who turns it on, the assistant writes their Today card: a short headline, a
 *         practical weather line and the 2 to 5 things that matter most, each linked to the real item. Written early
 *         each morning (for today) and at 7 PM (for tomorrow), or on demand from the card's refresh button.
 *   3.13: assistant rules. Plain-English rules (new ai_rules tab) that the AI assistant checks every run, posting to the
 *        people each rule names (one person = a private note). Activity gets an audience column for these notes.
 *   3.12: AI assistant. Once a day (after the hour set in the app) Claude reads a summary of the Sheet and posts 0 to 3
 *        short notes to the Feed as "AI assistant". Turn it on and choose who sees it in the app: Home, Settings, AI
 *        assistant (Paul only). Needs the Script property ANTHROPIC_API_KEY. Optional: AI_MODEL (default claude-opus-5-5).
 *   3.11: caretakers can be paid weekly: one "Pay <name>" to-do a week on their pay day (no per-job to-dos), listing that
 *        week's jobs, for their usual weekly amount or hours times rate. New Caretakers columns pay, payDay, weekly.
 *   3.10: school drop-off and pickup in the reminders. The 8 PM message lists tomorrow's school runs and who is doing
 *        each (changes and runs with no one set are called out), and the morning summary lists today's.
 *   3.9: new weeks start with no dinner planned (the weekly draft no longer picks random recipes). Who usually cooks
 *        and who is usually out still fill in. Random on a single night still follows the dinner rules.
 *   3.8: "Make it an app item" on a shared-calendar entry: the app takes over the existing calendar event (or repeating
 *        series) by tagging it, instead of making a second copy. Calendar reads now say which series an event belongs to.
 *   3.7: faster. The app's copy of each tab and of the shared calendar is kept in the script cache, so opening the
 *        app no longer re-reads every tab. A tab is re-read when the app changes it, when someone edits the Sheet
 *        by hand (a change trigger is added automatically), or after 2 hours. Opening the app no longer waits for
 *        the other person's save. "Family app > Refresh the app's copy" forces a fresh read.
 *   3.6: feedback from the Home screen is saved to a new "ideas" tab (id, time, who, text).
 *   3.5: gift ideas (gifts tab) and the daily checklist (daily_items and daily_completions tabs).
 *   3.4: remembers when each person last used the app (shown as green/yellow rings and "last active").
 *   3.3: every app event and repeating activity is copied to the shared Google Calendar (one-way backup).
 *        Run "Copy everything to the calendar" from the Family app menu once to copy what's already in the app.
 *   3.2: who's cooking each dinner (Menus.cook), with a usual cook per weekday in Dinner rules.
 *   3.1: photos on any card (Photos tab, saved to the "Momnie photos" Drive folder), school hours by weekday,
 *        extended day, plain-text weekly and monthly summaries. Needs Drive access: run "setup" once after pasting.
 *
 * Paste into Extensions > Apps Script in the family Google Sheet, then:
 *   0. (AI assistant only) Project Settings > Script properties: ANTHROPIC_API_KEY = your key from console.anthropic.com
 *   1. Project Settings > Script properties: PASSCODE_PAUL, PASSCODE_SHANA
 *      (optional: CALENDAR_IDS, NOTIFY_EMAIL_PAUL, NOTIFY_EMAIL_SHANA, PUSHOVER_*, APP_URL)
 *   2. Run "setup" once from the editor and approve access.
 *   3. Deploy > New deployment > Web app > Execute as: Me, Access: Anyone.
 * After any code change: Deploy > Manage deployments > edit > New version.
 */
var T = {
  People: 'id,name,kind,schoolId,workDays,workStart,workEnd,birthday,notes,extDays',
  Schools: 'id,name,short,color,logo,start,end,contacts,notes,hours,extEnd',
  SchoolCal: 'id,schoolId,date,endDate,title,kind,start,end,notes',
  Activities: 'id,name,kids,days,start,end,from,until,location,teacher,dropoff,pickup,house,notes,gcalId',
  Overrides: 'id,ref,date,dropoff,pickup,cancelled',
  Events: 'id,title,date,endDate,allDay,start,end,category,people,house,location,dropoff,pickup,notes,gcal,gcalId,createdBy',
  Caretakers: 'id,name,relationship,phone,roster,birthday,drive,rate,unpaid,notes,pay,payDay,weekly',
  Childcare: 'id,date,start,end,task,place,kids,roster,notes,asks,confirmedId,payTodoId,paidAmount,paidOn,createdBy',
  Birthdays: 'id,name,date,notes',
  Todos: 'id,created,type,title,amount,where,due,status,assignee,addedBy,doneOn,doneBy,notes,house,kid,repeat,link,source',
  TodoTypes: 'id,name,emoji,assignee,builtin,fields',
  Recipes: 'id,name,description,unique,pantry,steps,tags,link,ratings,status,pausedUntil,addedBy,created',
  DinnerRules: 'id,type,value,away,cook',
  Weeks: 'id,status,lockedBy',
  Menus: 'id,week,day,date,recipeId,note,away,skipped,kept,cook',
  Groceries: 'id,name,category,details,altNames,recurDays,nextAdd,house',
  GroceryList: 'id,groceryId,name,status,addOn,source,menuId,house,addedBy,boughtOn,boughtBy',
  HouseCards: 'id,house,kind,title,body,link,everyMonths,nextDue',
  Houses: 'id,name,lat,lon',
  WeatherRules: 'id,metric,op,threshold,message,when,push,urgent,enabled',
  Quotes: 'id,quote,author,lastShown',
  Memories: 'id,date,note,photo',
  Updates: 'id,date,title,message,hiddenFrom,label',   // label: optional heading over a splash screen, e.g. "A bit from Paul"
  Messages: 'id,time,from,text,tags,visibility,pinUntil,urgent,resolved,resolvedBy',
  Activity: 'id,time,who,type,text,amount,table,ref,cat,audience',   // audience: who sees an AI assistant note
  Comments: 'id,time,who,table,ref,text,system',
  Reactions: 'id,time,who,table,ref,emoji',
  Links: 'id,aTable,aRef,bTable,bRef,by',
  Photos: 'id,time,who,table,ref,fileId,caption,cover',
  Settings: 'id,value',
  NeedsReview: 'id,recipe,ingredient,closest,action',
  gifts: 'id,recipient,added_by,name,description,url,photo,assigned_to,created_at',
  ai_rules: 'id,text,audience,area,active,created_by,created_at',   // plain-English rules the AI assistant follows
  daily_items: 'id,title,days,time_of_day,for_person,visible_to,created_by,active',
  daily_completions: 'id,item_id,date,completed_by,completed_at',   // id = item_id|date, so each item is checked once per day
  ideas: 'id,time,who,text'   // feedback sent from the Home screen; read it in the Sheet
};
var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var ADULTS = ['Paul', 'Shana'];
var _ss, _cache = {}, _dirty = {}, _logs = [];

// ---------- small helpers ----------
function tz_() { return Session.getScriptTimeZone(); }
function now_() { return Utilities.formatDate(new Date(), tz_(), "yyyy-MM-dd'T'HH:mm:ss"); }
function today_() { return now_().slice(0, 10); }
function addDays_(d, n) { var p = d.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10); }
function dow_(d) { var p = d.split('-').map(Number); return (new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() + 6) % 7; }
function monday_(d) { return addDays_(d, -dow_(d)); }
function list_(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
function id_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 8); }
function nice_(d) { var p = d.split('-').map(Number); return DAYS[dow_(d)] + ', ' + MONTHS[p[1] - 1] + ' ' + p[2]; }
function t12_(s) { var p = String(s || '').split(':').map(Number); if (isNaN(p[0])) return ''; return ((p[0] + 11) % 12 + 1) + (p[1] ? ':' + ('0' + p[1]).slice(-2) : '') + (p[0] < 12 ? ' AM' : ' PM'); }
function hrs_(s, e) { var a = s.split(':').map(Number), b = e.split(':').map(Number), m = b[0] * 60 + b[1] - a[0] * 60 - a[1]; if (m <= 0) m += 1440; return m / 60; }
function isDate_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function normName_(s) { return String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().replace(/(es|s)$/, ''); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function norm_(v) {
  if (v instanceof Date) {
    var s = Utilities.formatDate(v, tz_(), "yyyy-MM-dd'T'HH:mm:ss");
    if (s < '1901') return s.slice(11, 16);
    return s.slice(11) === '00:00:00' ? s.slice(0, 10) : s;
  }
  return v === null || v === undefined ? '' : String(v);
}

// ---------- sheet tables ----------
function ss_() { return _ss || (_ss = SpreadsheetApp.getActiveSpreadsheet()); }
function cols_(t) { return T[t].split(','); }
function sh_(t) {
  var sh = ss_().getSheetByName(t);
  if (!sh) {
    sh = ss_().insertSheet(t);
    var c = cols_(t);
    sh.getRange(1, 1, 1, c.length).setValues([c]);
    sh.setFrozenRows(1);
  }
  return sh;
}
/** Reads a tab as objects keyed by its header row. Rows typed straight into the Sheet get an id on first read. */
function rows_(t) {
  if (_cache[t]) return _cache[t];
  var sh = sh_(t), v = sh.getDataRange().getValues(), head = v[0].map(String);
  cols_(t).forEach(function (k) { if (head.indexOf(k) < 0) { head.push(k); sh.getRange(1, head.length).setValue(k); } });
  var out = [], idCol = head.indexOf('id') + 1;
  for (var i = 1; i < v.length; i++) {
    var r = v[i], o = { _row: i + 1 }, any = false;
    head.forEach(function (k, j) { if (k) { o[k] = norm_(r[j]); if (o[k] !== '') any = true; } });
    if (!any) continue;
    if (!o.id) { o.id = id_(); sh.getRange(i + 1, idCol).setNumberFormat('@').setValue(o.id); }
    out.push(o);
  }
  out._head = head;
  return _cache[t] = out;
}
function get_(t, id) { var rs = rows_(t); for (var i = 0; i < rs.length; i++) if (rs[i].id === String(id)) return rs[i]; return null; }
/** Insert or update by id. Only the keys given are changed. */
function put_(t, o) {
  var rows = rows_(t), head = rows._head, sh = sh_(t), cur = o.id ? get_(t, o.id) : null;
  if (!cur) {
    cur = { id: String(o.id || id_()), _row: Math.max(sh.getLastRow(), 1) + 1 };
    head.forEach(function (k) { if (k && cur[k] === undefined) cur[k] = ''; });
    rows.push(cur);
  }
  if (!_dirty[t]) cacheDrop_(['tb|' + t]);
  Object.keys(o).forEach(function (k) { if (k !== 'id' && k.charAt(0) !== '_' && head.indexOf(k) >= 0) cur[k] = o[k] === null || o[k] === undefined ? '' : String(o[k]); });
  sh.getRange(cur._row, 1, 1, head.length).setNumberFormat('@').setValues([head.map(function (k) { return k && cur[k] !== undefined ? cur[k] : ''; })]);
  _dirty[t] = 1;
  return cur;
}
function del_(t, id) {
  var r = get_(t, id);
  if (!r) return null;
  if (!_dirty[t]) cacheDrop_(['tb|' + t]);
  sh_(t).deleteRow(r._row);
  delete _cache[t];
  _dirty[t] = 1;
  return r;
}
function out_(t) {
  var rs = rows_(t);
  if (t === 'Activity') rs = rs.slice(-250);
  if (t === 'daily_completions') { var since = addDays_(today_(), -14); rs = rs.filter(function (r) { return r.date >= since; }); }   // the app only needs recent check-offs
  return rs.map(function (r) { var o = {}; Object.keys(r).forEach(function (k) { if (k !== '_row') o[k] = r[k]; }); return o; });
}
// ---------- cache (speed) ----------
// Each tab's rows (as sent to the app) and recent calendar reads are kept in the script cache.
// Values over ~90 KB are split into pieces: the main key then holds "#<count>".
var TB_TTL = 7200, CAL_TTL = 300, PIECE = 30000;
var APP_TABLES = function () { return Object.keys(T).filter(function (t) { return t !== 'NeedsReview' && t !== 'ideas'; }); };
function cachePut_(key, obj, ttl) {
  try {
    var c = CacheService.getScriptCache(), js = JSON.stringify(obj), m = {};
    if (js.length <= PIECE) m[key] = js;
    else { var n = Math.ceil(js.length / PIECE); m[key] = '#' + n; for (var i = 0; i < n; i++) m[key + '|' + i] = js.slice(i * PIECE, (i + 1) * PIECE); }
    c.putAll(m, ttl);
  } catch (e) { console.error(e); }
}
/** Reads several cached values at once; returns { key: value } for the ones found whole. */
function cacheGetAll_(keys) {
  var out = {};
  try {
    var c = CacheService.getScriptCache(), top = c.getAll(keys), more = [];
    keys.forEach(function (k) { var v = top[k]; if (v && v.charAt(0) === '#') for (var i = 0; i < +v.slice(1); i++) more.push(k + '|' + i); });
    var parts = more.length ? c.getAll(more) : {};
    keys.forEach(function (k) {
      var v = top[k]; if (!v) return;
      if (v.charAt(0) === '#') { var js = ''; for (var i = 0; i < +v.slice(1); i++) { var p = parts[k + '|' + i]; if (p === undefined || p === null) return; js += p; } v = js; }
      try { out[k] = JSON.parse(v); } catch (e) {}
    });
  } catch (e) { console.error(e); }
  return out;
}
function cacheDrop_(keys) { try { CacheService.getScriptCache().removeAll(keys); } catch (e) { console.error(e); } }
/** Every app tab, from the cache where possible. Tabs changed in this run, or missing from the cache, are read from the Sheet and cached. */
function tablesCached_() {
  var names = APP_TABLES(), got = cacheGetAll_(names.map(function (t) { return 'tb|' + t; })), out = {};
  names.forEach(function (t) {
    var hit = got['tb|' + t];
    if (hit && !_dirty[t]) { out[t] = hit; return; }
    out[t] = out_(t); cachePut_('tb|' + t, out[t], TB_TTL);
  });
  return out;
}
function calCached_(start, days) {
  var key = 'cal|' + start + '|' + days, hit = cacheGetAll_([key])[key];
  if (hit) return hit;
  var cal = calSafe_(start, days); cachePut_(key, cal, CAL_TTL); return cal;
}
/** Forget the cached calendar reads (after the app deletes a calendar event). */
function calDrop_() { var t = today_(), keys = []; for (var i = -14; i <= 70; i++) { keys.push('cal|' + addDays_(t, i) + '|56'); keys.push('cal|' + addDays_(t, i) + '|7'); } cacheDrop_(keys); }
/** Installable "on change" trigger: someone edited the Sheet by hand, so the app's copy is re-read. */
function sheetChanged() { cacheDrop_(APP_TABLES().map(function (t) { return 'tb|' + t; })); }
function refreshAppCopy() { sheetChanged(); calDrop_(); try { SpreadsheetApp.getUi().alert('Done. The app will read the Sheet fresh next time it opens.'); } catch (e) {} }
function ensureChangeTrigger_() {
  var p = PropertiesService.getScriptProperties();
  if (p.getProperty('CHANGE_TRIGGER') === '1') return;
  p.setProperty('CHANGE_TRIGGER', '1');
  try {
    ScriptApp.getProjectTriggers().filter(function (x) { return x.getHandlerFunction() === 'sheetChanged'; }).forEach(function (x) { ScriptApp.deleteTrigger(x); });
    ScriptApp.newTrigger('sheetChanged').forSpreadsheet(ss_()).onChange().create();
  } catch (e) { console.error(e); }
}

function setting_(k, d) { var r = get_('Settings', k); return r && r.value !== '' ? r.value : d; }

// ---------- last active ----------
/** When each adult last used the app (UTC ISO time), kept in script properties so it doesn't touch the Sheet. */
function seenMark_(me) { try { PropertiesService.getScriptProperties().setProperty('SEEN_' + me.toUpperCase(), new Date().toISOString()); } catch (e) { console.error(e); } }
function seenAll_() { var p = PropertiesService.getScriptProperties(), o = {}; ADULTS.forEach(function (a) { o[a] = p.getProperty('SEEN_' + a.toUpperCase()) || ''; }); return o; }

// ---------- web app ----------
function doGet() { return json_({ ok: true, msg: 'Momnie Family API is running' }); }

function auth_(pass) {
  if (!pass) return null;
  var p = PropertiesService.getScriptProperties();
  if (pass === p.getProperty('PASSCODE_PAUL')) return 'Paul';
  if (pass === p.getProperty('PASSCODE_SHANA')) return 'Shana';
  return null;
}

function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }
  var me = auth_(b.passcode);
  if (!me) return json_({ ok: false, error: 'Wrong passcode' });
  seenMark_(me);
  if (b.action === 'ping') return json_({ ok: true, me: me, tables: {}, seen: seenAll_() });
  if (b.action === 'cal') return json_({ ok: true, me: me, tables: {}, seen: seenAll_(), cal: calCached_(b.start, b.days), calStart: b.start });
  if (b.action === 'boot') return json_(boot_(b, me));
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var res = route_(b, me) || {};
    if (res.ok === false) return json_(res);
    sendLogs_(me, b.notify);
    res.ok = true; res.me = me; res.tables = res.tables || {}; res.seen = seenAll_();
    Object.keys(_dirty).forEach(function (t) { if (t !== 'NeedsReview' && t !== 'ideas') { res.tables[t] = out_(t); cachePut_('tb|' + t, res.tables[t], TB_TTL); } });
    return json_(res);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the app: daily jobs, weather and the tab copy under the lock (quick when cached); the calendar outside it. */
function boot_(b, me) {
  var lock = LockService.getScriptLock(), r;
  lock.waitLock(25000);
  try {
    ensureChangeTrigger_();
    jobs_(false);
    var wx = weather_(b.lat, b.lon, me);   // may remember which house you're at, so it stays inside the lock
    sendLogs_(me, b.notify);
    r = { tables: tablesCached_(), today: today_(), weather: wx };
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
  } finally {
    lock.releaseLock();
  }
  r.cal = calCached_(addDays_(today_(), -7), 56);
  r.ok = true; r.me = me; r.seen = seenAll_();
  return r;
}

function route_(b, me) {
  switch (b.action) {
    case 'weather': return { weather: weather_(b.lat, b.lon, me) };
    case 'write': return write_(b, me);
    case 'week_add':
      if (!isDate_(b.week)) return { ok: false, error: 'Bad week' };
      weekAdd_(b.week); if (b.log) log_(me, b.log, 'Weeks', b.week); return {};
    case 'photo_add': return photoAdd_(b, me);
    case 'dinner_swap': swap_(b.id); if (b.log) log_(me, b.log, 'Menus', b.id); return {};
    case 'gcal_delete': gcalDelete_(b.gcalId); calDrop_(); if (b.log) log_(me, b.log); return { cal: calCached_(addDays_(today_(), -7), 56) };
    case 'ai_run':   // "Post now" from the AI assistant settings page (Paul only)
      if (me !== 'Paul') return { ok: false, error: 'Only Paul can run the AI assistant.' };
      return { ai: aiPosts_(today_(), true) };
    case 'ai_brief':   // the refresh button on someone's AI Today card (their own card only)
      if (setting_('app|ai.on', '') !== '1') return { ok: false, error: 'The AI assistant is off.' };
      return { brief: aiBrief_(me, isDate_(b.date) ? b.date : today_(), b.mode === 'night' ? 'night' : 'day') };
    case 'notify_test':
      var sent = send_(me, 'Test from the Momnie Family app', 'Notifications are working.');
      return sent ? { sent: sent } : { ok: false, error: 'No email or Pushover is set up for you yet (see README).' };
    default: return { ok: false, error: 'Unknown action' };
  }
}

/** Generic writes: ops = [{t, row, log}] to insert/update, or [{t, del, log}] to delete. */
function write_(b, me) {
  (b.ops || []).forEach(function (op) {
    if (!T[op.t]) throw new Error('Unknown table ' + op.t);
    var r;
    if (op.del) {
      r = del_(op.t, op.del);
      if (r && op.t === 'Events' && r.gcalId && r.gcal === '1') gcalDelete_(r.gcalId);
      if (r && op.t === 'Activities') actUnsync_(r);
      if (r && op.t === 'Photos' && r.fileId) photoTrash_(r.fileId);
    } else {
      var row = op.row || {}, isNew = !row.id || !get_(op.t, row.id), c = cols_(op.t);
      if (isNew) {
        if (c.indexOf('time') >= 0 && !row.time) row.time = now_();
        if (c.indexOf('created') >= 0 && !row.created) row.created = today_();
        ['created_at', 'completed_at'].forEach(function (k) { if (c.indexOf(k) >= 0 && !row[k]) row[k] = now_(); });
        ['who', 'addedBy', 'createdBy', 'by', 'added_by', 'created_by', 'completed_by'].forEach(function (k) { if (c.indexOf(k) >= 0 && !row[k]) row[k] = me; });
        if (op.t === 'Messages' && !row.from) row.from = me;
      }
      if (op.t === 'Events') row.gcal = '1';   // every app event is copied to the shared calendar
      r = put_(op.t, row);
      if (op.t === 'Events') gcalSafe_(function () { gcalSync_(r); });
      if (op.t === 'Activities') gcalSafe_(function () { if (op.adopt) actAdopt_(r, String(op.adopt)); else actSync_(r); });
      if (op.adopt) calDrop_();
      if (op.t === 'Overrides' && row.cancelled !== undefined) { var act = get_('Activities', r.ref); if (act) gcalSafe_(function () { actSync_(act); }); }
    }
    if (op.log) log_(me, op.log, op.t, r ? r.id : '');
  });
  if (b.log) log_(me, b.log);
  return {};
}

function log_(who, log, t, ref) {
  put_('Activity', { time: log.time || now_(), who: who, type: log.type || '', text: log.text || '', amount: log.amount === undefined ? '' : log.amount,
    table: log.table || t || '', ref: log.ref || ref || '', cat: log.cat || '', audience: log.audience || '' });
  if (who !== 'App' && who !== 'AI assistant') _logs.push(log);   // AI notes notify only their chosen audience (aiPosts_)
}

// ---------- notifications ----------
/**
 * Script properties:
 *   NOTIFY_EMAIL_PAUL / NOTIFY_EMAIL_SHANA    email alerts (free)
 *   PUSHOVER_TOKEN, PUSHOVER_USER_PAUL / _SHANA   optional iPhone push through the Pushover app
 *   APP_URL                                   optional link added to every alert
 */
function pref_(p, cat) { return setting_(p + '|n.' + cat, cat === 'dinner' ? '0' : '1') === '1'; }
function quiet_(p) {
  var a = setting_(p + '|quietStart', ''), b = setting_(p + '|quietEnd', '');
  if (!a || !b) return false;
  var n = now_().slice(11, 16);
  return a < b ? (n >= a && n < b) : (n >= a || n < b);
}
function notify_(to, title, body, urgent) {
  try {
    if (!urgent && quiet_(to)) {
      var q = JSON.parse(setting_('queue|' + to, '[]'));
      q.push([title, body]);
      put_('Settings', { id: 'queue|' + to, value: JSON.stringify(q) });
      return 'queued';
    }
    return send_(to, title, body);
  } catch (e) { console.error(e); return ''; }
}
function flushQueues_() {
  ADULTS.forEach(function (p) {
    if (quiet_(p)) return;
    var q = JSON.parse(setting_('queue|' + p, '[]'));
    if (!q.length) return;
    put_('Settings', { id: 'queue|' + p, value: '[]' });
    if (q.length === 1) send_(p, q[0][0], q[0][1]);
    else send_(p, q.length + ' updates while you were on quiet hours', q.map(function (x) { return '- ' + x[0] + (x[1] ? ': ' + x[1] : ''); }).join('\n'));
  });
}
function send_(name, title, body) {
  const pushed = pushQueue_.apply(null, arguments); if (pushed) return pushed;
  var p = PropertiesService.getScriptProperties(), N = name.toUpperCase(), url = p.getProperty('APP_URL') || '';
  var token = p.getProperty('PUSHOVER_TOKEN'), key = p.getProperty('PUSHOVER_USER_' + N), email = p.getProperty('NOTIFY_EMAIL_' + N);
  if (token && key) {
    var r = UrlFetchApp.fetch('https://api.pushover.net/1/messages.json', { method: 'post', muteHttpExceptions: true,
      payload: { token: token, user: key, title: title, message: body || title, url: url, url_title: 'Open the app' } });
    if (r.getResponseCode() === 200) return 'push';
  }
  if (email) {
    MailApp.sendEmail({ to: email, subject: title, name: 'Momnie Family', body: (body || title) + (url ? '\n\nOpen the app: ' + url : '') });
    return 'email';
  }
  return '';
}
/** After a request: one alert to the other adult. notify = 'off' | 'on' | 'urgent' | undefined (follow their switches). */
function sendLogs_(me, mode) {
  if (!_logs.length || mode === 'off') return;
  var log = _logs[0], other = ADULTS.filter(function (p) { return p !== me; });
  other.forEach(function (p) {
    var forced = mode === 'on' || mode === 'urgent';
    if (!forced && !(log.cat && pref_(p, log.cat))) return;
    notify_(p, (mode === 'urgent' ? 'URGENT: ' : '') + me + ' ' + log.text, _logs.length > 1 ? '+' + (_logs.length - 1) + ' more change' + (_logs.length > 2 ? 's' : '') : '', mode === 'urgent');
  });
}

// ---------- photos ----------
/** The Drive folder photos are saved in. Created on first use; its id is kept in Settings. */
function photoFolder_() {
  var id = setting_('app|photoFolder', ''), f = null;
  if (id) { try { f = DriveApp.getFolderById(id); if (f.isTrashed()) f = null; } catch (e) { f = null; } }
  if (!f) { f = DriveApp.createFolder('Momnie photos'); put_('Settings', { id: 'app|photoFolder', value: f.getId() }); }
  return f;
}
/** Saves one photo (base64 JPEG from the app, already shrunk on the phone) and attaches it to a card. */
function photoAdd_(b, me) {
  if (!T[b.table] || b.table === 'Photos' || !b.ref) return { ok: false, error: 'Pick a card for the photo.' };
  var data = String(b.data || '').replace(/^data:image\/\w+;base64,/, '');
  if (!data) return { ok: false, error: 'No photo was sent.' };
  if (data.length > 8000000) return { ok: false, error: 'That photo is too big. Try a smaller one.' };
  var blob = Utilities.newBlob(Utilities.base64Decode(data), 'image/jpeg', b.table + '-' + b.ref + '-' + now_().replace(/\D/g, '') + '.jpg');
  var file = photoFolder_().createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { console.error(e); }
  var first = !rows_('Photos').some(function (x) { return x.table === b.table && x.ref === String(b.ref); });
  var r = put_('Photos', { time: now_(), who: me, table: b.table, ref: String(b.ref), fileId: file.getId(), caption: b.caption || '', cover: first ? '1' : '' });
  if (b.log) log_(me, b.log, 'Photos', r.id);
  return { photo: r.id };
}
function photoTrash_(fileId) { try { DriveApp.getFileById(fileId).setTrashed(true); } catch (e) { console.error(e); } }

// ---------- Google Calendar ----------
function calIds_() {
  return String(PropertiesService.getScriptProperties().getProperty('CALENDAR_IDS') || 'primary').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}
function calById_(id) { return id === 'primary' ? CalendarApp.getDefaultCalendar() : CalendarApp.getCalendarById(id); }
function calSafe_(start, days) { try { return cal_(start, days); } catch (e) { return []; } }
function cal_(start, days) {
  days = Math.min(Math.max(parseInt(days, 10) || 7, 1), 70);
  var tz = tz_(), from = Utilities.parseDate(start, tz, 'yyyy-MM-dd'), to = Utilities.parseDate(addDays_(start, days), tz, 'yyyy-MM-dd'), out = [];
  calIds_().forEach(function (cid) {
    var cal = calById_(cid);
    if (!cal) return;
    cal.getEvents(from, to).forEach(function (e) {
      if (e.getTag('momnie')) return;   // copies made by the app are already in the app
      var allDay = e.isAllDayEvent();
      var rec = e.isRecurringEvent(), series = '';
      if (rec) { try { series = cid + '|' + e.getEventSeries().getId(); } catch (err) {} }
      out.push({ id: cid + '|' + e.getId(), title: e.getTitle() || '(No title)', allDay: allDay, recurring: rec, series: series,
        start: allDay ? Utilities.formatDate(e.getAllDayStartDate(), tz, 'yyyy-MM-dd') : Utilities.formatDate(e.getStartTime(), tz, "yyyy-MM-dd'T'HH:mm"),
        end: allDay ? Utilities.formatDate(e.getAllDayEndDate(), tz, 'yyyy-MM-dd') : Utilities.formatDate(e.getEndTime(), tz, "yyyy-MM-dd'T'HH:mm"),
        location: e.getLocation() || '' });
    });
  });
  return out;
}
function gcalEvent_(gcalId) {
  var i = gcalId.indexOf('|'), cal = calById_(gcalId.slice(0, i));
  return cal ? cal.getEventById(gcalId.slice(i + 1)) : null;
}
/** Pushes an app event (Events row with gcal = 1) to Google Calendar. Repeating calendar events are left alone. */
function gcalSync_(ev) {
  var tz = tz_(), e = ev.gcalId ? gcalEvent_(ev.gcalId) : null;
  var allDay = ev.allDay === '1' || !ev.start, multi = ev.endDate && ev.endDate > ev.date;
  var s = allDay ? Utilities.parseDate(ev.date, tz, 'yyyy-MM-dd') : Utilities.parseDate(ev.date + ' ' + ev.start, tz, 'yyyy-MM-dd HH:mm');
  var end = allDay ? Utilities.parseDate(addDays_(multi ? ev.endDate : ev.date, 1), tz, 'yyyy-MM-dd')
    : Utilities.parseDate(ev.date + ' ' + (ev.end && ev.end > ev.start ? ev.end : ev.start), tz, 'yyyy-MM-dd HH:mm');
  if (!allDay && !(ev.end && ev.end > ev.start)) end = new Date(s.getTime() + 3600000);
  if (e) {
    if (e.isRecurringEvent()) return;
    if (!e.getTag('momnie')) e.setTag('momnie', 'Events:' + ev.id);   // a calendar event the app took over
    e.setTitle(ev.title);
    if (allDay) { if (multi) e.setAllDayDates(s, end); else e.setAllDayDate(s); } else e.setTime(s, end);
    e.setLocation(ev.location || '');
  } else {
    var cid = calIds_()[0], cal = calById_(cid);
    if (!cal) throw new Error('Shared calendar not found. Check CALENDAR_IDS.');
    e = allDay ? (multi ? cal.createAllDayEvent(ev.title, s, end) : cal.createAllDayEvent(ev.title, s)) : cal.createEvent(ev.title, s, end);
    if (ev.location) e.setLocation(ev.location);
    e.setTag('momnie', 'Events:' + ev.id);
    put_('Events', { id: ev.id, gcalId: cid + '|' + e.getId() });
  }
}
function gcalDelete_(gcalId) {
  try { var e = gcalEvent_(gcalId); if (e && !e.isRecurringEvent()) e.deleteEvent(); } catch (err) { console.error(err); }
}
/** A calendar problem never blocks saving in the app. */
function gcalSafe_(fn) { try { fn(); } catch (e) { console.error(e); } }

var WEEKDAY_ = { Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY', Thu: 'THURSDAY', Fri: 'FRIDAY', Sat: 'SATURDAY', Sun: 'SUNDAY' };
/** Removes an activity's repeating event from the shared calendar. */
function actUnsync_(a) {
  if (!a.gcalId) return;
  gcalSafe_(function () { var i = a.gcalId.indexOf('|'), cal = calById_(a.gcalId.slice(0, i)), sr = cal && cal.getEventSeriesById(a.gcalId.slice(i + 1)); if (sr) sr.deleteEventSeries(); });
}
/**
 * Copies one activity row (its days, one time) to the shared calendar as a weekly repeating event, rebuilt on every change.
 * Days canceled in the app are removed from the series. One-day ride swaps stay in the app only.
 */
function actSync_(a) {
  actUnsync_(a);
  var days = list_(a.days).filter(function (d) { return WEEKDAY_[d]; });
  if (!a.name || !a.start || !days.length) { if (a.gcalId) put_('Activities', { id: a.id, gcalId: '' }); return; }
  var cid = calIds_()[0], cal = calById_(cid);
  if (!cal) throw new Error('Shared calendar not found. Check CALENDAR_IDS.');
  var tz = tz_(), first = a.from || today_(), n = 0;
  while (days.indexOf(DAYS[dow_(first)]) < 0 && n++ < 7) first = addDays_(first, 1);
  if (a.until && first > a.until) { put_('Activities', { id: a.id, gcalId: '' }); return; }
  var s = Utilities.parseDate(first + ' ' + a.start, tz, 'yyyy-MM-dd HH:mm');
  var e = a.end && a.end > a.start ? Utilities.parseDate(first + ' ' + a.end, tz, 'yyyy-MM-dd HH:mm') : new Date(s.getTime() + 3600000);
  var rule = CalendarApp.newRecurrence().addWeeklyRule().onlyOnWeekdays(days.map(function (d) { return CalendarApp.Weekday[WEEKDAY_[d]]; }));
  if (a.until) rule.until(Utilities.parseDate(a.until + ' 23:59', tz, 'yyyy-MM-dd HH:mm'));
  var notes = [a.dropoff ? 'Drop-off: ' + a.dropoff : '', a.pickup ? 'Pickup: ' + a.pickup : '', a.teacher ? 'Teacher: ' + a.teacher : '', a.notes || ''].filter(Boolean).join('\n');
  var sr = cal.createEventSeries(a.name + (a.kids ? ' · ' + a.kids : ''), s, e, rule, { location: a.location || '', description: (notes ? notes + '\n\n' : '') + 'From the Momnie Family app. Change it in the app.' });
  sr.setTag('momnie', 'Activities:' + a.id);
  var sid = sr.getId();
  put_('Activities', { id: a.id, gcalId: cid + '|' + sid });
  rows_('Overrides').forEach(function (o) {
    if (o.ref !== a.id || o.cancelled !== '1' || o.date < first || (a.until && o.date > a.until)) return;
    var from = Utilities.parseDate(o.date, tz, 'yyyy-MM-dd'), to = Utilities.parseDate(addDays_(o.date, 1), tz, 'yyyy-MM-dd');
    cal.getEvents(from, to).forEach(function (ev) { if (ev.isRecurringEvent() && ev.getEventSeries().getId() === sid) ev.deleteEvent(); });
  });
}
/** Takes over an existing repeating calendar series for an app activity: tags it so it isn't shown twice, and remembers it. */
function actAdopt_(a, seriesId) {
  var i = seriesId.indexOf('|'), cal = calById_(seriesId.slice(0, i)), sr = cal && cal.getEventSeriesById(seriesId.slice(i + 1));
  if (!sr) { actSync_(a); return; }   // the series is gone: fall back to making the app's own copy
  sr.setTag('momnie', 'Activities:' + a.id);
  put_('Activities', { id: a.id, gcalId: seriesId });
}
/** Sheet menu: copies every app event and activity to the shared calendar once. Anything already copied is skipped. */
function copyAllToCalendar() {
  var n = 0, skipped = 0;
  rows_('Activities').slice().forEach(function (a) { if (a.gcalId) { skipped++; return; } gcalSafe_(function () { actSync_(a); n++; }); });
  rows_('Events').slice().forEach(function (ev) { if (ev.gcalId) { skipped++; return; } gcalSafe_(function () { var r = put_('Events', { id: ev.id, gcal: '1' }); gcalSync_(r); n++; }); });
  var msg = n + ' item(s) copied to the shared calendar. ' + skipped + ' were already there.';
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { console.log(msg); }
  return msg;
}

// ---------- weather (Open-Meteo, no key needed) ----------
function km_(a, b, c, d) { var x = (d - b) * Math.cos((a + c) / 2 * Math.PI / 180), y = c - a; return Math.sqrt(x * x + y * y) * 111; }
function weather_(lat, lon, me) {
  try {
    var houses = rows_('Houses').filter(function (h) { return h.lat && h.lon; }), place = '', la, lo;
    lat = parseFloat(lat); lon = parseFloat(lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      var near = houses.filter(function (h) { return km_(lat, lon, +h.lat, +h.lon) < 30; })[0];
      if (near) { la = +near.lat; lo = +near.lon; place = near.name; if (me && setting_(me + '|house', '') !== near.id) put_('Settings', { id: me + '|house', value: near.id }); }
      else { la = lat; lo = lon; place = 'Here'; }
    } else {
      var h = get_('Houses', setting_((me || '') + '|house', 'boston')) || houses[0];
      if (!h) return null;
      la = +h.lat; lo = +h.lon; place = h.name;
    }
    var w = fetchWx_(la, lo);
    if (w) w.place = place;
    return w;
  } catch (e) { return null; }
}
function fetchWx_(la, lo) {
  var key = 'wx' + la.toFixed(2) + ',' + lo.toFixed(2), cache = CacheService.getScriptCache(), hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + la + '&longitude=' + lo +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,snowfall_sum' +
    '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto&forecast_days=3';
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;
  var j = JSON.parse(res.getContentText()), d = j.daily, days = [];
  for (var i = 0; i < d.time.length; i++) days.push({ date: d.time[i], code: d.weather_code[i], high: Math.round(d.temperature_2m_max[i]), low: Math.round(d.temperature_2m_min[i]),
    rain: d.precipitation_probability_max[i] || 0, uv: Math.round(d.uv_index_max[i] || 0), snow: Math.round((d.snowfall_sum[i] || 0) * 10) / 10 });
  var w = { now: j.current ? Math.round(j.current.temperature_2m) : null, code: j.current ? j.current.weather_code : null, days: days };
  cache.put(key, JSON.stringify(w), 1800);
  return w;
}
function ruleHits_(day, when) {
  if (!day) return [];
  return rows_('WeatherRules').filter(function (r) {
    if (r.enabled === '0' || (r.when || 'morning') !== when) return false;
    var v = Number(day[r.metric]), th = Number(r.threshold);
    return !isNaN(v) && !isNaN(th) && (r.op === '<' ? v < th : v > th);
  });
}

// ---------- dinner planning ----------
function ruleFor_(day) {
  return get_('DinnerRules', day) || (DAYS.indexOf(day) >= 4 ? { type: 'off', value: '', away: '' } : { type: 'any', value: '', away: '' });
}
function avg_(ratings) {
  try { var o = JSON.parse(ratings || '{}'), v = Object.keys(o).map(function (k) { return Number(o[k]); }).filter(function (x) { return x > 0; });
    return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : 0; } catch (e) { return 0; }
}
function recipeStats_() {
  var st = {}, t = today_();
  rows_('Menus').forEach(function (m) {
    if (!m.recipeId) return;
    var s = st[m.recipeId] || (st[m.recipeId] = { last: '', n: 0, skip: '', planned: '' });
    if (m.skipped === '1') { if (m.date > s.skip) s.skip = m.date; return; }
    if (m.date > s.planned) s.planned = m.date;
    if (m.date < t) { s.n++; if (m.date > s.last) s.last = m.date; }
  });
  return st;
}
/** Somewhat random; favors high ratings, new recipes and recently skipped ones; avoids repeats. */
function pick_(week, day, exclude) {
  var date = addDays_(week, DAYS.indexOf(day)), rule = ruleFor_(day);
  if (rule.type === 'off') return { recipeId: '', note: rule.value || '' };
  var all = rows_('Recipes').filter(function (r) { return r.name && r.status !== 'archived' && !(r.pausedUntil && r.pausedUntil >= date); });
  if (rule.type === 'recipe' && exclude.indexOf(rule.value) < 0 && all.some(function (r) { return r.id === rule.value; })) return { recipeId: rule.value, note: '' };
  var pool = all;
  if (rule.type === 'tag') {
    pool = all.filter(function (r) { return list_(r.tags.toLowerCase().replace(/#/g, '')).indexOf(rule.value.toLowerCase()) >= 0; });
    if (!pool.length) return { recipeId: '', note: 'No #' + rule.value + ' recipes yet' };
  }
  if (!pool.length) return { recipeId: '', note: '' };
  var used = rows_('Menus').filter(function (m) { return m.week === week && m.recipeId; }).map(function (m) { return m.recipeId; }).concat(exclude);
  var c = pool.filter(function (r) { return used.indexOf(r.id) < 0; });
  if (!c.length) c = pool.filter(function (r) { return exclude.indexOf(r.id) < 0; });
  if (!c.length) c = pool;
  var st = recipeStats_(), cut = addDays_(date, -14), total = 0;
  var w = c.map(function (r) {
    var s = st[r.id] || { last: '', n: 0, skip: '', planned: '' }, x = 1 + (avg_(r.ratings) || 3);
    if (!s.n && !s.planned) x *= 2;
    if (s.skip && s.skip >= cut && s.planned <= s.skip) x *= 5;
    if (s.last >= cut || s.planned >= cut) x *= 0.15;
    total += x; return x;
  });
  var roll = Math.random() * total;
  for (var i = 0; i < c.length; i++) { roll -= w[i]; if (roll <= 0) return { recipeId: c[i].id, note: '' }; }
  return { recipeId: c[c.length - 1].id, note: '' };
}
function weekAdd_(week) {
  week = monday_(week);
  if (get_('Weeks', week)) return;
  put_('Weeks', { id: week, status: 'draft', lockedBy: '' });
  DAYS.forEach(function (d, i) {   // every night starts with no dinner planned
    if (get_('Menus', week + '-' + d)) return;
    put_('Menus', { id: week + '-' + d, week: week, day: d, date: addDays_(week, i), recipeId: '', note: '', away: ruleFor_(d).away || '', skipped: '', kept: '', cook: ruleFor_(d).cook || '' });
  });
}
function swap_(id) {
  var m = get_('Menus', id);
  if (!m) throw new Error('Dinner not found');
  var rule = ruleFor_(m.day), p;
  if (rule.type === 'off' || !m.recipeId) {   // a night with nothing planned: suggest anything
    var saved = get_('DinnerRules', m.day), cache = _cache.DinnerRules;
    _cache.DinnerRules = cache.filter(function (r) { return r.id !== m.day; }).concat([{ id: m.day, type: 'any', value: '', away: '' }]);
    _cache.DinnerRules._head = cache._head;
    p = pick_(m.week, m.day, m.recipeId ? [m.recipeId] : []);
    _cache.DinnerRules = cache;
  } else p = pick_(m.week, m.day, [m.recipeId]);
  put_('Menus', { id: id, recipeId: p.recipeId, note: p.note, kept: '', skipped: '' });
}

// ---------- scheduled jobs ----------
/** Things for kids on a date that need a ride: activities plus timed Kids events. */
function kidOcc_(date) {
  var dow = DAYS[dow_(date)], out = [];
  rows_('Activities').forEach(function (a) {
    if (list_(a.days).indexOf(dow) < 0 || (a.from && date < a.from) || (a.until && date > a.until)) return;
    var o = rows_('Overrides').filter(function (x) { return x.ref === a.id && x.date === date; })[0] || {};
    if (o.cancelled === '1') return;
    out.push({ t: 'Activities', id: a.id, title: a.name, kids: a.kids, start: a.start, dropoff: o.dropoff || a.dropoff, pickup: o.pickup || a.pickup });
  });
  rows_('Events').forEach(function (e) {
    if (e.date === date && e.category === 'Kids' && e.allDay !== '1' && e.start) out.push({ t: 'Events', id: e.id, title: e.title, kids: e.people, start: e.start, dropoff: e.dropoff, pickup: e.pickup });
  });
  return out;
}
function birthdays_() {
  var out = [];
  rows_('Birthdays').forEach(function (b) { if (b.date) out.push({ name: b.name, md: b.date.slice(-5) }); });
  rows_('People').concat(rows_('Caretakers')).forEach(function (p) { if (p.birthday) out.push({ name: p.name, md: p.birthday.slice(-5) }); });
  return out;
}
function dishName_(m) { var r = m && m.recipeId ? get_('Recipes', m.recipeId) : null; return r ? r.name : (m && m.note) || ''; }
function once_(name, date) {
  var k = 'job|' + name;
  if (setting_(k, '') >= date) return false;
  put_('Settings', { id: k, value: date });
  return true;
}
function jobs_(fromTrigger) {
  var t = today_(), hour = Number(now_().slice(11, 13)), dow = DAYS[dow_(t)];
  if (once_('daily', t)) daily_(t);
  if (once_('groceries', t)) groceryRoll_(t);
  if (once_('upkeep', t)) upkeep_(t);
  if (once_('pay', t)) payCare_(t);
  weeklyPay_(t);   // each weekly caretaker once, on their pay day
  if (dow === setting_('app|draftDay', 'Mon') && once_('draft', t)) weekAdd_(addDays_(monday_(t), 7));
  if (dow === 'Sun' && hour >= 10 && once_('weekcard', t)) weekCard_(t);
  if (t.slice(8) === '01' && once_('monthcard', t)) monthCard_(t);
  if (!fromTrigger) return;
  flushQueues_();
  if (setting_('app|ai.on', '') === '1' && hour >= Number(setting_('app|ai.hour', '7')) && once_('ai', t)) aiSafe_(t);
  if (setting_('app|ai.on', '') === '1' && hour >= 5 && hour < 19 && once_('brief_am', t)) briefAll_(t, 'day');
  if (setting_('app|ai.on', '') === '1' && hour >= 19 && once_('brief_pm', t)) briefAll_(addDays_(t, 1), 'night');   // hourly tick only: never slows down opening the app
  if (hour >= 7 && once_('digest', t)) digest_(t);
  if (hour >= 20 && once_('gaps', t)) gaps_(t);
  if (hour >= 6 && once_('wx_am', t)) wxAlerts_(0, 'morning');
  if (hour >= 19 && once_('wx_pm', t)) wxAlerts_(1, 'night');
  var a = rows_('Activity');
  if (a.length > 1500) { sh_('Activity').deleteRows(2, 500); delete _cache.Activity; }
}
/** Hourly trigger (installed by setup). */
function tick() {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { jobs_(true); } finally { lock.releaseLock(); }
}
function daily_(t) {
  var qs = rows_('Quotes').filter(function (q) { return q.quote; }), q = null;
  if (qs.length) {
    var min = qs.reduce(function (a, x) { return x.lastShown < a ? x.lastShown : a; }, '9999');
    var pool = qs.filter(function (x) { return x.lastShown === min; });
    q = pool[Math.floor(Math.random() * pool.length)];
    put_('Quotes', { id: q.id, lastShown: t });
  }
  var mem = rows_('Memories').filter(function (m) { return m.date && m.date.slice(-5) === t.slice(5) && m.note; }).map(function (m) {
    var yrs = isDate_(m.date) ? Number(t.slice(0, 4)) - Number(m.date.slice(0, 4)) : 0;
    return { note: m.note, photo: m.photo, years: yrs };
  });
  if (!q && !mem.length) return;
  log_('App', { type: 'daily', time: t + 'T06:00:00', text: JSON.stringify({ quote: q ? q.quote : '', author: q ? q.author : '', memories: mem }) });
}
function groceryRoll_(t) {
  rows_('GroceryList').slice().forEach(function (g) { if (g.status === 'upcoming' && g.addOn && g.addOn <= t) put_('GroceryList', { id: g.id, status: 'open', addOn: '' }); });
  rows_('Groceries').slice().forEach(function (c) {
    var n = parseInt(c.recurDays, 10);
    if (!n || (c.nextAdd && c.nextAdd > t)) return;
    var open = rows_('GroceryList').some(function (g) { return g.groceryId === c.id && (g.status === 'open' || g.status === 'upcoming'); });
    if (!open) put_('GroceryList', { groceryId: c.id, name: c.name, status: 'open', source: 'recurring', house: c.house, addedBy: 'App' });
    put_('Groceries', { id: c.id, nextAdd: addDays_(t, n) });
  });
}
function typeAssignee_(typeId) { var ty = get_('TodoTypes', typeId); return ty ? ty.assignee : ''; }
function upkeep_(t) {
  rows_('HouseCards').slice().forEach(function (h) {
    if (h.kind !== 'upkeep' || !h.nextDue || h.nextDue > addDays_(t, 7)) return;
    var src = 'upkeep:' + h.id;
    if (rows_('Todos').some(function (x) { return x.source === src && x.status !== 'Done'; })) return;
    put_('Todos', { created: t, type: 'house', title: h.title, due: h.nextDue, status: 'Open', assignee: typeAssignee_('house'), addedBy: 'App', house: h.house, source: src, notes: '' });
    log_('App', { type: 'upkeep', text: 'House upkeep coming due: ' + h.title + ' (' + nice_(h.nextDue) + ')', cat: 'upkeep', table: 'HouseCards', ref: h.id });
    ADULTS.forEach(function (p) { if (pref_(p, 'upkeep')) notify_(p, 'House upkeep due ' + nice_(h.nextDue), h.title); });
  });
}
function payCare_(t) {
  rows_('Childcare').slice().forEach(function (c) {
    if (c.date >= t || c.date < addDays_(t, -14) || !c.confirmedId || c.payTodoId) return;
    var ct = get_('Caretakers', c.confirmedId);
    if (!ct || ct.unpaid === '1' || ct.pay === 'unpaid' || ct.pay === 'weekly') return;   // weekly: covered by weeklyPay_
    var h = c.start && c.end ? hrs_(c.start, c.end) : 0, amt = ct.rate && h ? Math.round(Number(ct.rate) * h * 100) / 100 : '';
    var todo = put_('Todos', { created: t, type: 'paycare', title: 'Pay ' + ct.name + ' for ' + nice_(c.date), amount: amt, due: addDays_(t, 3), status: 'Open',
      assignee: typeAssignee_('paycare'), addedBy: 'App', source: 'childcare:' + c.id, notes: h ? h + ' hours' + (ct.rate ? ' at $' + ct.rate + '/hr' : '') : '' });
    put_('Childcare', { id: c.id, payTodoId: todo.id });
    log_('App', { type: 'care_done', text: ct.name + ' did childcare ' + nice_(c.date) + (c.start ? ', ' + t12_(c.start) + '–' + t12_(c.end) : '') + '. Confirm the hours and pay.', amount: amt, cat: 'bills', table: 'Todos', ref: todo.id });
  });
}
/** Weekly-paid caretakers: on their pay day, one to-do for the 7 days ending today, listing any jobs in that week. */
function weeklyPay_(t) {
  var day = DAYS[dow_(t)], from = addDays_(t, -6);
  rows_('Caretakers').slice().forEach(function (ct) {
    if (ct.pay !== 'weekly' || (ct.payDay || 'Fri') !== day || !once_('weeklypay|' + ct.id, t)) return;
    var jobs = rows_('Childcare').filter(function (c) { return c.confirmedId === ct.id && c.date >= from && c.date <= t; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var hours = 0, lines = jobs.map(function (c) { var h = c.start && c.end ? hrs_(c.start, c.end) : 0; hours += h; return nice_(c.date) + (c.start ? ', ' + t12_(c.start) + '–' + t12_(c.end) : '') + (h ? ' (' + h + ' h)' : ''); });
    var amt = ct.weekly ? Number(ct.weekly) : ct.rate && hours ? Math.round(Number(ct.rate) * hours * 100) / 100 : '';
    var todo = put_('Todos', { created: t, type: 'paycare', title: 'Pay ' + ct.name + ' for the week ending ' + nice_(t), amount: amt, due: t, status: 'Open',
      assignee: typeAssignee_('paycare'), addedBy: 'App', source: 'weeklypay:' + ct.id + '|' + from,
      notes: (lines.length ? 'Jobs in the app this week:\n' + lines.join('\n') + (hours ? '\n' + hours + ' hours' + (ct.rate ? ' at $' + ct.rate + '/hr' : '') : '') : 'No jobs logged in the app this week.') + (ct.weekly ? '\nUsual weekly amount: $' + ct.weekly : '') });
    jobs.forEach(function (c) { if (!c.payTodoId) put_('Childcare', { id: c.id, payTodoId: todo.id }); });
    log_('App', { type: 'care_pay', text: 'Payday: pay ' + ct.name + ' for the week' + (amt ? ' ($' + amt + ')' : '') + '.', amount: amt, cat: 'bills', table: 'Todos', ref: todo.id });
  });
}
function weekCard_(t) {
  var L = [], start = addDays_(t, 1), bd = birthdays_();
  for (var i = 0; i < 7; i++) {
    var d = addDays_(start, i), bits = [];
    rows_('SchoolCal').forEach(function (s) { if (d >= s.date && d <= (s.endDate || s.date)) bits.push(s.title); });
    rows_('Events').forEach(function (e) { if (d >= e.date && d <= (e.endDate || e.date)) bits.push((e.start && e.allDay !== '1' ? t12_(e.start) + ' ' : '') + e.title); });
    bd.forEach(function (b) { if (b.md === d.slice(5)) bits.push('Birthday: ' + b.name); });
    rows_('Childcare').forEach(function (c) { if (c.date === d) { var ct = get_('Caretakers', c.confirmedId); bits.push('Caretaker: ' + (ct ? ct.name : 'needed')); } });
    var open = kidOcc_(d).filter(function (o) { return !o.dropoff || !o.pickup; });
    if (open.length) bits.push('Ride not set: ' + open.map(function (o) { return o.title; }).join(', '));
    var dish = dishName_(get_('Menus', monday_(d) + '-' + DAYS[dow_(d)]));
    if (dish) bits.push('Dinner: ' + dish);
    if (bits.length) L.push('**' + nice_(d) + ':** ' + bits.join(' · '));
  }
  log_('App', { type: 'summary_week', text: L.length ? L.join('\n') : 'Nothing planned yet.', cat: 'summary', ref: start });
}
function monthCard_(t) {
  var mm = t.slice(5, 7), L = [], prev = addDays_(t, -1).slice(0, 7);
  var b = birthdays_().filter(function (x) { return x.md.slice(0, 2) === mm; }).sort(function (a, c) { return a.md < c.md ? -1 : 1; });
  if (b.length) L.push('**Birthdays:** ' + b.map(function (x) { return x.name + ' (' + MONTHS[Number(mm) - 1] + ' ' + Number(x.md.slice(3)) + ')'; }).join(', '));
  var paid = rows_('Todos').filter(function (x) { return x.type === 'bill' && x.status === 'Done' && x.doneOn.slice(0, 7) === prev; });
  if (paid.length) L.push('**Bills paid last month:** ' + paid.length + ' ($' + paid.reduce(function (a, x) { return a + (Number(x.amount) || 0); }, 0).toFixed(2) + ')');
  var up = rows_('HouseCards').filter(function (h) { return h.kind === 'upkeep' && h.nextDue && h.nextDue.slice(0, 7) === t.slice(0, 7); });
  if (up.length) L.push('**Upkeep due:** ' + up.map(function (h) { return h.title; }).join(', '));
  if (L.length) log_('App', { type: 'summary_month', text: L.join('\n'), cat: 'summary', ref: t });
}
// ---------- school runs (the same rules the app uses) ----------
function jsonSafe_(s) { try { var o = JSON.parse(s || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
/** A school's hours for a weekday: { start, end, ext } (hours JSON {"Mon":[start, pickup, extEnd]}, else the single times). */
function schoolHoursFor_(sch, day) { var w = jsonSafe_(sch.hours)[day];
  return { start: w ? w[0] || '' : sch.start || '', end: w ? w[1] || '' : sch.end || '', ext: w && w.length > 2 ? w[2] || '' : sch.extEnd || '' }; }
/** Drop-off, pickup and extended-day pickup on a date, grouped by school and time, with the kids and who is doing each run. */
function schoolRuns_(date) {
  var day = DAYS[dow_(date)], out = {}, order = [];
  if (dow_(date) > 4) return [];
  rows_('People').forEach(function (k) {
    if (k.kind !== 'kid' || !k.schoolId) return;
    var sch = get_('Schools', k.schoolId); if (!sch) return;
    var h = schoolHoursFor_(sch, day); if (!h.start) return;
    var cal = rows_('SchoolCal').filter(function (c) { return c.schoolId === sch.id && c.date && date >= c.date && date <= (c.endDate || c.date) && (c.kind === 'off' || c.kind === 'half'); })[0];
    if (cal && cal.kind === 'off') return;
    var schedRow = get_('Settings', 'kid|' + k.id + '|schedule'), sched = schedRow ? jsonSafe_(schedRow.value)[day] || {} : {};
    var legacyX = !schedRow && list_(k.extDays).indexOf(day) >= 0 ? h.ext : '';
    var e = sched.e || h.end, x = sched.x || legacyX, ext = !!x && !cal;
    var pick = cal ? (cal.end || '12:00') : ext ? x : e;
    [['d', h.start], [ext ? 'x' : 'p', pick]].forEach(function (r) {
      var key = sch.id + '|' + r[0] + '|' + r[1];
      if (!out[key]) { out[key] = { sid: sch.id, name: sch.short || sch.name, kind: r[0], time: r[1], kids: [] }; order.push(key); }
      out[key].kids.push(k.name);
    });
  });
  return order.map(function (key) {
    var r = out[key], usual = (jsonSafe_(setting_('school|' + r.sid + '|rides', '{}'))[day] || {})[r.kind] || '';
    var o = rows_('Overrides').filter(function (x) { return x.ref === 'school:' + r.sid + '|' + r.kind && x.date === date; })[0];
    r.who = o ? o.pickup || '' : usual; r.usual = usual; r.changed = !!o; return r;
  }).sort(function (a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
}
var RUN_WORD_ = { d: 'drop-off', p: 'pickup', x: 'extended day pickup' };
function kidList_(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
/** "3 PM CHS pickup (Clara and Conrad): Shana, changed from Lina" */
function runLine_(r) { return t12_(r.time) + ' ' + r.name + ' ' + RUN_WORD_[r.kind] + ' (' + kidList_(r.kids) + '): ' +
  (r.who ? r.who + (r.changed ? ', changed' + (r.usual ? ' from ' + r.usual : '') : '') : 'NO ONE SET'); }

// ---------- AI assistant ----------
function aiRules_() { return rows_('ai_rules').filter(function (r) { return r.text && r.active !== '0'; }); }
var AI_TOPICS_ = { meals: 'Meals and recipes', birthdays: 'Birthdays and gift ideas (counts only)', todos: 'To-dos and bills', rides: 'School runs, activity rides and caretakers', week: 'The week ahead', house: 'House upkeep' };
function aiSafe_(t) { try { aiPosts_(t, false); } catch (e) { console.error(e); put_('Settings', { id: 'app|ai.last', value: now_() + ' · error: ' + String(e && e.message || e).slice(0, 200) }); } }
/** A compact, plain summary of what's coming up, limited to the chosen topics. Gift ideas themselves are never included. */
function aiContext_(t) {
  var topics = list_(setting_('app|ai.topics', Object.keys(AI_TOPICS_).join(', '))), rules = aiRules_(),
      on = function (k) { return rules.length || topics.indexOf(k) >= 0; }, c = { today: nice_(t), topics: topics };   // rules can be about anything, so they see everything
  if (rules.length) c.rules = rules.map(function (r) { return { id: r.id, rule: r.text, tellOnly: r.audience || 'everyone who sees AI notes' }; });
  var people = rows_('People'), kids = people.filter(function (p) { return p.kind === 'kid'; }).map(function (p) { return p.name; });
  c.family = people.map(function (p) { return p.name + (p.kind === 'kid' ? ' (kid)' : ''); });
  if (on('meals') || on('week')) {
    c.dinners = []; for (var i = 0; i < 8; i++) { var d = addDays_(t, i), m = get_('Menus', monday_(d) + '-' + DAYS[dow_(d)]);
      c.dinners.push(nice_(d) + ': ' + (m ? (m.skipped === '1' ? 'skipped' : dishName_(m) || 'nothing planned') + (m.cook ? ', ' + m.cook + ' cooking' : '') + (m.away ? ', ' + m.away + ' not home' : '') : 'nothing planned')); }
  }
  if (on('meals')) { var st = recipeStats_();
    c.recipes = rows_('Recipes').filter(function (r) { return r.name && r.status !== 'archived'; }).map(function (r) { var s = st[r.id] || {};
      return r.name + ' | rating ' + (avg_(r.ratings) ? avg_(r.ratings).toFixed(1) : 'none') + ' | ' + (s.last ? 'last made ' + s.last : 'never made') + (s.n ? ', made ' + s.n + 'x' : '') + (r.pausedUntil && r.pausedUntil >= t ? ' | paused' : '') + (r.tags ? ' | #' + list_(r.tags).join(' #') : ''); }).slice(0, 60); }
  if (on('birthdays')) { var gifts = rows_('gifts');
    c.birthdays = birthdays_().map(function (b) { var y = Number(t.slice(0, 4)), nx = y + '-' + b.md; if (nx < t) nx = (y + 1) + '-' + b.md; return { name: b.name, date: nx }; })
      .filter(function (b) { return b.date <= addDays_(t, 45); })
      .map(function (b) { var n = gifts.filter(function (g) { return g.recipient === b.name; }).length, kid = kids.indexOf(b.name) >= 0;
        return b.name + ' on ' + nice_(b.date) + (kid ? ' | gift ideas saved: ' + n : ''); }); }
  if (on('todos')) { var open = rows_('Todos').filter(function (x) { return x.status !== 'Done'; });
    c.todos = open.filter(function (x) { return x.due && x.due <= addDays_(t, 7); }).sort(function (a, b) { return a.due < b.due ? -1 : 1; }).slice(0, 25)
      .map(function (x) { return x.title + ' | due ' + x.due + (x.due < t ? ' (OVERDUE)' : '') + (x.assignee ? ' | ' + x.assignee : '') + (x.amount ? ' | $' + x.amount : ''); });
    c.openTodos = open.length; }
  if (on('rides') || on('week')) {
    c.days = []; for (var j = 0; j < (on('week') ? 7 : 3); j++) { var dd = addDays_(t, j), bits = [];
      schoolRuns_(dd).forEach(function (r) { bits.push(runLine_(r)); });
      kidOcc_(dd).forEach(function (o) { bits.push(t12_(o.start) + ' ' + o.title + ' (' + o.kids + ') drop-off ' + (o.dropoff || 'NOT SET') + ', pickup ' + (o.pickup || 'NOT SET')); });
      rows_('Events').forEach(function (e) { if (e.date === dd) bits.push((e.start ? t12_(e.start) + ' ' : '') + e.title + (e.people ? ' (' + e.people + ')' : '')); });
      rows_('Childcare').forEach(function (cc) { if (cc.date === dd) { var ct = get_('Caretakers', cc.confirmedId); bits.push('Caretaker ' + t12_(cc.start) + '–' + t12_(cc.end) + ': ' + (ct ? ct.name : 'NOT CONFIRMED')); } });
      rows_('SchoolCal').forEach(function (s) { if (s.date && dd >= s.date && dd <= (s.endDate || s.date)) bits.push('School calendar: ' + s.title); });
      c.days.push(nice_(dd) + ': ' + (bits.join('; ') || 'nothing scheduled')); } }
  if (on('house')) c.house = rows_('HouseCards').filter(function (h) { return h.kind === 'upkeep' && h.nextDue && h.nextDue <= addDays_(t, 30); }).map(function (h) { return h.title + ' (' + (h.house || '') + ') due ' + h.nextDue; });
  c.recentNotes = rows_('Activity').filter(function (a) { return a.type === 'ai' && a.time >= addDays_(t, -10); }).map(function (a) { return a.time.slice(0, 10) + ': ' + a.text; }).slice(-15);
  return c;
}
/** One structured call to Claude. Returns { data } (the parsed JSON), { refused: true } or { error }. */
function claude_(system, content, schema, effort) {
  var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) return { error: 'No API key yet. In Apps Script: Project Settings, Script properties, add ANTHROPIC_API_KEY.', nokey: true };
  var body = { model: PropertiesService.getScriptProperties().getProperty('AI_MODEL') || 'claude-opus-5-5', max_tokens: 4000,
    output_config: { effort: effort || 'medium', format: { type: 'json_schema', schema: schema } }, fallbacks: 'default',
    system: system, messages: [{ role: 'user', content: content }] };
  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2026-10-21', 'anthropic-beta': 'server-side-fallback-2026-07-01' }, payload: JSON.stringify(body) });
  var code = res.getResponseCode(), j = {};
  try { j = JSON.parse(res.getContentText()); } catch (e) {}
  if (code !== 200) return { error: 'Claude API error ' + code + (j.error && j.error.message ? ': ' + j.error.message : '') };
  if (j.stop_reason === 'refusal') return { refused: true };
  var text = (j.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
  try { return { data: JSON.parse(text) }; } catch (e) { return { error: 'Could not read the answer.' }; }
}
/** Asks Claude for 0 to 3 notes and posts them to the Feed. Returns the notes (or why there are none). */
function aiPosts_(t, manual) {
  var ctx = aiContext_(t);
  var system = 'You are the AI assistant inside a family\'s shared home app (parents Paul and Shana, and their kids). Each morning you read a summary of the family\'s plans and write 0 to 3 short notes for the app\'s Feed.\n' +
    'Write only notes that help: something to act on, a gap in the plan, a timely idea or a useful heads-up. If nothing is worth saying, return no notes; that is often the right answer.\n' +
    'Each note: one or two plain sentences, under 220 characters, warm and practical, first names only, no emoji, no greeting, no sign-off. Use dates like "Thu" or "Nov 20".\n' +
    'Do not repeat or rephrase anything in recentNotes. Never name or describe gift ideas; at most say how many are saved. Do not invent facts that are not in the summary.\n' +
    'The family may give you standing rules (in "rules"). Check every rule against the summary. When a rule applies, write one note for it, set rule_id to that rule\'s id, and word it for the people in tellOnly (use @Name to tag someone). A rule note does not count toward the 3-note limit, and a rule that does not apply gets no note. ' +
    'Notes not tied to a rule must stay within the listed topics and set rule_id to "".';
  var schema = { type: 'object', additionalProperties: false, required: ['notes'],
    properties: { notes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text', 'topic', 'rule_id'],
      properties: { text: { type: 'string' }, topic: { type: 'string', enum: Object.keys(AI_TOPICS_).concat('rule') }, rule_id: { type: 'string' } } } } } };
  var r = claude_(system, 'Family summary (JSON):\n' + JSON.stringify(ctx) + '\n\nWrite today\'s notes.', schema, 'medium');
  if (r.nokey) { put_('Settings', { id: 'app|ai.last', value: now_() + ' · no API key: add ANTHROPIC_API_KEY in Script properties' }); return { error: r.error }; }
  if (r.error) { put_('Settings', { id: 'app|ai.last', value: now_() + ' · ' + r.error.slice(0, 200) }); return { error: r.error }; }
  if (r.refused) { put_('Settings', { id: 'app|ai.last', value: now_() + ' · declined' }); return { notes: [] }; }
  var notes = [], rulesById = {}; aiRules_().forEach(function (x) { rulesById[x.id] = x; });
  var all = ((r.data && r.data.notes) || []).filter(function (n) { return n && n.text; }), free = 0;
  notes = all.filter(function (n) { return rulesById[n.rule_id] || free++ < 3; });
  var who = list_(setting_('app|ai.who', 'Paul'));
  notes.forEach(function (n) {
    var rule = rulesById[n.rule_id], aud = rule && rule.audience ? list_(rule.audience) : who;   // a rule's note goes only to the people it names
    log_('AI assistant', { type: 'ai', text: String(n.text).slice(0, 400), cat: 'ai', ref: rule ? 'rule:' + rule.id : n.topic, audience: aud.join(', ') });
    aud.forEach(function (p) { if (pref_(p, 'ai')) notify_(p, 'AI assistant', String(n.text).slice(0, 400)); });
  });
  put_('Settings', { id: 'app|ai.last', value: now_() + ' · ' + notes.length + ' note' + (notes.length === 1 ? '' : 's') + (manual ? ' (Post now)' : '') });
  return { notes: notes };
}

// ---------- AI Today card ----------
function briefAll_(d, mode) { ADULTS.forEach(function (p) { if (setting_(p + '|ai.card', '') === '1') { try { aiBrief_(p, d, mode); } catch (e) { console.error(e); } } }); }
/** Everything on person p's plate for date d, each with a ref the app can open. Gift ideas are never included. */
function briefCands_(p, d, mode) {
  var t = today_(), day = DAYS[dow_(d)], c = [], add = function (ref, text) { c.push({ ref: ref, what: text }); };
  var people = rows_('People'), me = people.filter(function (x) { return x.name === p; })[0] || {};
  people.forEach(function (x) {
    if (x.kind === 'kid' || !x.workStart || list_(x.workDays).indexOf(day) < 0) return;
    var w = jsonSafe_(setting_('person|' + x.id + '|wfh', '{}')), dates = w.dates && typeof w.dates === 'object' ? w.dates : {};
    var where = dates[d] || (list_(w.days).indexOf(day) >= 0 ? 'home' : 'office');
    add('People:' + x.id, (x.name === p ? 'You work' : x.name + ' works') + ' ' + t12_(x.workStart) + (x.workEnd ? '–' + t12_(x.workEnd) : '') + ', ' + (where === 'home' ? 'from home' : 'in the office'));
  });
  schoolRuns_(d).forEach(function (r) { add('run:' + r.sid + '|' + d + '|' + r.kind, runLine_(r)); });
  kidOcc_(d).forEach(function (o) { add(o.t + ':' + o.id, t12_(o.start) + ' ' + o.title + ' (' + o.kids + '): drop-off ' + (o.dropoff || 'NOT SET') + ', pickup ' + (o.pickup || 'NOT SET')); });
  rows_('Events').forEach(function (e) { if (e.date === d && !(e.category === 'Kids' && e.allDay !== '1' && e.start)) add('Events:' + e.id, (e.allDay === '1' || !e.start ? 'All day ' : t12_(e.start) + ' ') + e.title + (e.people ? ' (' + e.people + ')' : '') + (e.category ? ' [' + e.category + ']' : '')); });
  rows_('Childcare').forEach(function (cc) { if (cc.date === d) { var ct = get_('Caretakers', cc.confirmedId); add('Childcare:' + cc.id, 'Caretaker ' + t12_(cc.start) + '–' + t12_(cc.end) + ': ' + (ct ? ct.name : 'NOT CONFIRMED')); } });
  rows_('SchoolCal').forEach(function (s) { if (s.date && d >= s.date && d <= (s.endDate || s.date)) add('', 'School calendar: ' + s.title); });
  var mid = monday_(d) + '-' + day, m = get_('Menus', mid);
  add('Menus:' + mid, 'Dinner: ' + (m ? (m.skipped === '1' ? 'skipped' : dishName_(m) || 'nothing planned') + (m.cook ? ', ' + m.cook + ' cooking' : '') + (m.away ? ', ' + m.away + ' not home' : '') : 'nothing planned'));
  rows_('Todos').filter(function (x) { return x.status !== 'Done' && (!x.assignee || x.assignee === p) && x.due && x.due <= addDays_(d, 3); })
    .sort(function (a, b) { return a.due < b.due ? -1 : 1; }).slice(0, 20)
    .forEach(function (x) { add('Todos:' + x.id, 'To-do: ' + x.title + ' | due ' + x.due + (x.due < t ? ' (OVERDUE)' : x.due === d ? ' (due this day)' : '') + (x.assignee ? ' | ' + x.assignee + "'s" : ' | anyone') + (x.amount ? ' | $' + x.amount : '')); });
  var kids = people.filter(function (x) { return x.kind === 'kid'; }).map(function (x) { return x.name; }), gifts = rows_('gifts');
  birthdays_().forEach(function (b) { var y = Number(d.slice(0, 4)), nx = y + '-' + b.md; if (nx < d) nx = (y + 1) + '-' + b.md;
    if (nx <= addDays_(d, 10)) add('', 'Birthday: ' + b.name + ' on ' + nice_(nx) + (kids.indexOf(b.name) >= 0 ? ' | gift ideas saved: ' + gifts.filter(function (g) { return g.recipient === b.name; }).length : '')); });
  rows_('HouseCards').forEach(function (h) { if (h.kind === 'upkeep' && h.nextDue && h.nextDue <= addDays_(d, 7)) add('HouseCards:' + h.id, 'House upkeep: ' + h.title + (h.house ? ' (' + h.house + ')' : '') + ' due ' + h.nextDue); });
  var wx = null, h = get_('Houses', setting_(p + '|house', 'boston'));
  if (h && h.lat) { var w = fetchWx_(+h.lat, +h.lon), wd = w && w.days.filter(function (x) { return x.date === d; })[0];
    if (wd) wx = { place: h.name, high: wd.high, low: wd.low, rainChance: wd.rain, uv: wd.uv, snowInches: wd.snow, familyRules: ruleHits_(wd, mode === 'night' ? 'night' : 'morning').map(function (r) { return r.message; }) }; }
  return { cands: c, weather: wx };
}
/** Writes person p's Today card for date d and saves it in Settings (p|ai.brief). */
function aiBrief_(p, d, mode) {
  var k = briefCands_(p, d, mode), refs = {};
  k.cands.forEach(function (x) { if (x.ref) refs[x.ref] = 1; });
  var ctx = { forPerson: p, date: nice_(d), now: now_().slice(11, 16), mode: mode, weather: k.weather, candidates: k.cands,
    family: rows_('People').map(function (x) { return x.name + (x.kind === 'kid' ? ' (kid)' : ''); }) };
  var system = 'You write the Today card at the top of a family home app, for one person (forPerson). The family: parents Paul and Shana and their kids.\n' +
    (mode === 'night' ? 'It is evening. Write about TOMORROW (date) so they can get ready tonight.\n' : 'Write about TODAY (date). The time is "now": leave out anything already over unless it still needs action.\n') +
    'Return:\n- headline: one or two sentences (under 180 characters) giving the shape of their day: how busy it is and the one or two things that matter most for them. Speak to them as "you".\n' +
    '- weather: one practical sentence about what to wear or bring, mentioning any familyRules, or "" if the weather is unremarkable or missing.\n' +
    '- items: the 2 to 5 things this person should focus on, most important first. Each under 110 characters, written to them, with ref copied exactly from the candidate it comes from ("" if none). ' +
    'level "heads-up" means it needs action or something is at risk (NOT SET, NOT CONFIRMED, OVERDUE, nothing planned for dinner on a busy day); otherwise "normal".\n' +
    'Put their own responsibilities first. Mention what someone else is doing only when it affects them (for example who has a pickup, or the other parent being out). Skip routine things that need nothing from them. Combine related candidates into one item when that reads better. ' +
    'Plain words, first names, no emoji, no exclamation marks. Never name or describe gift ideas. Do not invent anything that is not in the candidates.';
  var schema = { type: 'object', additionalProperties: false, required: ['headline', 'weather', 'items'],
    properties: { headline: { type: 'string' }, weather: { type: 'string' },
      items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text', 'ref', 'level'],
        properties: { text: { type: 'string' }, ref: { type: 'string' }, level: { type: 'string', enum: ['heads-up', 'normal'] } } } } } };
  var r = claude_(system, 'Candidates (JSON):\n' + JSON.stringify(ctx) + '\n\nWrite the card.', schema, 'low');
  if (r.error || r.refused) return { error: r.error || 'The assistant declined.' };
  var x = r.data || {}, brief = { for: d, mode: mode, time: now_(), headline: String(x.headline || '').slice(0, 300), weather: String(x.weather || '').slice(0, 200),
    items: (x.items || []).filter(function (i) { return i && i.text; }).slice(0, 5).map(function (i) { return { text: String(i.text).slice(0, 160), ref: refs[i.ref] ? i.ref : '', level: i.level === 'heads-up' ? 'heads-up' : 'normal' }; }) };
  put_('Settings', { id: p + '|ai.brief', value: JSON.stringify(brief) });
  return brief;
}

function digest_(t) {
  ADULTS.forEach(function (p) {
    if (!pref_(p, 'summary')) return;
    var L = [], m = get_('Menus', monday_(t) + '-' + DAYS[dow_(t)]), dish = dishName_(m);
    if (dish) L.push('Tonight: ' + dish + (m.cook ? ' (' + m.cook + ' cooking)' : '') + (m.away ? ' (' + m.away + ' not home)' : ''));
    rows_('Childcare').forEach(function (c) { if (c.date === t) { var ct = get_('Caretakers', c.confirmedId); L.push('Caretaker: ' + (ct ? ct.name : 'NOT CONFIRMED') + ', ' + t12_(c.start) + '–' + t12_(c.end)); } });
    schoolRuns_(t).forEach(function (r) { L.push(runLine_(r)); });
    kidOcc_(t).forEach(function (o) { L.push(t12_(o.start) + ' ' + o.title + (!o.dropoff || !o.pickup ? ' (ride not set)' : '')); });
    var mine = rows_('Todos').filter(function (x) { return x.status !== 'Done' && (x.assignee === p || !x.assignee); });
    var over = mine.filter(function (x) { return x.due && x.due < t; }), due = mine.filter(function (x) { return x.due === t; });
    if (over.length) L.push('Overdue: ' + over.map(function (x) { return x.title; }).join(', '));
    if (due.length) L.push('Due today: ' + due.map(function (x) { return x.title; }).join(', '));
    birthdays_().forEach(function (b) { if (b.md === t.slice(5)) L.push('Birthday today: ' + b.name); });
    notify_(p, 'Today, ' + nice_(t), L.length ? L.join('\n') : 'Nothing on the schedule today.');
  });
}
function gaps_(t) {
  var tm = addDays_(t, 1), L = [], runs = schoolRuns_(tm), missing = runs.filter(function (r) { return !r.who; });
  missing.forEach(function (r) { L.push(r.name + ' ' + RUN_WORD_[r.kind] + ' ' + t12_(r.time) + ': no one set'); });
  kidOcc_(tm).forEach(function (o) { if (!o.dropoff || !o.pickup) L.push(o.title + ' ' + t12_(o.start) + ': ' + (!o.dropoff && !o.pickup ? 'drop-off and pickup' : !o.dropoff ? 'drop-off' : 'pickup') + ' not set'); });
  rows_('Childcare').forEach(function (c) { if (c.date === tm && !c.confirmedId) L.push('Caretaker for ' + t12_(c.start) + '–' + t12_(c.end) + ' is not confirmed'); });
  // One message a school night: tomorrow's school runs (who is doing each), plus anything that still needs a plan.
  var body = (runs.length ? ['School runs tomorrow:'].concat(runs.map(runLine_)) : []).concat(L.length ? (runs.length ? [''] : []).concat(['Needs a plan:'], L) : []);
  if (!body.length) return;
  var title = L.length ? 'Tomorrow needs a plan' : 'Tomorrow\'s school runs';
  ADULTS.forEach(function (p) { if (pref_(p, 'planning')) notify_(p, title, body.join('\n')); });
}
function wxAlerts_(offset, when) {
  ADULTS.forEach(function (p) {
    var h = get_('Houses', setting_(p + '|house', 'boston'));
    if (!h || !h.lat) return;
    var w = fetchWx_(+h.lat, +h.lon);
    ruleHits_(w && w.days[offset], when).forEach(function (r) { if (r.push === '1') notify_(p, r.message, (offset ? 'Tomorrow' : 'Today') + ' at ' + h.name, r.urgent === '1'); });
  });
}

// ---------- Sheet menu ----------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Family app')
    .addItem('Link recipe ingredients', 'linkIngredients')
    .addItem('Set up / repair tabs', 'setup')
    .addItem('Copy everything to the calendar', 'copyAllToCalendar')
    .addItem('Refresh the app\'s copy', 'refreshAppCopy')
    .addToUi();
}
/**
 * Matches every recipe ingredient to a grocery card (ignoring case, plurals and alternate names),
 * creates cards for new ones, and lists unsure matches in the NeedsReview tab.
 * In NeedsReview, type "use" (same thing as the closest card) or "new" in the action column, then run again.
 */
function linkIngredients() {
  var cards = rows_('Groceries'), made = 0, review = 0, settled = 0;
  var find = function (n) { var k = normName_(n); return cards.filter(function (c) { return normName_(c.name) === k || list_(c.altNames).some(function (a) { return normName_(a) === k; }); })[0]; };
  rows_('NeedsReview').slice().forEach(function (r) {
    var a = r.action.toLowerCase().trim();
    if (!a) return;
    if (a === 'use') { var c = cards.filter(function (x) { return x.name === r.closest; })[0]; if (c) put_('Groceries', { id: c.id, altNames: list_(c.altNames).concat([r.ingredient]).join(', ') }); }
    else if (!find(r.ingredient)) { put_('Groceries', { name: r.ingredient }); made++; }
    settled++;
  });
  rows_('NeedsReview').slice().reverse().forEach(function (r) { if (r.action.trim()) del_('NeedsReview', r.id); });
  cards = rows_('Groceries');
  var pending = {};
  rows_('NeedsReview').forEach(function (r) { pending[normName_(r.ingredient)] = 1; });
  rows_('Recipes').forEach(function (rec) {
    [['unique', ''], ['pantry', 'Pantry']].forEach(function (col) {
      list_(rec[col[0]].replace(/\n/g, ',')).forEach(function (n) {
        var k = normName_(n);
        if (!k || find(n) || pending[k]) return;
        var close = cards.filter(function (c) { var ck = normName_(c.name); return ck.indexOf(k) >= 0 || k.indexOf(ck) >= 0 || ck.split(' ')[0] === k.split(' ')[0]; })[0];
        if (close) { put_('NeedsReview', { recipe: rec.name, ingredient: n, closest: close.name, action: '' }); pending[k] = 1; review++; }
        else { put_('Groceries', { name: n, category: col[1] }); cards = rows_('Groceries'); made++; }
      });
    });
  });
  var msg = made + ' new grocery card(s). ' + settled + ' review item(s) settled. ' + review + ' new item(s) need review' + (review ? ' (see the NeedsReview tab).' : '.');
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { console.log(msg); }
  return msg;
}

/** Run once from the editor: creates every tab, adds starter rows, installs the hourly trigger, and asks for access. */
function setup() {
  Object.keys(T).forEach(function (t) { rows_(t); });
  var seed = function (t, list) { if (!rows_(t).length) list.forEach(function (o) { put_(t, o); }); };
  seed('People', [
    { id: 'Paul', name: 'Paul', kind: 'adult', workDays: 'Mon, Tue, Wed, Thu, Fri', workStart: '09:00', workEnd: '17:30' },
    { id: 'Shana', name: 'Shana', kind: 'adult' },
    { id: 'Clara', name: 'Clara', kind: 'kid', schoolId: 'chs' },
    { id: 'Conrad', name: 'Conrad', kind: 'kid', schoolId: 'chs' },
    { id: 'Charlie', name: 'Charlie', kind: 'kid', schoolId: 'panda' }]);
  seed('Schools', [
    { id: 'chs', name: 'The Chestnut Hill School', short: 'CHS', color: '#2f6fed', logo: 'icons/chs-logo.png', start: '08:15', end: '15:00' },
    { id: 'panda', name: 'Panda Cub Academy', short: 'Panda Cub', color: '#e0453a', logo: 'icons/panda-cub-logo.png', start: '08:30', end: '17:30' }]);
  seed('Caretakers', [{ name: 'Lina', roster: 'Boston' }, { name: 'Nana Principato', relationship: 'Grandmother', roster: 'Boston, Cape' }]);
  seed('Houses', [{ id: 'boston', name: 'Boston', lat: '42.279', lon: '-71.158' }, { id: 'cape', name: 'Cape house', lat: '41.67', lon: '-70.20' }]);
  seed('TodoTypes', [
    { id: 'task', name: 'Task', emoji: '', assignee: '', builtin: '1', fields: '' },
    { id: 'bill', name: 'Bill', emoji: '', assignee: 'Paul', builtin: '1', fields: 'amount, where' },
    { id: 'school', name: 'School', emoji: '', assignee: '', builtin: '1', fields: 'kid' },
    { id: 'errand', name: 'Errand', emoji: '', assignee: '', builtin: '1', fields: '' },
    { id: 'appt', name: 'Appointment to book', emoji: '', assignee: '', builtin: '1', fields: 'kid' },
    { id: 'house', name: 'House', emoji: '', assignee: '', builtin: '1', fields: '' },
    { id: 'buy', name: 'Buy', emoji: '', assignee: 'Shana', builtin: '1', fields: 'link' },
    { id: 'paycare', name: 'Pay caretaker', emoji: '', assignee: 'Paul', builtin: '1', fields: 'amount' }]);
  seed('WeatherRules', [
    { metric: 'rain', op: '>', threshold: '50', message: 'Send kids with rain gear', when: 'night', push: '1', urgent: '', enabled: '1' },
    { metric: 'low', op: '<', threshold: '32', message: 'Hats and gloves for the kids', when: 'night', push: '', urgent: '', enabled: '1' },
    { metric: 'high', op: '>', threshold: '85', message: 'Sunscreen and water bottles', when: 'morning', push: '', urgent: '', enabled: '1' },
    { metric: 'uv', op: '>', threshold: '6', message: 'UV is high: sunscreen for the kids', when: 'morning', push: '', urgent: '', enabled: '1' },
    { metric: 'snow', op: '>', threshold: '1', message: 'Snow: leave early and check for school closings', when: 'night', push: '1', urgent: '', enabled: '1' }]);
  seed('DinnerRules', [{ id: 'Fri', type: 'off', value: '' }, { id: 'Sat', type: 'off', value: '' }, { id: 'Sun', type: 'off', value: '' }]);
  try {
    ScriptApp.getProjectTriggers().filter(function (x) { return x.getHandlerFunction() === 'tick'; }).forEach(function (x) { ScriptApp.deleteTrigger(x); });
    ScriptApp.newTrigger('tick').timeBased().everyHours(1).create();
    PropertiesService.getScriptProperties().deleteProperty('CHANGE_TRIGGER'); ensureChangeTrigger_();
    CalendarApp.getDefaultCalendar().getName();
    MailApp.getRemainingDailyQuota();
    DriveApp.getRootFolder().getName();
  } catch (e) { console.error(e); }
  return 'Setup done';
}
