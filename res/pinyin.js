/* ============================================================
   pinyin.js — 按拼音查字 逻辑
   依赖: bburma_dict.js (提供全局变量 bburmas)
   ============================================================ */

'use strict';

// ── 数据定义 ────────────────────────────────────────────────

// 目录中的44个条目：第一项 "-" 代表无声母，后跟43个声母
const INITIALS = [
  '-',
  'b',  'p',  'bb', 'nb', 'hm', 'm',  'f',  'v',
  'd',  't',  'dd', 'nd', 'hn', 'n',  'hl', 'l',
  'g',  'k',  'gg', 'mg', 'hx', 'ng', 'h',  'w',
  'z',  'c',  'zz', 'nz', 's',  'ss',
  'zh', 'ch', 'rr', 'nr', 'sh', 'r',
  'j',  'q',  'jj', 'nj', 'ny', 'x',  'y'
];

// 10个韵母（顺序与文档一致）
const VOWELS = ['i', 'ie', 'a', 'uo', 'o', 'e', 'u', 'ur', 'y', 'yr'];

// 4个声调后缀（高调t / 次高调x / 平调无标 / 低调p）
const TONES = ['t', 'x', '', 'p'];

// ── DOM 引用 ─────────────────────────────────────────────────

const sidebarListEl  = document.getElementById('sidebarList');
const contentAreaEl  = document.getElementById('contentArea');
const sidebarEl      = document.getElementById('sidebar');
const overlayEl      = document.getElementById('overlay');
const menuToggleEl   = document.getElementById('menuToggle');
const closeSidebarEl = document.getElementById('closeSidebar');
const userAvatarEl   = document.getElementById('userAvatar');
const mobilePanelEl  = document.getElementById('mobileUserPanel');

// ── 拼音拼接 ─────────────────────────────────────────────────

/**
 * 拼接一个完整拼音字符串
 * @param {string} initial  声母（"-" 代表无声母）
 * @param {string} vowel    韵母
 * @param {string} tone     声调后缀（'t'|'x'|''|'p'）
 * @returns {string}
 */
function buildSyllable(initial, vowel, tone) {
  const init = initial === '-' ? '' : initial;
  return init + vowel + tone;
}

// ── 内容渲染 ─────────────────────────────────────────────────

/**
 * 渲染声母 `initial` 对应的内容区（10个divA）
 */
function renderContent(initial) {
  const isNoInitial = initial === '-';
  const titleText   = isNoInitial ? '无声母字' : `声母：${initial}`;
  const countText   = (() => {
    let n = 0;
    for (const vowel of VOWELS) {
      for (const tone of TONES) {
        if (bburmas[buildSyllable(initial, vowel, tone)]) n++;
      }
    }
    return `共 ${n} 字`;
  })();

  let html = `
    <div class="content-header anim">
      <h2 class="content-title">${titleText}</h2>
      <span class="content-subtitle">${countText}</span>
    </div>
    <div class="diva-grid anim">
  `;

  for (const vowel of VOWELS) {
    // 4个拼音 & 对应字符
    const syllables = TONES.map(tone => buildSyllable(initial, vowel, tone));
    const chars     = syllables.map(s => bburmas[s] || null);

    // 韵母的小标题（对于"-"，只显示韵母；对于其他声母，同样只显示韵母，声母在页面标题已有）
    const divaTitleText = isNoInitial
      ? vowel
      : `<span style="opacity:.45;font-size:13px">${initial}</span> + ${vowel}`;

    html += `
      <div class="diva">
        <div class="diva-label">韵母</div>
        <div class="diva-title">${divaTitleText}</div>
        <div class="diva-cells">
    `;

    for (let i = 0; i < 4; i++) {
      const syllable = syllables[i];
      const char     = chars[i];

      if (char !== null) {
        // 有字
        html += `
          <div class="cell-wrap" onclick="clicked_on_main(event)">
            <div class="cell-pinyin">${syllable}</div>
            <div class="char-cell" title="${syllable} → ${char}">${char}</div>
          </div>
        `;
      } else {
        // 无字 — 拼音隐藏，但方格占位
        html += `
          <div class="cell-wrap">
            <div class="cell-pinyin invisible">${syllable}</div>
            <div class="char-cell empty"></div>
          </div>
        `;
      }
    }

    html += `
        </div><!-- .diva-cells -->
      </div><!-- .diva -->
    `;
  }

  html += '</div><!-- .diva-grid -->';
  contentAreaEl.innerHTML = html;
  contentAreaEl.scrollTop = 0;
}

// ── 侧边栏构建 ───────────────────────────────────────────────

function buildSidebar() {
  INITIALS.forEach((initial, index) => {
    const li = document.createElement('li');
    li.className = 'sidebar-item';
    li.dataset.initial = initial;

    if (initial === '-') {
      li.textContent = '—  无声母';
      li.style.fontFamily = "'Noto Sans SC', sans-serif";
    } else {
      // 序号 + 声母
      const num = String(index).padStart(2, '0');
      li.textContent = `${num}  ${initial}`;
    }

    li.addEventListener('click', () => {
      activateSidebarItem(li);
      renderContent(initial);
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

// 移动端：点击头像打开右侧面板
userAvatarEl.addEventListener('click', () => {
  if (window.innerWidth <= 768) openMobilePanel();
});

// 窗口尺寸变化时重置移动端状态
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
  // 默认激活第一项（"-" 无声母）
  const firstItem = sidebarListEl.querySelector('.sidebar-item');
  if (firstItem) firstItem.classList.add('active');
  renderContent('-');
})();




function clicked_on_main(event){
  let parentDiv = event.target.parentNode;

  let pinyinContent = parentDiv.querySelector('.cell-pinyin').innerHTML;
  let charContent = parentDiv.querySelector('.char-cell').innerHTML;

  showModal(charContent, pinyinContent);

}