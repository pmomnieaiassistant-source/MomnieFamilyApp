/**
 * Momnie Family app backend
 * Version 3.51 (2026-11-22)
 *   3.51: Fixes: the rain gear rule is switched to school days once (not every day); list posts are left out of the assistant's Feed tidying; proposed events are not copied to the calendar by "Copy everything" and the assistant sees them as not confirmed.
 *   3.50: Proposed events (Events: proposal, proposedBy, proposedTo, counter).
 *   3.49: Weather rules can be limited to school days; the rain gear rule now only fires on school nights.
 *   3.48: Lists (checklist posts, Lists tab).
 *   3.47: One-day work changes (late, different hours, day off) from the app's Work schedule page are used in the Today cards.
 *   3.46: A tradition collects its events (links); the assistant links the event when a tradition is made or planned, and does not ask "again this year?" when it is already on the Planner.
 *   3.45: Annual traditions are no longer shown daily; shortly before one starts the assistant asks "Are we doing it again?" (shared Yes/No); Yes puts it on the Planner.
 *   3.44: The assistant can ask "Should this be an annual tradition?" about an event (yes/no question in the Feed); a Yes adds the tradition and posts a note. Messages gets a ref column.
 *   3.43: The assistant no longer sees gift-idea counts at all.
 *   3.42: The assistant reviews every two hours from 5 AM to 1 AM; the start-hour setting is gone.
 *   3.41: School posts put a whole section on one card (up to about 1,380 characters); a very large section splits into even pieces.
 *   3.40: Cards break at sentence ends (no split after Dr., Mr.; no tiny last card); source_post can replace an earlier post.
 *   3.39: Posts from outside sources can be limited to some people (audience), for a preview before the whole family sees them.
 *   3.38: Annual events (Annuals tab): things we like to do every year, kept off the Planner.
 *   3.37: source_post says when SOURCE_KEY is missing (vs a wrong key).
 *   3.36: Posts from outside sources: sourcePost_() posts a stack AS the school (type 'source'), once per key; the
 *         scraper calls action source_post with the SOURCE_KEY Script property. The assistant never curates them.
 *   3.35: The assistant curates the Feed on each review: groups related change posts into stacks under an overview it writes
 *         (its own order), updates its stacks, and hides moot posts (state 'moot', reversible). Never touches people's messages.
 *   3.34: Stacked posts: Messages and Activity carry stack and stackIdx; stackPost_() writes a pile of cards as one Feed post
 *         (long cards continue on the next card); Sheet menu adds a sample.
 *   3.33: ideas tab gets a status column (filled in by hand).
 *   3.32: Files on any card, not just photos: PDFs and documents go to their own "Momnie documents" Drive folder
 *         (photos stay in "Momnie photos").
 *         New Photos columns name and mime (blank mime = a photo, as before). Files up to 15 MB.
 *   3.31: Test of the automatic GitHub to Apps Script deploy (no behavior change).
 *   3.30: The Assistant shows the real reason when it fails (also saved as app|ai.error), retries once when Claude is busy,
 *         and falls back to plain JSON if the request form is refused.
 *   3.29: Known locations (places tab) for "last seen at".
 *   3.28: Work location wording is "in office" and "working from home".
 *   3.27: Activity.subject, so the Feed shows only the newest post when something changes back and forth.
 *   3.26: A kid can have days they don't go to school (kid|<id>|schedule {"Mon":{"off":"1"}}): no runs or ride reminders those days.
 *   3.25: Work hours can differ by day (Settings person|<id>|hours); the morning summary uses them.
 *   3.24: The assistant tidies up after itself. Each review it checks its own recent notes and open questions
 *         against the current plan and clears the ones that are outdated (the question was answered somewhere
 *         else, the gap was filled, the day has passed). Cleared posts leave the Feed but stay in the Assistant's
 *         request log. Conversations can now settle who is cooking or away for dinner, and clear the question
 *         they answered. Notes expire after 3 days and unanswered questions after 7.
 *   3.23: Fixes the Assistant button, Fill it in and answering a question, which 3.22 broke (their routes were
 *         removed by mistake). The assistant now reviews far more often: every two hours from 6 AM to 10 PM (notes,
 *         rules, Today cards, conversations), and straight after anyone uses the Assistant button, answers a question
 *         or runs it by hand. A daily cap keeps the Feed from filling up.
 *   3.22: One "Run the assistant now" button (ai_all, Paul only) runs the notes, the AI Today cards and the conversation
 *         check together. The Today card's own refresh button is gone.
 *   3.21: Hide a calendar entry or series from the planner (gcal_hide / gcal_unhide): it gets the app's hidden key,
 *         nothing is created in the app, and Settings lists what is hidden (app|gcal.hidden).
 *   3.20: Shared Notes (notes tab). Sheet menu: Run the assistant now / Write Today cards now. The assistant leaves
 *         past events and meals alone.
 *   3.19: The Assistant reads the family's conversations (posts, comments, answers to question posts) and, when one
 *         settles a plan, adds it: an event ("Paul home 6:30 PM"), a to-do, or who is doing a school run (ai_convo;
 *         runs after an answer and on the hourly tick when there is something new; Paul can turn it off with
 *         app|ai.convo). Daily notes now follow up on requests still waiting. The Today card groups routine things.
 *   3.18: Question posts (Messages kind, answerType, options) and the built-in "App question" to-do type.
 *   3.17: The Assistant. Type anything ("Clara has piano every Monday at 8 AM") and it works out what to create:
 *         events, to-dos and bills, weekly activities, caretaker requests, school calendar days, house cards
 *         (ai_do). It can ask a follow-up question, and the answer revises what it made (ai_answer). Every
 *         value is checked before the app saves it. New ai_requests tab keeps a log of every request.
 *         Paul chooses who can use it (app|ai.use; just Paul until he adds others). Notes now post as "Assistant".
 *   3.16: New event by description: the assistant reads a sentence and fills in the event form (ai_event).
 *   3.15: Paul chooses who gets the AI Today card (app|ai.card; just Paul until he adds others).
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
  Events: 'id,title,date,endDate,allDay,start,end,category,people,house,location,dropoff,pickup,notes,gcal,gcalId,createdBy,proposal,proposedBy,proposedTo,counter',   // proposal 'pending': proposed by one parent, waiting for the other to accept or suggest another time
  Caretakers: 'id,name,relationship,phone,roster,birthday,drive,rate,unpaid,notes,pay,payDay,weekly',
  Childcare: 'id,date,start,end,task,place,kids,roster,notes,asks,confirmedId,payTodoId,paidAmount,paidOn,createdBy',
  Birthdays: 'id,name,date,notes',
  Lists: 'id,time,by,title,items',   // checklists: items is JSON [{t: text, d: 1 when ticked, by}]
  Annuals: 'id,name,from,to,when,where,link,notes,years,remind',   // annual traditions: things we like to do each year (month and day repeat); years = the years we went
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
  WeatherRules: 'id,metric,op,threshold,message,when,push,urgent,enabled,school',   // school '1': only when that day is a school day
  Quotes: 'id,quote,author,lastShown',
  Memories: 'id,date,note,photo',
  Updates: 'id,date,title,message,hiddenFrom,label',   // label: optional heading over a splash screen, e.g. "A bit from Paul"
  Messages: 'id,time,from,text,tags,visibility,pinUntil,urgent,resolved,resolvedBy,kind,answerType,options,stack,stackIdx,ref',   // kind 'question': answerType yesno / time / choice / text; stack: posts that share a stack id show as one pile of cards (stackIdx = card order)
  Activity: 'id,time,who,type,text,amount,table,ref,cat,audience,state,subject,stack,stackIdx',   // audience: who sees an AI assistant note; state: 'cleared' = the assistant retired it; stack, stackIdx: as in Messages
  Comments: 'id,time,who,table,ref,text,system',
  Reactions: 'id,time,who,table,ref,emoji',
  Links: 'id,aTable,aRef,bTable,bRef,by',
  Photos: 'id,time,who,table,ref,fileId,caption,cover,name,mime',   // mime blank or image/* = a photo; anything else (application/pdf…) is a file
  Settings: 'id,value',
  NeedsReview: 'id,recipe,ingredient,closest,action',
  gifts: 'id,recipient,added_by,name,description,url,photo,assigned_to,created_at',
  ai_rules: 'id,text,audience,area,active,created_by,created_at',   // plain-English rules the assistant follows
  ai_requests: 'id,time,who,text,source,status,summary,question,answer,refs',   // everything asked of the Assistant, and what it made
  notes: 'id,time,who,text',   // shared notes at the bottom of Home
  places: 'id,name,lat,lon,radius,added_by,created_at',   // known locations (Home, work, school) for "last seen at"
  daily_items: 'id,title,days,time_of_day,for_person,visible_to,created_by,active',
  daily_completions: 'id,item_id,date,completed_by,completed_at',   // id = item_id|date, so each item is checked once per day
  ideas: 'id,time,who,text,status'   // feedback sent from the Home screen; status is filled in by hand (Done, Not started…)
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
  if (b.action === 'source_post') return json_(sourceRoute_(b));   // outside sources (the school scraper) use their own key
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
    case 'gcal_hide': gcalHide_(String(b.gcalId || ''), b.series === '1', String(b.title || ''), me); calDrop_(); return { cal: calCached_(addDays_(today_(), -7), 56) };
    case 'gcal_unhide': gcalUnhide_(String(b.id || '')); calDrop_(); return {};
    case 'gcal_delete': gcalDelete_(b.gcalId); calDrop_(); if (b.log) log_(me, b.log); return { cal: calCached_(addDays_(today_(), -7), 56) };
    case 'ai_all':   // "Run the assistant now" in Settings, Assistant (Paul only): notes, Today cards and conversations
      if (me !== 'Paul') return { ok: false, error: 'Only Paul can run the assistant.' };
      if (setting_('app|ai.on', '') !== '1') return { ok: false, error: 'Turn the assistant on first.' };
      return aiAll_(isDate_(b.today) ? b.today : today_());
    case 'ai_event':   // "Fill it in" on a new event: fills in the form, saves nothing
      if (setting_('app|ai.on', '') !== '1') return { ok: false, error: 'The assistant is off.' };
      if (aiUseFor_().indexOf(me) < 0) return { ok: false, error: 'The assistant is not turned on for you.' };
      return aiEvent_(String(b.text || '').slice(0, 1000), isDate_(b.today) ? b.today : today_(), String(b.now || ''), me);
    case 'ai_do':      // the Assistant button: works out what to create (the app saves it)
    case 'ai_answer':  // an answer to the Assistant's question: works out what to change
      if (setting_('app|ai.on', '') !== '1') return { ok: false, error: 'The assistant is off.' };
      if (aiUseFor_().indexOf(me) < 0) return { ok: false, error: 'The assistant is not turned on for you.' };
      return { plan: aiDo_(b, me) };
    case 'ai_after':   // the app calls this once a request has been saved: a quick review while things are fresh
      return { after: aiAfter_(isDate_(b.today) ? b.today : today_()) };
    case 'ai_convo':   // after someone answers a question post: turn a settled plan into app items
      if (setting_('app|ai.on', '') !== '1' || setting_('app|ai.convo', '1') !== '1') return { convo: null };
      return { convo: aiConvoSafe_(today_(), false) };
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
      if (op.t === 'Events') row.gcal = row.proposal === 'pending' ? '' : '1';   // every app event is copied to the shared calendar, once it is not just a proposal
      r = put_(op.t, row);
      if (op.t === 'Events' && r.proposal !== 'pending') gcalSafe_(function () { gcalSync_(r); });
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
    table: log.table || t || '', ref: log.ref || ref || '', cat: log.cat || '', audience: log.audience || '', subject: log.subject || '' });   // subject: newer posts about the same thing replace older ones in the Feed
  if (who !== 'App' && who !== 'AI assistant' && who !== 'Assistant') _logs.push(log);   // AI notes notify only their chosen audience (aiPosts_)
}

// ---------- stacked posts ----------
var STACK_CARD_MAX = 280;   // characters per card; longer text continues on the next card
/** Where sentences end in a text (the index just after each one). "Dr." and similar do not end a sentence; a newline does. */
/** An event's name for the assistant: a proposal the other parent has not confirmed yet says so. */
function evName_(e) { return e.title + (e.proposal === 'pending' ? ' (proposed by ' + (e.proposedBy || 'a parent') + ', not confirmed yet)' : ''); }
function stackEnds_(str) {
  var r = [], m, re = /(?<!\b(?:Mr|Mrs|Ms|Dr|St|Jr|Sr|Prof|vs|etc|No))[.!?]+["'”)]*(?=\s)|\n/g;
  while ((m = re.exec(str))) r.push(m.index + m[0].length);
  return r;
}
var SOURCE_CARD_MAX = 950;   // school posts: a whole section on one card; only a very large one is split
/** For school posts: keeps a section whole up to about 45% over SOURCE_CARD_MAX; a larger one is split into EVEN pieces
 *  (never a big card and a tiny one), each cut at a sentence end near its share, else at a word. */
function stackSplitEven_(text, max) {
  max = max || SOURCE_CARD_MAX;
  var t = String(text || '').replace(/[ \t]+\n/g, '\n').trim(), slack = Math.round(max * 0.45);
  if (t.length <= max + slack) return t ? [t] : [];
  var n = Math.ceil(t.length / max), out = [];
  while (n > 1) {
    var target = Math.round(t.length / n), e = stackEnds_(t), cut = 0, best = 1e9, i;
    for (i = 0; i < e.length; i++) if (e[i] >= target * 0.6 && e[i] <= target * 1.4 && Math.abs(e[i] - target) < best) { best = Math.abs(e[i] - target); cut = e[i]; }
    if (!cut) { cut = t.lastIndexOf(' ', target); if (cut < target * 0.5) cut = target; }
    out.push(t.slice(0, cut).trim()); t = t.slice(cut).trim(); n--;
  }
  if (t) out.push(t);
  return out;
}
/** Splits text into card-sized pieces at sentence boundaries. A card may run a little long (up to 40% over) to finish a
 *  sentence or to avoid a tiny last card; abbreviations such as "Dr." do not end a sentence; a single very long sentence
 *  is cut at a word. */
function stackSplit_(text, max) {
  max = max || STACK_CARD_MAX;
  var slack = Math.round(max * 0.4), t = String(text || '').replace(/[ \t]+\n/g, '\n').trim(), out = [];
  while (t.length > max + slack) {
    var e = stackEnds_(t), cut = 0, i;
    for (i = 0; i < e.length; i++) if (e[i] <= max) cut = e[i];                                           // the last sentence end within the limit
    if (cut < max * 0.5) for (i = 0; i < e.length; i++) if (e[i] > max && e[i] <= max + slack) { cut = e[i]; break; }   // else the first one just past it
    if (cut < max * 0.5) { cut = t.lastIndexOf(' ', max); if (cut < max * 0.5) cut = max; }              // else a word boundary
    out.push(t.slice(0, cut).trim());
    t = t.slice(cut).trim();
  }
  if (t) out.push(t);
  return out;
}
/**
 * Writes several posts as ONE stacked post: the app shows posts that share a stack id as a pile of cards in a
 * single Feed row (swipe left and right, "1 of 5" in the corner). Each card is its own post.
 * cards: [{ title, text, table, ref }]   title (optional) starts the card in bold, e.g. a section name.
 * o: { audience: 'Paul, Shana' ('' = the assistant's usual audience), cat, who }
 * A card longer than STACK_CARD_MAX continues on extra cards, marked (2/3) and so on.
 * Returns { stack: id, ids: [Activity ids] }. Stacked posts send no notification.
 */
function stackPost_(cards, o) {
  o = o || {};
  var id = 'st' + Utilities.getUuid().replace(/-/g, '').slice(0, 10), t = now_(), ids = [], n = 0;
  (cards || []).forEach(function (c) {
    var title = String(c.title || '').trim(), parts = stackSplit_(c.text, STACK_CARD_MAX - (title ? title.length + 8 : 0));
    if (!parts.length) parts = [''];
    parts.forEach(function (part, k) {
      var head = title ? title + (parts.length > 1 ? ' (' + (k + 1) + '/' + parts.length + ')' : '') : '';
      var r = put_('Activity', { time: t, who: o.who || 'Assistant', type: 'ai', text: (head ? '**' + head + '**\n' : '') + part, cat: o.cat || 'ai',
        table: k === 0 ? (c.table || '') : '', ref: k === 0 ? (c.ref || '') : '', audience: o.audience || '', subject: '', stack: id, stackIdx: String(n++) });
      ids.push(r.id);
    });
  });
  return { stack: id, ids: ids };
}
// ---------- Posts from outside sources ----------
// Information from outside the family, such as a school's Week in Review found by the scraper, posts AS THAT SOURCE:
// the Feed shows "The Chestnut Hill School" with its logo, not the assistant. Each post is a stack: a cover card, then
// one card per section (long sections continue on the next card). Stack ids start with "src". The assistant never
// stacks, re-orders or hides these. Everyone in the family sees them (Feed filter: School updates).
/**
 * o: { source: school id (e.g. 'chs') or a plain name, key: unique id for this update (e.g. 'wir|Clara|2026-11-06'),
 *      title, intro, cards: [{ title, text }], time (optional, YYYY-MM-DDTHH:MM:SS),
 *      audience (optional, e.g. 'Paul': only those people see it, for a preview; blank = the whole family),
 *      replace (optional): if this key was posted before, delete that post and post this one instead }
 * The same key is only ever posted once (it is kept as the post's subject). Returns { stack, ids } or { skipped }.
 */
function sourcePost_(o) {
  o = o || {};
  var key = txt_(o.key, 120);
  if (!key) return { error: 'A key is needed so the same update is never posted twice.' };
  var subj = 'src|' + key;
  var old = rows_('Activity').filter(function (a) { return a.subject === subj; })[0];
  if (old && !o.replace) return { skipped: true, key: key };
  if (old) rows_('Activity').filter(function (a) { return a.stack === old.stack; }).forEach(function (a) { del_('Activity', a.id); });   // replace the earlier post
  var school = get_('Schools', String(o.source || '')), who = school ? school.name : txt_(o.source, 60) || 'Outside source';
  var id = 'src' + Utilities.getUuid().replace(/-/g, '').slice(0, 10), t = isTime_(o.time) ? o.time : now_(), ids = [], n = 0;
  var cards = [{ title: o.title, text: o.intro }].concat(o.cards || []);
  cards.forEach(function (c, ci) {
    var title = String(c.title || '').trim(), parts = stackSplitEven_(c.text, SOURCE_CARD_MAX);   // school cards are big: a whole section each
    if (!parts.length) parts = [''];
    if (ci > 0 && !title && !parts.join('')) return;
    parts.forEach(function (part, k) {
      var head = title ? title + (parts.length > 1 ? ' (' + (k + 1) + '/' + parts.length + ')' : '') : '';
      var r = put_('Activity', { time: t, who: who, type: 'source', text: (head ? '**' + head + '**\n' : '') + part, cat: 'school',
        table: school ? 'Schools' : '', ref: school ? school.id : '', audience: txt_(o.audience, 100), subject: n === 0 ? subj : '', stack: id, stackIdx: String(n++) });
      ids.push(r.id);
    });
  });
  return { stack: id, ids: ids, key: key };
}
function isTime_(v) { return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(String(v || '')); }
/** The route an outside source calls: { action: 'source_post', sourceKey: the SOURCE_KEY Script property, post: {...} } */
function sourceRoute_(b) {
  var want = PropertiesService.getScriptProperties().getProperty('SOURCE_KEY');
  if (!want) return { ok: false, error: 'Posting from outside sources is not set up: add SOURCE_KEY in Project Settings, Script properties.' };
  if (String(b.sourceKey || '') !== want) return { ok: false, error: 'Wrong source key' };
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var r = sourcePost_(b.post || {});
    return r.error ? { ok: false, error: r.error } : { ok: true, result: r };
  } finally { lock.releaseLock(); }
}
/** Sheet menu: a sample school post (made-up text), to see how it looks in the app. */
function menuSourceDemo() {
  var r = sourcePost_({ source: 'chs', key: 'sample|' + now_(), title: 'Sample: new Week in Review for Clara',
    intro: 'Week ending Friday, November 6 · Grade 1. Swipe to read each section.',
    cards: [{ title: 'Highlights', text: 'This is made-up sample text. The real posts will carry the school\'s own words, section by section.' },
            { title: 'Literacy', text: 'Each section of the Week in Review becomes its own card, in the same order as the page.' },
            { title: 'Math', text: 'Long sections continue on a second card, so every card stays short.' }] });
  SpreadsheetApp.getUi().alert(r.skipped ? 'Already posted.' : 'Added a sample school post (' + r.ids.length + ' cards). Open the Feed in the app and pull down to refresh.');
}
/** Sheet menu: adds a sample stacked post so it can be tried in the app. */
function menuStackDemo() {
  var r = stackPost_([
    { title: 'Stacked posts', text: 'This is one Feed post made of several cards. Swipe left to see the next card, right to go back.' },
    { title: 'Each card is its own post', text: 'The corner shows where you are in the pile, like 2 of 4. The cards waiting underneath peek out below.' },
    { title: 'Coming next', text: 'The assistant will use stacks for each child\'s week in review: one card per section, then the photos. Long sections continue on a second card.' },
    { title: 'Done looking?', text: 'Remove this sample with the button under the cards.' }
  ], {});   // the assistant's usual audience
  SpreadsheetApp.getUi().alert('Added a sample stacked post (' + r.ids.length + ' cards). Open the Feed in the app and pull down to refresh.');
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
/** A Drive folder the app saves into. Created on first use; its id is kept in Settings (key), so renaming or moving it in Drive is fine. */
function driveFolder_(key, name) {
  var id = setting_(key, ''), f = null;
  if (id) { try { f = DriveApp.getFolderById(id); if (f.isTrashed()) f = null; } catch (e) { f = null; } }
  if (!f) { f = DriveApp.createFolder(name); put_('Settings', { id: key, value: f.getId() }); }
  return f;
}
/** Photos go to "Momnie photos"; PDFs and other documents go to "Momnie documents". */
function photoFolder_() { return driveFolder_('app|photoFolder', 'Momnie photos'); }
function docFolder_() { return driveFolder_('app|docFolder', 'Momnie documents'); }
/** Saves one photo (base64 JPEG from the app, already shrunk on the phone) or file (a PDF, document…) and attaches it to a card. */
function photoAdd_(b, me) {
  if (!T[b.table] || b.table === 'Photos' || !b.ref) return { ok: false, error: 'Pick a card for the photo or file.' };
  var mime = String(b.mime || 'image/jpeg').replace(/[^\w.+\/-]/g, '') || 'application/octet-stream';
  var data = String(b.data || '').replace(/^data:[^;,]*(;[^,]*)?,/, '');
  if (!data) return { ok: false, error: 'Nothing was sent.' };
  if (data.length > 21000000) return { ok: false, error: 'That file is too big (over 15 MB). Try a smaller one.' };
  var pic = mime.indexOf('image/') === 0;
  var orig = String(b.name || '').replace(/[\\\/:*?"<>|]+/g, ' ').trim().slice(0, 120);
  var ext = mime === 'image/jpeg' ? '.jpg' : ((orig.match(/\.\w{1,6}$/) || [''])[0] || (mime === 'application/pdf' ? '.pdf' : ''));
  var stamp = now_().replace(/\D/g, '');
  var fname = pic ? b.table + '-' + b.ref + '-' + stamp + ext : (orig ? orig.replace(/\.\w{1,6}$/, '') : b.table + '-' + b.ref) + ' (' + stamp + ')' + ext;
  var file = (pic ? photoFolder_() : docFolder_()).createFile(Utilities.newBlob(Utilities.base64Decode(data), mime, fname));
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { console.error(e); }
  var first = pic && !rows_('Photos').some(function (x) { return x.table === b.table && x.ref === String(b.ref) && (!x.mime || x.mime.indexOf('image/') === 0); });
  var r = put_('Photos', { time: now_(), who: me, table: b.table, ref: String(b.ref), fileId: file.getId(), caption: b.caption || '', cover: first ? '1' : '',
    name: orig, mime: pic && mime === 'image/jpeg' ? '' : mime });
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
/** Hides a calendar entry, or its whole repeating series, from the app by giving it the app's key (the app skips tagged entries). */
function gcalHide_(gcalId, series, title, me) {
  var e = gcalEvent_(gcalId); if (!e) throw new Error('That calendar entry is gone.');
  var key = gcalId, cid = gcalId.slice(0, gcalId.indexOf('|'));
  if (series && e.isRecurringEvent()) { var sr = e.getEventSeries(); sr.setTag('momnie', 'hidden'); key = cid + '|' + sr.getId(); } else e.setTag('momnie', 'hidden');
  var list = jsonList_(setting_('app|gcal.hidden', '[]')).filter(function (x) { return x.id !== key; });
  list.push({ id: key, series: series ? '1' : '', title: title, by: me, time: now_() });
  put_('Settings', { id: 'app|gcal.hidden', value: JSON.stringify(list) });
}
function gcalUnhide_(key) {
  var list = jsonList_(setting_('app|gcal.hidden', '[]')), x = list.filter(function (y) { return y.id === key; })[0];
  if (x) { var i = key.indexOf('|'), cal = calById_(key.slice(0, i));
    try { var item = x.series === '1' ? cal.getEventSeriesById(key.slice(i + 1)) : cal.getEventById(key.slice(i + 1)); if (item && item.getTag('momnie') === 'hidden') item.deleteTag('momnie'); } catch (e) { console.error(e); } }
  put_('Settings', { id: 'app|gcal.hidden', value: JSON.stringify(list.filter(function (y) { return y.id !== key; })) });
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
  rows_('Events').slice().forEach(function (ev) { if (ev.gcalId || ev.proposal === 'pending') { skipped++; return; } gcalSafe_(function () { var r = put_('Events', { id: ev.id, gcal: '1' }); gcalSync_(r); n++; }); });
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
function ruleHits_(day, when, date) {
  if (!day) return [];
  var school = null;   // is `date` a school day? worked out once, only if a rule asks
  return rows_('WeatherRules').filter(function (r) {
    if (r.enabled === '0' || (r.when || 'morning') !== when) return false;
    if (r.school === '1' && date) { if (school === null) school = schoolRuns_(date).length > 0; if (!school) return false; }
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
  if (setting_('app|ai.on', '') === '1') aiReview_(t, hour);   // hourly tick only: never slows down opening the app
  if (hour >= 7 && once_('digest', t)) digest_(t);
  if (hour >= 20 && once_('gaps', t)) gaps_(t);
  if (!setting_('job|rainSchool', '')) { rows_('WeatherRules').forEach(function (r) { if (/rain gear/i.test(r.message) && !r.school) put_('WeatherRules', { id: r.id, school: '1' }); }); put_('Settings', { id: 'job|rainSchool', value: t }); }   // one time ever: the built-in rain gear rule becomes school nights only (it can be turned off after)
  if (hour >= 6 && once_('wx_am', t)) wxAlerts_(0, 'morning');
  if (hour >= 19 && once_('wx_pm', t)) wxAlerts_(1, 'night');
  var a = rows_('Activity');
  if (a.length > 1500) { sh_('Activity').deleteRows(2, 500); delete _cache.Activity; }
}
/** Sheet menu: run the assistant's notes now, and say what happened. */
function menuAiNotes() { var r = aiPosts_(today_(), true); SpreadsheetApp.getUi().alert(r.error ? 'The assistant could not run: ' + r.error : 'Done: ' + (r.notes || []).length + ' note(s) posted to the Feed.'); }
/** Sheet menu: write the AI Today cards now (today's, or tomorrow's after 7 PM) for the people who get them. */
function menuAiCards() { var t = today_(), night = Number(now_().slice(11, 13)) >= 19, who = aiCardFor_();
  if (!who.length) { SpreadsheetApp.getUi().alert('No one gets the AI Today card yet. Choose who in the app: Settings, Assistant, Change.'); return; }
  var r = briefAll_(night ? addDays_(t, 1) : t, night ? 'night' : 'day'); SpreadsheetApp.getUi().alert(r.error ? 'The Today card could not be written: ' + r.error : 'Done: wrote the Today card for ' + r.done.join(' and ') + '.'); }
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
    rows_('Events').forEach(function (e) { if (d >= e.date && d <= (e.endDate || e.date)) bits.push((e.start && e.allDay !== '1' ? t12_(e.start) + ' ' : '') + evName_(e)); });
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
    if (sched.off) return;   // this kid doesn't go to school on this weekday
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
var AI_TOPICS_ = { meals: 'Meals and recipes', birthdays: 'Birthdays', todos: 'To-dos and bills', rides: 'School runs, activity rides and caretakers', week: 'The week ahead', house: 'House upkeep' };
function aiSafe_(t) { try { aiPosts_(t, false); } catch (e) { console.error(e); put_('Settings', { id: 'app|ai.last', value: now_() + ' · error: ' + String(e && e.message || e).slice(0, 200) }); } }
/** A compact, plain summary of what's coming up, limited to the chosen topics. Gift ideas are never included. */
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
  if (on('birthdays')) {
    c.birthdays = birthdays_().map(function (b) { var y = Number(t.slice(0, 4)), nx = y + '-' + b.md; if (nx < t) nx = (y + 1) + '-' + b.md; return { name: b.name, date: nx }; })
      .filter(function (b) { return b.date <= addDays_(t, 45); })
      .map(function (b) { return b.name + ' on ' + nice_(b.date); }); }
  if (on('todos')) { var open = rows_('Todos').filter(function (x) { return x.status !== 'Done'; });
    c.todos = open.filter(function (x) { return x.due && x.due <= addDays_(t, 7); }).sort(function (a, b) { return a.due < b.due ? -1 : 1; }).slice(0, 25)
      .map(function (x) { return x.title + ' | due ' + x.due + (x.due < t ? ' (OVERDUE)' : '') + (x.assignee ? ' | ' + x.assignee : '') + (x.amount ? ' | $' + x.amount : ''); });
    c.openTodos = open.length; }
  if (on('rides') || on('week')) {
    c.days = []; for (var j = 0; j < (on('week') ? 7 : 3); j++) { var dd = addDays_(t, j), bits = [];
      schoolRuns_(dd).forEach(function (r) { bits.push(runLine_(r)); });
      kidOcc_(dd).forEach(function (o) { bits.push(t12_(o.start) + ' ' + o.title + ' (' + o.kids + ') drop-off ' + (o.dropoff || 'NOT SET') + ', pickup ' + (o.pickup || 'NOT SET')); });
      rows_('Events').forEach(function (e) { if (e.date === dd) bits.push((e.start ? t12_(e.start) + ' ' : '') + evName_(e) + (e.people ? ' (' + e.people + ')' : '')); });
      rows_('Childcare').forEach(function (cc) { if (cc.date === dd) { var ct = get_('Caretakers', cc.confirmedId); bits.push('Caretaker ' + t12_(cc.start) + '–' + t12_(cc.end) + ': ' + (ct ? ct.name : 'NOT CONFIRMED')); } });
      rows_('SchoolCal').forEach(function (s) { if (s.date && dd >= s.date && dd <= (s.endDate || s.date)) bits.push('School calendar: ' + s.title); });
      c.days.push(nice_(dd) + ': ' + (bits.join('; ') || 'nothing scheduled')); } }
  if (on('house')) c.house = rows_('HouseCards').filter(function (h) { return h.kind === 'upkeep' && h.nextDue && h.nextDue <= addDays_(t, 30); }).map(function (h) { return h.title + ' (' + (h.house || '') + ') due ' + h.nextDue; });
  c.openRequests = rows_('ai_requests').filter(function (q) { return (q.status === 'question' || q.status === 'error') && q.time >= addDays_(t, -7); })
    .map(function (q) { return q.who + ' asked on ' + String(q.time).slice(0, 10) + ': "' + q.text + '" | ' + (q.status === 'question' ? 'still waiting for their answer to: ' + q.question : 'could not be done: ' + q.summary); });
  c.note = 'Everything listed is today or later, except overdue to-dos. Past events and meals are history: do not write about them.';
  c.generalNotesLeftToday = Math.max(0, 3 - freeToday_(t));
  c.recentNotes = rows_('Activity').filter(function (a) { return a.type === 'ai' && !a.stack && a.time >= addDays_(t, -10); }).map(function (a) { return a.time.slice(0, 10) + ': ' + a.text; }).slice(-15);
  return c;
}
/** One structured call to Claude. Returns { data } (the parsed JSON), { refused: true } or { error }. */
function claude_(system, content, schema, effort, maxTokens) {
  var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) return { error: 'No API key yet. In Apps Script: Project Settings, Script properties, add ANTHROPIC_API_KEY.', nokey: true };
  var model = PropertiesService.getScriptProperties().getProperty('AI_MODEL') || 'claude-opus-5-5';
  var send = function (strict) {
    var body = { model: model, max_tokens: maxTokens || 4000, fallbacks: 'default', system: system, messages: [{ role: 'user', content: content }],
      output_config: strict ? { effort: effort || 'medium', format: { type: 'json_schema', schema: schema } } : { effort: effort || 'medium' } };
    if (!strict) body.system = system + '\n\nReply with only one JSON object (no other text) that matches this JSON schema exactly:\n' + JSON.stringify(schema);
    try {
      return UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        headers: { 'x-api-key': key, 'anthropic-version': '2026-10-21', 'anthropic-beta': 'server-side-fallback-2026-07-01' }, payload: JSON.stringify(body) });
    } catch (e) { return { err: 'Could not reach Claude (' + String(e && e.message || e).slice(0, 120) + ')' }; }
  };
  var strict = true, res, code, j;
  for (var tries = 0; tries < 3; tries++) {
    res = send(strict); j = {};
    if (res.err) { code = 0; if (tries === 0) { Utilities.sleep(1500); continue; } return claudeErr_(res.err); }
    code = res.getResponseCode();
    try { j = JSON.parse(res.getContentText()); } catch (e) {}
    var msg = j.error && j.error.message ? j.error.message : '';
    if (code === 200) break;
    if (code === 400 && strict && /schema|grammar|format|output_config|too (many|complex|large)/i.test(msg)) { strict = false; continue; }   // the form was refused: ask for plain JSON instead
    if ((code === 429 || code >= 500) && tries === 0) { Utilities.sleep(2000); continue; }   // busy: one more try
    return claudeErr_('Claude API error ' + code + (msg ? ': ' + msg : ''));
  }
  if (code !== 200) return claudeErr_('Claude API error ' + code);
  if (j.stop_reason === 'refusal') return { refused: true };
  if (j.stop_reason === 'max_tokens') return claudeErr_('The answer was too long and got cut off.');
  var text = (j.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
  if (!strict) { var i0 = text.indexOf('{'), i1 = text.lastIndexOf('}'); if (i0 >= 0 && i1 > i0) text = text.slice(i0, i1 + 1); }
  try { return { data: JSON.parse(text) }; } catch (e) { return claudeErr_('Could not read the answer.'); }
}
/** Keeps the latest Claude problem in Settings (app|ai.error) so it can be seen from the Sheet and the app. */
function claudeErr_(msg) {
  try { put_('Settings', { id: 'app|ai.error', value: now_() + ' · ' + String(msg).slice(0, 300) }); } catch (e) {}
  return { error: msg };
}
/** Asks Claude for 0 to 3 notes and posts them to the Feed. Returns the notes (or why there are none). */
/** How many general (not rule) notes the assistant has posted today. */
function freeToday_(t) { return rows_('Activity').filter(function (a) { return a.type === 'ai' && !a.stack && String(a.time).slice(0, 10) === t && String(a.ref || '').indexOf('rule:') !== 0; }).length; }
function aiPosts_(t, manual) {
  var ctx = aiContext_(t);
  var system = 'You are the AI assistant inside a family\'s shared home app (parents Paul and Shana, and their kids). Each morning you read a summary of the family\'s plans and write 0 to 3 short notes for the app\'s Feed.\n' +
    'Write only notes that help: something to act on, a gap in the plan, a timely idea or a useful heads-up. If nothing is worth saying, return no notes; that is often the right answer.\n' +
    'Each note: one or two plain sentences, under 220 characters, warm and practical, first names only, no emoji, no greeting, no sign-off. Use dates like "Thu" or "Nov 20".\n' +
    'You run every couple of hours, so most runs should return no notes. Post a general note only when something is new or has changed since recentNotes, and never more than generalNotesLeftToday of them. Do not repeat or rephrase anything in recentNotes. Never name or describe gift ideas; at most say how many are saved. Do not invent facts that are not in the summary.\n' +
    'The family may give you standing rules (in "rules"). Check every rule against the summary. When a rule applies, write one note for it, set rule_id to that rule\'s id, and word it for the people in tellOnly (use @Name to tag someone). A rule note does not count toward the 3-note limit, and a rule that does not apply gets no note. ' +
    'Notes not tied to a rule must stay within the listed topics and set rule_id to "".\n' +
    'openRequests are things someone asked the Assistant for that are still waiting. If one has waited since before today, you may write one short nudge to that person (tag them with @Name) with topic "week"; never nudge about the same request twice (check recentNotes).';
  var schema = { type: 'object', additionalProperties: false, required: ['notes'],
    properties: { notes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text', 'topic', 'rule_id'],
      properties: { text: { type: 'string' }, topic: { type: 'string', enum: Object.keys(AI_TOPICS_).concat('rule') }, rule_id: { type: 'string' } } } } } };
  var r = claude_(system, 'Family summary (JSON):\n' + JSON.stringify(ctx) + '\n\nWrite today\'s notes.', schema, 'medium');
  if (r.nokey) { put_('Settings', { id: 'app|ai.last', value: now_() + ' · no API key: add ANTHROPIC_API_KEY in Script properties' }); return { error: r.error }; }
  if (r.error) { put_('Settings', { id: 'app|ai.last', value: now_() + ' · ' + r.error.slice(0, 200) }); return { error: r.error }; }
  if (r.refused) { put_('Settings', { id: 'app|ai.last', value: now_() + ' · declined' }); return { notes: [] }; }
  var notes = [], rulesById = {}; aiRules_().forEach(function (x) { rulesById[x.id] = x; });
  var all = ((r.data && r.data.notes) || []).filter(function (n) { return n && n.text; }), left = Math.max(0, 3 - freeToday_(t)), free = 0;   // at most 3 general notes a day; rule notes are not capped
  notes = all.filter(function (n) { return rulesById[n.rule_id] || free++ < left; });
  var who = list_(setting_('app|ai.who', 'Paul'));
  notes.forEach(function (n) {
    var rule = rulesById[n.rule_id], aud = rule && rule.audience ? list_(rule.audience) : who;   // a rule's note goes only to the people it names
    log_('Assistant', { type: 'ai', text: String(n.text).slice(0, 400), cat: 'ai', ref: rule ? 'rule:' + rule.id : n.topic, audience: aud.join(', ') });
    aud.forEach(function (p) { if (pref_(p, 'ai')) notify_(p, 'Assistant', String(n.text).slice(0, 400)); });
  });
  put_('Settings', { id: 'app|ai.last', value: now_() + ' · ' + notes.length + ' note' + (notes.length === 1 ? '' : 's') + (manual ? ' (run by hand)' : '') });
  return { notes: notes };
}

// ---------- AI Today card ----------
/** Who gets the AI Today card: Paul's choice in the app (app|ai.card), Paul only until he adds others. */
function aiCardFor_() { var v = setting_('app|ai.card', 'Paul'); return v === 'none' ? [] : list_(v); }
function briefAll_(d, mode) { var done = [], err = ''; aiCardFor_().forEach(function (p) { try { var b = aiBrief_(p, d, mode); if (b && b.error) err = b.error; else done.push(p); } catch (e) { console.error(e); err = String(e && e.message || e); } }); return { done: done, error: err }; }
/** Minutes since a timestamp saved in Settings (a big number if it never ran). */
function minsSince_(key) { var v = setting_(key, ''); if (!v) return 99999;
  var ms = function (iso) { var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(iso)); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : NaN; };
  var d = (ms(now_()) - ms(v)) / 60000; return isNaN(d) ? 99999 : Math.round(d); }
function stamp_(key) { put_('Settings', { id: key, value: now_() }); }
/** The scheduled review (hourly tick): every two hours from 5 AM to 1 AM (5, 7, ... 11 PM, 1). Notes and rules, the Today cards, and conversations. */
function aiReview_(t, hour) {
  var gap = Number(setting_('app|ai.every', '110'));   // minutes; a little under two hours so an hourly tick never skips a slot
  if (hour >= 2 && hour < 5) return;   // quiet from 2 AM to 5 AM; the window is fixed, there is no setting for it
  if (minsSince_('job|ai_review_at') >= gap) { stamp_('job|ai_review_at'); aiSafe_(t); aiCardsSafe_(t, hour); }
  aiTradSafe_(t, false);   // adds a tradition the moment a yes has been given (no Claude call)
  if (setting_('app|ai.convo', '1') === '1') aiConvoSafe_(t, false);   // every tick; only calls Claude when there is something new
  if (minsSince_('job|ai_tidy_at') >= gap) { stamp_('job|ai_tidy_at'); aiTidySafe_(t); }
  if (minsSince_('job|ai_feed_at') >= gap) { stamp_('job|ai_feed_at'); aiFeedSafe_(t); }
  if (minsSince_('job|ai_trad_at') >= gap) { stamp_('job|ai_trad_at'); aiTradSafe_(t, true); }
}
/** Today cards: tomorrow's from 7 PM, today's before that. */
function aiCardsSafe_(t, hour) { try { if (hour >= 19) briefAll_(addDays_(t, 1), 'night'); else briefAll_(t, 'day'); } catch (e) { console.error(e); } }
// ---------- The assistant curates the Feed ----------
// On each review the assistant looks at the last few days of automatic change posts ("set dinner for Tue", "added
// Dentist", ...) and uses its judgment to make the Feed clearer: it groups related posts into a stack under an overview
// card it writes (in the order that reads best), updates stacks it made earlier, and hides posts that are moot (an
// item changed again, or deleted). Hiding is reversible (state 'moot'; the app has "Show what the assistant tidied
// away"). People's own messages and comments are never touched. Assistant stacks have ids starting with "ai"; the app
// applies the stacks and hiding only for people in the assistant's audience (app|ai.who).
var FEED_SKIP = { message: 1, answer: 1, ai: 1, daily: 1, summary_week: 1, summary_month: 1, source: 1, list: 1 };
/** One line on what an item looks like now, so the assistant can tell which posts are out of date. */
function itemNow_(table, ref) {
  if (!table || !ref) return '';
  var r = T[table] ? get_(table, ref) : null;
  if (!r) return 'no longer exists';
  if (table === 'Menus') { var rec = r.recipeId ? get_('Recipes', r.recipeId) : null;
    return 'dinner ' + r.date + ' (' + r.day + '): ' + (r.skipped === '1' ? 'skipped' : rec ? rec.name : r.note || 'nothing set'); }
  if (table === 'Events') return 'event "' + r.title + '" on ' + r.date + (r.start ? ' at ' + r.start : '') + (r.dropoff || r.pickup ? ', drop-off ' + (r.dropoff || 'not set') + ', pickup ' + (r.pickup || 'not set') : '');
  if (table === 'Todos') return 'to-do "' + r.title + '"' + (r.due ? ' due ' + r.due : '') + (r.status ? ', ' + r.status : '') + (r.assignee ? ', for ' + r.assignee : '');
  if (table === 'Childcare') return 'caretaker ' + (r.task || 'babysit') + ' on ' + r.date + (r.start ? ' at ' + r.start : '') + (r.confirmedId ? ', confirmed' : ', not confirmed yet');
  if (table === 'Overrides') return 'ride change: ' + JSON.stringify(r).slice(0, 120);
  return txt_(r.name || r.title || r.text || '', 100);
}
function aiFeedSafe_(t) { try { return aiFeed_(t); } catch (e) { console.error(e); return { error: String(e && e.message || e) }; } }
function aiFeed_(t) {
  if (setting_('app|ai.on', '') !== '1') return { off: true };
  var since = addDays_(t, -3), all = rows_('Activity');
  var posts = all.filter(function (a) { return String(a.time).slice(0, 10) >= since && a.state !== 'cleared' && !FEED_SKIP[a.type] && (!a.stack || a.stack.indexOf('ai') === 0); }).slice(-60);
  var overviews = all.filter(function (a) { return a.type === 'ai' && a.stackIdx === '0' && String(a.stack || '').indexOf('ai') === 0 && a.state !== 'cleared'; });
  if (posts.length < 2) return { stacks: 0, hidden: 0 };
  var cand = posts.map(function (a) { return { id: a.id, when: a.time, who: a.who, what: a.text, item: a.table ? a.table + ':' + a.ref : '', itemNow: itemNow_(a.table, a.ref),
    inStack: a.stack || '', hidden: a.state === 'moot' }; });
  var mine = overviews.map(function (o) { var m = String(o.text).match(/^\*\*(.+?)\*\*\n?/);
    return { stack: o.stack, title: m ? m[1] : '', overview: m ? String(o.text).slice(m[0].length) : o.text, posts: posts.filter(function (a) { return a.stack === o.stack; })
      .sort(function (x, y) { return Number(x.stackIdx) - Number(y.stackIdx); }).map(function (a) { return a.id; }) }; });
  var S = { type: 'string' }, ids = { type: 'array', items: S }, obj = function (props) { return { type: 'object', additionalProperties: false, required: Object.keys(props), properties: props }; };
  var schema = obj({ stacks: { type: 'array', items: obj({ existing: S, title: S, overview: S, posts: ids }) }, hide: { type: 'array', items: obj({ id: S, why: S }) },
    unhide: ids, dissolve: ids });
  var system = 'You are the Assistant inside a family\'s home app. The Feed gets an automatic post each time someone changes the plan (dinners, events, rides, ' +
    'to-dos, caretakers). Use your judgment to make the Feed streamlined and informational:\n' +
    '1. Stacks. Group related posts into a stack: an overview card you write, followed by the posts that matter, in the order that reads best ' +
    '(usually by the day or time they are about, not when they were posted). Example: several dinner changes during the day that settled on five meals ' +
    'become one stack titled "Dinners this week" with an overview like "Dinner is set Mon-Fri: tacos, salmon, chili, pasta, pizza. Saturday is still open." ' +
    'and then the posts that set each night. Only stack posts that belong together (one topic, such as the week\'s dinners, a trip, a day\'s rides). ' +
    'A stack needs at least 2 posts. title: up to 40 characters. overview: one or two plain sentences, at most 220 characters, saying where things stand now.\n' +
    '2. Hide moot posts: a post about an item that was changed again later (keep the post that matches "itemNow", hide the earlier ones), about an item that ' +
    'no longer exists, or that no longer means anything. When unsure, keep it. Hidden posts can be shown again by the family.\n' +
    '3. Your earlier stacks are in "myStacks". To change one (new posts, new order, new overview), return it with "existing" set to its id and the full ' +
    'list of posts it should hold now. Leave out stacks that are fine as they are. To undo a stack, put its id in "dissolve". For a new stack, "existing" is "".\n' +
    '4. "unhide" lists posts you hid before that matter again.\n' +
    'Use only ids from the input. Never invent details. Most runs should change little or nothing.';
  var r = claude_(system, JSON.stringify({ today: t, posts: cand, myStacks: mine }), schema, 'low');
  if (r.error || r.refused || !r.data) return { error: r.error || 'declined' };
  var d = r.data, byId = {}, used = {}, made = 0, hid = 0, shown = 0, gone = 0;
  posts.forEach(function (a) { byId[a.id] = a; });
  var mineIds = {}; mine.forEach(function (x) { mineIds[x.stack] = true; });
  (d.dissolve || []).forEach(function (sid) {
    if (!mineIds[sid]) return;
    overviews.filter(function (o) { return o.stack === sid; }).forEach(function (o) { put_('Activity', { id: o.id, state: 'cleared' }); });
    posts.filter(function (a) { return a.stack === sid; }).forEach(function (a) { put_('Activity', { id: a.id, stack: '', stackIdx: '' }); });
    delete mineIds[sid]; gone++;
  });
  (d.stacks || []).forEach(function (st) {
    var list = (st.posts || []).filter(function (id) { return byId[id] && !used[id]; });
    if (list.length < 2) return;
    list.forEach(function (id) { used[id] = true; });
    var sid = st.existing && mineIds[st.existing] ? st.existing : 'ai' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    var newest = list.map(function (id) { return byId[id].time; }).sort().pop();
    var text = (st.title ? '**' + txt_(st.title, 60) + '**\n' : '') + txt_(st.overview, 260);
    var ov = overviews.filter(function (o) { return o.stack === sid; })[0];
    if (ov) put_('Activity', { id: ov.id, text: text, time: newest });
    else put_('Activity', { time: newest, who: 'Assistant', type: 'ai', text: text, cat: 'ai', audience: '', subject: '', stack: sid, stackIdx: '0' });
    posts.forEach(function (a) { if (a.stack === sid && list.indexOf(a.id) < 0) put_('Activity', { id: a.id, stack: '', stackIdx: '' }); });   // posts that left the stack
    list.forEach(function (id, k) { put_('Activity', { id: id, stack: sid, stackIdx: String(k + 1) }); });   // may move a post out of another stack
    made++;
  });
  (d.hide || []).forEach(function (x) { var a = byId[x.id]; if (a && a.state !== 'moot') { put_('Activity', { id: a.id, state: 'moot' }); hid++; } });
  (d.unhide || []).forEach(function (id) { var a = byId[id]; if (a && a.state === 'moot') { put_('Activity', { id: a.id, state: '' }); shown++; } });
  put_('Settings', { id: 'app|ai.feedLast', value: now_() + ' · ' + made + ' stack(s), ' + hid + ' hidden' + (shown ? ', ' + shown + ' shown again' : '') + (gone ? ', ' + gone + ' undone' : '') });
  return { stacks: made, hidden: hid, unhidden: shown, dissolved: gone };
}

// ---------- The assistant tidies up its own posts ----------
function aiTidySafe_(t) { try { return aiTidy_(t); } catch (e) { console.error(e); return { error: String(e && e.message || e) }; } }
// ---------- The assistant spots annual traditions ----------
// Each review it may notice an event that looks like something the family does every year (a holiday party, a festival,
// a yearly outing) and post a yes/no question in the Feed: "Should X be an annual tradition?". The question is an ordinary
// question post (Messages, kind 'question', answerType 'yesno') with ref "tradition|<event id>|<title>". On its next run,
// if the answer is Yes it adds the tradition (Annuals) and posts a note saying so; No just closes it. Each event title is asked about once.
var TRAD_REF = /^tradition\|([^|]*)\|(.*)$/;
function aiTradSafe_(t, ask) {
  var out = {}; try { out = aiTrad_(t, ask) || {}; } catch (e) { console.error(e); out = { error: String(e && e.message || e) }; }
  try { var a = aiAgain_(t, ask); out.made = (out.made || []).concat(a.made || []); out.again = a.asked || []; } catch (e2) { console.error(e2); }
  return out;
}
// "Are we doing it again?": instead of a daily reminder, shortly before a tradition comes around (its "Remind us" lead, two weeks
// by default) the assistant asks one shared Yes/No question in the Feed. Yes puts it on the Planner for this year's dates;
// No leaves it. Each tradition is asked once a year (ref "again|<tradition id>|<year>|<name>").
function aiAgain_(t, ask) {
  if (setting_('app|ai.on', '') !== '1') return { off: true };
  var made = [], asked = [], who = list_(setting_('app|ai.who', 'Paul')), AG = /^again\|([^|]*)\|(\d{4})\|(.*)$/;
  rows_('Messages').forEach(function (m) {
    var mt = AG.exec(m.ref || ''); if (!mt) return;
    var ans = rows_('Comments').filter(function (c) { return c.table === 'Messages' && c.ref === m.id && c.system === 'answer'; }).sort(function (a, b) { return String(a.time) < String(b.time) ? -1 : 1; }).pop();
    if (!ans) return;
    var a = get_('Annuals', mt[1]);
    if (!/^\s*yes/i.test(ans.text) || !a) { put_('Messages', { id: m.id, ref: 'again-no|' + mt[1] + '|' + mt[2] + '|' + mt[3] }); return; }
    var w = annualNext_(a, t, mt[2]);
    var have = rows_('Events').filter(function (e) { return norm_(e.title) === norm_(a.name) && e.date === w.s; })[0];
    var evId = have ? have.id : id_();
    if (!have) put_('Events', { id: evId, title: a.name, date: w.s, endDate: w.e > w.s ? w.e : '', allDay: '1', category: 'Family', location: a.where || '', notes: [a.notes, a.link].filter(Boolean).join('\n') });
    put_('Links', { id: id_(), aTable: 'Annuals', aRef: a.id, bTable: 'Events', bRef: evId, by: 'Assistant' });
    put_('Messages', { id: m.id, ref: 'again-yes|' + mt[1] + '|' + mt[2] + '|' + mt[3] });
    log_('Assistant', { type: 'ai', text: 'Put **' + a.name + '** on the Planner for ' + nice_(w.s) + (w.e > w.s ? ' to ' + nice_(w.e) : '') + '.', cat: 'ai', table: 'Annuals', ref: a.id, audience: who.join(', ') });
    made.push(a.name);
  });
  if (!ask) return { made: made };
  var open = rows_('Messages').filter(function (m) { return AG.test(m.ref || ''); }).length;
  rows_('Annuals').forEach(function (a) {
    if (open >= 3 || !a.from || !/^\d\d-\d\d$/.test(a.from.slice(5, 10))) return;
    var w = annualNext_(a, t), lead = Number(a.remind) || 14;
    if (w.days < 0 || w.days > lead || list_(a.years).indexOf(String(w.year)) >= 0) return;
    var linked = {}; rows_('Links').forEach(function (l) { if (l.aTable === 'Annuals' && l.aRef === a.id && l.bTable === 'Events') linked[l.bRef] = 1; });
    var planned = rows_('Events').some(function (e) { return (linked[e.id] || norm_(e.title) === norm_(a.name)) && e.date >= t && e.date <= addDays_(w.s, 45); });
    if (planned) return;   // already on the Planner this year: nothing to ask
    var seen = rows_('Messages').some(function (m) { var x = /^again[^|]*\|([^|]*)\|(\d{4})\|/.exec(m.ref || ''); return x && x[1] === a.id && x[2] === String(w.year); });
    if (seen) return;
    put_('Messages', { id: id_(), time: now_(), from: 'Assistant', tags: who.join(', '), visibility: '', kind: 'question', answerType: 'yesno', ref: 'again|' + a.id + '|' + w.year + '|' + String(a.name).replace(/\|/g, ' '),
      text: 'Are we doing "' + a.name + '" again this year? It usually starts ' + nice_(w.s) + (w.days === 0 ? ' (today)' : ' (in ' + w.days + ' day' + (w.days === 1 ? '' : 's') + ')') + '. If yes, I will put it on the Planner.' });
    open++; asked.push(a.name);
  });
  return { made: made, asked: asked };
}
/** The next time a tradition starts (its month and day each year): { s, e, days, year }. For an answered question, pass the year it was asked for. */
function annualNext_(a, t, forYear) {
  var f = a.from.slice(5, 10), y = forYear ? Number(forYear) : Number(t.slice(0, 4)), s0 = y + '-' + f;
  if (!forYear && s0 < t) { y++; s0 = y + '-' + f; }
  var tm = String(a.to || '').slice(5, 10), e0 = /^\d\d-\d\d$/.test(tm) ? y + '-' + tm : s0;
  if (e0 < s0) e0 = (y + 1) + '-' + tm;
  return { s: s0, e: e0, days: Math.round((Date.parse(s0) - Date.parse(t)) / 864e5), year: y };
}
function aiTrad_(t, ask) {
  if (setting_('app|ai.on', '') !== '1') return { off: true };
  var made = [], who = list_(setting_('app|ai.who', 'Paul')), annuals = rows_('Annuals');
  // 1. answered questions
  rows_('Messages').forEach(function (m) {
    var mt = TRAD_REF.exec(m.ref || ''); if (!mt) return;
    var ans = rows_('Comments').filter(function (c) { return c.table === 'Messages' && c.ref === m.id && c.system === 'answer'; }).sort(function (a, b) { return String(a.time) < String(b.time) ? -1 : 1; }).pop();
    if (!ans) return;
    var yes = /^\s*yes/i.test(ans.text), title = mt[2], e = get_('Events', mt[1]) || {};
    if (!yes) { put_('Messages', { id: m.id, ref: 'tradition-no|' + mt[1] + '|' + title }); return; }
    var have = annuals.filter(function (a) { return norm_(a.name) === norm_(title); })[0], id = have ? have.id : id_();
    if (!have) {
      var from = e.date || t, yr = from.slice(0, 4);
      put_('Annuals', { id: id, name: title, from: from, to: e.endDate && e.endDate > from ? e.endDate : '', where: e.location || '', notes: e.notes || '', remind: '14', years: from <= t ? yr : '', when: '', link: '' });
      annuals.push({ id: id, name: title });
    }
    if (e.id) put_('Links', { id: id_(), aTable: 'Annuals', aRef: id, bTable: 'Events', bRef: e.id, by: 'Assistant' });   // the event is this tradition's upcoming (or past) year
    put_('Messages', { id: m.id, ref: 'tradition-yes|' + mt[1] + '|' + title });
    log_('Assistant', { type: 'ai', text: (have ? '"' + title + '" is already an annual tradition.' : 'Created a new annual tradition: **' + title + '**' + (e.date ? ' (usually ' + nice_(e.date) + ')' : '') + '. You will get a reminder two weeks before it starts. Find it under Home, Annual traditions.'), cat: 'ai', table: 'Annuals', ref: id, audience: who.join(', ') });
    made.push(title);
  });
  if (!ask) return { made: made };
  // 2. maybe one new question
  var asked = {}; rows_('Messages').forEach(function (m) { var mt = /^tradition[^|]*\|[^|]*\|(.*)$/.exec(m.ref || ''); if (mt) asked[norm_(mt[1])] = 1; });
  annuals.forEach(function (a) { asked[norm_(a.name)] = 1; });
  var open = rows_('Messages').filter(function (m) { return TRAD_REF.test(m.ref || ''); }).length;
  if (open >= 2) return { made: made };   // never pile up questions
  var evs = rows_('Events').filter(function (e) { return e.date >= addDays_(t, -45) && e.date <= addDays_(t, 75) && !asked[norm_(e.title)]; })
    .map(function (e) { return { id: e.id, title: e.title, date: e.date, endDate: e.endDate || '', location: e.location || '', category: e.category || '' }; });
  if (!evs.length) return { made: made };
  var S = { type: 'string' }, schema = { type: 'object', additionalProperties: false, required: ['pick'], properties: { pick: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id'], properties: { id: S } } } } };
  var system = 'You are the Assistant inside a family\'s home app. Below are events from the family\'s Planner. Pick AT MOST ONE that looks like something a family does every year and would want to be reminded about: ' +
    'a holiday or seasonal party, a festival, a yearly outing, a recurring tradition (for example a Christmas party, Oyster Fest, apple picking, meeting Santa). Do not pick ordinary appointments, school days, practices, birthdays, work, errands, ' +
    'or anything routine or one-off. Most of the time pick nothing: return an empty list unless one is clearly a good fit. Use the id exactly as given.';
  var r = claude_(system, JSON.stringify({ events: evs }), schema, 'low', 800);
  if (r.error || r.refused || !r.data) return { made: made, error: r.error };
  var pick = (r.data.pick || [])[0], e = pick && evs.filter(function (x) { return x.id === pick.id; })[0];
  if (!e) return { made: made };
  var title = String(e.title).replace(/\|/g, ' ').trim();
  put_('Messages', { id: id_(), time: now_(), from: 'Assistant', tags: who.join(', '), visibility: '', kind: 'question', answerType: 'yesno', ref: 'tradition|' + e.id + '|' + title,
    text: 'Should "' + title + '" (' + nice_(e.date) + ') be an annual tradition? If yes, I will add it to Annual traditions and remind you two weeks before it each year.' });
  return { made: made, asked: title };
}
/** Clears the assistant's notes and questions that are no longer relevant. Nothing is deleted: cleared posts just leave the Feed. */
function aiTidy_(t) {
  var cleared = [], notes = rows_('Activity').filter(function (a) { return a.type === 'ai' && !a.stack && a.state !== 'cleared'; }),
      asks = rows_('ai_requests').filter(function (q) { return q.status === 'question'; });
  // Old ones simply expire: notes after 3 days, unanswered questions after 7.
  notes.forEach(function (a) { if (String(a.time).slice(0, 10) < addDays_(t, -3)) { put_('Activity', { id: a.id, state: 'cleared' }); cleared.push(a.id); } });
  asks.forEach(function (q) { if (String(q.time).slice(0, 10) < addDays_(t, -7)) { put_('ai_requests', { id: q.id, status: 'cleared' }); cleared.push(q.id); } });
  notes = notes.filter(function (a) { return cleared.indexOf(a.id) < 0; }); asks = asks.filter(function (q) { return cleared.indexOf(q.id) < 0; });
  if (!notes.length && !asks.length) return { cleared: cleared.length };
  var facts = aiContext_(t); delete facts.recipes; delete facts.rules; delete facts.recentNotes; delete facts.openRequests; delete facts.topics; delete facts.note;
  var cand = notes.map(function (a) { return { id: a.id, kind: 'note', posted: a.time, text: a.text }; })
    .concat(asks.map(function (q) { return { id: q.id, kind: 'question', posted: q.time, asked: q.who, request: q.text, question: q.question }; }));
  var S = { type: 'string' }, schema = { type: 'object', additionalProperties: false, required: ['clear'], properties: { clear: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'reason'], properties: { id: S, reason: S } } } } };
  var system = 'You are the Assistant inside a family\'s home app. Earlier you posted notes and asked questions in the family\'s Feed (posts). Decide which are now outdated and should be cleared from the Feed.\n' +
    'Clear a post when what it raised is no longer true or no longer needed: the gap it pointed out has been filled (for example a dinner now has someone cooking, a ride or caretaker is now set, a bill or to-do is done), the question has already been answered in the plan, or the day it was about has passed. ' +
    'Compare each post with "facts", the current state of the plan. Keep a post when the issue it raised is still open or still useful. When unsure, keep it. Most of the time clear nothing or only a few. Never invent ids.';
  var r = claude_(system, JSON.stringify({ posts: cand, facts: facts }), schema, 'low');
  if (r.error || r.refused || !r.data) return { error: r.error || 'declined', cleared: cleared.length };
  var ids = {}; cand.forEach(function (c) { ids[c.id] = c.kind; });
  (r.data.clear || []).forEach(function (x) { var k = ids[x.id]; if (!k) return;
    if (k === 'note') put_('Activity', { id: x.id, state: 'cleared' }); else put_('ai_requests', { id: x.id, status: 'cleared', summary: txt_(x.reason, 200) });
    cleared.push(x.id); });
  return { cleared: cleared.length };
}
/** A quick review right after someone uses the Assistant: conversations, then the Today cards and the notes if it has been a while. */
function aiAfter_(t) {
  if (setting_('app|ai.on', '') !== '1') return { skipped: 'off' };
  if (minsSince_('job|ai_after_at') < 5) return { skipped: 'recent' };   // several requests close together share one review
  stamp_('job|ai_after_at');
  var hour = Number(now_().slice(11, 13)), out = {};
  if (setting_('app|ai.convo', '1') === '1') out.convo = (aiConvoSafe_(t, true) || {}).actions || [];
  if (minsSince_('job|ai_review_at') >= 30) { stamp_('job|ai_review_at'); aiSafe_(t); aiCardsSafe_(t, hour); out.reviewed = true; }
  out.tidied = (aiTidySafe_(t) || {}).cleared || 0; if (out.tidied) out.reviewed = true;
  return out;
}
/** Everything the assistant does, now: notes for the Feed, the AI Today cards, and plans from conversations. */
function aiAll_(t) {
  stamp_('job|ai_review_at'); var night = Number(now_().slice(11, 13)) >= 19, notes = aiPosts_(t, true), cards = briefAll_(night ? addDays_(t, 1) : t, night ? 'night' : 'day'), convo = setting_('app|ai.convo', '1') === '1' ? aiConvoSafe_(t, true) : {}, tidy = aiTidySafe_(t);
  stamp_('job|ai_feed_at'); var feed = aiFeedSafe_(t);
  stamp_('job|ai_trad_at'); var trad = aiTradSafe_(t, true);
  return { traditions: (trad.made || []).length, tradAsked: trad.asked || '', notes: notes, cards: cards.done, cardError: cards.error, convo: convo.actions || [], tidied: tidy.cleared || 0, stacked: feed.stacks || 0, hidden: feed.hidden || 0 };
}
/** Everything on person p's plate for date d, each with a ref the app can open. Gift ideas are never included. */
function briefCands_(p, d, mode) {
  var t = today_(), day = DAYS[dow_(d)], c = [], add = function (ref, text) { c.push({ ref: ref, what: text }); };
  var people = rows_('People'), me = people.filter(function (x) { return x.name === p; })[0] || {};
  people.forEach(function (x) {
    var w = jsonSafe_(setting_('person|' + x.id + '|wfh', '{}')), dates = w.dates && typeof w.dates === 'object' ? w.dates : {}, ov = w.hrs && w.hrs[d];   // ov: a one-day change from the app's Work schedule page
    var hrs = (jsonSafe_(setting_('person|' + x.id + '|hours', '{}'))[day]) || {}, ws = ov && !ov.off ? (ov.s || x.workStart) : hrs.s || x.workStart, we = ov && !ov.off ? (ov.e || '') : hrs.e || (hrs.s ? '' : x.workEnd);
    if (x.kind === 'kid' || !ws || (ov ? ov.off : list_(x.workDays).indexOf(day) < 0)) return;
    var where = dates[d] || (list_(w.days).indexOf(day) >= 0 ? 'home' : 'office');
    add('People:' + x.id, (x.name === p ? 'You work' : x.name + ' works') + ' ' + t12_(ws) + (we ? '–' + t12_(we) : '') + ', ' + (where === 'home' ? 'from home' : 'in office'));
  });
  schoolRuns_(d).forEach(function (r) { add('run:' + r.sid + '|' + d + '|' + r.kind, runLine_(r) + (r.who && !r.changed ? ' (the usual)' : '')); });
  kidOcc_(d).forEach(function (o) { add(o.t + ':' + o.id, t12_(o.start) + ' ' + o.title + ' (' + o.kids + '): drop-off ' + (o.dropoff || 'NOT SET') + ', pickup ' + (o.pickup || 'NOT SET')); });
  rows_('Events').forEach(function (e) { if (e.date === d && !(e.category === 'Kids' && e.allDay !== '1' && e.start)) add('Events:' + e.id, (e.allDay === '1' || !e.start ? 'All day ' : t12_(e.start) + ' ') + evName_(e) + (e.people ? ' (' + e.people + ')' : '') + (e.category ? ' [' + e.category + ']' : '')); });
  rows_('Childcare').forEach(function (cc) { if (cc.date === d) { var ct = get_('Caretakers', cc.confirmedId); add('Childcare:' + cc.id, 'Caretaker ' + t12_(cc.start) + '–' + t12_(cc.end) + ': ' + (ct ? ct.name : 'NOT CONFIRMED')); } });
  rows_('SchoolCal').forEach(function (s) { if (s.date && d >= s.date && d <= (s.endDate || s.date)) add('', 'School calendar: ' + s.title); });
  var mid = monday_(d) + '-' + day, m = get_('Menus', mid);
  add('Menus:' + mid, 'Dinner: ' + (m ? (m.skipped === '1' ? 'skipped' : dishName_(m) || 'nothing planned') + (m.cook ? ', ' + m.cook + ' cooking' : '') + (m.away ? ', ' + m.away + ' not home' : '') : 'nothing planned'));
  rows_('Todos').filter(function (x) { return x.status !== 'Done' && (!x.assignee || x.assignee === p) && x.due && x.due <= addDays_(d, 3); })
    .sort(function (a, b) { return a.due < b.due ? -1 : 1; }).slice(0, 20)
    .forEach(function (x) { add('Todos:' + x.id, 'To-do: ' + x.title + ' | due ' + x.due + (x.due < t ? ' (OVERDUE)' : x.due === d ? ' (due this day)' : '') + (x.assignee ? ' | ' + x.assignee + "'s" : ' | anyone') + (x.amount ? ' | $' + x.amount : '')); });
  var kids = people.filter(function (x) { return x.kind === 'kid'; }).map(function (x) { return x.name; });
  birthdays_().forEach(function (b) { var y = Number(d.slice(0, 4)), nx = y + '-' + b.md; if (nx < d) nx = (y + 1) + '-' + b.md;
    if (nx <= addDays_(d, 10)) add('', 'Birthday: ' + b.name + ' on ' + nice_(nx)); });
  rows_('HouseCards').forEach(function (h) { if (h.kind === 'upkeep' && h.nextDue && h.nextDue <= addDays_(d, 7)) add('HouseCards:' + h.id, 'House upkeep: ' + h.title + (h.house ? ' (' + h.house + ')' : '') + ' due ' + h.nextDue); });
  var wx = null, h = get_('Houses', setting_(p + '|house', 'boston'));
  if (h && h.lat) { var w = fetchWx_(+h.lat, +h.lon), wd = w && w.days.filter(function (x) { return x.date === d; })[0];
    if (wd) wx = { place: h.name, high: wd.high, low: wd.low, rainChance: wd.rain, uv: wd.uv, snowInches: wd.snow, familyRules: ruleHits_(wd, mode === 'night' ? 'night' : 'morning', d).map(function (r) { return r.message; }) }; }
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
    'Group routine things: when the school runs are all the usual people and nothing changed, fold them into one short item such as "Usual school runs: Paul drops off, Lina picks up" (ref "") or leave them out on a busy day; spell out any run that changed or has NO ONE SET. Lead with what is different about this day.\n' +
    'Put their own responsibilities first. Mention what someone else is doing only when it affects them (for example who has a pickup, or the other parent being out). Skip routine things that need nothing from them. Combine related candidates into one item when that reads better. ' +
    'Plain words, first names, no emoji, no exclamation marks.  Do not invent anything that is not in the candidates.';
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

// ---------- The Assistant: checking what Claude returns ----------
/** Who can use the Assistant button and "Fill it in": Paul's choice (app|ai.use), just Paul until he adds others. */
function aiUseFor_() { var v = setting_('app|ai.use', 'Paul'); return v === 'none' ? [] : list_(v); }
function hm_(v) { return /^\d{2}:\d{2}$/.test(v || '') && Number(v.slice(0, 2)) < 24 && Number(v.slice(3)) < 60 ? v : ''; }
function one_(v, o) { return o.indexOf(v) >= 0 ? v : ''; }
function names_(v, o) { return list_(v).filter(function (n) { return o.indexOf(n) >= 0; }).join(', '); }
function txt_(v, n) { return String(v || '').trim().slice(0, n || 200); }
function rides_() { return ADULTS.concat(rows_('Caretakers').map(function (c) { return c.name; }), ['Carpool', 'School bus']); }
function kidNames_() { return rows_('People').filter(function (p) { return p.kind === 'kid'; }).map(function (p) { return p.name; }); }
function evClean_(x, t) {
  var people = rows_('People').map(function (p) { return p.name; }), rides = rides_(), cats = ['School', 'Work', 'Kids', 'Family'];
  var e = { title: txt_(x.title, 120), category: one_(x.category, cats) || 'Family', date: isDate_(x.date) ? x.date : t, allDay: x.allDay === '1' || !hm_(x.start) ? '1' : '',
    endDate: isDate_(x.endDate) && x.endDate > x.date ? x.endDate : '', start: hm_(x.start), end: hm_(x.end), people: names_(x.people, people), location: txt_(x.location),
    house: one_(x.house, ['Boston', 'Cape']), dropoff: one_(x.dropoff, rides), pickup: one_(x.pickup, rides), notes: txt_(x.notes, 1000) };
  return e.title ? e : null;
}
function todoClean_(x) {
  var types = rows_('TodoTypes').map(function (y) { return y.id; }), amt = parseFloat(String(x.amount || '').replace(/[$,]/g, ''));
  var rep = /^(\d{1,3}) (day|week|month|year)s?$/.exec(String(x.repeat || '').trim()), n = rep ? Number(rep[1]) : 0;
  var e = { type: one_(x.type, types.length ? types : ['task', 'bill']) || 'task', title: txt_(x.title, 120), amount: isNaN(amt) ? '' : String(Math.round(amt * 100) / 100),
    due: isDate_(x.due) ? x.due : '', assignee: one_(x.assignee, ADULTS), repeat: n ? n + ' ' + rep[2] + (n === 1 ? '' : 's') : '', house: one_(x.house, ['Boston', 'Cape']),
    kid: one_(x.kid, kidNames_()), notes: txt_(x.notes, 1000) };
  if (e.type === 'bill' && !e.amount) e.type = 'task';
  return e.title ? e : null;
}
function actClean_(x) {
  var people = rows_('People').map(function (p) { return p.name; }), rides = rides_(), seen = {};
  var slots = (x.slots || []).map(function (y) { return { day: one_(y.day, DAYS), start: hm_(y.start), end: hm_(y.end) }; })
    .filter(function (y) { if (!y.day || !y.start || seen[y.day]) return false; seen[y.day] = 1; return true; });
  var e = { name: txt_(x.name, 80), kids: names_(x.kids, people), slots: slots, from: isDate_(x.from) ? x.from : '', until: isDate_(x.until) ? x.until : '',
    location: txt_(x.location), teacher: txt_(x.teacher), dropoff: one_(x.dropoff, rides), pickup: one_(x.pickup, rides), house: one_(x.house, ['Boston', 'Cape']), notes: txt_(x.notes, 1000) };
  return e.name && e.kids && slots.length ? e : null;
}
function careClean_(x, t) {
  var e = { task: one_(x.task, ['babysit', 'pick up', 'bring to']) || 'babysit', place: txt_(x.place), kids: names_(x.kids, kidNames_()), date: isDate_(x.date) ? x.date : '',
    start: hm_(x.start), end: hm_(x.end), roster: one_(x.roster, ['Boston', 'Cape']) || 'Boston', notes: txt_(x.notes, 1000) };
  if (e.task !== 'babysit' && !e.place) e.task = 'babysit';
  return e.kids && e.date && e.start && e.end && e.end > e.start ? e : null;
}
function schoolClean_(x) {
  var ids = rows_('Schools').map(function (y) { return y.id; });
  var e = { schoolId: one_(x.schoolId, ids) || (ids.length === 1 ? ids[0] : ''), title: txt_(x.title, 120), kind: one_(x.kind, ['event', 'off', 'half']) || 'event',
    date: isDate_(x.date) ? x.date : '', endDate: isDate_(x.endDate) && x.endDate > x.date ? x.endDate : '', start: hm_(x.start), end: hm_(x.end), notes: txt_(x.notes, 1000) };
  return e.schoolId && e.title && e.date ? e : null;
}
function houseClean_(x) {
  var m = parseInt(x.everyMonths, 10);
  var e = { house: one_(x.house, ['Boston', 'Cape']) || 'Boston', kind: one_(x.kind, ['info', 'upkeep']) || 'info', title: txt_(x.title, 120), body: txt_(x.body, 2000),
    everyMonths: m > 0 && m < 241 ? String(m) : '', nextDue: isDate_(x.nextDue) ? x.nextDue : '' };
  if (e.kind === 'upkeep' && !e.everyMonths) e.everyMonths = '12';
  return e.title ? e : null;
}
var AI_KINDS_ = { events: ['Events', evClean_], todos: ['Todos', todoClean_], activities: ['Activities', actClean_], caretaker: ['Childcare', careClean_], schooldays: ['SchoolCal', schoolClean_], housecards: ['HouseCards', houseClean_] };
/** What the Assistant should create or change. The app saves it through the same steps a person's save takes. */
function aiDo_(b, me) {
  var t = isDate_(b.today) ? b.today : today_(), now = hm_(b.now), S = { type: 'string' }, obj = function (props) {
    var o = { type: 'object', additionalProperties: false, required: Object.keys(props), properties: props }; return o; };
  var str = function (keys) { var o = { ref: S }; keys.forEach(function (k) { o[k] = S; }); return o; };
  var schema = obj({ summary: S, question: S,
    events: { type: 'array', items: obj(str(['title', 'category', 'date', 'allDay', 'endDate', 'start', 'end', 'people', 'location', 'house', 'dropoff', 'pickup', 'notes'])) },
    todos: { type: 'array', items: obj(str(['type', 'title', 'amount', 'due', 'assignee', 'repeat', 'house', 'kid', 'notes'])) },
    activities: { type: 'array', items: obj(Object.assign(str(['name', 'kids', 'from', 'until', 'location', 'teacher', 'dropoff', 'pickup', 'house', 'notes']),
      { slots: { type: 'array', items: obj({ day: { type: 'string', enum: DAYS }, start: S, end: S }) } })) },
    caretaker: { type: 'array', items: obj(str(['task', 'place', 'kids', 'date', 'start', 'end', 'roster', 'notes'])) },
    schooldays: { type: 'array', items: obj(str(['schoolId', 'title', 'kind', 'date', 'endDate', 'start', 'end', 'notes'])) },
    housecards: { type: 'array', items: obj(str(['house', 'kind', 'title', 'body', 'everyMonths', 'nextDue'])) } });
  var fam = rows_('People').map(function (p) { var sc = p.schoolId ? get_('Schools', p.schoolId) : null; return p.name + (p.kind === 'kid' ? ' (kid' + (sc ? ', ' + (sc.short || sc.name) : '') + ')' : ''); });
  var setup = 'Family: ' + fam.join(', ') + '. Caretakers: ' + (rows_('Caretakers').map(function (c) { return c.name; }).join(', ') || 'none') + '. Ride options: ' + rides_().join(', ') + '.\n' +
    'Schools (schoolId: name): ' + (rows_('Schools').map(function (x) { return x.id + ': ' + x.name; }).join('; ') || 'none') + '. To-do types (type id: name): ' + rows_('TodoTypes').map(function (x) { return x.id + ': ' + x.name; }).join('; ') + '. Houses: Boston, Cape.\n' +
    'The person asking is ' + me + ' ("I", "me", "my"). Today is ' + nice_(t) + ' (' + t + ')' + (now ? ', time ' + now : '') + '. They asked from: ' + txt_(b.source || 'the app', 60) + '.\n';
  var rules = 'What each list is for: events = one-time plans; activities = things that repeat weekly (lessons, sports, clubs), with a slot per day; todos = tasks and bills (type "bill" needs an amount; repeat is like "1 month" or "6 months"); ' +
    'caretaker = asking a babysitter or caretaker to babysit, pick up or bring kids somewhere (task: babysit, pick up or bring to; roster: Boston or Cape); schooldays = school calendar entries (kind: off = no school, half = half day with end = dismissal time, event = school is on); housecards = house info or upkeep that repeats every N months.\n' +
    'Dates are YYYY-MM-DD, times 24-hour HH:MM. Work out relative dates from today. Use only names from the lists above. Fill only what is said or clearly implied; use "" for anything else. Never invent details.\n' +
    'For kids\' events and activities, "I\'ll take them" means dropoff is the person asking. ' +
    'If something important is missing (a time, which kid, which school), still make the item with what you know when you can, and ask ONE short, specific question in "question", written to the person asking; otherwise question is "". If you cannot make the item at all without the answer, leave it out and ask.\n' +
    'summary: one short past-tense sentence saying what you did, e.g. "Added Clara\'s piano lessons, Mondays at 8 AM." If the request is not something you can create, make nothing and say in summary what you can do.';
  var content, system;
  if (b.action === 'ai_answer') {
    var req = get_('ai_requests', String(b.id || ''));
    if (!req) return { error: 'That request is gone.' };
    var refs = jsonList_(req.refs), current = refs.map(function (r) { var row = get_(r[0], r[1]); if (!row) return null; var o = { ref: r[0] + ':' + r[1], kind: r[0] };
      cols_(r[0]).forEach(function (k) { if (row[k] && ['id', 'gcal', 'gcalId', 'createdBy', 'created', 'addedBy', 'status', 'source', 'asks', 'confirmedId'].indexOf(k) < 0) o[k] = row[k]; }); return o; }).filter(Boolean);
    system = 'You are the Assistant inside a family\'s home app. Earlier someone asked you to create things, you made them and asked a question. Now they have answered. Revise what you made.\n' + setup + rules +
      '\nInclude only items you change (with their ref copied exactly) and any new items (ref ""). Activities you change must list all their slots. summary: one past-tense sentence saying what you changed.';
    content = 'Their request: ' + req.text + '\nWhat you made (JSON): ' + JSON.stringify(current) + '\nYour question: ' + req.question + '\nTheir answer: ' + txt_(b.answer, 1000);
  } else {
    system = 'You are the Assistant inside a family\'s home app. Someone typed a request; turn it into things to create in the app.\n' + setup + rules + '\nFor new items, ref is "".';
    content = txt_(b.text, 2000);
  }
  var r = claude_(system, content, schema, 'low', 8000);
  if (r.error) return { error: r.nokey ? r.error : 'The assistant is not available right now. ' + r.error };
  if (r.refused || !r.data) return { error: 'The assistant could not help with that.' };
  var d = r.data, items = [], dropped = 0, allowed = {};
  if (b.action === 'ai_answer') jsonList_(get_('ai_requests', String(b.id)).refs).forEach(function (x) { allowed[x[0] + ':' + x[1]] = 1; });
  Object.keys(AI_KINDS_).forEach(function (k) {
    (d[k] || []).forEach(function (x) {
      var tb = AI_KINDS_[k][0], ref = String(x.ref || ''), row = AI_KINDS_[k][1](x, t);
      if (!row) { dropped++; return; }
      if (ref && !(allowed[ref] && ref.split(':')[0] === tb)) { dropped++; return; }   // only items this request made can be changed
      var id = ref ? ref.split(':').slice(1).join(':') : '';
      items.push({ t: tb, id: id, row: row });
    });
  });
  return { summary: txt_(d.summary, 300), question: txt_(d.question, 300), items: items, dropped: dropped };
}
// ---------- The Assistant reads conversations ----------
function aiConvoSafe_(t, manual) { try { return aiConvo_(t, manual); } catch (e) { console.error(e); return { error: String(e && e.message || e) }; } }
/** When a conversation in the app settles a plan, the Assistant adds it. Calls Claude only when something new was said. */
function aiConvo_(t, manual) {
  var last = setting_('app|ai.convoLast', ''), since = addDays_(t, -3), people = rows_('People');
  var cmt = rows_('Comments').filter(function (c) { return c.system !== '1' && c.time >= since; });
  var threads = rows_('Messages').filter(function (m) { return !/^(tradition|again)/.test(m.ref || '') && (m.time >= since || cmt.some(function (c) { return c.table === 'Messages' && c.ref === m.id; })); }).map(function (m) {
    var cs = cmt.filter(function (c) { return c.table === 'Messages' && c.ref === m.id; }), newest = [m.time].concat(cs.map(function (c) { return c.time; })).sort().pop();
    return { id: m.id, time: m.time, from: m.from, text: m.text, asked: m.kind === 'question' ? (m.tags || 'the other parent') : '', answerKind: m.kind === 'question' ? m.answerType : '', isNew: newest > last,
      replies: cs.map(function (c) { return { who: c.who, time: c.time, text: c.system === 'answer' && m.answerType === 'time' ? t12_(c.text) : c.text, isAnswer: c.system === 'answer' }; }) };
  });
  if (!threads.some(function (x) { return x.isNew; })) return { actions: [] };
  put_('Settings', { id: 'app|ai.convoLast', value: now_() });
  var runs = []; for (var i = 0; i < 4; i++) { var dd = addDays_(t, i); schoolRuns_(dd).forEach(function (r) { runs.push({ key: r.sid + '|' + dd + '|' + r.kind, what: nice_(dd) + ' ' + runLine_(r) }); }); }
  var plan = rows_('Events').filter(function (e) { return e.date >= t && e.date <= addDays_(t, 14); }).map(function (e) { return e.date + ' ' + (e.start || 'all day') + ' ' + evName_(e) + (e.people ? ' (' + e.people + ')' : ''); })
    .concat(rows_('Todos').filter(function (x) { return x.status !== 'Done'; }).slice(0, 40).map(function (x) { return 'To-do: ' + x.title + (x.assignee ? ' (' + x.assignee + ')' : ''); }));
  var done = rows_('ai_requests').filter(function (q) { return q.source === 'Conversation' && q.time >= since; }).map(function (q) { return q.summary; });
  var dinners = []; for (var di = 0; di < 4; di++) { var dd2 = addDays_(t, di), mm = get_('Menus', monday_(dd2) + '-' + DAYS[dow_(dd2)]); dinners.push({ date: dd2, dinner: mm ? (dishName_(mm) || 'nothing planned') : 'nothing planned', cook: mm && mm.cook || '', notHome: mm && mm.away || '' }); }
  var myPosts = rows_('Activity').filter(function (a) { return a.type === 'ai' && !a.stack && a.state !== 'cleared' && a.time >= since; }).map(function (a) { return { id: a.id, kind: 'note', text: a.text }; })
    .concat(rows_('ai_requests').filter(function (q) { return q.status === 'question'; }).map(function (q) { return { id: q.id, kind: 'question', askedOf: q.who, question: q.question }; }));
  var S = { type: 'string' }, o = function (props) { return { type: 'object', additionalProperties: false, required: Object.keys(props), properties: props }; },
      strs = function (keys) { var x = {}; keys.forEach(function (k) { x[k] = S; }); return x; };
  var schema = o({ actions: { type: 'array', items: o({ thread_id: S, summary: S, forPerson: S,
    events: { type: 'array', items: o(strs(['title', 'category', 'date', 'allDay', 'endDate', 'start', 'end', 'people', 'location', 'house', 'dropoff', 'pickup', 'notes'])) },
    todos: { type: 'array', items: o(strs(['type', 'title', 'amount', 'due', 'assignee', 'repeat', 'house', 'kid', 'notes'])) },
    schoolRuns: { type: 'array', items: o({ key: S, who: S }) },
    dinners: { type: 'array', items: o({ date: S, cook: S, away: S }) }, resolves: { type: 'array', items: S } }) } });
  var system = 'You are the Assistant inside a family\'s home app. You read the family\'s recent conversations in the app (posts, replies, and answers to question posts). ' +
    'When a conversation settles a concrete plan that is not already in the app, add it so nobody has to type it in. Examples: asked "What time are you coming home today?" and Paul answered 6:30 PM: add an event "Paul home" today at 18:30 with people Paul, category Family. ' +
    'Asked "Are you picking the kids up?" and the answer was Yes: set that school run (from schoolRuns, by key) to the person who answered. Someone agreed to buy or do something: add a to-do for them.\n' +
    'Only act on things that were clearly answered or agreed, in threads marked isNew. Never act on open questions, maybes or jokes. Never duplicate anything in "plan" or "alreadyAdded". Most of the time return no actions.\n' +
    'Dinners: when someone says they are making dinner (or taking tonight, or answers who is cooking), add a dinners entry with that date and cook set to them ("away" is a name only if someone says they will not be home for dinner; otherwise ""). Use dates from "dinners".\n' +
    '"myPosts" are notes and questions you posted earlier. When a thread answers or settles one of them, put its id in resolves so it can be cleared from the Feed, even if nothing needs adding to the plan.\n' +
    'Family: ' + people.map(function (p) { return p.name + (p.kind === 'kid' ? ' (kid)' : ''); }).join(', ') + '. Ride options: ' + rides_().join(', ') + '. Today is ' + nice_(t) + ' (' + t + '), time ' + now_().slice(11, 16) + '. ' +
    'Dates are YYYY-MM-DD, times 24-hour HH:MM; "today" in a thread means the day it was written. One action per thread: summary is one short past-tense sentence ("Added Paul home at 6:30 PM today."), forPerson is the person the plan is about (a name from the family, or ""). Use "" for anything not said.';
  var r = claude_(system, JSON.stringify({ threads: threads, schoolRuns: runs, plan: plan, dinners: dinners, myPosts: myPosts, alreadyAdded: done }), schema, 'low');
  if (r.error || r.refused || !r.data) return { error: r.error || 'declined' };
  var out = [], keys = {}; runs.forEach(function (x) { keys[x.key] = 1; });
  (r.data.actions || []).forEach(function (a) {
    var th = threads.filter(function (x) { return x.id === a.thread_id; })[0]; if (!th || !th.isNew) return;
    var ops = [], refs = [];
    (a.events || []).forEach(function (x) { var e = evClean_(x, t); if (e) { e.id = id_(); ops.push({ t: 'Events', row: e }); refs.push(['Events', e.id]); } });
    (a.todos || []).forEach(function (x) { var e = todoClean_(x); if (e) { e.id = id_(); e.status = 'Open'; if (!e.due) e.due = addDays_(t, 7); ops.push({ t: 'Todos', row: e }); refs.push(['Todos', e.id]); } });
    (a.schoolRuns || []).forEach(function (x) { if (!keys[x.key] || rides_().indexOf(x.who) < 0) return; var k = x.key.split('|'), ref = 'school:' + k[0] + '|' + k[2];
      var ov = rows_('Overrides').filter(function (y) { return y.ref === ref && y.date === k[1]; })[0], row = { id: ov ? ov.id : id_(), ref: ref, date: k[1], pickup: x.who, dropoff: '', cancelled: '' };
      ops.push({ t: 'Overrides', row: row }); refs.push(['Overrides', row.id]); });
    var mine = {}; myPosts.forEach(function (x) { mine[x.id] = x.kind; });
    (a.resolves || []).forEach(function (rid) { if (mine[rid] === 'note') put_('Activity', { id: rid, state: 'cleared' }); else if (mine[rid] === 'question') put_('ai_requests', { id: rid, status: 'cleared' }); });
    (a.dinners || []).forEach(function (x) { if (!isDate_(x.date) || x.date < t || x.date > addDays_(t, 7)) return; var cook = one_(x.cook, ADULTS), away = one_(x.away, ADULTS); if (!cook && !away) return;
      var mid = monday_(x.date) + '-' + DAYS[dow_(x.date)], mrow = get_('Menus', mid); if (!mrow) { weekAdd_(monday_(x.date)); mrow = get_('Menus', mid); } if (!mrow) return;
      var upd = { id: mid }; if (cook) upd.cook = cook; if (away) upd.away = away; ops.push({ t: 'Menus', row: upd }); refs.push(['Menus', mid]); });
    if (!ops.length) return;
    write_({ ops: ops }, 'Assistant');
    var snippet = th.from + ': ' + th.text + th.replies.slice(-2).map(function (c) { return ' / ' + c.who + ': ' + c.text; }).join('');
    put_('ai_requests', { id: id_(), time: now_(), who: one_(a.forPerson, people.map(function (p) { return p.name; })) || th.from, text: snippet.slice(0, 500), source: 'Conversation', status: 'done', summary: txt_(a.summary, 300), question: '', answer: '', refs: JSON.stringify(refs) });
    ADULTS.forEach(function (p) { if (pref_(p, 'ai')) notify_(p, 'Assistant', txt_(a.summary, 300)); });
    out.push(a.summary);
  });
  return { actions: out };
}
function jsonList_(s) { try { var a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }

// ---------- New event by description ----------
function aiEvent_(text, t, now, me) {
  var people = rows_('People').map(function (p) { return p.name; }), rides = ADULTS.concat(rows_('Caretakers').map(function (c) { return c.name; }), ['Carpool', 'School bus']);
  var houses = ['Boston', 'Cape'], cats = ['School', 'Work', 'Kids', 'Family'];
  var system = 'You turn one sentence into a calendar event for a family home app. The family: ' + rows_('People').map(function (p) { return p.name + (p.kind === 'kid' ? ' (kid)' : ''); }).join(', ') + '. ' +
    'The person typing is ' + me + ' ("I", "me"). Today is ' + nice_(t) + ' (' + t + ')' + (now ? ', time ' + now : '') + '. Work out relative dates ("next Tuesday", "the 4th") from today; dates are YYYY-MM-DD and times are 24-hour HH:MM.\n' +
    'Fill every field, using "" when the sentence does not say and you cannot reasonably infer it. title: short, like "Dentist" or "Clara\'s recital"; do not repeat the date or time in it. ' +
    'category: Kids for anything a kid goes to or needs a ride to, School for school events (conferences, school concerts, days off), Work for work, otherwise Family. ' +
    'allDay "1" only when there is no time. end: the end time if given, otherwise "". endDate only for a multi-day all-day event. people: comma-separated names from the family list only. ' +
    'house: Boston or Cape only if the sentence says so. dropoff and pickup (only for Kids events with a time): one of ' + rides.join(', ') + '; "I" means ' + me + '; if one person takes them and nothing else is said, set dropoff only. ' +
    'notes: anything useful left over (what to bring, a phone number), else "". Never invent details.';
  var str = { type: 'string' }, schema = { type: 'object', additionalProperties: false,
    required: ['title', 'category', 'date', 'allDay', 'endDate', 'start', 'end', 'people', 'location', 'house', 'dropoff', 'pickup', 'notes'],
    properties: { title: str, category: { type: 'string', enum: cats }, date: str, allDay: { type: 'string', enum: ['1', ''] }, endDate: str, start: str, end: str, people: str, location: str, house: str, dropoff: str, pickup: str, notes: str } };
  var r = claude_(system, text, schema, 'low');
  if (r.error) return { ok: false, error: r.nokey ? r.error : 'The assistant is not available right now. ' + r.error };
  if (r.refused || !r.data) return { event: null };
  var e = evClean_(r.data, t);
  if (!e) return { event: null };
  return { event: e };
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
    ruleHits_(w && w.days[offset], when, addDays_(today_(), offset)).forEach(function (r) { if (r.push === '1') notify_(p, r.message, (offset ? 'Tomorrow' : 'Today') + ' at ' + h.name, r.urgent === '1'); });
  });
}

// ---------- Sheet menu ----------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Family app')
    .addItem('Link recipe ingredients', 'linkIngredients')
    .addItem('Set up / repair tabs', 'setup')
    .addItem('Copy everything to the calendar', 'copyAllToCalendar')
    .addItem('Refresh the app\'s copy', 'refreshAppCopy')
    .addSeparator()
    .addItem('Run the assistant now (Feed notes)', 'menuAiNotes')
    .addItem('Write AI Today cards now', 'menuAiCards')
    .addItem('Add a sample stacked post', 'menuStackDemo')
    .addItem('Add a sample school post', 'menuSourceDemo')
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
    { id: 'question', name: 'App question', emoji: '', assignee: '', builtin: '1', fields: '' },
    { id: 'paycare', name: 'Pay caretaker', emoji: '', assignee: 'Paul', builtin: '1', fields: 'amount' }]);
  seed('WeatherRules', [
    { metric: 'rain', op: '>', threshold: '50', message: 'Send kids with rain gear', when: 'night', push: '1', urgent: '', enabled: '1', school: '1' },
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
