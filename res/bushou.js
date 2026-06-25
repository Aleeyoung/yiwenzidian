/* ============================================================
   bushou.js — 按部首查字 逻辑
   依赖: bburmaSets.js (提供全局变量 wordsByAli, bushou)
   ============================================================ */

'use strict';

// ── DOM 引用 ─────────────────────────────────────────────────

const sidebarListEl  = document.getElementById('sidebarList');
const contentAreaEl  = document.getElementById('contentArea');
const sidebarEl      = document.getElementById('sidebar');
const overlayEl      = document.getElementById('overlay');
const menuToggleEl   = document.getElementById('menuToggle');
const closeSidebarEl = document.getElementById('closeSidebar');
const userAvatarEl   = document.getElementById('userAvatar');
const mobilePanelEl  = document.getElementById('mobileUserPanel');

// ── 数据解析 ─────────────────────────────────────────────────

/**
 * 解析 bushou 字符串，返回部首条目数组
 * 每条: { primary: '꒐', display: '꒐', seq: 1 }
 * bushou 字符串形如 "꒐, ꒑（꒒）, ..."，以 ", " 分隔
 */
function parseBushouList() {
  return bushou.split(', ').map((entry, idx) => ({
    primary: entry,   // 用于查询 wordsByAli 的主部首
    display: entry,             // 在侧边栏展示（含变形部首）
    seq:     idx + 1
  }));
}

const bushouList = parseBushouList();

// ── 内容渲染 ─────────────────────────────────────────────────

/**
 * 渲染指定部首的字符内容
 * @param {string} primary   主部首字符（作为 wordsByAli 的键）
 * @param {string} display   用于标题显示的完整部首字符串
 * @param {number} seq       序号（1-26）
 */
function renderContent(primary, display, seq) {
  const words = wordsByAli[primary] || [];

  // 按剩余笔画（sr）分组，并保持 bburmaSets.js 中的原始 sr 排序
  const grouped = {};
  words.forEach(w => {
    if (!grouped[w.sr]) grouped[w.sr] = [];
    grouped[w.sr].push(w);
  });

  // 获取 sr 值列表（已在数据中由小到大排列，此处再做保险排序）
  const srValues = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  const totalCount = words.length;
  const seqStr     = String(seq).padStart(2, '0');

  let html = `
    <div class="content-header anim">
      <h2 class="content-title">第 ${seqStr} 部 &nbsp; ${display}</h2>
      <span class="content-subtitle">共 ${totalCount} 字</span>
    </div>
  `;

  if (totalCount === 0) {
    html += '<p class="no-words">此部首下暂无字收录</p>';
    contentAreaEl.innerHTML = html;
    contentAreaEl.scrollTop = 0;
    return;
  }

  // 按剩余笔画分节渲染
  srValues.forEach(sr => {
    const group = grouped[sr];
    html += `
      <div class="sr-section anim">
        <h3 class="sr-title">余 ${sr} 画&emsp;<span style="font-weight:400;font-size:12px;color:var(--text-sec)">${group.length} 字</span></h3>
        <div class="char-grid">
    `;

    group.forEach(w => {
      html += `
        <div class="bushou-cell-wrap" onclick="clicked_on_main(event)">
          <div class="cell-pinyin">${w.p}</div>
          <div class="char-cell" title="${w.p} → ${w.c}">${w.c}</div>
        </div>
      `;
    });

    html += `
        </div><!-- .char-grid -->
      </div><!-- .sr-section -->
    `;
  });

  contentAreaEl.innerHTML = html;
  contentAreaEl.scrollTop = 0;
}

// ── 侧边栏构建 ───────────────────────────────────────────────

function buildSidebar() {
  bushouList.forEach(r => {
    const li = document.createElement('li');
    li.className = 'sidebar-item';
    li.dataset.primary = r.primary;

    // 序号 + 部首（含变形）
    const seqStr = String(r.seq).padStart(2, '0');
    li.textContent = `${seqStr}  ${r.display}`;

    li.addEventListener('click', () => {
      activateSidebarItem(li);
      renderContent(r.primary, r.display, r.seq);
      if (window.innerWidth <= 768) closeSidebar();
    });

    sidebarListEl.appendChild(li);
  });
}

function activateSidebarItem(targetLi) {
  document.querySelectorAll('#sidebarList .sidebar-item').forEach(el =>
    el.classList.remove('active')
  );
  targetLi.classList.add('active');
}

// ── 侧边栏开关 (移动端) ──────────────────────────────────────

function openSidebar() {
  sidebarEl.classList.add('open');
  overlayEl.classList.add('visible');
  overlayEl.dataset.target = 'sidebar';
  menuToggleEl.classList.add('hidden');
}

function closeSidebar() {
  sidebarEl.classList.remove('open');
  if (overlayEl.dataset.target === 'sidebar') {
    overlayEl.classList.remove('visible');
    delete overlayEl.dataset.target;
  }
  menuToggleEl.classList.remove('hidden');
}

// ── 移动端用户面板 ───────────────────────────────────────────

function openMobilePanel() {
  mobilePanelEl.classList.add('open');
  overlayEl.classList.add('visible');
  overlayEl.dataset.target = 'user-panel';
}

function closeMobilePanel() {
  mobilePanelEl.classList.remove('open');
  if (overlayEl.dataset.target === 'user-panel') {
    overlayEl.classList.remove('visible');
    delete overlayEl.dataset.target;
  }
}

// ── 事件绑定 ─────────────────────────────────────────────────

menuToggleEl.addEventListener('click', openSidebar);
closeSidebarEl.addEventListener('click', closeSidebar);

overlayEl.addEventListener('click', () => {
  if (overlayEl.dataset.target === 'sidebar')    closeSidebar();
  if (overlayEl.dataset.target === 'user-panel') closeMobilePanel();
});

userAvatarEl.addEventListener('click', () => {
  if (window.innerWidth <= 768) openMobilePanel();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    sidebarEl.classList.remove('open');
    mobilePanelEl.classList.remove('open');
    overlayEl.classList.remove('visible');
    menuToggleEl.classList.remove('hidden');
  }
});

// ── 初始化 ───────────────────────────────────────────────────

(function init() {
  buildSidebar();
  // 默认显示第一个部首
  const firstItem = sidebarListEl.querySelector('.sidebar-item');
  if (firstItem) firstItem.classList.add('active');
  const first = bushouList[0];
  if (first) renderContent(first.primary, first.display, first.seq);
})();


function clicked_on_main(event){
  let parentDiv = event.target.parentNode;

  let pinyinContent = parentDiv.querySelector('.cell-pinyin').innerHTML;
  let charContent = parentDiv.querySelector('.char-cell').innerHTML;

  showModal(charContent, pinyinContent);

}