/* ============================================================
   common.js — 两页共享：搜索框 + 字符详情弹窗
   依赖：
     · bburma_dict.js 必须在本文件之前加载（提供 bburmas）
     · HTML 中须有 #searchInput #searchClear #searchDropdown
     · HTML 中须有 #modalOverlay #modalChar #modalPinyin #modalClose
   ============================================================ */

'use strict';


/* ══════════════════════════════════════
   1. MODAL — 字符详情弹窗
══════════════════════════════════════ */

const modalOverlayEl = document.getElementById('modalOverlay');
const modalCharEl    = document.getElementById('modalChar');
const modalPinyinEl  = document.getElementById('modalPinyin');
const modalCloseEl   = document.getElementById('modalClose');

/**
 * 打开弹窗，展示字符和拼音
 * @param {string} char    彝文字符
 * @param {string} pinyin  对应拼音
 */
function showModal(char, pinyin) {
  modalCharEl.textContent   = char;
  modalPinyinEl.textContent = pinyin;
  modalOverlayEl.classList.add('active');
  document.body.style.overflow = 'hidden'; // 防止背景滚动
}

function closeModal() {
  modalOverlayEl.classList.remove('active');
  document.body.style.overflow = '';
}

// 关闭按钮
modalCloseEl.addEventListener('click', closeModal);

// 点击遮罩关闭
modalOverlayEl.addEventListener('click', e => {
  if (e.target === modalOverlayEl) closeModal();
});

// ESC 键关闭
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


/* ══════════════════════════════════════
   2. SEARCH — 拼音搜索框
══════════════════════════════════════ */

const searchInputEl    = document.getElementById('searchInput');
const searchDropdownEl = document.getElementById('searchDropdown');
const searchClearEl    = document.getElementById('searchClear');

// 每次搜索最多展示的条目数
const MAX_RESULTS = 48;

/**
 * 根据查询字符串在 bburmas 中匹配拼音
 * 排序规则：完全匹配 > 按拼音长度升序 > 字母序
 * @param {string} query
 * @returns {{ pinyin: string, char: string }[]}
 */
function getSearchResults(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();

  const results = [];
  for (const [pinyin, char] of Object.entries(bburmas)) {
    if (pinyin.startsWith(q)) {
      results.push({ pinyin, char });
    }
  }

  results.sort((a, b) => {
    // 完全匹配优先
    if (a.pinyin === q) return -1;
    if (b.pinyin === q) return  1;
    // 拼音长度升序（更短的在前）
    const lenDiff = a.pinyin.length - b.pinyin.length;
    if (lenDiff !== 0) return lenDiff;
    // 同等长度按字母序
    return a.pinyin.localeCompare(b.pinyin);
  });

  return results;
}

/**
 * 渲染搜索下拉列表
 */
function renderDropdown(results) {
  const total   = results.length;
  const visible = results.slice(0, MAX_RESULTS);

  if (total === 0) {
    searchDropdownEl.innerHTML = `
      <div class="search-empty">
        未找到以「${searchInputEl.value.trim()}」开头的彝文字
      </div>`;
    openDropdown();
    return;
  }

  const itemsHTML = visible.map(r => `
    <div class="search-result-item" data-char="${r.char}" data-pinyin="${r.pinyin}">
      <span class="sri-char">${r.char}</span>
      <span class="sri-pinyin">${r.pinyin}</span>
    </div>
  `).join('');

  const hintHTML = total > MAX_RESULTS
    ? `<div class="search-hint">还有 ${total - MAX_RESULTS} 个匹配结果，请继续输入以精确查找</div>`
    : '';

  searchDropdownEl.innerHTML = itemsHTML + hintHTML;
  openDropdown();

  // 为每个结果项绑定点击事件
  searchDropdownEl.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const char   = item.dataset.char;
      const pinyin = item.dataset.pinyin;
      showModal(char, pinyin);
      closeDropdown();
      // 清空输入框
      searchInputEl.value = '';
      searchClearEl.style.display = 'none';
    });
  });
}

function openDropdown() {
  searchDropdownEl.classList.add('open');
}

function closeDropdown() {
  searchDropdownEl.classList.remove('open');
  searchDropdownEl.innerHTML = '';
}

/* ── 搜索框事件 ── */

searchInputEl.addEventListener('input', () => {
  const query = searchInputEl.value.trim();
  // 控制清除按钮显隐
  searchClearEl.style.display = query ? 'flex' : 'none';

  if (!query) {
    closeDropdown();
    return;
  }

  renderDropdown(getSearchResults(query));
});

// 回车：直接打开第一个结果
searchInputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const first = searchDropdownEl.querySelector('.search-result-item');
    if (first) first.click();
  }
  if (e.key === 'Escape') {
    closeDropdown();
    searchInputEl.blur();
  }
});

// 清除按钮
searchClearEl.addEventListener('click', () => {
  searchInputEl.value = '';
  searchClearEl.style.display = 'none';
  closeDropdown();
  searchInputEl.focus();
});

// 点击搜索框外部关闭下拉列表
document.addEventListener('click', e => {
  const searchWrap = document.getElementById('navSearch');
  if (searchWrap && !searchWrap.contains(e.target)) {
    closeDropdown();
  }
});

// 暴露 showModal 到全局，供 pinyin.js / bushou.js 的点击委托调用
window.showModal = showModal;

