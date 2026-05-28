/* ===== DIRECTION BOARD v3 — TOOLS (Accessibility / Image Scale / Hearing) =====
 *  ファイル構成:
 *  direction-app-v3.js      … 状態管理・ヒアリングデータ・保存/出力・スライド・プロジェクト管理
 *  direction-app-v3-tools.js … アクセシビリティ・言語イメージスケール・ヒアリングUI (当ファイル)
 *  direction-app-v3-schedule.js … スケジュール・ガントチャート
 * =========================================================================== */

// ============================================================
// ===== P9: ACCESSIBILITY CHECK ==============================
// ============================================================

// --- コントラスト比計算 (WCAG 2.1 / sRGB) ---
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [parseInt(full.slice(0,2),16), parseInt(full.slice(2,4),16), parseInt(full.slice(4,6),16)];
}
function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance([r,g,b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}
function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hexToRgb(hex1));
  const L2 = relativeLuminance(hexToRgb(hex2));
  const [L, D] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (L + 0.05) / (D + 0.05);
}

function syncColorFromHex(colorId, hexId) {
  const val = document.getElementById(hexId).value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    document.getElementById(colorId).value = val;
    calcContrast();
  }
}

function calcContrast() {
  const fg = document.getElementById('cr-fg').value;
  const bg = document.getElementById('cr-bg').value;
  document.getElementById('cr-fg-hex').value = fg;
  document.getElementById('cr-bg-hex').value = bg;

  const preview = document.getElementById('cr-preview');
  preview.style.backgroundColor = bg;
  preview.style.color = fg;

  const ratio = contrastRatio(fg, bg);
  const r = ratio.toFixed(2);
  const ratioEl = document.getElementById('cr-ratio');
  ratioEl.textContent = r + ' : 1';
  ratioEl.style.color = ratio >= 7 ? 'var(--success)' : ratio >= 4.5 ? '#b5622a' : 'var(--danger)';

  document.getElementById('cr-badges').innerHTML = [
    { label: 'AA  通常テキスト（4.5:1以上）', note: '16px以下の本文・ラベル',            pass: ratio >= 4.5 },
    { label: 'AA  大テキスト・UI（3:1以上）', note: '18px以上 / bold 14px以上 / ボタン枠', pass: ratio >= 3   },
    { label: 'AAA 通常テキスト（7:1以上）',   note: '最高水準。法的要件がある場合に推奨',  pass: ratio >= 7   },
    { label: 'AAA 大テキスト（4.5:1以上）',   note: '18px以上のテキスト',                  pass: ratio >= 4.5 && ratio < 7 ? false : ratio >= 4.5 }
  ].map(({ label, note, pass }) => `
    <div class="cr-badge">
      <div class="cr-badge-dot" style="background:${pass ? 'var(--success)' : 'var(--danger)'}"></div>
      <div>
        <span class="${pass ? 'cr-pass' : 'cr-fail'}">${pass ? '✓' : '✗'} ${label}</span>
        <div style="font-size:10px;color:var(--text3);margin-top:1px">${note}</div>
      </div>
    </div>`).join('');
}

function loadPaletteToContrast() {
  const textColors = S.colors.text || [];
  const allColors = [...(S.colors.main || []), ...(S.colors.sub || []), ...(S.colors.accent || [])];

  const mkSwatches = (id, colors) => {
    const el = document.getElementById(id);
    if (!el) return;
    const target = id === 'cr-fg-presets' ? 'cr-fg' : 'cr-bg';
    el.innerHTML = colors.map(c => `<div class="cr-swatch" style="background:${c}" title="${c}"
      onclick="document.getElementById('${target}').value='${c}';calcContrast()"></div>`).join('');
  };

  // 文字色プリセット: テキストカラー優先、次に全カラー
  mkSwatches('cr-fg-presets', [...new Set(['#1c1917', '#ffffff', ...textColors, ...allColors])]);
  // 背景色プリセット: 全カラー
  mkSwatches('cr-bg-presets', [...new Set(['#ffffff', '#f5f3ef', '#1c1917', ...allColors])]);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function autoResizeMemo(el) {
  el.style.height = 'auto';
  el.style.height = Math.max(el.scrollHeight, 28) + 'px';
}

// ============================================================
// --- WCAGチェックリスト (WCAG 2.1 / 具体的な確認方法・修正ヒント付き) ---
// ============================================================

const WCAG_ITEMS = [
  {
    cat: '文字・テキスト',
    icon: '🔤',
    items: [
      {
        text: '本文フォントサイズが16px（1rem）以上である',
        level: 'A',
        how: 'Chrome DevToolsでbody / pセレクタのfont-sizeを確認。16px未満はNG',
        fix: 'body { font-size: 16px; } — 12〜14pxはキャプション・注釈にのみ使用'
      },
      {
        text: '行間（line-height）が1.5以上に設定されている',
        level: 'AA',
        how: 'DevToolsのComputedタブでline-heightを確認。1.5未満はNG',
        fix: 'p, li { line-height: 1.5; } — 日本語は1.7〜1.8が推奨'
      },
      {
        text: '文字サイズを200%に拡大しても横スクロールが発生しない',
        level: 'AA',
        how: 'Chromeでフォントサイズを「大」に設定、またはzoom:200%でレイアウト確認',
        fix: 'px固定をやめremやemを使用。flex-wrap:wrapを設定'
      },
      {
        text: '文字・行・段落・単語の間隔を上書きしてもレイアウトが崩れない',
        level: 'AA',
        how: 'Bookmarkletでletter-spacing:0.12em / word-spacing:0.16em / line-height:1.5を強制適用して確認',
        fix: '固定heightをやめmin-heightで指定。テキストが溢れない設計にする'
      },
      {
        text: '本文1行の文字数が66文字（英数）・32〜34文字（日本語）以内に収まっている',
        level: 'AAA',
        how: 'コンテナの最大幅をch単位で計測。66ch≒日本語約33文字分',
        fix: '.prose { max-width: 66ch; } — 全画面幅で本文を表示しない'
      }
    ]
  },
  {
    cat: '画像・メディア',
    icon: '🖼',
    items: [
      {
        text: '意味のある画像すべてにaltテキストが設定されている',
        level: 'A',
        how: 'DevToolsのElementsでimg要素のalt属性を確認。axeやWAVEプラグインでも自動検出可',
        fix: '<img alt="サービス説明のイラスト：笑顔のスタッフ"> — 画像の内容・目的を簡潔に記述'
      },
      {
        text: '装飾目的の画像はalt=""（空文字）または背景画像で実装されている',
        level: 'A',
        how: '装飾ラインや区切り画像のaltが空文字になっているか確認',
        fix: '<img alt=""> または background-image: url() で実装'
      },
      {
        text: '重要な情報を画像だけで伝えておらず、テキストでも同等の情報が得られる',
        level: 'A',
        how: '画像を非表示（DevToolsでdisplay:none）にして、同じ情報がテキストで得られるか確認',
        fix: '数値・価格・重要メッセージはHTMLテキストで記述し、画像はビジュアル補助として使う'
      },
      {
        text: '動画に字幕または書き起こしテキストが用意されている',
        level: 'A',
        how: 'YouTube埋め込みは字幕有無を、vimeoなら字幕設定を確認',
        fix: 'YouTubeは字幕ファイル(.srt)をアップロード / <video>要素には<track kind="subtitles">を追加'
      },
      {
        text: 'SVGアイコンに意味がある場合、aria-labelまたはtitleが付与されている',
        level: 'A',
        how: '装飾でないSVGアイコンのソースを確認。aria-labelかtitleがあるか',
        fix: '<svg aria-label="検索" role="img"> — 装飾のみなら aria-hidden="true"'
      }
    ]
  },
  {
    cat: 'リンク',
    icon: '🔗',
    items: [
      {
        text: 'リンクテキストが内容を説明している（「こちら」「詳しくは」を使っていない）',
        level: 'A',
        how: 'ページ内のリンクテキストだけを一覧表示して目的地が分かるか確認（axeで検出可）',
        fix: '× 「詳しくはこちら」→ ○ 「サービス詳細ページを見る」に変更'
      },
      {
        text: '同じリンクテキストで異なるURLに遷移するリンクがない',
        level: 'A',
        how: 'ページ内で同じテキストのリンクが複数ある場合、すべて同じURLか確認',
        fix: 'リンクテキストを「○○サービスの詳細」「△△プランの詳細」のように区別する'
      },
      {
        text: '外部リンク（target="_blank"）にrel="noopener noreferrer"が設定されている',
        level: 'A',
        how: 'DevToolsで外部リンク要素のrel属性を確認。noopenerがあるか',
        fix: '<a href="..." target="_blank" rel="noopener noreferrer"> — セキュリティ・プライバシー両面で必須'
      }
    ]
  },
  {
    cat: '見出し・ページ構造',
    icon: '📐',
    items: [
      {
        text: '見出しタグ（h1〜h6）が正しい階層順で使われている（レベルを飛ばさない）',
        level: 'A',
        how: 'HeadingsMapブラウザ拡張またはaxeで見出し構造を確認。h2→h4など飛び越えはNG',
        fix: 'h1は1ページ1つ。h2→h3→h4の順に使用。見た目のためだけにhタグを使わない'
      },
      {
        text: 'h1が1ページに1つだけ存在し、ページ内容を表すテキストになっている',
        level: 'A',
        how: 'DevToolsでh1要素の数を確認（ヘッダーロゴをh1にしているケースに注意）',
        fix: 'ロゴはspan・divで実装。コンテンツの主見出しのみh1に設定'
      },
      {
        text: '見出しだけを順番に読んでもコンテンツの流れが理解できる',
        level: 'AA',
        how: 'HeadingsMapでh1〜h6の一覧を見て、見出しだけで内容が伝わるか評価',
        fix: '「詳細」「について」などの曖昧な見出しを避け、具体的な内容を記述する'
      },
      {
        text: 'ランドマーク（header / main / footer / nav）が適切に使われている',
        level: 'A',
        how: 'DevToolsでsemantic要素（header, main, nav, footer）の有無を確認。axeで検出可',
        fix: '<div id="header"> → <header> / <div id="content"> → <main> に変更'
      }
    ]
  },
  {
    cat: 'フォーム',
    icon: '📝',
    items: [
      {
        text: '全ての入力欄にvisibleなlabel要素が紐づいており、プレースホルダーのみに頼っていない',
        level: 'A',
        how: 'プレースホルダーのみでlabelを省略していないか確認。axeで検出可',
        fix: '<label for="name">お名前</label><input id="name"> — labelとfor/idを対応させる'
      },
      {
        text: 'エラーメッセージは色だけでなくテキストと位置でも伝えている',
        level: 'A',
        how: '送信エラー時にエラー箇所が色のみで示されていないか確認',
        fix: '赤文字＋エラーアイコン＋「このフィールドは必須です」のテキスト。aria-describedbyで紐付け'
      },
      {
        text: '必須項目はrequired属性とテキスト表示の両方で示している',
        level: 'A',
        how: '「*必須」表示とrequired属性の両方があるか確認',
        fix: '<input required> + <span class="req">*必須</span> — *だけでは不十分'
      },
      {
        text: 'フォーム送信エラー後、フォーカスがエラー箇所に自動移動する',
        level: 'AA',
        how: 'Tabキーだけで操作し、送信エラー後にフォーカスがエラー位置に移動するか確認',
        fix: 'JavaScript で errorEl.focus() を実行 / aria-live="polite" でエラーを通知'
      },
      {
        text: '入力補完（autocomplete）が氏名・住所・メール・電話に設定されている',
        level: 'AA',
        how: '氏名・住所・メール・電話欄のautocomplete属性を確認',
        fix: 'autocomplete="name" / "email" / "tel" / "street-address" — W3C仕様の値を使用'
      }
    ]
  },
  {
    cat: 'ナビゲーション・操作',
    icon: '⌨️',
    items: [
      {
        text: 'キーボード（Tab / Enter / Spaceキー）だけで全操作が完結する',
        level: 'A',
        how: 'マウスを使わずTab・Enter・Spaceだけで全機能を操作してみる',
        fix: 'clickイベントのみをやめkeydownも対応。操作不可な<div>を<button>に変更'
      },
      {
        text: 'フォーカスインジケーター（:focus）が常に視覚的に確認できる',
        level: 'AA',
        how: 'Tabキーで移動してフォーカス枠が見えるか確認。outline:noneは危険',
        fix: ':focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; } — 視認性の高いスタイルを設定'
      },
      {
        text: 'コンテンツへスキップするリンクが実装されている',
        level: 'AA',
        how: 'Tabキーを最初に押したときにスキップリンクが表示されるか確認',
        fix: '<a href="#main" class="skip-link">本文へ移動</a> を<body>直後に設置。.skip-link { position:absolute; top:-100%; } :focus { top:0; }'
      },
      {
        text: 'モーダル・ドロワーが開いている間、フォーカスがモーダル内に留まる（フォーカストラップ）',
        level: 'AA',
        how: 'モーダル表示中にTabキーでフォーカスがモーダル外に出ないか確認',
        fix: '背景要素に inert属性 または aria-hidden="true" を設定。フォーカストラップを実装'
      },
      {
        text: 'ドロップダウン・アコーディオン等のUIがキーボードで開閉できる',
        level: 'A',
        how: 'Tabキーでフォーカスを当て、Enter/Spaceで開閉するか確認',
        fix: '<div onclick>をやめ<button>を使用。aria-expanded属性で開閉状態を通知'
      }
    ]
  },
  {
    cat: '色・コントラスト',
    icon: '🎨',
    items: [
      {
        text: '情報を色だけで伝えていない（アイコン・パターン・テキストを併用）',
        level: 'A',
        how: 'filter: grayscale(1) をbodyに当てて色なしでも意味が伝わるか確認',
        fix: 'エラー: 赤文字＋✗アイコン / 必須: ＊＋テキスト / グラフ: 模様・形でも区別'
      },
      {
        text: '本文テキストと背景のコントラスト比が4.5:1以上（上のツールで確認）',
        level: 'AA',
        how: '上のコントラスト比チェックツールで文字色と背景色を入力して確認',
        fix: '薄いグレー文字（#999など）をやめ #595959以上の明度に。太字は3:1まで緩和可'
      },
      {
        text: 'プレースホルダーテキストのコントラスト比が3:1以上である',
        level: 'AA',
        how: 'DevToolsで::placeholder の color を確認してコントラストツールで計算',
        fix: '::placeholder { color: #767676; } — #999などの薄いグレーは基準未達のことが多い'
      },
      {
        text: 'ホバー・フォーカス時のUI変化がコントラスト3:1以上を維持している',
        level: 'AA',
        how: 'ホバー前後のボタン色をDevToolsで確認してコントラストツールで計算',
        fix: '半透明overlayではなく明確に色を変える。border-colorの変化も3:1以上を確保'
      }
    ]
  },
  {
    cat: 'コンテンツ・メディア',
    icon: '📄',
    items: [
      {
        text: 'PDFだけで情報を提供しておらず、HTMLでも同等の情報が取得できる',
        level: 'A',
        how: 'PDFへのリンクがある場合、同内容のHTMLページや代替手段があるか確認',
        fix: 'PDFは補助資料にとどめ、重要情報はHTMLページでも提供する'
      },
      {
        text: '自動再生する動画・アニメーションが5秒以上の場合、停止・一時停止手段がある',
        level: 'A',
        how: 'ページにautoplayの動画・アニメーションがある場合、停止ボタンを確認',
        fix: '停止ボタンを実装 / prefers-reduced-motion: reduce { animation: none; } を設定'
      },
      {
        text: 'prefers-reduced-motionメディアクエリに対応し、動きを抑えたスタイルが定義されている',
        level: 'AA',
        how: 'OSの「視差効果を減らす」設定を有効にしてアニメーションが止まるか確認',
        fix: '@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }'
      },
      {
        text: 'ページのtitleタグが各ページの内容を具体的に説明している',
        level: 'A',
        how: 'DevToolsの<title>タグを確認。「トップページ」「index」等の汎用タイトルはNG',
        fix: '<title>サービス名 | ○○のご紹介</title> — ページ固有のキーワードを含める'
      }
    ]
  },
  {
    cat: 'モバイル・レスポンシブ',
    icon: '📱',
    items: [
      {
        text: 'タップターゲット（ボタン・リンク）が44×44px以上のサイズを確保している',
        level: 'AA',
        how: 'DevToolsのモバイルモードでBox Modelのサイズを確認',
        fix: 'a, button { min-height: 44px; min-width: 44px; } padding拡大でも対応可'
      },
      {
        text: '320px幅（iPhone SE等）で横スクロールが発生しない',
        level: 'AA',
        how: 'DevToolsで幅320pxに設定してスクロールバーが出ないか確認',
        fix: '固定幅要素をwidth:100%+max-widthに変更。テーブルはoverflow-x:autoで囲む'
      },
      {
        text: '画面の向き（縦横）を強制固定していない',
        level: 'AA',
        how: 'CSSにscreen-orientation:lockやJSでの向き固定がないか確認',
        fix: 'CSS: screen-orientationプロパティを削除。縦横両対応のレイアウトに設計'
      },
      {
        text: 'ピンチズームを無効化していない（viewport metaタグを確認）',
        level: 'A',
        how: '<meta name="viewport">にuser-scalable=noやmaximum-scale=1がないか確認',
        fix: '<meta name="viewport" content="width=device-width, initial-scale=1"> — user-scalable=noは削除'
      },
      {
        text: 'タッチ操作でスクロール中に誤タップが発生しない余白がある',
        level: 'AAA',
        how: '実機でスクロール操作中に意図しないボタンタップが起きないか確認',
        fix: 'インタラクティブ要素間のマージンを8px以上確保。密集したリンクは間隔を広げる'
      }
    ]
  }
];

const wcagState = {};
const wcagMemo = {};
let wcagFilter = '全て';

function setWcagFilter(val, btn) {
  wcagFilter = val;
  document.querySelectorAll('.wcag-filter').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  applyWcagFilter();
}

function applyWcagFilter() {
  const list = document.getElementById('wcag-list');
  if (!list) return;
  list.querySelectorAll('.wcag-category').forEach(cat => {
    const body = cat.querySelector('.wcag-items');
    let visible = 0;
    cat.querySelectorAll('.wcag-item').forEach(item => {
      const status = item.querySelector('.wcag-sel')?.value || '未確認';
      const show = wcagFilter === '全て' || status === wcagFilter;
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    cat.style.display = visible > 0 ? '' : 'none';
    if (wcagFilter !== '全て' && body) body.style.display = visible > 0 ? 'block' : 'none';
  });
}

function renderWcagList() {
  const el = document.getElementById('wcag-list');
  if (!el) return;
  el.innerHTML = WCAG_ITEMS.map((cat, ci) => {
    const items = cat.items.map((item, ii) => {
      const key = `${ci}-${ii}`;
      if (!wcagState[key]) wcagState[key] = '未確認';
      const s = wcagState[key];
      const levelColor = item.level === 'A' ? 'var(--warm)' : item.level === 'AA' ? 'var(--accent)' : 'var(--blue)';
      return `<div class="wcag-item">
        <select class="wcag-sel${s === 'OK' ? ' ok' : s === 'NG' ? ' ng' : ''}"
          onchange="wcagState['${key}']=this.value;this.className='wcag-sel'+(this.value==='OK'?' ok':this.value==='NG'?' ng':'');document.getElementById('wfix-${key}').style.display=this.value==='NG'?'block':'none';updateWcagSummary();applyWcagFilter()">
          <option${s === '未確認' ? ' selected' : ''}>未確認</option>
          <option${s === 'OK' ? ' selected' : ''}>OK</option>
          <option${s === 'NG' ? ' selected' : ''}>NG</option>
        </select>
        <div class="wcag-item-main">
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px">
            <span class="wcag-level" style="background:${levelColor};color:#fff">${item.level}</span>
            <span class="wcag-item-text">${item.text}</span>
          </div>
          <div class="wcag-how">🔍 <strong>確認方法：</strong>${esc(item.how)}</div>
          <div class="wcag-fix" id="wfix-${key}" style="display:${s === 'NG' ? 'block' : 'none'}">🔧 <strong>修正ヒント：</strong>${esc(item.fix)}</div>
          <textarea class="wcag-memo" placeholder="メモ..." oninput="wcagMemo['${key}']=this.value;autoResizeMemo(this)">${wcagMemo[key] || ''}</textarea>
        </div>
      </div>`;
    }).join('');

    const okCount  = cat.items.filter((_, ii) => wcagState[`${ci}-${ii}`] === 'OK').length;
    const ngCount  = cat.items.filter((_, ii) => wcagState[`${ci}-${ii}`] === 'NG').length;
    const badge = ngCount > 0
      ? `<span style="font-size:10px;padding:2px 7px;border-radius:100px;background:#fef2f2;color:var(--danger)">NG ${ngCount}</span>`
      : okCount === cat.items.length
        ? `<span style="font-size:10px;padding:2px 7px;border-radius:100px;background:#eef4f1;color:var(--success)">✓ 完了</span>`
        : `<span style="font-size:10px;color:var(--text3)">${okCount}/${cat.items.length}</span>`;

    return `<div class="wcag-category">
      <div class="wcag-cat-head" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        <span class="wcag-cat-title">${cat.icon} ${cat.cat}</span>
        ${badge}
      </div>
      <div class="wcag-items">${items}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('.wcag-memo').forEach(t => autoResizeMemo(t));
  updateWcagSummary();
  applyWcagFilter();
}

function updateWcagSummary() {
  const vals = Object.values(wcagState);
  const total = WCAG_ITEMS.reduce((s, c) => s + c.items.length, 0);
  const ok = vals.filter(v => v === 'OK').length;
  const ng = vals.filter(v => v === 'NG').length;
  const un = total - ok - ng;

  const pct = total > 0 ? Math.round(ok / total * 100) : 0;
  const bar = document.getElementById('wcag-summary-bar');
  if (bar) bar.innerHTML = `
    <span class="a11y-chip ok">✓ OK：${ok}件</span>
    <span class="a11y-chip ng">✗ NG：${ng}件</span>
    <span class="a11y-chip un">— 未確認：${un}件</span>
    <span class="a11y-chip" style="background:var(--bg);color:var(--text2)">達成率 ${pct}%</span>`;

  renderA11ySummary();
}

function renderA11ySummary() {
  const el = document.getElementById('a11y-summary');
  if (!el) return;

  const ngList = [];
  WCAG_ITEMS.forEach((cat, ci) => {
    cat.items.forEach((item, ii) => {
      if (wcagState[`${ci}-${ii}`] === 'NG') {
        ngList.push({ cat: cat.cat, icon: cat.icon, ...item });
      }
    });
  });

  if (ngList.length === 0) {
    el.innerHTML = `<div style="color:var(--success);font-size:13px;padding:10px 0;display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">✅</span>NG項目はありません。引き続き定期的な確認をおすすめします。</div>`;
    return;
  }

  const byLevel = { A: [], AA: [], AAA: [] };
  ngList.forEach(item => byLevel[item.level].push(item));

  const levelLabel = { A: '優先度 高（WCAG A）', AA: '優先度 中（WCAG AA）', AAA: '優先度 低（WCAG AAA）' };
  const levelColor = { A: 'var(--danger)', AA: 'var(--warm)', AAA: 'var(--blue)' };

  let html = '';
  ['A', 'AA', 'AAA'].forEach(level => {
    if (byLevel[level].length === 0) return;
    html += `<div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:600;color:${levelColor[level]};margin-bottom:8px;letter-spacing:.06em">${levelLabel[level]}（${byLevel[level].length}件）</div>`;
    byLevel[level].forEach(item => {
      html += `<div class="a11y-action-item">
        <div class="a11y-action-head">${item.icon} ${item.cat} — ${item.text}</div>
        <div class="a11y-action-fix">🔧 ${item.fix}</div>
      </div>`;
    });
    html += '</div>';
  });
  el.innerHTML = html;
}

function genA11yPrompt() {
  const ngList = [];
  WCAG_ITEMS.forEach((cat, ci) => {
    cat.items.forEach((item, ii) => {
      if (wcagState[`${ci}-${ii}`] === 'NG') {
        ngList.push({ cat: cat.cat, text: item.text, fix: item.fix, level: item.level });
      }
    });
  });

  if (ngList.length === 0) { showToast('NG項目がありません'); return; }

  const fg = document.getElementById('cr-fg')?.value || '#1c1917';
  const bg = document.getElementById('cr-bg')?.value || '#ffffff';
  const ratio = contrastRatio(fg, bg).toFixed(2);

  const prompt = `以下のアクセシビリティ問題を解決する、具体的なHTML・CSS・JavaScriptのコード修正案を提案してください。

【対象プロジェクト】
クライアント：${v('client_name') || '未入力'}
制作物：${S.mediums.join('、') || '未設定'}
業種：${v('ind1')} ${v('ind2')}

【コントラスト比（現在の設定）】
文字色：${fg} / 背景色：${bg} / コントラスト比：${ratio}:1

【NG項目と修正ヒント（優先度順）】
${ngList.map((item, i) => `
${i + 1}. [WCAG ${item.level}] ${item.cat} — ${item.text}
   修正ヒント：${item.fix}`).join('\n')}

【依頼内容】
各項目について以下を提示してください：
1. 問題のある具体的なコード例（Before）
2. 修正後のコード（After）
3. 補足説明（なぜこれが必要か）

実際のプロジェクトにそのまま貼り付けられる形式でお願いします。`;

  navigator.clipboard.writeText(prompt).then(() => showToast('プロンプトをコピーしました'));
}

// ============================================================
// --- ディレクターリリース前チェックリスト ---
// ============================================================

const DIRECTOR_ITEMS = [
  {
    cat: '公開前・技術確認',
    icon: '🔧',
    items: [
      { text: 'SSL/HTTPS設定が完了し、証明書の有効期限を確認した', priority: '高', how: 'URLがhttps://になっているか確認。ブラウザの鍵アイコンから証明書の有効期限を確認' },
      { text: '404エラーページ（ページが見つかりません）がデザイン済みで設定されている', priority: '高', how: '存在しないURLにアクセスして404ページが表示されるか確認' },
      { text: 'ファビコン（ブラウザタブのアイコン）が設定されている', priority: '中', how: 'ブラウザのタブでファビコンが表示されるか確認。<link rel="icon">タグを確認' },
      { text: 'OGP（og:title / og:description / og:image）が主要ページに設定されている', priority: '高', how: 'ogp.meやOGタグ確認ツールでURLを入力してSNSプレビューを確認' },
      { text: 'robots.txtとsitemap.xmlが設置され、サーチコンソールに送信済み', priority: '中', how: '/robots.txt と /sitemap.xml にアクセスして内容を確認。SCから送信状態を確認' },
      { text: 'ページ内のリンク切れがないことを確認した', priority: '高', how: 'W3C Link Checker や Broken Link Checker等のツールでページをスキャン' }
    ]
  },
  {
    cat: '計測・解析',
    icon: '📊',
    items: [
      { text: 'GA4（Google Analytics 4）またはGTMが正しく設置されている', priority: '高', how: 'GA4のリアルタイムレポートで自分のアクセスが計測されるか確認' },
      { text: 'コンバージョン（問い合わせ・購入等）の計測イベントが動作している', priority: '高', how: 'テスト送信後、GA4のコンバージョンイベントが発火するかリアルタイムで確認' },
      { text: 'Googleサーチコンソールにプロパティが登録され、所有権が確認済み', priority: '中', how: 'Search Consoleにログインしてプロパティが登録されているか確認' },
      { text: '社内IP等の計測除外設定が適切に行われている', priority: '中', how: 'GTMまたはGA4の設定で除外フィルタが設定されているか確認' }
    ]
  },
  {
    cat: 'フォーム・コンバージョン確認',
    icon: '📬',
    items: [
      { text: 'フォーム送信テストを実施し、担当者が受信を確認した', priority: '高', how: '実際にフォームを送信し、サンクスページ表示＋担当者のメール受信を確認' },
      { text: 'サンクスページ（送信完了画面）が正しく表示される', priority: '高', how: 'フォーム送信後にリダイレクト先URLとページ内容を確認' },
      { text: '自動返信メールが設定されており、正しい内容・送信元で届く', priority: '高', how: 'テスト送信後、ユーザー側メールアドレスに自動返信が届くか確認。迷惑メールフォルダも確認' },
      { text: 'スパム対策（reCAPTCHAやhoneypot等）が設定されている', priority: '中', how: 'フォームにreCAPTCHAまたは同等のスパム対策があるか確認' },
      { text: 'サンクスページのURLがGA4のコンバージョンに設定されている', priority: '中', how: 'GA4のコンバージョン設定でサンクスページのURLが登録されているか確認' }
    ]
  },
  {
    cat: '法的・コンプライアンス',
    icon: '⚖️',
    items: [
      { text: 'プライバシーポリシーページが存在し、フォームからリンクされている', priority: '高', how: 'プライバシーポリシーページのURLにアクセスし、フォーム送信前のリンクを確認' },
      { text: '特定商取引法に基づく表記がある（EC・有料サービスの場合）', priority: '高', how: 'ECサイト・有料会員サービスの場合、特商法ページの設置と内容を確認' },
      { text: '利用規約ページが存在する（会員登録・有料サービスの場合）', priority: '高', how: '会員登録・有料サービスの場合、利用規約ページを確認' },
      { text: 'Cookie使用・トラッキングに関する同意バナーが設置されている', priority: '中', how: 'ページ初回表示時にCookie同意バナーが表示されるか確認（GA4使用時は特に重要）' },
      { text: '使用画像・フォント・アイコンの著作権・ライセンス確認が完了している', priority: '高', how: '使用素材のライセンス（商用利用可否・クレジット表記要否）をすべて確認' }
    ]
  },
  {
    cat: 'SEO・メタ情報',
    icon: '🔍',
    items: [
      { text: '全ページにユニークなtitleとmeta descriptionが設定されている', priority: '高', how: 'DevToolsの<head>を確認。titleは32文字以内、descriptionは120文字以内が推奨' },
      { text: 'canonical URLが設定されており、重複コンテンツが生じていない', priority: '中', how: '<link rel="canonical" href="...">を確認。パラメータ付きURLでもcanonicalを確認' },
      { text: '公開不要なページ（テスト・開発環境）にnoindex設定がある', priority: '高', how: 'テストページ・開発系URLの<meta name="robots" content="noindex">を確認' },
      { text: 'ブログ・ニュース等で構造化データ（JSON-LD）が設定されている', priority: '低', how: 'GoogleのリッチリザルトテストでURLを入力して構造化データを確認' }
    ]
  },
  {
    cat: 'パフォーマンス',
    icon: '⚡',
    items: [
      { text: 'Core Web Vitals（LCP: 2.5秒以内 / CLS: 0.1以下）を確認した', priority: '高', how: 'PageSpeed Insights（pagespeed.web.dev）でURLを計測。モバイルスコアも確認' },
      { text: '画像が最適化されている（WebP/AVIF形式、適切なサイズ）', priority: '高', how: 'DevToolsのNetworkタブで画像の形式とサイズを確認。1MB以上はNG' },
      { text: 'ファーストビューのCSS・JSが最小化・遅延読み込みされている', priority: '中', how: 'PageSpeed InsightsでFCPとTTIスコアを確認。レンダーブロックリソースの警告を確認' },
      { text: '主要ページの読み込みが3G回線でも5秒以内で表示される', priority: '低', how: 'DevToolsのNetwork > スロットリング「Fast 3G」に設定してDOMContentLoadedを確認' }
    ]
  },
  {
    cat: 'ブラウザ・デバイス動作確認',
    icon: '🖥',
    items: [
      { text: 'Chrome・Safari・Firefox・Edgeの最新版で表示・動作確認した', priority: '高', how: '各ブラウザで主要ページのレイアウト・フォーム動作・アニメーションを確認' },
      { text: 'iOS Safari（iPhone）で主要ページの動作確認をした', priority: '高', how: 'iPhoneの実機またはXcodeシミュレーターのSafariで確認' },
      { text: 'Android Chrome（主要機種）で主要ページの動作確認をした', priority: '高', how: 'Android実機またはDevToolsのモバイルモードで確認。Samsung Galaxy等も推奨' },
      { text: '印刷スタイル（@media print）が必要なページで確認した', priority: '低', how: 'DevTools > More tools > Rendering > Emulate CSS media typeで「print」を選択して確認' }
    ]
  }
];

const directorState = {};
const directorMemo = {};

function renderDirectorList() {
  const el = document.getElementById('director-list');
  if (!el) return;
  el.innerHTML = DIRECTOR_ITEMS.map((cat, ci) => {
    const items = cat.items.map((item, ii) => {
      const key = `d-${ci}-${ii}`;
      if (!directorState[key]) directorState[key] = '未確認';
      const s = directorState[key];
      const pColor = item.priority === '高' ? 'var(--danger)' : item.priority === '中' ? 'var(--warm)' : 'var(--blue)';
      return `<div class="wcag-item">
        <select class="wcag-sel${s === 'OK' ? ' ok' : s === 'NG' ? ' ng' : ''}"
          onchange="directorState['${key}']=this.value;this.className='wcag-sel'+(this.value==='OK'?' ok':this.value==='NG'?' ng':'');updateDirectorSummary()">
          <option${s === '未確認' ? ' selected' : ''}>未確認</option>
          <option${s === 'OK' ? ' selected' : ''}>OK</option>
          <option${s === 'NG' ? ' selected' : ''}>NG</option>
        </select>
        <div class="wcag-item-main">
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px">
            <span class="dir-priority" style="background:${pColor}">${item.priority}</span>
            <span class="wcag-item-text">${item.text}</span>
          </div>
          <div class="wcag-how">🔍 <strong>確認方法：</strong>${esc(item.how)}</div>
          <textarea class="wcag-memo" placeholder="メモ..." oninput="directorMemo['${key}']=this.value;autoResizeMemo(this)">${directorMemo[key] || ''}</textarea>
        </div>
      </div>`;
    }).join('');

    const okCount = cat.items.filter((_, ii) => directorState[`d-${ci}-${ii}`] === 'OK').length;
    const ngCount = cat.items.filter((_, ii) => directorState[`d-${ci}-${ii}`] === 'NG').length;
    const badge = ngCount > 0
      ? `<span style="font-size:10px;padding:2px 7px;border-radius:100px;background:#fef2f2;color:var(--danger)">NG ${ngCount}</span>`
      : okCount === cat.items.length
        ? `<span style="font-size:10px;padding:2px 7px;border-radius:100px;background:#eef4f1;color:var(--success)">✓ 完了</span>`
        : `<span style="font-size:10px;color:var(--text3)">${okCount}/${cat.items.length}</span>`;

    return `<div class="wcag-category">
      <div class="wcag-cat-head" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        <span class="wcag-cat-title">${cat.icon} ${cat.cat}</span>
        ${badge}
      </div>
      <div class="wcag-items">${items}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('.wcag-memo').forEach(t => autoResizeMemo(t));
  updateDirectorSummary();
}

function updateDirectorSummary() {
  const total = DIRECTOR_ITEMS.reduce((s, c) => s + c.items.length, 0);
  const vals = Object.values(directorState);
  const ok = vals.filter(v => v === 'OK').length;
  const ng = vals.filter(v => v === 'NG').length;
  const un = total - ok - ng;
  const pct = total > 0 ? Math.round(ok / total * 100) : 0;
  const bar = document.getElementById('dir-summary-bar');
  if (bar) bar.innerHTML = `
    <span class="a11y-chip ok">✓ OK：${ok}件</span>
    <span class="a11y-chip ng">✗ NG：${ng}件</span>
    <span class="a11y-chip un">— 未確認：${un}件</span>
    <span class="a11y-chip" style="background:var(--bg);color:var(--text2)">完了率 ${pct}%</span>`;
}

function initA11y() {
  renderWcagList();
  renderDirectorList();
  calcContrast();
  loadPaletteToContrast();
}

// ─── 言語イメージスケール (NCD ©1995 日本カラーデザイン研究所 準拠 約180語) ────
// x: 0=WARM → 100=COOL  /  y: 0=HARD → 100=SOFT
const IMAGE_WORDS = [
  // ── プリティ (WARM-SOFT 最上左) ──
  { w: 'あどけない',       x:  8, y: 90 },
  { w: 'かわいい',         x: 13, y: 86 },
  { w: '子供らしい',       x:  8, y: 82 },
  { w: 'キュートな',       x: 17, y: 83 },

  // ── ロマンティック ──
  { w: '可憐な',           x: 21, y: 92 },
  { w: '甘美な',           x: 25, y: 89 },
  { w: 'ういういしい',     x: 29, y: 87 },
  { w: 'ロマンティック',   x: 33, y: 85 },
  { w: 'メルヘンの',       x: 37, y: 84 },
  { w: '夢のある',         x: 41, y: 84 },
  { w: 'お上品な',         x: 36, y: 80 },
  { w: 'やわらかい',       x: 30, y: 80 },

  // ── カジュアル (WARM, 中上) ──
  { w: '抗ざわりのよい',   x: 22, y: 78 },
  { w: '気楽な',           x: 19, y: 74 },
  { w: 'なじみやすい',     x: 26, y: 74 },
  { w: 'マイルドな',       x: 22, y: 70 },
  { w: 'ほがらかな',       x:  8, y: 72 },
  { w: '気軽な',           x: 12, y: 68 },
  { w: '楽しい',           x:  7, y: 64 },
  { w: '親しみやすい',     x: 15, y: 63 },
  { w: '愉快な',           x: 10, y: 59 },
  { w: '開放的な',         x: 18, y: 58 },
  { w: 'のんびりした',     x: 11, y: 55 },
  { w: '活発な',           x:  7, y: 54 },
  { w: '楽天的な',         x:  7, y: 50 },
  { w: '陽気な',           x: 14, y: 50 },
  { w: 'にぎやかな',       x:  8, y: 46 },
  { w: 'さわやかな',       x: 14, y: 44 },
  { w: 'はなやかな',       x:  8, y: 40 },

  // ── ナチュラル ──
  { w: 'やさしい',         x: 27, y: 66 },
  { w: '平和な',           x: 36, y: 70 },
  { w: 'のどかな',         x: 32, y: 65 },
  { w: '穏やかな',         x: 28, y: 60 },
  { w: 'デリケートな',     x: 28, y: 56 },
  { w: 'フェミニンな',     x: 34, y: 58 },
  { w: '柔らかい',         x: 24, y: 62 },
  { w: '自然な',           x: 28, y: 52 },
  { w: '女性的な',         x: 33, y: 53 },
  { w: '流麗な',           x: 36, y: 52 },
  { w: '優美な',           x: 36, y: 48 },
  { w: '素朴な',           x: 28, y: 48 },
  { w: '田園的な',         x: 30, y: 43 },
  { w: '豊かな',           x: 24, y: 54 },
  { w: '充実した',         x: 22, y: 46 },
  { w: 'ゆとりある',       x: 24, y: 50 },
  { w: '安らかな',         x: 32, y: 59 },

  // ── エレガント ──
  { w: '美しい',           x: 38, y: 60 },
  { w: 'ドレッシーな',     x: 40, y: 58 },
  { w: '上品な',           x: 44, y: 58 },
  { w: '優雅な',           x: 42, y: 54 },
  { w: '気品のある',       x: 46, y: 54 },
  { w: 'はなやかな',       x: 40, y: 50 },
  { w: '繊細な',           x: 44, y: 46 },
  { w: 'きめ細かい',       x: 46, y: 44 },
  { w: '洗練された',       x: 50, y: 53 },
  { w: 'さりげない',       x: 48, y: 58 },
  { w: '典雅な',           x: 52, y: 56 },
  { w: '瀟洒な',           x: 50, y: 50 },

  // ── CENTER ──
  { w: 'センスのよい',     x: 52, y: 62 },
  { w: '落ち着いた',       x: 52, y: 48 },
  { w: '端正な',           x: 56, y: 46 },
  { w: '整った',           x: 54, y: 52 },

  // ── クリア上部 (WARM-COOL橋) ──
  { w: '涼しい',           x: 48, y: 82 },
  { w: '上質な',           x: 48, y: 78 },
  { w: '淡い',             x: 56, y: 82 },
  { w: 'ピュアな',         x: 42, y: 78 },

  // ── クリア (COOL-SOFT) ──
  { w: 'さっぱりした',     x: 62, y: 88 },
  { w: 'すがすがしい',     x: 66, y: 86 },
  { w: '清潔な',           x: 70, y: 87 },
  { w: '清らかな',         x: 74, y: 85 },
  { w: 'みずみずしい',     x: 64, y: 82 },
  { w: 'クリアな',         x: 72, y: 83 },
  { w: 'すっきりした',     x: 76, y: 81 },
  { w: '利発な',           x: 78, y: 79 },
  { w: '清楚な',           x: 74, y: 77 },
  { w: '新鮮な',           x: 66, y: 70 },
  { w: 'ナチュラルな',     x: 62, y: 72 },
  { w: 'オーガニックな',   x: 60, y: 68 },
  { w: 'ヘルシーな',       x: 66, y: 64 },
  { w: 'フレッシュな',     x: 70, y: 74 },

  // ── スポーティ (COOL 中) ──
  { w: '青春の',           x: 76, y: 73 },
  { w: '若々しい',         x: 80, y: 71 },
  { w: 'スポーティな',     x: 83, y: 67 },
  { w: '快活な',           x: 74, y: 68 },
  { w: '活力のある',       x: 78, y: 65 },
  { w: '躍動的な',         x: 76, y: 62 },

  // ── クール・カジュアル ──
  { w: 'スピーディな',     x: 82, y: 58 },
  { w: '颯爽とした',       x: 78, y: 56 },
  { w: '都会的な',         x: 76, y: 54 },
  { w: '機敏な',           x: 84, y: 54 },
  { w: '軽快な',           x: 80, y: 58 },
  { w: '理知的な',         x: 78, y: 48 },
  { w: 'シャープな',       x: 84, y: 50 },
  { w: '精細な',           x: 82, y: 46 },
  { w: '知的な',           x: 76, y: 46 },

  // ── ダンディ ──
  { w: 'ダンディな',       x: 72, y: 44 },
  { w: 'シックな',         x: 65, y: 46 },
  { w: 'スマートな',       x: 69, y: 44 },
  { w: '大人的な',         x: 62, y: 40 },
  { w: '渋い',             x: 68, y: 38 },
  { w: '文化的な',         x: 68, y: 36 },
  { w: '紳士的な',         x: 74, y: 36 },
  { w: '男性的な',         x: 70, y: 34 },
  { w: '深みのある',       x: 66, y: 34 },

  // ── シック ──
  { w: '地味な',           x: 64, y: 32 },
  { w: '風格のある',       x: 66, y: 30 },
  { w: '朴とした',         x: 62, y: 28 },
  { w: '個性的な',         x: 62, y: 24 },
  { w: '社会的な',         x: 74, y: 30 },
  { w: '慎み深い',         x: 62, y: 26 },

  // ── クラシック ──
  { w: 'なつかしい',       x: 44, y: 36 },
  { w: '古風な',           x: 46, y: 34 },
  { w: '風格な',           x: 48, y: 32 },
  { w: '味わい深い',       x: 44, y: 30 },
  { w: 'アンティークな',   x: 52, y: 30 },
  { w: '伝統的な',         x: 54, y: 26 },
  { w: '古典的な',         x: 52, y: 24 },
  { w: 'クラシックな',     x: 56, y: 26 },
  { w: '由緒ある',         x: 50, y: 24 },
  { w: '歴史的な',         x: 46, y: 26 },
  { w: '奥深い',           x: 48, y: 28 },

  // ── クラシック&ダンディ ──
  { w: '本格的な',         x: 48, y: 22 },
  { w: '格調のある',       x: 50, y: 20 },
  { w: '品格のある',       x: 54, y: 20 },
  { w: 'どっしりした',     x: 48, y: 14 },
  { w: '堂々とした',       x: 52, y: 14 },
  { w: '気高い',           x: 50, y: 10 },
  { w: '確かな',           x: 52, y: 18 },

  // ── ゴージャス ──
  { w: '豪華な',           x: 32, y: 40 },
  { w: 'ぜいたくな',       x: 28, y: 36 },
  { w: '豊麗な',           x: 32, y: 34 },
  { w: '派手な',           x: 26, y: 34 },
  { w: '重厚な',           x: 34, y: 36 },
  { w: '絢爛な',           x: 38, y: 38 },
  { w: '円熟した',         x: 36, y: 32 },
  { w: '満ち足りた',       x: 30, y: 30 },

  // ── ダイナミック ──
  { w: '活動的な',         x: 15, y: 36 },
  { w: 'アクティブな',     x: 18, y: 34 },
  { w: '行動的な',         x: 13, y: 30 },
  { w: '大胆な',           x: 22, y: 32 },
  { w: '積極的な',         x: 12, y: 27 },
  { w: '情熱的な',         x: 16, y: 26 },
  { w: 'ダイナミックな',   x: 10, y: 24 },
  { w: 'エネルギッシュな', x: 14, y: 22 },
  { w: '力強い',           x: 10, y: 18 },
  { w: '躍動的な',         x: 20, y: 24 },
  { w: '激しい',           x:  8, y: 26 },
  { w: '精力的な',         x: 20, y: 22 },
  { w: '勢いのある',       x: 16, y: 20 },

  // ── ワイルド ──
  { w: 'タフな',           x:  8, y: 18 },
  { w: 'たくましい',       x: 12, y: 16 },
  { w: 'ワイルドな',       x: 10, y: 12 },
  { w: '男っぽい',         x: 14, y: 13 },
  { w: '荒々しい',         x:  8, y:  9 },
  { w: '豪快な',           x: 14, y:  9 },

  // ── モダン (COOL-HARD) ──
  { w: 'モダンな',         x: 82, y: 38 },
  { w: 'スタイリッシュな', x: 84, y: 42 },
  { w: '人工的な',         x: 86, y: 34 },
  { w: '機能的な',         x: 84, y: 30 },
  { w: '精密な',           x: 88, y: 34 },
  { w: '合理的な',         x: 86, y: 26 },
  { w: 'メカニカルな',     x: 84, y: 22 },
  { w: '精巧な',           x: 88, y: 28 },
  { w: '鋭い',             x: 84, y: 26 },
  { w: '革新的な',         x: 82, y: 30 },
  { w: '高度な',           x: 80, y: 26 },
  { w: '近代的な',         x: 88, y: 30 },

  // ── フォーマル ──
  { w: '高貴な',           x: 72, y: 20 },
  { w: '格調高い',         x: 74, y: 14 },
  { w: '礼節のある',       x: 78, y: 14 },
  { w: 'フォーマルな',     x: 76, y: 10 },
  { w: '威厳のある',       x: 80, y: 18 },
  { w: '荘厳な',           x: 80, y: 12 },
  { w: '堅固な',           x: 84, y: 12 },
  { w: '重厚感のある',     x: 74, y: 10 },
  { w: '格式のある',       x: 78, y: 10 },
  { w: '壮大な',           x: 68, y: 12 },
];

// カラートーン別配色データ (CLEAR → GRAYISH / 5段階)
const ZONE_TONES = {
  'warm-soft': {
    vivid:   ['#f43f5e','#ec4899','#a855f7','#f97316','#eab308'],
    light:   ['#fda4af','#f9a8d4','#d8b4fe','#fed7aa','#fef08a'],
    soft:    ['#fce7f3','#fdf2f8','#faf5ff','#fff7ed','#fefce8'],
    muted:   ['#c4768a','#b46890','#8860b0','#c08858','#b0a040'],
    grayish: ['#907080','#806888','#605888','#907858','#807860'],
  },
  'cool-soft': {
    vivid:   ['#10b981','#06b6d4','#0ea5e9','#84cc16','#22d3ee'],
    light:   ['#6ee7b7','#67e8f9','#7dd3fc','#bef264','#a5f3fc'],
    soft:    ['#d1fae5','#cffafe','#e0f2fe','#f0fdf4','#ecfeff'],
    muted:   ['#4a9870','#4888a8','#3878a8','#6a9840','#388898'],
    grayish: ['#406858','#386878','#285870','#506830','#305868'],
  },
  'warm-hard': {
    vivid:   ['#ef4444','#f97316','#eab308','#dc2626','#ea580c'],
    light:   ['#fca5a5','#fdba74','#fde047','#f87171','#fb923c'],
    soft:    ['#fee2e2','#ffedd5','#fefce8','#fef2f2','#fff7ed'],
    muted:   ['#b84040','#b06030','#908028','#902828','#a84818'],
    grayish: ['#805050','#806040','#706828','#682828','#783818'],
  },
  'cool-hard': {
    vivid:   ['#1e3a8a','#1d4ed8','#0891b2','#065f46','#6d28d9'],
    light:   ['#93c5fd','#7dd3fc','#67e8f9','#6ee7b7','#c4b5fd'],
    soft:    ['#eff6ff','#e0f2fe','#ecfeff','#d1fae5','#f5f3ff'],
    muted:   ['#2c4a80','#1a5080','#0e6880','#085030','#4c1d80'],
    grayish: ['#1e2a50','#183858','#0a4858','#063828','#301858'],
  },
  'neutral': {
    vivid:   ['#3b82f6','#64748b','#f59e0b','#10b981','#8b5cf6'],
    light:   ['#93c5fd','#cbd5e1','#fcd34d','#6ee7b7','#c4b5fd'],
    soft:    ['#eff6ff','#f8fafc','#fffbeb','#f0fdf4','#faf5ff'],
    muted:   ['#3060a0','#485868','#906818','#287860','#504880'],
    grayish: ['#284888','#383848','#684808','#185848','#302870'],
  },
};

const TONE_LABELS = {
  vivid:   ['ビビッド','ビビッド','ビビッド','ビビッド','ビビッド'],
  light:   ['ライト','ライト','ライト','ライト','ライト'],
  soft:    ['ソフト','ソフト','ソフト','ソフト','ソフト'],
  muted:   ['ミュート','ミュート','ミュート','ミュート','ミュート'],
  grayish: ['グレイッシュ','グレイッシュ','グレイッシュ','グレイッシュ','グレイッシュ'],
};

const IMAGE_ZONES = [
  { name: 'ロマンチック・フェミニン',     desc: '温かみがあり、やわらかく女性的な印象',   cond: (x,y) => x<45 && y>55, toneKey: 'warm-soft' },
  { name: 'ナチュラル・クリーン',         desc: '清潔感があり、さわやかで自然な印象',     cond: (x,y) => x>55 && y>55, toneKey: 'cool-soft' },
  { name: 'ダイナミック・エネルギッシュ', desc: '力強く、情熱的でインパクトのある印象',   cond: (x,y) => x<45 && y<45, toneKey: 'warm-hard' },
  { name: 'モダン・スタイリッシュ',       desc: 'クールで洗練された、都市的な印象',       cond: (x,y) => x>55 && y<45, toneKey: 'cool-hard' },
  { name: 'バランス・プロフェッショナル', desc: '信頼感があり、安定した誠実な印象',       cond: () => true,             toneKey: 'neutral'   },
];

let imageWordSel = new Set();
let selectedTone  = 'light';
let _iwZone       = null;

function renderImageScale() {
  const layer = document.getElementById('iw-words-layer');
  if (!layer) return;
  layer.innerHTML = IMAGE_WORDS.map(w =>
    `<div class="iw-word${imageWordSel.has(w.w) ? ' on' : ''}"
      style="left:${w.x}%;top:${100 - w.y}%"
      onclick="toggleImageWord('${w.w}')">${w.w}</div>`
  ).join('');
  updateImageZone();
}

function toggleImageWord(word) {
  if (imageWordSel.has(word)) imageWordSel.delete(word);
  else imageWordSel.add(word);
  renderImageScale();
}

function analyzeHearingKeywords() {
  const raw    = document.getElementById('iw-hearing-input')?.value || '';
  const tokens = raw.split(/[\s,、。・！？「」【】\n]+/).filter(Boolean);
  imageWordSel.clear();
  IMAGE_WORDS.forEach(w => {
    if (tokens.some(t => t.includes(w.w) || w.w.includes(t))) imageWordSel.add(w.w);
  });
  renderImageScale();
  showToast(imageWordSel.size > 0
    ? `${imageWordSel.size}個のキーワードを反映しました`
    : 'スケール上の言葉に一致するキーワードがありませんでした');
}

function setIwTone(tone, btn) {
  selectedTone = tone;
  document.querySelectorAll('.iw-tone-btn').forEach(b => b.classList.toggle('on', b === btn));
  updateImageZone();
}

function updateImageZone() {
  const result = document.getElementById('iw-zone-result');
  if (!result) return;
  if (imageWordSel.size === 0) {
    _iwZone = null;
    result.innerHTML = '<p style="color:var(--text3);font-size:12px">言葉をタップ、またはキーワードを入力して「スケールに反映」してください</p>';
    const pin = document.getElementById('iw-pin');
    if (pin) pin.style.display = 'none';
    return;
  }
  const selected = IMAGE_WORDS.filter(w => imageWordSel.has(w.w));
  const cx = selected.reduce((s, w) => s + w.x, 0) / selected.length;
  const cy = selected.reduce((s, w) => s + w.y, 0) / selected.length;
  const pin = document.getElementById('iw-pin');
  if (pin) { pin.style.left = cx + '%'; pin.style.top = (100 - cy) + '%'; pin.style.display = ''; }
  const zone = IMAGE_ZONES.find(z => z.cond(cx, cy));
  if (!zone) return;
  _iwZone = zone;
  if (typeof S !== 'undefined') S.scale = { x: cx / 100, y: cy / 100, label: zone.name };

  const toneData = ZONE_TONES[zone.toneKey]?.[selectedTone] || [];
  const swatches = toneData.map((c, i) =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <div class="iw-swatch" style="background:${c}" title="${c}"></div>
      <span style="font-size:9px;color:var(--text3)">${c}</span>
    </div>`
  ).join('');

  result.innerHTML = `
    <div class="iw-zone-name">${zone.name}</div>
    <div class="iw-zone-desc">${zone.desc}</div>
    <div class="iw-swatches" style="margin-top:8px">${swatches}</div>
    <div class="iw-add-row">
      <span style="font-size:11px;color:var(--text3)">パレットに追加：</span>
      <button class="iw-add-btn" onclick="addIwColors('main')">メイン</button>
      <button class="iw-add-btn" onclick="addIwColors('sub')">サブ</button>
      <button class="iw-add-btn" onclick="addIwColors('accent')">アクセント</button>
    </div>`;
}

function addIwColors(type) {
  if (!_iwZone) return;
  const colors = ZONE_TONES[_iwZone.toneKey]?.[selectedTone] || [];
  colors.forEach(c => addColor(type, c));
  const typeLabel = type === 'main' ? 'メイン' : type === 'sub' ? 'サブ' : 'アクセント';
  showToast(`${colors.length}色を${typeLabel}カラーに追加しました`);
}

function initImageScale() {
  renderImageScale();
}

initA11y();
initImageScale();
