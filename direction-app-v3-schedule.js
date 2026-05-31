/* ===== DIRECTION BOARD v3 — Schedule / Gantt =====
 *  ファイル構成:
 *  direction-app-v3.js      … 状態管理・ヒアリングデータ・保存/出力・スライド・プロジェクト管理
 *  direction-app-v3-tools.js … アクセシビリティ・言語イメージスケール・ヒアリングUI
 *  direction-app-v3-schedule.js … スケジュール・ガントチャート (当ファイル)
 * ================================================= */

const SCH_DAY_W  = 20;   // px per day
const SCH_LBL_W  = 185;  // px for left label column
const SCH_ROW_H  = 34;   // px per task row
const SCH_GRP_H  = 54;   // px per group header (2 rows)
const SCH_MON_H  = 26;   // px for month header
const SCH_WK_H   = 22;   // px for week header
const SCH_MIN_WK = 14;   // minimum weeks to display

// ─── Preset templates ───────────────────────────────────────
const SCH_PRESETS = {
  'Webサイト制作': [
    { name: 'スケジュール共有・要件定義', type: 'production', d: 0,  dur: 5  },
    { name: 'ワイヤーフレーム作成',       type: 'production', d: 5,  dur: 14, ms: 'ワイヤーレビュー' },
    { name: 'ワイヤーレビュー',           type: 'client',     d: 19, dur: 5  },
    { name: 'キービジュアル作成',         type: 'production', d: 24, dur: 7  },
    { name: 'TOPデザイン（PC）',          type: 'production', d: 24, dur: 14, ms: 'デザインレビュー' },
    { name: 'TOPデザイン（SP）',          type: 'production', d: 31, dur: 10 },
    { name: 'デザインレビュー',           type: 'client',     d: 45, dur: 5  },
    { name: '下層ページデザイン',         type: 'production', d: 50, dur: 21, ms: '下層レビュー' },
    { name: '下層レビュー',               type: 'client',     d: 71, dur: 5  },
    { name: '環境構築',                   type: 'production', d: 50, dur: 7  },
    { name: 'コーディング',               type: 'production', d: 55, dur: 35 },
    { name: '最終確認・修正対応',         type: 'client',     d: 85, dur: 5  },
    { name: '公開作業',                   type: 'production', d: 90, dur: 2,  ms: '公開' },
  ],
  'LP制作': [
    { name: 'ヒアリング・要件整理',       type: 'production', d: 0,  dur: 3  },
    { name: 'ワイヤーフレーム',           type: 'production', d: 3,  dur: 7,  ms: 'ワイヤーレビュー' },
    { name: 'ワイヤーレビュー',           type: 'client',     d: 10, dur: 3  },
    { name: 'デザイン（PC）',             type: 'production', d: 13, dur: 10, ms: 'デザインレビュー' },
    { name: 'デザイン（SP）',             type: 'production', d: 18, dur: 7  },
    { name: 'デザインレビュー',           type: 'client',     d: 25, dur: 3  },
    { name: 'コーディング',               type: 'production', d: 28, dur: 14 },
    { name: '最終確認',                   type: 'client',     d: 42, dur: 3  },
    { name: '公開',                       type: 'production', d: 45, dur: 1,  ms: '公開' },
  ],
  'バナー制作': [
    { name: '素材・テキスト収集',         type: 'client',     d: 0,  dur: 3  },
    { name: 'デザイン案作成',             type: 'production', d: 3,  dur: 5,  ms: 'レビュー' },
    { name: 'レビュー',                   type: 'client',     d: 8,  dur: 3  },
    { name: '修正・納品',                 type: 'production', d: 11, dur: 2  },
  ],
  'チラシ制作': [
    { name: '素材・テキスト・画像収集',   type: 'client',     d: 0,  dur: 3  },
    { name: '構成・レイアウト案作成',     type: 'production', d: 3,  dur: 5,  ms: '初稿レビュー' },
    { name: '初稿レビュー',               type: 'client',     d: 8,  dur: 3  },
    { name: 'デザイン修正・表裏制作',     type: 'production', d: 11, dur: 5,  ms: '最終確認' },
    { name: '最終確認',                   type: 'client',     d: 16, dur: 2  },
    { name: '印刷データ入稿',             type: 'production', d: 18, dur: 2,  ms: '入稿' },
  ],
};

// ─── Utility ────────────────────────────────────────────────
function schUid()       { return 'sch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6); }
function schToDate(str) { return new Date(str + 'T00:00:00'); }
function schToStr(date) { return date.toISOString().slice(0, 10); }
function schDiff(a, b)  { return Math.round((schToDate(b) - schToDate(a)) / 86400000); }
function schAdd(str, n) { const d = schToDate(str); d.setDate(d.getDate() + n); return schToStr(d); }

// ─── カレンダー週ベースのヘッダー計算 ───────────────────────
// 月〜日を1週間とし、月をまたぐ週は月ごとに分割する。
// 返り値:
//   monthCells : [{month, year, days}]   ← 実際の暦日数
//   weekCells  : [{weekNum, month, year, days, mondayStr}]
function calcGanttHeaders(kickoffStr, totalDays) {
  const kickoff    = schToDate(kickoffStr);
  const monthCells = [];
  const weekCells  = [];

  for (let day = 0; day < totalDays; day++) {
    const d = new Date(kickoff.getTime());
    d.setDate(d.getDate() + day);

    const month = d.getMonth() + 1;
    const year  = d.getFullYear();

    // この日が属するカレンダー週の月曜日
    const dow = (d.getDay() + 6) % 7;  // 0=月 … 6=日
    const monday = new Date(d.getTime());
    monday.setDate(d.getDate() - dow);
    const mondayStr = schToStr(monday);

    // 月セル: 同じ年月なら加算、違えば新規
    if (monthCells.length
        && monthCells[monthCells.length - 1].month === month
        && monthCells[monthCells.length - 1].year  === year) {
      monthCells[monthCells.length - 1].days++;
    } else {
      monthCells.push({ month, year, days: 1 });
    }

    // 週セル: カレンダー週が変わる OR 月が変わるときに新規作成
    const last = weekCells[weekCells.length - 1];
    const needNew = !last
      || last.mondayStr !== mondayStr
      || last.month !== month;

    if (needNew) {
      // その月の1日が属するカレンダー週の月曜日を求め、
      // 何週目かを「月曜日の差分÷7」で計算する
      const firstOfMonth = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00`);
      const dowFirst = (firstOfMonth.getDay() + 6) % 7;
      const firstMonday = new Date(firstOfMonth.getTime());
      firstMonday.setDate(1 - dowFirst);
      const weekNum = Math.round((monday.getTime() - firstMonday.getTime()) / (7 * 86400000)) + 1;

      weekCells.push({ mondayStr, month, year, weekNum, days: 1 });
    } else {
      last.days++;
    }
  }

  return { monthCells, weekCells };
}

// ─── Init ───────────────────────────────────────────────────
function initSchedule() {
  if (!S.schedule) S.schedule = { kickoff: '', groups: [] };
  const el = document.getElementById('sch-kickoff');
  if (el) {
    if (!S.schedule.kickoff) S.schedule.kickoff = v('date_kickoff') || '';
    el.value = S.schedule.kickoff;
  }
  renderGantt();
}

function onSchKickoffChange(val) {
  S.schedule.kickoff = val;
  renderGantt();
}

// ─── Render ─────────────────────────────────────────────────
function renderGantt() {
  const wrap = document.getElementById('gantt-wrap');
  if (!wrap) return;

  const kickoff = S.schedule?.kickoff;
  const groups  = S.schedule?.groups || [];

  if (!kickoff) {
    wrap.innerHTML = `<div style="padding:52px 24px;text-align:center;color:var(--text3)">
      <div style="font-size:36px;margin-bottom:10px">📅</div>
      <div style="font-size:13px">キックオフ日を入力するとガントチャートが表示されます</div>
    </div>`;
    return;
  }

  // Calc total days
  let maxDay = SCH_MIN_WK * 7;
  groups.forEach(g => (g.tasks || []).forEach(t => {
    const ed = schDiff(kickoff, t.end) + 7;
    if (ed > maxDay) maxDay = ed;
  }));
  const totalDays = maxDay;
  const totalW    = totalDays * SCH_DAY_W;

  // カレンダー週ベースでヘッダーセルを計算
  const { monthCells, weekCells } = calcGanttHeaders(kickoff, totalDays);

  // Today
  const todayStr    = schToStr(new Date());
  const todayOffset = schDiff(kickoff, todayStr);
  const showToday   = todayOffset >= 0 && todayOffset <= totalDays;
  const todayPx     = todayOffset * SCH_DAY_W;

  // ── HTML build ──
  let html = `<div class="gantt-inner" style="min-width:${SCH_LBL_W + totalW + 2}px">`;

  // Month header — 実際の暦日数ベースで幅を計算
  html += `<div class="gantt-row gantt-head-month">
    <div class="gantt-lbl gantt-corner" style="height:${SCH_MON_H}px"></div>
    <div class="gantt-bars" style="display:flex;height:${SCH_MON_H}px">
      ${monthCells.map(m => `<div class="gantt-month-cell" style="width:${m.days * SCH_DAY_W}px">${m.month}月</div>`).join('')}
    </div>
  </div>`;

  // Week header — カレンダー週ベース、月境界で分割
  const todayWkHtml = showToday
    ? `<div class="gantt-today-marker" style="left:${todayPx}px"><span class="gantt-today-lbl">🐢 今ここ</span><div class="gantt-today-line" style="height:${SCH_WK_H}px"></div></div>`
    : '';
  html += `<div class="gantt-row gantt-head-week">
    <div class="gantt-lbl gantt-corner" style="height:${SCH_WK_H}px;font-size:10px;color:var(--text3)">グループ / タスク</div>
    <div class="gantt-bars" style="display:flex;position:relative;height:${SCH_WK_H}px">
      ${weekCells.map(wk => `<div class="gantt-week-cell" style="width:${wk.days * SCH_DAY_W}px">w${wk.weekNum}</div>`).join('')}
      ${todayWkHtml}
    </div>
  </div>`;

  // Empty state
  if (groups.length === 0) {
    html += `<div class="gantt-row" style="height:80px">
      <div class="gantt-lbl"></div>
      <div class="gantt-bars" style="display:flex;align-items:center;padding-left:16px;color:var(--text3);font-size:12px">
        「＋ グループ追加」からグループとタスクを追加してください
      </div>
    </div>`;
  }

  groups.forEach(group => {
    const tasks      = group.tasks || [];
    const grpDate    = group.startDate || kickoff;

    // Group header — row 1: name + delete; row 2: date input + add task
    html += `<div class="gantt-row gantt-group-row">
      <div class="gantt-lbl gantt-group-lbl" style="height:${SCH_GRP_H}px;flex-direction:column;align-items:stretch;padding:6px 8px;gap:4px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:4px">
          <span class="gantt-grp-handle" onmousedown="schGrpDragStart(event,'${group.id}')" title="ドラッグして並び替え">⠿</span>
          <span class="gantt-group-name">${esc(group.name)}</span>
          <button class="gantt-mini-btn gantt-del-btn" onclick="schDeleteGroup('${group.id}')" title="グループを削除">×</button>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="date" class="gantt-grp-date" value="${grpDate}"
            onchange="schShiftGroup('${group.id}',this.value)"
            title="グループ開始日（変更すると全タスクが連動します）">
          <button class="gantt-mini-btn" onclick="openSchModal('${group.id}',null)" title="タスクを追加">＋</button>
        </div>
      </div>
      <div class="gantt-bars" style="position:relative;height:${SCH_GRP_H}px">
        ${schGrid(weekCells, SCH_GRP_H)}
        ${showToday ? schTodayLine(todayPx, SCH_GRP_H) : ''}
      </div>
    </div>`;

    // Task rows
    if (tasks.length === 0) {
      html += `<div class="gantt-row">
        <div class="gantt-lbl gantt-task-lbl" style="height:${SCH_ROW_H}px;padding-left:22px;color:var(--text3);font-size:11px">タスクなし</div>
        <div class="gantt-bars" style="position:relative;height:${SCH_ROW_H}px">
          ${schGrid(weekCells, SCH_ROW_H)}
          ${showToday ? schTodayLine(todayPx, SCH_ROW_H) : ''}
        </div>
      </div>`;
    }

    tasks.forEach(task => {
      const sDay   = Math.max(0, schDiff(kickoff, task.start));
      const eDay   = Math.max(sDay + 1, schDiff(kickoff, task.end));
      const barL   = sDay * SCH_DAY_W;
      const barW   = Math.max(SCH_DAY_W, (eDay - sDay) * SCH_DAY_W);
      const isProd = task.type === 'production';
      const msHtml = task.milestone
        ? `<div class="gantt-milestone" style="left:${eDay * SCH_DAY_W - 2}px"><span>⭐</span><span class="gantt-ms-lbl">${esc(task.milestone)}</span></div>`
        : '';

      const isDone  = task.status === '完了';
      const isWip   = task.status === '対応中';
      const stsBadge = isDone ? '<span class="gantt-sts sts-done">完了</span>'
                     : isWip  ? '<span class="gantt-sts sts-wip">対応中</span>' : '';
      const tipText = `${schFmtD(task.start)} 〜 ${schFmtD(task.end)}`;

      html += `<div class="gantt-row gantt-task-row">
        <div class="gantt-lbl gantt-task-lbl" style="height:${SCH_ROW_H}px">
          <span class="gantt-type-dot ${isProd ? 'dot-prod' : 'dot-client'}"></span>
          <span class="gantt-task-name-lbl" title="${esc(task.name)}">${esc(task.name)}</span>
          ${stsBadge}
          <button class="gantt-edit-btn" onclick="openSchModal('${group.id}','${task.id}')">✎</button>
        </div>
        <div class="gantt-bars" style="position:relative;height:${SCH_ROW_H}px">
          ${schGrid(weekCells, SCH_ROW_H)}
          ${showToday ? schTodayLine(todayPx, SCH_ROW_H) : ''}
          <div class="gantt-bar ${isProd ? 'gantt-bar-prod' : 'gantt-bar-client'}${isDone ? ' gantt-bar-done' : ''}"
            data-gid="${group.id}" data-tid="${task.id}" data-status="${esc(task.status || '未対応')}"
            style="left:${barL}px;width:${barW}px;top:5px;height:${SCH_ROW_H - 10}px;cursor:grab"
            onmousedown="schDragStart(event,this)"
            onmousemove="schDragCursor(event,this);schMoveTip(event)"
            onmouseenter="schShowTip(event,'${tipText}')"
            onmouseleave="schHideTip()">
            <span class="gantt-bar-txt">${esc(task.name)}</span>
          </div>
          ${msHtml}
        </div>
      </div>`;
    });
  });

  html += `</div>`;
  wrap.innerHTML = html;
}

// ─── Group reorder drag ──────────────────────────────────────
let _grpDrag = null;

function schGrpDragStart(e, groupId) {
  if (_drag) return;  // タスクバードラッグ中は無視
  e.preventDefault();
  e.stopPropagation();
  schHideTip();
  const idx = (S.schedule.groups || []).findIndex(g => g.id === groupId);
  if (idx < 0) return;
  _grpDrag = { groupId, fromIdx: idx, toIdx: idx };
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'grabbing';
  document.addEventListener('mousemove', schGrpDragMove);
  document.addEventListener('mouseup',   schGrpDragEnd);
  _schGrpVisual();
}

function schGrpDragMove(e) {
  if (!_grpDrag) return;
  const rows = [...document.querySelectorAll('.gantt-group-row')];
  let to = 0;
  rows.forEach((row, i) => {
    const r = row.getBoundingClientRect();
    if (e.clientY > r.top + r.height / 2) to = i + 1;
  });
  _grpDrag.toIdx = Math.min(to, rows.length);
  _schGrpVisual();
}

function _schGrpVisual() {
  const rows = [...document.querySelectorAll('.gantt-group-row')];
  const { fromIdx, toIdx } = _grpDrag;
  rows.forEach((row, i) => {
    row.classList.toggle('gantt-grp-dragging', i === fromIdx);
    row.classList.remove('gantt-grp-drag-top', 'gantt-grp-drag-bottom');
  });
  // ドロップ先インジケーター（fromIdx/fromIdx+1 は「変化なし」なので非表示）
  const noMove = toIdx === fromIdx || toIdx === fromIdx + 1;
  if (!noMove) {
    if (toIdx < rows.length) rows[toIdx].classList.add('gantt-grp-drag-top');
    else rows[rows.length - 1].classList.add('gantt-grp-drag-bottom');
  }
}

function schGrpDragEnd() {
  if (!_grpDrag) return;
  document.removeEventListener('mousemove', schGrpDragMove);
  document.removeEventListener('mouseup',   schGrpDragEnd);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  const { fromIdx, toIdx } = _grpDrag;
  _grpDrag = null;
  document.querySelectorAll('.gantt-group-row').forEach(row => {
    row.classList.remove('gantt-grp-dragging', 'gantt-grp-drag-top', 'gantt-grp-drag-bottom');
  });
  const noMove = toIdx === fromIdx || toIdx === fromIdx + 1;
  if (!noMove) {
    const groups = S.schedule.groups;
    const [moved] = groups.splice(fromIdx, 1);
    groups.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, moved);
    renderGantt();
    showToast('グループを並び替えました');
  }
}

// ─── Tooltip ────────────────────────────────────────────────
const DOW_JA = ['日', '月', '火', '水', '木', '金', '土'];
function schFmtD(s) {
  const d = schToDate(s);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}（${DOW_JA[d.getDay()]}）`;
}
function _schTipEl() {
  let el = document.getElementById('gantt-tip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gantt-tip';
    el.style.cssText = 'display:none;position:fixed;z-index:9999;pointer-events:none;background:rgba(20,20,20,.88);color:#fff;font-size:11px;padding:5px 11px;border-radius:6px;white-space:nowrap;font-family:\'Noto Sans JP\',sans-serif;line-height:1.5';
    document.body.appendChild(el);
  }
  return el;
}
function schShowTip(e, text) {
  const el = _schTipEl();
  el.textContent = text;
  el.style.display = 'block';
  schMoveTip(e);
}
function schMoveTip(e) {
  const el = document.getElementById('gantt-tip');
  if (!el || el.style.display === 'none') return;
  el.style.left = (e.clientX + 14) + 'px';
  el.style.top  = (e.clientY - 42) + 'px';
}
function schHideTip() {
  const el = document.getElementById('gantt-tip');
  if (el) el.style.display = 'none';
}

function schGrid(weekCells, h) {
  let pos = 0;
  const lines = weekCells.map(cell => {
    const px = pos * SCH_DAY_W;
    pos += cell.days;
    return `<div class="gantt-grid-line" style="left:${px}px;height:${h}px"></div>`;
  });
  lines.push(`<div class="gantt-grid-line" style="left:${pos * SCH_DAY_W}px;height:${h}px"></div>`);
  return lines.join('');
}
function schTodayLine(px, h) {
  return `<div class="gantt-today-line" style="left:${px}px;height:${h}px"></div>`;
}

// ─── Group shift (date input → move all tasks) ───────────────
function schShiftGroup(groupId, newDate) {
  const group = (S.schedule.groups || []).find(g => g.id === groupId);
  if (!group) return;
  const oldDate = group.startDate || S.schedule.kickoff;
  if (!oldDate || oldDate === newDate) { group.startDate = newDate; return; }
  const delta = schDiff(oldDate, newDate);
  group.startDate = newDate;
  (group.tasks || []).forEach(t => {
    t.start = schAdd(t.start, delta);
    t.end   = schAdd(t.end,   delta);
  });
  renderGantt();
  showToast(`全タスクを${Math.abs(delta)}日${delta > 0 ? '後' : '前'}にシフトしました`);
}

// ─── Drag ───────────────────────────────────────────────────
let _drag = null;

function schDragCursor(e, el) {
  if (_drag) return;
  const relX = e.clientX - el.getBoundingClientRect().left;
  el.style.cursor = (relX < 8 || relX > el.offsetWidth - 8) ? 'ew-resize' : 'grab';
}

function schDragStart(e, el) {
  e.preventDefault();
  schHideTip();
  const relX    = e.clientX - el.getBoundingClientRect().left;
  const mode    = relX < 8 ? 'left' : relX > el.offsetWidth - 8 ? 'right' : 'move';
  const groupId = el.dataset.gid;
  const taskId  = el.dataset.tid;
  const group   = (S.schedule.groups || []).find(g => g.id === groupId);
  const task    = (group?.tasks || []).find(t => t.id === taskId);
  if (!task) return;

  _drag = { el, mode, groupId, taskId, startX: e.clientX,
            origStart: task.start, origEnd: task.end,
            moved: false, pendingStart: null, pendingEnd: null };

  document.body.style.userSelect = 'none';
  document.body.style.cursor     = mode === 'move' ? 'grabbing' : 'ew-resize';
  document.addEventListener('mousemove', schDragMove);
  document.addEventListener('mouseup',   schDragEnd);
}

function schDragMove(e) {
  if (!_drag) return;
  const dx    = e.clientX - _drag.startX;
  if (Math.abs(dx) < 3) return;
  _drag.moved = true;

  const days = Math.round(dx / SCH_DAY_W);
  let ns = _drag.origStart, ne = _drag.origEnd;

  if (_drag.mode === 'move') {
    ns = schAdd(_drag.origStart, days);
    ne = schAdd(_drag.origEnd,   days);
  } else if (_drag.mode === 'left') {
    ns = schAdd(_drag.origStart, days);
    if (ns >= _drag.origEnd) ns = schAdd(_drag.origEnd, -1);
  } else {
    ne = schAdd(_drag.origEnd, days);
    if (ne <= _drag.origStart) ne = schAdd(_drag.origStart, 1);
  }

  _drag.pendingStart = ns;
  _drag.pendingEnd   = ne;

  // Update bar position visually without re-render
  const kick = S.schedule.kickoff;
  const sDay = Math.max(0, schDiff(kick, ns));
  const eDay = Math.max(sDay + 1, schDiff(kick, ne));
  _drag.el.style.left  = sDay * SCH_DAY_W + 'px';
  _drag.el.style.width = Math.max(SCH_DAY_W, (eDay - sDay) * SCH_DAY_W) + 'px';
}

function schDragEnd() {
  if (!_drag) return;
  document.removeEventListener('mousemove', schDragMove);
  document.removeEventListener('mouseup',   schDragEnd);
  document.body.style.userSelect = '';
  document.body.style.cursor     = '';

  if (_drag.moved && _drag.pendingStart) {
    const group = (S.schedule.groups || []).find(g => g.id === _drag.groupId);
    const task  = (group?.tasks || []).find(t => t.id === _drag.taskId);
    if (task) {
      task.start = _drag.pendingStart;
      task.end   = _drag.pendingEnd;
    }
    _drag = null;
    renderGantt();
  } else {
    // Treated as click → open modal
    const { groupId, taskId } = _drag;
    _drag = null;
    openSchModal(groupId, taskId);
  }
}

// ─── Task modal ─────────────────────────────────────────────
let _schModal = { groupId: null, taskId: null };

function openSchModal(groupId, taskId) {
  _schModal = { groupId, taskId };
  const group = (S.schedule.groups || []).find(g => g.id === groupId);
  const task  = taskId ? (group?.tasks || []).find(t => t.id === taskId) : null;
  const kick  = S.schedule.kickoff || schToStr(new Date());

  document.getElementById('sch-task-name').value   = task?.name      || '';
  document.getElementById('sch-task-type').value   = task?.type      || 'production';
  document.getElementById('sch-task-status').value = task?.status    || '未対応';
  document.getElementById('sch-task-start').value  = task?.start     || kick;
  document.getElementById('sch-task-end').value    = task?.end       || schAdd(kick, 7);
  document.getElementById('sch-task-ms').value     = task?.milestone || '';
  document.getElementById('sch-modal-title').textContent = taskId ? 'タスクを編集' : 'タスクを追加';
  document.getElementById('sch-delete-btn').style.display = taskId ? '' : 'none';
  document.getElementById('sch-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('sch-task-name').focus(), 50);
}

function closeSchModal() { document.getElementById('sch-modal').style.display = 'none'; }

function saveSchModal() {
  const name = document.getElementById('sch-task-name').value.trim();
  if (!name) { showToast('タスク名を入力してください'); return; }
  const data = {
    name,
    type:      document.getElementById('sch-task-type').value,
    status:    document.getElementById('sch-task-status').value,
    start:     document.getElementById('sch-task-start').value,
    end:       document.getElementById('sch-task-end').value,
    milestone: document.getElementById('sch-task-ms').value.trim(),
  };
  if (!data.start || !data.end) { showToast('開始日・終了日を設定してください'); return; }
  if (data.start > data.end)    { showToast('終了日は開始日より後にしてください'); return; }

  const { groupId, taskId } = _schModal;
  const group = (S.schedule.groups || []).find(g => g.id === groupId);
  if (!group) return;

  if (taskId) {
    const idx = group.tasks.findIndex(t => t.id === taskId);
    if (idx >= 0) group.tasks[idx] = { id: taskId, ...data };
  } else {
    group.tasks.push({ id: schUid(), ...data }); // append to bottom
  }
  closeSchModal();
  renderGantt();
  showToast(taskId ? 'タスクを更新しました' : 'タスクを追加しました');
}

function deleteSchTask() {
  const { groupId, taskId } = _schModal;
  if (!taskId) return;
  const group = (S.schedule.groups || []).find(g => g.id === groupId);
  if (group) group.tasks = group.tasks.filter(t => t.id !== taskId);
  closeSchModal();
  renderGantt();
  showToast('タスクを削除しました');
}

// ─── Group modal ────────────────────────────────────────────
function openSchGroupModal() {
  document.getElementById('sch-group-name').value   = '';
  document.getElementById('sch-group-preset').value = '';
  document.getElementById('sch-group-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('sch-group-name').focus(), 50);
}
function closeSchGroupModal() { document.getElementById('sch-group-modal').style.display = 'none'; }

function saveSchGroup() {
  const name   = document.getElementById('sch-group-name').value.trim();
  if (!name) { showToast('グループ名を入力してください'); return; }
  const preset = document.getElementById('sch-group-preset').value;
  const kick   = S.schedule.kickoff || schToStr(new Date());

  const group = { id: schUid(), name, startDate: kick, tasks: [] };
  if (preset && SCH_PRESETS[preset]) {
    group.tasks = SCH_PRESETS[preset].map(t => ({
      id: schUid(), name: t.name, type: t.type,
      start: schAdd(kick, t.d), end: schAdd(kick, t.d + t.dur),
      milestone: t.ms || '',
    }));
  }
  S.schedule.groups.push(group);
  closeSchGroupModal();
  renderGantt();
  showToast('グループを追加しました');
}

function schDeleteGroup(id) {
  if (!confirm('このグループを削除しますか？タスクもすべて削除されます。')) return;
  S.schedule.groups = S.schedule.groups.filter(g => g.id !== id);
  renderGantt();
}

// ─── CSV Export ─────────────────────────────────────────────
function exportScheduleCsv() {
  const groups = S.schedule?.groups || [];
  if (groups.length === 0) { showToast('エクスポートするタスクがありません'); return; }

  // Overall date range
  let minDate = null, maxDate = null;
  groups.forEach(g => (g.tasks || []).forEach(t => {
    const s = schToDate(t.start), e = schToDate(t.end);
    if (!minDate || s < minDate) minDate = new Date(s);
    if (!maxDate || e > maxDate) maxDate = new Date(e);
  }));
  if (!minDate) { showToast('エクスポートするタスクがありません'); return; }

  // Build week columns (7-day steps from minDate, +2 weeks padding at end)
  const weeks = [];
  const cur = new Date(minDate);
  const padEnd = new Date(maxDate);
  padEnd.setDate(padEnd.getDate() + 14);
  while (cur <= padEnd) {
    const ws = new Date(cur);
    const we = new Date(cur);
    we.setDate(we.getDate() + 6);
    weeks.push({ start: ws, end: we, month: ws.getMonth() + 1, wom: Math.ceil(ws.getDate() / 7) });
    cur.setDate(cur.getDate() + 7);
  }

  // Info rows
  const today = schToStr(new Date());
  const projName = v('project_name') || '';
  const clientName = v('client_name') || '';
  const kickoff = S.schedule?.kickoff || '';
  const blank = () => ['', ...weeks.map(() => '')];

  const rows = [];
  rows.push(['プロジェクト', projName || '―', '', ...weeks.map(() => '')]);
  rows.push(['クライアント', clientName || '―', '', ...weeks.map(() => '')]);
  if (kickoff) rows.push(['キックオフ', kickoff, '', ...weeks.map(() => '')]);
  rows.push(['出力日', today, '', ...weeks.map(() => '')]);
  rows.push(blank());
  rows.push(['凡例', '■ 制作タスク　● クライアントタスク　◆ マイルストーン', '', ...weeks.map(() => '')]);
  rows.push(blank());

  // Month header row (merge-like: write month only on first occurrence)
  const hdr1 = ['', 'タスク名', '種別'];
  let prevMonth = -1;
  weeks.forEach(w => { hdr1.push(w.month !== prevMonth ? `${w.month}月` : ''); prevMonth = w.month; });
  rows.push(hdr1);

  // Week header row
  const hdr2 = ['', '', ''];
  weeks.forEach(w => hdr2.push(`w${w.wom}`));
  rows.push(hdr2);

  // Task rows grouped
  groups.forEach(g => {
    // Group separator row
    const gRow = [`【 ${g.name} 】`, '', '', ...weeks.map(() => '')];
    rows.push(gRow);

    (g.tasks || []).forEach(t => {
      const tStart = schToDate(t.start);
      const tEnd   = schToDate(t.end);
      const isProd = t.type === 'production';
      const cells = weeks.map(w => {
        if (tEnd < w.start || tStart > w.end) return '';
        const isLast = tEnd >= w.start && tEnd <= w.end;
        if (isLast && t.milestone) return '◆';
        return isProd ? '■' : '●';
      });
      rows.push(['', t.name, isProd ? '制作' : 'クライアント', ...cells]);
    });
    rows.push(blank());
  });

  const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `schedule_${(clientName || 'project').replace(/\s/g, '_')}_${today}.csv`;
  a.click();
  showToast('CSVを出力しました');
}

initSchedule();
