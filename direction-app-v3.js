/* ===== DIRECTION BOARD v3 — Main JavaScript =====
 *  ファイル構成:
 *  direction-app-v3.js      … 状態管理・ヒアリングデータ・保存/出力・スライド・プロジェクト管理 (当ファイル)
 *  direction-app-v3-tools.js … アクセシビリティ・言語イメージスケール・ヒアリングUI
 *  direction-app-v3-schedule.js … スケジュール・ガントチャート
 * ================================================= */

// ===== STATE =====
const S = {
  chips: {}, colors: { main: [], sub: [], accent: [], text: [] },
  scale: { x: null, y: null, label: '' },
  mediums: [], competitors: [], refs: [],
  bullets: { goals: [], asis: [], tobe: [] },
  tactics: [],
  cjm: {
    rows: ['行動', '思考・感情', 'タッチポイント', '課題・障壁', '施策アイデア'],
    stages: ['認知', '興味・検討', '決定・行動', '利用・継続'],
    data: {}
  },
  schedule: { kickoff: '', groups: [] },
  meetings: [],
};

// ===== INDUSTRY DATA =====
const IND = {
  '医療・ヘルスケア': ['内科・クリニック', '小児科', '歯科・矯正歯科', '精神科・心療内科', '整形外科', '皮膚科', '産婦人科', '眼科', '耳鼻咽喉科', '鍼灸・整体・接骨院', 'カウンセリング・心理士', '訪問看護・介護', '薬局・調剤薬局', 'その他医療'],
  '美容・コスメ': ['美容院・ヘアサロン', 'ネイルサロン', 'エステ・フェイシャル', '脱毛サロン', 'マツエク', '化粧品・スキンケアブランド', '美容クリニック', 'その他美容'],
  '飲食・フード': ['カフェ・コーヒー', 'レストラン・ダイニング', 'ラーメン・麺類', '焼肉・肉料理', '寿司・和食', 'パン・スイーツ', 'テイクアウト・デリバリー', '給食・フードサービス', 'その他飲食'],
  '不動産・建設': ['住宅販売・新築', 'マンション分譲', '賃貸仲介', 'リフォーム・リノベーション', '建設・工務店', 'インテリア・内装', '土地・土木', 'その他不動産'],
  '教育・スクール': ['学習塾・予備校', '英会話スクール', '音楽・ダンス教室', 'プログラミングスクール', '幼児教育・保育', '職業訓練・資格学校', 'オンライン学習', '大学・専門学校', 'その他教育'],
  'IT・テクノロジー': ['Webシステム開発', 'アプリ開発', 'SaaS・クラウド', 'AI・データ分析', 'ITコンサルティング', 'セキュリティ', 'ゲーム・エンタメIT', 'その他IT'],
  '製造・メーカー': ['食品製造', '機械・部品', '電子機器', 'アパレル・繊維', '家具・インテリア', '化学・素材', 'その他製造'],
  '小売・EC': ['アパレル・ファッション', '雑貨・インテリア', '食品・飲料', '美容・コスメEC', 'スポーツ用品', '書籍・メディア', 'その他EC'],
  '金融・保険': ['生命保険', '損害保険', 'FP・資産運用', '銀行・信用金庫', '不動産投資', 'その他金融'],
  'エンタメ・メディア': ['音楽・アーティスト', '映像・動画制作', '写真家・フォトグラファー', 'イベント・企画', '出版・メディア', 'その他エンタメ'],
  'ブライダル・ウェディング': ['ウェディングプランナー', 'ブライダルフォト', 'ドレスショップ', '会場・ホテル', 'その他ブライダル'],
  '福祉・相談・支援': ['カウンセリング', 'メンタルヘルス支援', '障害者支援', '子育て支援', 'DV・虐待支援', '地域コミュニティ', 'NPO・社会福祉法人', 'その他福祉'],
  '士業・コンサル': ['弁護士', '税理士・会計士', '社労士', '行政書士', '経営コンサル', 'その他士業'],
  '宿泊・観光': ['ホテル', '旅館・民宿', 'ゲストハウス', '観光案内・ツアー', 'キャンプ場・グランピング', 'その他宿泊'],
  'スポーツ・フィットネス': ['ジム・フィットネス', 'ヨガ・ピラティス', '格闘技・武道', 'スポーツチーム', 'その他スポーツ'],
  'その他': ['その他']
};
const IND_HINTS = {
  '医療・ヘルスケア': '地域名＋診療科名で検索。厚労省の施設検索も活用。',
  '福祉・相談・支援': 'NPO法人・社会福祉法人のサイトを中心に。地域の相談窓口も参考に。',
  '美容・コスメ': 'Hotpepper Beauty・ミニモ掲載店のサイトを確認。',
  '飲食・フード': '食べログ・ぐるなびの上位店サイトを参照。',
  '宿泊・観光': 'じゃらん・楽天トラベル掲載施設の公式サイトを確認。',
  '教育・スクール': '地域名＋学習塾/スクール名で検索。比較サイトも活用。'
};

function updateInd2() {
  const v = document.getElementById('ind1').value;
  const s2 = document.getElementById('ind2');
  s2.disabled = !v;
  s2.innerHTML = v ? ['<option value="">選択してください', ...(IND[v] || []).map(x => `<option>${x}`)].join('') : '<option>大分類を先に選択</option>';
  document.getElementById('ind-hint').textContent = '';
  updateCompHint();
  suggestIndustryQ();
}
function updateInd3() {
  const v1 = document.getElementById('ind1').value;
  const hint = IND_HINTS[v1] || '';
  document.getElementById('ind-hint').textContent = hint ? '💡 調査ヒント: ' + hint : '';
  updateCompHint();
  suggestIndustryQ();
}

// ===== INDUSTRY-SPECIFIC HEARING QUESTIONS =====
const INDUSTRY_Q = {
  '医療・ヘルスケア': {
    req: [
      { q: '医療広告ガイドラインの制約（口コミ・ビフォーアフター・比較表現・体験談の可否）', h: '医療法・薬機法の規制により掲載できない表現があるため必ず確認', hl: 1 }
    ],
    'biz-bg': [
      { q: '集患の主な経路（Web検索・紹介・SNS・広告）', h: 'どこからの患者が多いかで集客戦略が変わる' },
      { q: '自由診療と保険診療の比率', h: '収益モデル・単価感を把握する' }
    ],
    strength: [
      { q: '専門医資格・学会認定・院長の経歴', h: '信頼性の根拠として掲載に効果的' },
      { q: '患者様の声・口コミの収集・活用方法', h: '医療広告の規制があるため、どこまで掲載できるか確認が必要' }
    ]
  },
  '美容・コスメ': {
    'biz-bg': [
      { q: 'Hotpepper Beauty・ミニモ等のポータル掲載状況と依存度', h: '公式サイトとの役割分担を整理する' },
      { q: 'リピート率・指名率の現状', h: '美容業は顧客継続率がKPI。どこで数字が落ちているかを把握' }
    ],
    req: [
      { q: 'Instagram/TikTokの活用状況・フォロワー数・投稿頻度', h: '美容系はSNS経由の集客が主流。公式サイトとの連動を検討' }
    ]
  },
  '飲食・フード': {
    'biz-bg': [
      { q: 'Googleマップ・食べログの評価・口コミ状況', h: 'レビュープラットフォームは集客に直結。マイナス口コミがあれば把握' },
      { q: 'テイクアウト・デリバリーの対応状況（Uber Eats等）', h: '今後の展開も含めて確認' }
    ],
    req: [
      { q: 'アレルギー・ビーガン・ハラール等の対応と情報開示方針', h: 'Webでの記載要否の確認' }
    ]
  },
  '不動産・建設': {
    'biz-bg': [
      { q: 'SUUMOやHOME\'S等ポータルサイトの活用状況と費用対効果', h: 'ポータル依存からの脱却が課題になるケースが多い' },
      { q: '施工エリアと対応可能な物件タイプ・工法', h: 'SEOの地域キーワード設計に影響' }
    ],
    req: [
      { q: '建設業許可番号・宅建業免許番号の表記確認', h: 'Webへの法的表示事項として必須' }
    ]
  },
  '教育・スクール': {
    'biz-bg': [
      { q: '体験授業・無料相談の有無と体験→入会の転換率', h: '体験申込みのCVが主なWebの目標になりやすい' },
      { q: '通学・オンラインの比率と今後の方向性', h: 'LP設計・SEO方針の設計に影響' }
    ],
    strength: [
      { q: '合格実績・資格取得実績の具体的な数値', h: '具体的な数字が信頼性向上に直結。掲載許可の確認も必要' }
    ]
  },
  'IT・テクノロジー': {
    'biz-bg': [
      { q: '顧客は主にどんな課題でアプローチしてくるか', h: '課題起点の言語化がBtoBコンテンツの核になる' },
      { q: '商談〜受注までの平均期間（営業サイクル）', h: 'サイクルが長い場合はナーチャリングコンテンツが必要' }
    ],
    req: [
      { q: '競合SaaSや代替ツールとの差別化ポイント', h: 'IT系は比較記事・比較表が購買判断に影響大', hl: 1 }
    ]
  },
  '士業・コンサル': {
    'biz-bg': [
      { q: '顧客の主な相談経路（紹介・検索・SNS・セミナー）', h: '士業は紹介主体が多いが、Web経由のニーズも増加' },
      { q: '得意領域・専門特化している分野', h: '専門特化の方がSEO・認知獲得に有利' }
    ],
    req: [
      { q: '弁護士費用・報酬の表記方針（明示する/しない）', h: '士業のサイトでは費用感の開示レベルが重要な設計判断', hl: 1 }
    ]
  },
  '宿泊・観光': {
    'biz-bg': [
      { q: 'OTA（じゃらん・楽天・Booking.com）依存度と直接予約の比率', h: 'OTA比率が高いと手数料負担が重い → 直予約促進がWebの主テーマ' },
      { q: '繁忙期・閑散期のパターン', h: 'シーズナリティがコンテンツ設計・LP企画に影響' }
    ]
  },
  'スポーツ・フィットネス': {
    'biz-bg': [
      { q: '会員制か都度払いか、退会率・継続率の現状', h: 'フィットネスは継続率が最重要KPI' },
      { q: 'オンラインレッスンの有無と今後の展開', h: 'DX対応の観点でWebサービスとの連携も検討' }
    ]
  },
  'ブライダル・ウェディング': {
    'biz-bg': [
      { q: 'ゼクシィ・マイナビウェディング等のポータル掲載状況', h: 'ポータル依存度と公式サイトの役割分担を整理' },
      { q: '問い合わせから成約までの平均期間', h: 'ブライダルは検討期間が長い → 継続的な接触設計が必要' }
    ]
  },
  '福祉・相談・支援': {
    'biz-bg': [
      { q: '支援対象者が情報収集する媒体（SNS/検索/チラシ/口コミ）', h: '当事者ではなく家族が検索するケースも多い' },
      { q: '公的補助・助成金の活用状況と告知方針', h: 'サービス利用に繋がる重要な情報' }
    ],
    req: [
      { q: '個人情報・プライバシー保護に関する配慮事項・表現制限', h: '相談系サービスは特に慎重な表現が必要', hl: 1 }
    ]
  }
};

function suggestIndustryQ() {
  const ind1 = document.getElementById('ind1')?.value;
  const ind2 = document.getElementById('ind2')?.value;
  const banner = document.getElementById('ind-q-banner');
  if (!banner) return;
  const data = INDUSTRY_Q[ind1] || null;
  if (!ind1 || !data) { banner.style.display = 'none'; return; }
  const count = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
  const label = ind2 || ind1;
  banner.className = 'ind-q-banner';
  banner.style.display = '';
  banner.innerHTML = `<span>💡 <strong>${label}</strong> 向けの業種別ヒアリング項目が <strong>${count}件</strong> あります（重複はスキップされます）</span>
    <button onclick="addIndustryQ()" class="ind-q-add-btn">追加する</button>`;
}

function addIndustryQ() {
  const ind1 = document.getElementById('ind1')?.value;
  const data = INDUSTRY_Q[ind1] || null;
  if (!data) return;
  let added = 0;
  Object.entries(data).forEach(([key, qs]) => {
    if (!QS[key]) return;
    qs.forEach(q => {
      if (QS[key].some(x => x.q === q.q)) return;
      QS[key].push({ ...q, id: `${key}-ind-${Date.now()}-${added}`, answer: '' });
      added++;
    });
    renderQ(key);
  });
  const banner = document.getElementById('ind-q-banner');
  if (banner) {
    banner.className = 'ind-q-banner done';
    banner.innerHTML = `✅ ${added}件の業種別ヒアリング項目を追加しました`;
    setTimeout(() => { banner.style.display = 'none'; }, 3500);
  }
  showToast(`${added}件の業種別質問を追加しました`);
}

// ===== HEARING SHEET v2 — DATA & STATE =====
const QD = {
  req: [
    { q: '依頼内容', h: 'ご依頼いただく内容の全体像' },
    { q: '前提・補足情報', h: '既存素材・参照データ・制約など事前に共有いただくもの' }
  ],
  'biz-bg': [
    { q: '依頼の背景・きっかけ', h: 'なぜ今このタイミングなのか', hl: 1 },
    { q: '現在一番困っていること', h: '解決しないと起きる問題・影響', hl: 1 },
    { q: 'この課題はいつ頃から？', h: '' },
    { q: '過去に同じ課題を解決しようとしたことはあるか、その結果は？', h: '過去の取り組みを知ることで何が本当に必要かが見える' }
  ],
  'biz-model': [
    { q: 'メインのサービス・商品と客単価', h: 'ビジネス構造を理解することで提案の優先順位が変わる', hl: 1 },
    { q: '新規とリピートの比率', h: '集客重視か既存顧客強化かで戦略が変わる' },
    { q: '売上の季節性・繁忙期', h: '' },
    { q: '今後伸ばしたいサービス・商品', h: '' }
  ],
  strength: [
    { q: 'なぜ選んでいただけていると思うか', h: 'お客様から直接聞いた理由があれば', hl: 1 },
    { q: '他社には絶対にできないこと', h: '「普通のことでも構わない」と前置きして引き出す', hl: 1 },
    { q: '逆に、他社に負けていると感じること', h: '弱みを聞くことで逆に強みが浮き彫りになる' },
    { q: '断られた・選ばれなかった経験があれば、その理由は？', h: '失注理由を知っているかどうかで市場理解の深さがわかる', hl: 1 },
    { q: 'お客様から嬉しかった言葉・印象に残るフィードバック', h: '' },
    { q: '絶対に譲れないこだわり・ポリシー', h: 'ブランドの核になる部分', hl: 1 },
    { q: '創業・サービス開始のストーリー', h: '共感を生むナラティブはコピーの核になる' },
    { q: '10年後、どんな存在になりたいか', h: 'ビジョンを聞くことで中長期の設計に活かせる' },
    { q: 'お客様の期待値を超えた瞬間はどんな場面か', h: '' },
    { q: '「価格が高い」と言われたとき、どう答えているか', h: '価値の言語化力がわかる', hl: 1 }
  ],
  'tgt-cur': [
    { q: '年代・性別・職業', h: '' },
    { q: '抱えている悩み・不満', h: '' },
    { q: '商材を調べるシーン・媒体・検索キーワード', h: '' },
    { q: '認知から購買までの流れ', h: '' },
    { q: '選ばれる理由・重視していること', h: '' },
    { q: '表に出にくい本音・インサイト', h: '「〇〇と言いながら本当は〇〇と思っている」という構造を探る', hl: 1 }
  ],
  'tgt-fut': [
    { q: '年代・性別・職業', h: '' },
    { q: '抱えている悩みは？', h: '' },
    { q: '調べるシーン・媒体・検索キーワード', h: '' },
    { q: '今のサービス・制作物でそのターゲットにリーチできると思うか', h: '' },
    { q: 'そのターゲットに選ばれるために何が変わる必要があるか', h: '' }
  ],
  insight: [
    { q: '問い合わせ直前に一番迷うこと・不安に思うこと', h: '背中を押すコピーの設計に直結する', hl: 1 },
    { q: '比較して最後に選んでくれた方の決め手', h: '', hl: 1 },
    { q: '問い合わせをためらってやめた方が多い場合、その理由は？', h: '失われたコンバージョンの理由がわかれば対策できる' },
    { q: '「来てほしくない」ターゲット外の方はいるか', h: 'ターゲットの輪郭が明確になる' },
    { q: 'お客様が最初に感じる疑問・懸念', h: 'FAQやLPの訴求ポイントの設計に活かせる', hl: 1 },
    { q: '使い始めてよかったと実感する瞬間はどんな場面か', h: 'ビフォーアフターの言語化につながる' },
    { q: 'このサービスを人に紹介するとき、どう説明するか', h: '口コミ・紹介文のヒントになる', hl: 1 }
  ],
  web: [
    { q: '制作物の目的・目標KPI', h: '目的 / 目標値 / 現状値' },
    { q: 'ページ数・希望納品形式', h: 'デザインデータ / サーバーアップ / コード一式（zip）' },
    { q: '開発方法の希望', h: 'HTML/CSS / WordPress / STUDIO / その他' },
    { q: '現在のサイトの問題点・リニューアルの理由', h: 'リニューアルの場合' },
    { q: '現在のアクセス数・流入経路（GA4など）', h: '数字があれば改善提案の説得力が増す' },
    { q: '参考にしたいサイト（3つ以上）', h: 'なぜそのサイトが好きか理由も聞く' },
    { q: 'CVR・コンバージョン動線で重視すること', h: '' },
    { q: '必須コンテンツ・ページ構成', h: '' },
    { q: 'CMS・更新頻度の希望', h: '' },
    { q: '指定カラー・使用フォントの有無', h: '' }
  ],
  logo: [
    { q: '社名・ネーミングの由来', h: '' },
    { q: '表記はアルファベット？和文？大文字・小文字のルールは？', h: '' },
    { q: '事業の特徴・会社のビジョン', h: '' },
    { q: 'ロゴを刷新しようと思ったきっかけ', h: '' },
    { q: 'ロゴを見た方にどんな印象を持ってもらいたいか', h: '' },
    { q: 'デザインイメージの方向性', h: 'クール・親しみやすさ・信頼感・個性的・スタイリッシュ・温かみ など' },
    { q: 'ターゲット層（取引先・エンドユーザー）', h: '' },
    { q: 'キーカラー・こだわりモチーフ・避けてほしいデザイン', h: '' },
    { q: '使用場面（名刺・Web・看板・SNS など）', h: '' },
    { q: 'その他ご要望・制約', h: '' }
  ],
  print: [
    { q: '配布場所・対象エリア', h: '' },
    { q: 'サイズ・仕様（A4両面 / A5片面 / 折りパンフ など）', h: '' },
    { q: '印刷部数・印刷会社の指定', h: '' },
    { q: '掲載必須の情報', h: 'サービス名・電話番号・QRコード・料金表・地図など' },
    { q: '現状のチラシ・名刺の問題点', h: '' },
    { q: 'ロゴ・Webサイトとの統一感の希望', h: '' }
  ],
  line: [
    { q: 'LINEで実現したいこと', h: '予約受付 / クーポン配信 / 問い合わせ対応 など' },
    { q: '現在のLINE運用状況（公式アカウントの有無・登録者数）', h: '' },
    { q: 'リッチメニューに置きたいボタン・メニュー', h: '' },
    { q: '自動応答・チャットボットの希望', h: '' },
    { q: 'SNSアカウントの状況・投稿頻度・フォロワー数', h: '' },
    { q: '反応の良いコンテンツの傾向', h: '' }
  ],
  itc: [
    { q: '現在のサイト・システムはいつ制作したか', h: '' },
    { q: 'サーバー・ドメインの契約先・更新時期', h: '' },
    { q: 'Googleアナリティクス（GA4）は入っているか', h: '' },
    { q: 'Googleサーチコンソールは設定しているか', h: '' },
    { q: 'サイトの更新は誰がどのように行っているか', h: '' },
    { q: 'お問い合わせフォーム・予約システムは正常に動作しているか', h: '' },
    { q: 'SSL（https）は対応しているか', h: '' },
    { q: 'Googleビジネスプロフィールは設定しているか', h: '' },
    { q: 'SNSと公式サイトは連携しているか', h: '' },
    { q: '現在のWebで困っていること・気になっていること', h: '', hl: 1 }
  ],
  comp: [
    { q: '意識している競合・同業他社（URLがあれば）', h: '' },
    { q: 'ベンチマークにしているサイト・会社（業種問わず）', h: '' },
    { q: '競合と自社の違い・優れていると思う点', h: '' },
    { q: '競合のどこが嫌いか・どこが羨ましいか', h: '本音を引き出す質問', hl: 1 }
  ],
  order: [
    { q: '発注の判断軸・一番重視すること', h: 'クオリティ / 価格 / スピード / 提案力' },
    { q: '希望スケジュール・納期', h: '' },
    { q: '予算の上限', h: '' },
    { q: 'やりとりの希望ツール', h: 'Slack / Chatwork / LINE / メール' },
    { q: '決裁者の確認（同席・自己決裁）', h: '' },
    { q: '今後必要になりそうな施策', h: '名刺・会社資料・採用サイト・バナーなど' }
  ]
};

const IT_CHECKS = [
  'SSL / https 対応', '表示速度（PageSpeed Insights）',
  'モバイル対応（レスポンシブ）', 'GA4 / アクセス解析の設置',
  'Googleサーチコンソール', 'Googleビジネスプロフィール',
  'SEO（titleタグ・metaディスクリプション）', 'OGP（SNSシェア時の表示）',
  'お問い合わせフォームの動作確認', '404エラーページの設定',
  'コピーライト表記・年号', 'プライバシーポリシー・特商法の記載',
  'SNSリンクの動作確認', '競合サイトとのデザイン比較'
];

const DEFAULT_NA = ['次回ご提案日：', 'お返事いただける期日：', '決裁者の同席確認', 'お見積もり送付'];

// Hearing state
const QS = {};
const checkData = IT_CHECKS.map(item => ({ item, status: '未確認', note: '' }));
const hearingCompRows = [];
const naItems = DEFAULT_NA.map(t => ({ done: false, text: t }));

// ===== HEARING INIT =====
function initHearing() {
  Object.keys(QD).forEach(key => {
    QS[key] = QD[key].map((q, i) => ({ ...q, id: `${key}-${i}`, answer: '' }));
    renderQ(key);
  });
  renderCheckTable();
  renderHearingCompRows();
  renderNA();
  // free-note など .h-content 内の全テキストエリアをauto-resize
  const p1b = document.getElementById('p1b');
  if (p1b) p1b.addEventListener('input', e => { if (e.target.tagName === 'TEXTAREA') autoResize(e.target); }, { passive: true });
}

// ===== RENDER QUESTIONS =====
function renderQ(key) {
  const el = document.getElementById('qg-' + key);
  if (!el) return;
  el.innerHTML = QS[key].map((q, i) => `
    <div class="q-item${q.hl ? ' hl' : ''}" id="qi-${q.id}">
      <div class="q-header" onclick="toggleQ('${q.id}')">
        <div class="q-num">${i + 1}</div>
        <div class="q-label-text">${hesc(q.q)}</div>
        <span class="q-toggle-icon" id="icon-${q.id}">▼</span>
      </div>
      <div class="q-body" id="qb-${q.id}">
        ${q.h ? `<div class="q-hint">💡 ${hesc(q.h)}</div>` : ''}
        <div class="q-answer">
          <textarea placeholder="回答を入力..." oninput="upA('${key}','${q.id}',this.value);autoResize(this)">${hesc(q.answer || '')}</textarea>
        </div>
      </div>
    </div>`).join('');
  el.querySelectorAll('textarea').forEach(ta => autoResize(ta));
}

function toggleQ(id) {
  const body = document.getElementById('qb-' + id);
  const icon = document.getElementById('icon-' + id);
  if (!body) return;
  const open = body.classList.toggle('open');
  icon.classList.toggle('open', open);
}

function upA(key, id, val) {
  const q = QS[key] && QS[key].find(x => x.id === id);
  if (q) q.answer = val;
}

function addQ(key, inputId) {
  const input = document.getElementById(inputId);
  const txt = input.value.trim();
  if (!txt) return;
  QS[key].push({ q: txt, h: '', id: `${key}-${Date.now()}`, answer: '' });
  input.value = '';
  renderQ(key);
  showToast('項目を追加しました');
}

// ===== TOGGLE ALL =====
function openAll(scope) {
  const el = document.getElementById(getBlockEl(scope));
  if (!el) return;
  el.querySelectorAll('.q-body').forEach(b => b.classList.add('open'));
  el.querySelectorAll('.q-toggle-icon').forEach(i => i.classList.add('open'));
}
function closeAll(scope) {
  const el = document.getElementById(getBlockEl(scope));
  if (!el) return;
  el.querySelectorAll('.q-body').forEach(b => b.classList.remove('open'));
  el.querySelectorAll('.q-toggle-icon').forEach(i => i.classList.remove('open'));
}
function getBlockEl(scope) {
  const map = {
    'b1': 'b1', 'b2': 'b2', 'b3': 'b3', 'b4': 'b4', 'b5': 'b5',
    'b6-web': 'itp-med-web', 'b6-logo': 'itp-med-logo',
    'b6-print': 'itp-med-print', 'b6-line': 'itp-med-line',
    'b6-itc': 'itp-med-itc', 'b7': 'b7', 'b8': 'b8'
  };
  return map[scope] || scope;
}

// ===== IT CHECK TABLE =====
function renderCheckTable() {
  const el = document.getElementById('it-check-body');
  if (!el) return;
  el.innerHTML = checkData.map((r, i) => `
    <tr>
      <td>${hesc(r.item)}</td>
      <td>
        <select class="st-sel" onchange="checkData[${i}].status=this.value">
          ${['未確認', '✅ 問題なし', '⚠️ 要改善', '❌ 問題あり', '— 対象外'].map(s => `<option${s === r.status ? ' selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" placeholder="メモ" value="${hesc(r.note)}" oninput="checkData[${i}].note=this.value"></td>
    </tr>`).join('');
}
function addCheckRow() {
  checkData.push({ item: '', status: '未確認', note: '' });
  renderCheckTable();
}

// ===== HEARING COMP ROWS (相見積もり) =====
function renderHearingCompRows() {
  const el = document.getElementById('h-comp-rows');
  if (!el) return;
  el.innerHTML = hearingCompRows.map((r, i) => `
    <div class="h-comp-row">
      <div><div class="h-comp-row-lbl">会社名</div><input value="${hesc(r.name)}" placeholder="会社名" oninput="hearingCompRows[${i}].name=this.value"></div>
      <div><div class="h-comp-row-lbl">金額提示</div><input value="${hesc(r.price)}" placeholder="例：20万円" oninput="hearingCompRows[${i}].price=this.value"></div>
      <div><div class="h-comp-row-lbl">所感</div><input value="${hesc(r.note)}" placeholder="例：デザイン重視" oninput="hearingCompRows[${i}].note=this.value"></div>
    </div>`).join('');
}
function addHCompRow() {
  hearingCompRows.push({ name: '', price: '', note: '' });
  renderHearingCompRows();
}

// ===== NEXT ACTION =====
function renderNA() {
  const el = document.getElementById('na-list');
  if (!el) return;
  el.innerHTML = naItems.map((n, i) => `
    <div class="na-item">
      <input type="checkbox" class="na-cb" ${n.done ? 'checked' : ''} onchange="naItems[${i}].done=this.checked">
      <input class="na-input" value="${hesc(n.text)}" oninput="naItems[${i}].text=this.value">
      <button class="na-del" onclick="naItems.splice(${i},1);renderNA()">削除</button>
    </div>`).join('');
}
function addNA() { naItems.push({ done: false, text: '' }); renderNA(); }

// ===== HEARING SIDEBAR SCROLL NAV =====
const H_BLOCK_IDS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9'];

function scrollToHBlock(id) {
  const mainEl = document.querySelector('.main');
  const el = document.getElementById(id);
  if (!el || !mainEl) return;
  const mainRect = mainEl.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  mainEl.scrollBy({ top: elRect.top - mainRect.top - 24, behavior: 'smooth' });
  setHearingActiveNav(id);
}

function setHearingActiveNav(id) {
  H_BLOCK_IDS.forEach(b => {
    const nav = document.getElementById('hsn-' + b);
    if (nav) nav.classList.toggle('active', b === id);
  });
}

// Scroll spy for hearing (attached to .main scroll)
let hScrollTimer = null;
function initHearingScrollSpy() {
  const mainEl = document.querySelector('.main');
  if (!mainEl) return;
  mainEl.addEventListener('scroll', () => {
    if (!document.getElementById('p1b').classList.contains('active')) return;
    if (hScrollTimer) clearTimeout(hScrollTimer);
    hScrollTimer = setTimeout(() => {
      const mainRect = mainEl.getBoundingClientRect();
      let current = 'b1';
      H_BLOCK_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - mainRect.top <= 80) current = id;
      });
      setHearingActiveNav(current);
    }, 80);
  }, { passive: true });
}

// ===== INNER TABS (hearing) =====
function switchHTab(group, key, el) {
  document.querySelectorAll(`[id^="itp-${group}-"]`).forEach(p => p.classList.remove('on'));
  const target = document.getElementById(`itp-${group}-${key}`);
  if (target) target.classList.add('on');
  el.closest('.itabs').querySelectorAll('.itab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
}

// ===== GATHER / RESTORE HEARING DATA =====
function gatherHearing() {
  const fns = {};
  document.querySelectorAll('[id^="fn-"]').forEach(el => { fns[el.id.replace('fn-', '')] = el.value; });
  const kpiIds = ['kgi', 'ksf', 'target', 'current'];
  const cpaIds = ['budget', 'goal', 'now', 'limit', 'repeat', 'ltv'];
  const metaIds = ['date', 'members', 'format', 'url', 'rec'];
  return {
    qs: Object.fromEntries(Object.keys(QS).map(k => [k, QS[k].map(q => ({ ...q }))])),
    fns,
    kpi: Object.fromEntries(kpiIds.map(k => [k, (document.getElementById('kpi-' + k) || {}).value || ''])),
    cpa: Object.fromEntries(cpaIds.map(k => [k, (document.getElementById('cpa-' + k) || {}).value || ''])),
    meta: Object.fromEntries(metaIds.map(k => [k, (document.getElementById('m_' + k) || {}).value || ''])),
    checkData: checkData.map(r => ({ ...r })),
    hearingCompRows: [...hearingCompRows],
    naItems: [...naItems]
  };
}

function restoreHearing(d) {
  if (!d) return;
  if (d.qs) Object.entries(d.qs).forEach(([k, qs]) => { QS[k] = [...qs]; renderQ(k); });
  if (d.fns) Object.entries(d.fns).forEach(([k, val]) => { const el = document.getElementById('fn-' + k); if (el) el.value = val; });
  if (d.kpi) Object.entries(d.kpi).forEach(([k, val]) => { const el = document.getElementById('kpi-' + k); if (el) el.value = val; });
  if (d.cpa) Object.entries(d.cpa).forEach(([k, val]) => { const el = document.getElementById('cpa-' + k); if (el) el.value = val; });
  if (d.meta) Object.entries(d.meta).forEach(([k, val]) => { const el = document.getElementById('m_' + k); if (el) el.value = val; });
  if (d.checkData) { checkData.length = 0; d.checkData.forEach(r => checkData.push({ ...r })); renderCheckTable(); }
  if (d.hearingCompRows) { hearingCompRows.length = 0; d.hearingCompRows.forEach(r => hearingCompRows.push({ ...r })); renderHearingCompRows(); }
  if (d.naItems) { naItems.length = 0; d.naItems.forEach(n => naItems.push({ ...n })); renderNA(); }
  // free-note textareasのauto-resize初期化
  setTimeout(() => initAutoResize(document.getElementById('p1b')), 0);
}

function resetHearing() {
  Object.keys(QD).forEach(key => {
    QS[key] = QD[key].map((q, i) => ({ ...q, id: `${key}-${i}`, answer: '' }));
    renderQ(key);
  });
  document.querySelectorAll('[id^="fn-"]').forEach(el => { el.value = ''; });
  ['kgi', 'ksf', 'target', 'current'].forEach(k => { const el = document.getElementById('kpi-' + k); if (el) el.value = ''; });
  ['budget', 'goal', 'now', 'limit', 'repeat', 'ltv'].forEach(k => { const el = document.getElementById('cpa-' + k); if (el) el.value = ''; });
  ['date', 'members', 'format', 'url', 'rec'].forEach(k => { const el = document.getElementById('m_' + k); if (el) el.value = ''; });
  checkData.length = 0;
  IT_CHECKS.forEach(item => checkData.push({ item, status: '未確認', note: '' }));
  renderCheckTable();
  hearingCompRows.length = 0;
  renderHearingCompRows();
  naItems.length = 0;
  DEFAULT_NA.forEach(t => naItems.push({ done: false, text: t }));
  renderNA();
}

// ===== COMPETITION HINTS =====
function updateCompHint() {
  const ind1 = document.getElementById('ind1').value;
  const ind2 = document.getElementById('ind2').value;
  const region = document.getElementById('client_region').value || '地域';
  const kwBox = document.getElementById('comp-hint-kw');
  const ptBox = document.getElementById('comp-hint-points');
  if (!ind1) {
    kwBox.innerHTML = '<span style="color:var(--text3);font-size:11px">業種を選択すると調査ヒントが表示されます</span>';
    ptBox.innerHTML = '';
    return;
  }
  const label = ind2 || ind1;
  const kws = [`${region} ${label}`, `${label} 公式サイト`, `${label} ホームページ 参考`, `${ind1} デザイン 事例`];
  kwBox.innerHTML = kws.map(k => `<span onclick="navigator.clipboard.writeText('${k}').then(()=>showToast('コピーしました'))" title="クリックでコピー">${k}</span>`).join('');
  const points = ['サービスの見せ方・訴求軸', 'デザインのトーン・カラー使い', 'ナビゲーション・導線設計', 'CTA（予約・問合せ）の設置方法', 'スマホ対応の品質', '更新頻度・コンテンツ量'];
  ptBox.innerHTML = '<strong style="display:block;margin-bottom:4px">確認ポイント：</strong>' + points.map(p => `・${p}`).join('<br>');
}

// ===== AUTO FILL (タブ2〜5 含む) =====
function autoFill() {
  // ヒアリングQSから主要回答を取得
  const qa = (key, idx) => (QS[key] && QS[key][idx]) ? QS[key][idx].answer : '';
  const h = {
    service:  qa('biz-model', 0),
    strength: qa('strength', 0),
    story:    qa('strength', 6),
    problem:  qa('biz-bg', 1),
    solve:    qa('biz-bg', 0),
    goal:     document.getElementById('kpi-target') ? document.getElementById('kpi-target').value : '',
    kpi:      document.getElementById('kpi-kgi') ? document.getElementById('kpi-kgi').value : '',
    target:   qa('tgt-cur', 0),
    pain:     qa('tgt-cur', 1),
    reason:   qa('tgt-cur', 4),
    insight:  qa('insight', 0),
    compInfo: qa('comp', 0)
  };
  const ind1 = v('ind1') || '';
  const ind2 = v('ind2') || '';
  const region = v('client_region') || '';
  const client = v('client_name') || 'クライアント';
  const meds = S.mediums.join('・') || '制作物';

  // ===== タブ2: 目的・ゴール =====
  S.bullets.goals = [];
  if (h.solve) S.bullets.goals.push({ id: Date.now() + 1, text: h.solve });
  if (h.goal) S.bullets.goals.push({ id: Date.now() + 2, text: h.goal });
  if (h.kpi) S.bullets.goals.push({ id: Date.now() + 3, text: `KGI：${h.kpi}` });
  if (!h.solve && !h.goal) S.bullets.goals.push({ id: Date.now() + 4, text: `${meds}を通じた認知拡大と問い合わせ増加` });
  renderBullets('goals-list', 'goals');

  // As Is
  S.bullets.asis = [];
  if (h.problem) {
    h.problem.split(/[。\n・]/).filter(s => s.trim()).forEach((s, i) => S.bullets.asis.push({ id: Date.now() + 10 + i, text: s.trim() }));
  } else {
    S.bullets.asis.push({ id: Date.now() + 10, text: `${ind2 || ind1}としての情報発信が不十分` });
  }
  renderBullets('asis-list', 'asis');

  // To Be
  S.bullets.tobe = [];
  [
    h.goal || `${meds}を通じて新規顧客が自然に獲得できている`,
    `${client}のサービスが${region || '地域'}に広く認知されている`,
    h.reason ? `「${h.reason}」という理由で選ばれている` : '信頼感のある情報発信ができている'
  ].forEach((t, i) => S.bullets.tobe.push({ id: Date.now() + 20 + i, text: t }));
  renderBullets('tobe-list', 'tobe');

  // 施策
  S.tactics = [];
  if (meds.includes('Web') || meds.includes('LP')) S.tactics.push({ id: Date.now() + 30, title: '共感を軸にしたWebサイト制作', detail: h.story ? `「${h.story.slice(0, 40)}」という想いを起点にしたコピー・デザイン` : 'ターゲットの悩みに寄り添ったコピーとビジュアルで構成' });
  if (meds.includes('LINE')) S.tactics.push({ id: Date.now() + 31, title: 'LINE構築による予約・問い合わせ導線の整備', detail: '心理的ハードルを下げ、気軽に連絡できる環境をつくる' });
  if (meds.includes('チラシ')) S.tactics.push({ id: Date.now() + 32, title: 'チラシによる地域認知の拡大', detail: `${region || '地域'}の施設・窓口への配布で存在を知ってもらう` });
  if (S.tactics.length === 0) S.tactics.push({ id: Date.now() + 33, title: 'ブランド認知向上のための情報発信', detail: 'ターゲットに届く媒体でサービスの価値を伝える' });
  renderTactics();

  // ===== タブ3: ターゲット =====
  if (h.target) {
    document.getElementById('target_desc').value = h.target + (h.pain ? `\n\n【悩み】${h.pain}` : '');
    document.getElementById('target_behavior').value = h.reason ? `サービスを選ぶ決め手：${h.reason}` : '';
  }
  // 年齢チップ自動選択
  const ageMap = { '10代': ['10代', '10', '高校'], '20代': ['20代', '20', '大学'], '30代': ['30代', '30', '三十'], '40代': ['40代', '40', '四十'], '50代以上': ['50代', '50', '五十', 'シニア'] };
  const tStr = (h.target + h.pain).toLowerCase();
  Object.entries(ageMap).forEach(([label, kws]) => {
    if (kws.some(k => tStr.includes(k))) {
      document.querySelectorAll('#age-chips .chip').forEach(c => {
        if (c.textContent.trim() === label) { c.classList.add('on'); if (!S.chips.age) S.chips.age = []; if (!S.chips.age.includes(label)) S.chips.age.push(label); }
      });
    }
  });
  if (tStr.includes('女性') || tStr.includes('女')) {
    document.querySelectorAll('#gender-chips .chip').forEach(c => {
      if (c.textContent.trim() === '女性寄り') { c.classList.add('on'); if (!S.chips.gender) S.chips.gender = []; if (!S.chips.gender.includes('女性寄り')) S.chips.gender.push('女性寄り'); }
    });
  }
  // イメージKW
  const kwMap = {
    '福祉・相談・支援': ['親しみやすい', '安心感', '温かみ', 'ナチュラル'],
    '医療・ヘルスケア': ['信頼感', 'プロフェッショナル', '安心感'],
    '美容・コスメ': ['エレガント', 'フェミニン', 'スタイリッシュ', '高級感'],
    '宿泊・観光': ['ナチュラル', '温かみ'],
    '教育・スクール': ['信頼感', '親しみやすい', 'ポップ'],
    'IT・テクノロジー': ['モダン', 'クール', 'スタイリッシュ', 'プロフェッショナル']
  };
  (kwMap[ind1] || []).forEach(kw => {
    document.querySelectorAll('#image-chips .chip').forEach(c => {
      if (c.textContent.trim() === kw && !c.classList.contains('on')) {
        c.classList.add('on');
        if (!S.chips.image) S.chips.image = [];
        if (!S.chips.image.includes(kw)) S.chips.image.push(kw);
      }
    });
  });

  // ===== タブ4: ペルソナ / CJM =====
  const ageGuess = S.chips.age?.[0] || '30代';
  const genderGuess = (S.chips.gender || []).includes('女性寄り') ? '女性' : '男性';
  document.getElementById('persona_name').value = genderGuess === '女性' ? '田中 美佐子' : '田中 太郎';
  document.getElementById('persona_job').value = `${ageGuess}・${ind2 || ind1}を必要としているユーザー`;
  document.getElementById('persona_family').value = region || '地域在住';
  document.getElementById('persona_lifestyle').value = 'スマホ中心の情報収集。SNSとGoogle検索を日常的に使用。';
  document.getElementById('persona_pain').value = h.pain || `${ind2 || ind1}に関連する悩みを抱えているが、どこに相談すればよいかわからない状態。`;
  document.getElementById('persona_goal').value = h.goal || `${h.service ? h.service.slice(0, 30) + '...' : `${client}のサービス`}を通じて、悩みを解消したい。`;
  document.getElementById('persona_behavior').value = `情報収集はスマホで行い、${h.reason || '口コミや見た目の安心感'}を重視して意思決定する。`;
  document.getElementById('persona_quote').value = `「${h.story ? h.story.slice(0, 30) + '...' : `${client}なら安心して相談できそう`}」`;
  // CJM
  const cjmData = {
    '行動_認知': `${region || '地域'}でSNS・Googleを見ていて${client}を発見`,
    '行動_興味・検討': `サイトやSNSで${h.service ? h.service.slice(0, 20) : 'サービス内容'}を確認`,
    '行動_決定・行動': `${S.mediums.includes('LINE構築') ? 'LINEで問い合わせ・予約' : 'フォームから問い合わせ'}`,
    '行動_利用・継続': 'サービス利用後、口コミ・SNSでシェア',
    '思考・感情_認知': '「こんなサービスがあるんだ」「自分に合うかな？」',
    '思考・感情_興味・検討': h.pain ? `「${h.pain.slice(0, 20)}…」と感じており、解決策を探している` : '料金や内容が自分に合うか確認している',
    '思考・感情_決定・行動': h.reason ? `「${h.reason.slice(0, 25)}」と感じて決断` : '安心感・信頼感を確認して問い合わせを決意',
    '思考・感情_利用・継続': '「相談してよかった」「また利用したい」',
    'タッチポイント_認知': 'Instagram・Google検索・チラシ・知人の口コミ',
    'タッチポイント_興味・検討': 'Webサイト・SNS・Google口コミ・LINE',
    'タッチポイント_決定・行動': '問い合わせフォーム・LINE・電話',
    'タッチポイント_利用・継続': 'SNS・メルマガ・LINE配信',
    '課題・障壁_認知': 'そもそも存在を知らない / 似たサービスと区別できない',
    '課題・障壁_興味・検討': '料金・内容・信頼性への不安 / 情報が見つけにくい',
    '課題・障壁_決定・行動': '問い合わせへの心理的ハードル / 操作がわかりにくい',
    '課題・障壁_利用・継続': '継続的な関係構築ができていない',
    '施策アイデア_認知': 'SEO対策・SNS定期発信・チラシ配布・地域イベント出展',
    '施策アイデア_興味・検討': 'FAQ設置・料金の明示・代表のプロフィール充実',
    '施策アイデア_決定・行動': 'LINE予約・シンプルなフォーム・CTA最適化',
    '施策アイデア_利用・継続': '定期LINE配信・お礼メッセージ・紹介特典'
  };
  Object.assign(S.cjm.data, cjmData);
  initCJM();

  // ===== タブ5: 競合調査 =====
  // ヒアリングで出た競合情報をS.competitorsに追加
  updateCompHint();
  if (h.compInfo) {
    const lines = h.compInfo.split(/[\n・、,，]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60);
    lines.slice(0, 3).forEach(line => {
      if (!S.competitors.some(c => c.name === line)) {
        S.competitors.push({ id: Date.now() + Math.random(), url: '', name: line, strong: '', weak: '', design: '', diff: '', client_info: `（ヒアリングより）${line}` });
      }
    });
    if (lines.length > 0) renderComps();
  }

  const resultEl = document.getElementById('auto-result');
  resultEl.style.display = 'block';
  resultEl.innerHTML = `✅ 自動入力完了。タブ2（ゴール ${S.bullets.goals.length}件）・タブ3（ターゲット）・タブ4（ペルソナ・CJM）・タブ5（競合）に反映しました。内容を確認して修正してください。`;
  showToast('自動入力しました');
}

function v(id) { return (document.getElementById(id) || {}).value || ''; }

// ===== NAV =====
function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');
  if (id === 'p8') buildOutput();
  if (id === 'p9') loadPaletteToContrast();
  if (id === 'p1b') suggestIndustryQ();

  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.scrollTop = 0;
}

// ===== MEDIUMS =====
function togMed(name, el) {
  el.classList.toggle('on');
  const i = S.mediums.indexOf(name);
  if (i >= 0) S.mediums.splice(i, 1);
  else S.mediums.push(name);
  renderSidebarMeds();
  updateRefFilter();
  updateCompHint();
}
function addMedPrompt() {
  const val = prompt('制作物名を入力:');
  if (!val || !val.trim()) return;
  const name = val.trim();
  if (S.mediums.includes(name)) { showToast('すでに追加済みです'); return; }
  S.mediums.push(name);
  renderSidebarMeds();
  updateRefFilter();
  showToast(name + 'を追加しました');
}
function renderSidebarMeds() {
  document.getElementById('medList').innerHTML = S.mediums.map(m => `
    <div class="med-item"><input type="checkbox" checked onchange="removeMed('${m}',this)"><label>${m}</label></div>`).join('');
}
function removeMed(name, cb) {
  if (!cb.checked) { S.mediums = S.mediums.filter(x => x !== name); renderSidebarMeds(); updateRefFilter(); }
}

// ===== CHIPS =====
function toggleChip(el, group) {
  el.classList.toggle('on');
  if (!S.chips[group]) S.chips[group] = [];
  const val = el.textContent.trim();
  const i = S.chips[group].indexOf(val);
  if (i >= 0) S.chips[group].splice(i, 1);
  else S.chips[group].push(val);
}
function gc(g) { return (S.chips[g] || []).join('、') || '—'; }

// ===== BULLETS =====
function addBullet(cid, key) {
  const id = Date.now();
  if (!S.bullets[key]) S.bullets[key] = [];
  S.bullets[key].push({ id, text: '' });
  renderBullets(cid, key);
}
function delBullet(cid, key, id) { S.bullets[key] = S.bullets[key].filter(b => b.id !== id); renderBullets(cid, key); }
function upBullet(key, id, val) { const b = S.bullets[key].find(x => x.id === id); if (b) b.text = val; }
function renderBullets(cid, key) {
  const el = document.getElementById(cid);
  el.innerHTML = (S.bullets[key] || []).map(b => `
    <div class="bitem">
      <button class="btn-del" onclick="delBullet('${cid}','${key}',${b.id})">×</button>
      <textarea style="flex:1;font-size:11px;min-height:30px;padding:4px 8px;border-radius:5px;line-height:1.4" onchange="upBullet('${key}',${b.id},this.value)" oninput="upBullet('${key}',${b.id},this.value)">${b.text}</textarea>
    </div>`).join('');
}

// ===== TACTICS =====
function addTactic() { S.tactics.push({ id: Date.now(), title: '', detail: '' }); renderTactics(); }
function delTactic(id) { S.tactics = S.tactics.filter(t => t.id !== id); renderTactics(); }
function upTactic(id, k, val) { const t = S.tactics.find(x => x.id === id); if (t) t[k] = val; }
function renderTactics() {
  document.getElementById('tactics-list').innerHTML = S.tactics.map((t, i) => `
    <div class="titem">
      <div class="tnum">${i + 1}</div>
      <div class="tbody">
        <input type="text" placeholder="施策タイトル" value="${t.title}" oninput="upTactic(${t.id},'title',this.value)">
        <textarea placeholder="詳細" style="min-height:44px;font-size:11px" oninput="upTactic(${t.id},'detail',this.value)">${t.detail}</textarea>
      </div>
      <button class="btn-del" onclick="delTactic(${t.id})" style="margin-top:2px">×</button>
    </div>`).join('');
}

// ===== CJM =====
function initCJM() {
  const body = document.getElementById('cjm-body');
  body.innerHTML = S.cjm.rows.map(row => `
    <tr>
      <td class="rh">${row}</td>
      ${S.cjm.stages.map(stage => `
        <td><textarea class="jtarea" oninput="S.cjm.data['${row}_${stage}']=this.value">${S.cjm.data[row + '_' + stage] || ''}</textarea></td>
      `).join('')}
    </tr>`).join('');
}

// ===== COMPETITORS =====
function addComp() {
  S.competitors.push({ id: Date.now(), url: '', name: '', strong: '', weak: '', design: '', diff: '', client_info: '' });
  renderComps();
}
function delComp(id) { S.competitors = S.competitors.filter(c => c.id !== id); renderComps(); }
function upComp(id, k, val) { const c = S.competitors.find(x => x.id === id); if (c) c[k] = val; }
function renderComps() {
  document.getElementById('comp-container').innerHTML = S.competitors.map((c, i) => `
    <div class="comp-card">
      <div class="comp-head">
        <div class="comp-num">${i + 1}</div>
        <input type="text" placeholder="競合名" value="${c.name}" style="flex:1;border:none;background:transparent;font-size:13px;font-weight:500;outline:none" oninput="upComp(${c.id},'name',this.value)">
        <button class="btn-del" onclick="delComp(${c.id})">×</button>
      </div>
      <div class="comp-body">
        <div class="field"><label class="flabel">URL</label><input type="url" value="${c.url}" placeholder="https://..." oninput="upComp(${c.id},'url',this.value)"></div>
        <div style="margin-bottom:10px"><label class="flabel" style="margin-bottom:5px">先方からの情報・知っていること</label><textarea placeholder="例：地域で有名・料金が安い・SNSが活発など" style="min-height:52px" oninput="upComp(${c.id},'client_info',this.value)">${c.client_info}</textarea></div>
        <div class="comp-g">
          <div class="field"><label class="flabel">強み</label><textarea placeholder="例：地域認知が高い・料金明示" style="min-height:52px" oninput="upComp(${c.id},'strong',this.value)">${c.strong}</textarea></div>
          <div class="field"><label class="flabel">弱み</label><textarea placeholder="例：デザインが古い・導線不明瞭" style="min-height:52px" oninput="upComp(${c.id},'weak',this.value)">${c.weak}</textarea></div>
          <div class="field"><label class="flabel">デザイン特徴</label><textarea placeholder="例：落ち着いた和風・写真多め" style="min-height:52px" oninput="upComp(${c.id},'design',this.value)">${c.design}</textarea></div>
          <div class="field"><label class="flabel">差別化ポイント（当社）</label><textarea placeholder="例：共感ベースのコピー・安心感のある導線" style="min-height:52px" oninput="upComp(${c.id},'diff',this.value)">${c.diff}</textarea></div>
        </div>
      </div>
    </div>`).join('');
}

// ===== REF SITES =====
const REF_TYPES = ['コーポレート', 'LP', '採用', 'ロゴ', 'チラシ', 'LINE', 'SNS', 'その他'];
function addRef(type, url, title, cc, mm) {
  S.refs.push({ id: Date.now() + Math.random(), type: type || 'コーポレート', url: url || '', title: title || '', cc: cc || '', mm: mm || '', img: '' });
  renderRefTable();
}
function delRef(id) { S.refs = S.refs.filter(r => r.id !== id); renderRefTable(); }
function upRef(id, k, val) { const r = S.refs.find(x => x.id === id); if (r) r[k] = val; }
function updateRefFilter() {
  const types = ['all', ...new Set(['コーポレート', 'LP', '採用', 'ロゴ', 'チラシ', 'LINE', 'SNS', ...S.mediums])];
  document.getElementById('ref-filter').innerHTML = types.map(t => `<button class="btn btn-o btn-sm" onclick="filterRef('${t}')">${t === 'all' ? 'すべて' : t}</button>`).join('');
}
let curRefFilter = 'all';
function filterRef(t) { curRefFilter = t; renderRefTable(); }
function renderRefTable() {
  const rows = curRefFilter === 'all' ? S.refs : S.refs.filter(r => r.type === curRefFilter);
  document.getElementById('refBody').innerHTML = rows.map(r => `
    <tr>
      <td><select style="font-size:10px;padding:3px 5px;border-radius:4px" onchange="upRef(${r.id},'type',this.value)">${REF_TYPES.map(t => `<option${t === r.type ? ' selected' : ''}>${t}</option>`).join('')}</select></td>
      <td><input type="url" placeholder="https://..." value="${r.url}" oninput="upRef(${r.id},'url',this.value)"></td>
      <td><input type="text" placeholder="サイト名" value="${r.title}" oninput="upRef(${r.id},'title',this.value)"></td>
      <td><textarea placeholder="クライアントのコメント" oninput="upRef(${r.id},'cc',this.value)">${r.cc}</textarea></td>
      <td><textarea placeholder="自分のメモ" oninput="upRef(${r.id},'mm',this.value)">${r.mm}</textarea></td>
      <td style="text-align:center;vertical-align:middle">
        ${r.img ? `<img src="${r.img}" class="ref-thumb" onclick="document.getElementById('rfi-${r.id}').click()" title="クリックで変更">` : `<button class="ref-img-btn" onclick="document.getElementById('rfi-${r.id}').click()" title="スクリーンショットを追加">📷</button>`}
        <input type="file" id="rfi-${r.id}" accept="image/*" style="display:none" onchange="onRefImageLoaded(${r.id},this)">
      </td>
      <td style="text-align:center"><button class="btn-del" onclick="delRef(${r.id})">×</button></td>
    </tr>`).join('');
}
function onRefImageLoaded(id, input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { upRef(id, 'img', e.target.result); renderRefTable(); showToast('画像を登録しました'); };
  reader.readAsDataURL(file);
}

// ===== CSV =====
function handleCSV(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split('\n').filter(l => l.trim());
    lines.slice(1).forEach(line => {
      const c = line.split(',').map(x => x.replace(/^"|"$/g, '').trim());
      if (c[1]) addRef(c[0], c[1], c[2], c[3], c[4]);
    });
    showToast(`${lines.length - 1}件インポートしました`);
  };
  reader.readAsText(file, 'UTF-8');
}
function handleDrop(e) { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.name.endsWith('.csv')) handleCSV({ files: [f] }); }
function dlCSVTemplate(e) {
  e.preventDefault();
  const csv = '種別,URL,タイトル,クライアントコメント,自分のメモ\nコーポレート,https://example.com,サンプルサイト,,\n';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = '参考サイトテンプレート.csv'; a.click();
}

// ===== SCALE =====
const SLABELS = { 'soft-warm': 'ロマンチック / フェミニン / やさしい', 'soft-cool': 'クリア / ナチュラル / 爽やか', 'hard-warm': 'ダイナミック / ワイルド / エネルギッシュ', 'hard-cool': 'モダン / スマート / ダンディ', 'center': 'バランス型 / ナチュラル', 'center-soft': 'エレガント / 上品 / 繊細', 'center-warm': 'カジュアル / 陽気 / 親しみやすい', 'center-cool': 'スタイリッシュ / シャープ', 'center-hard': 'クラシック / 重厚感' };
function placePin(e) {
  const r = document.getElementById('scaleMap').getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  S.scale = { x, y };
  const pin = document.getElementById('scalePin');
  pin.style.left = (x * 100) + '%'; pin.style.top = (y * 100) + '%'; pin.style.display = 'block';
  const cx = x - .5, cy = y - .5, d = Math.sqrt(cx * cx + cy * cy);
  let lbl = '';
  if (d < .1) lbl = SLABELS['center'];
  else if (Math.abs(cy) < .1) lbl = cx < 0 ? SLABELS['center-warm'] : SLABELS['center-cool'];
  else if (Math.abs(cx) < .1) lbl = cy < 0 ? SLABELS['center-soft'] : SLABELS['center-hard'];
  else lbl = (cy < 0 && cx < 0) ? SLABELS['soft-warm'] : (cy < 0 && cx >= 0) ? SLABELS['soft-cool'] : (cy >= 0 && cx < 0) ? SLABELS['hard-warm'] : SLABELS['hard-cool'];
  S.scale.label = lbl;
  document.getElementById('scaleResult').textContent = '📍 ' + lbl;
}

// ===== COLORS =====
function addColor(type, hex) {
  if (!S.colors[type]) S.colors[type] = [];
  S.colors[type].push(hex);
  const c = document.getElementById('pal-' + type);
  if (!c) return;
  const sw = document.createElement('div'); sw.className = 'sw'; sw.style.background = hex; sw.title = hex;
  const d = document.createElement('div'); d.className = 'sdel'; d.textContent = '×';
  d.onclick = ev => { ev.stopPropagation(); S.colors[type] = S.colors[type].filter(x => x !== hex); c.removeChild(sw); };
  sw.appendChild(d); c.insertBefore(sw, c.lastElementChild);
}

function renderPalette() {
  ['main', 'sub', 'accent', 'text'].forEach(type => {
    const c = document.getElementById('pal-' + type);
    if (!c) return;
    while (c.children.length > 1) c.removeChild(c.firstChild);
    (S.colors[type] || []).forEach(hex => {
      const sw = document.createElement('div'); sw.className = 'sw'; sw.style.background = hex; sw.title = hex;
      const d = document.createElement('div'); d.className = 'sdel'; d.textContent = '×';
      d.onclick = ev => { ev.stopPropagation(); S.colors[type] = S.colors[type].filter(x => x !== hex); c.removeChild(sw); };
      sw.appendChild(d); c.insertBefore(sw, c.lastElementChild);
    });
  });
}

// ===== AUTO BACKUP =====
function autoBackup(name, data) {
  const today = new Date().toISOString().slice(0, 10);
  const filename = (name || '案件').replace(/[\\/:*?"<>|]/g, '_') + '_' + today + '.json';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = filename;
  a.click();
}

// ===== FILE SYSTEM SYNC (File System Access API / Chrome・Edge のみ) =====
let _fileHandle = null;

// IndexedDB にファイルハンドルを永続化するミニラッパー
function _idbOp(mode, fn) {
  return new Promise((res, rej) => {
    const req = indexedDB.open('direction-board-fsh', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('h');
    req.onsuccess = e => {
      try {
        const tx = e.target.result.transaction('h', mode);
        fn(tx.objectStore('h'), res);
        tx.onerror = () => rej(tx.error);
      } catch (err) { rej(err); }
    };
    req.onerror = () => rej(req.error);
  });
}
const _idbGet = k => _idbOp('readonly',  (s, r) => { const g = s.get(k); g.onsuccess = () => r(g.result); });
const _idbPut = (k, v) => _idbOp('readwrite', (s, r) => { s.put(v, k).onsuccess = r; });
const _idbDel = k => _idbOp('readwrite', (s, r) => { s.delete(k).onsuccess = r; });

async function initFileSync() {
  if (!('showSaveFilePicker' in window)) { updateFileSyncUI('unsupported'); return; }
  try {
    const handle = await _idbGet('fh');
    if (!handle) { updateFileSyncUI('none'); return; }
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm === 'granted') { _fileHandle = handle; updateFileSyncUI('connected'); }
    else { updateFileSyncUI('needs-permission'); }
  } catch { updateFileSyncUI('none'); }
}

async function setupFileSync() {
  if (!('showSaveFilePicker' in window)) { showToast('この機能はChrome / Edgeのみ対応しています'); return; }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'direction-board-data.json',
      startIn: 'documents',
      types: [{ description: 'Direction Board データ', accept: { 'application/json': ['.json'] } }]
    });
    _fileHandle = handle;
    await _idbPut('fh', handle);
    await writeAllToFile();
    updateFileSyncUI('connected');
    localStorage.setItem('direction_board_last_backup', new Date().toISOString());
    renderDashboard();
    showToast('保存先を設定しました。以降は自動でファイルに書き込まれます。');
  } catch { /* キャンセル */ }
}

async function reconnectFileSync() {
  try {
    let handle = _fileHandle || await _idbGet('fh');
    if (!handle) { showToast('保存先が見つかりません。再設定してください。'); return; }
    const perm = await handle.requestPermission({ mode: 'readwrite' });
    if (perm === 'granted') {
      _fileHandle = handle;
      await writeAllToFile();
      updateFileSyncUI('connected');
      showToast('ファイル接続を再開しました。');
    }
  } catch { showToast('接続できませんでした。'); }
}

async function disconnectFileSync() {
  _fileHandle = null;
  try { await _idbDel('fh'); } catch {}
  updateFileSyncUI('none');
  renderDashboard();
  showToast('ファイル同期を解除しました。');
}

async function writeAllToFile() {
  if (!_fileHandle) return;
  try {
    const payload = JSON.stringify({
      _schema: DATA_SCHEMA_VERSION,
      _savedAt: new Date().toISOString(),
      _appVersion: 'direction-board-v3',
      projects: getProjects()
    }, null, 2);
    const writable = await _fileHandle.createWritable();
    await writable.write(payload);
    await writable.close();
  } catch {
    // 権限が切れた可能性
    _fileHandle = null;
    updateFileSyncUI('needs-permission');
  }
}

function updateFileSyncUI(state) {
  // ヘッダーバッジ
  const badge = document.getElementById('filesync-badge');
  if (badge) {
    if (state === 'connected') {
      badge.textContent = '📁 同期中';
      badge.style.cursor = 'default';
      badge.onclick = null;
    } else if (state === 'needs-permission') {
      badge.textContent = '📁 再接続が必要';
      badge.style.color = '#fbbf24';
      badge.style.cursor = 'pointer';
      badge.onclick = reconnectFileSync;
    } else {
      badge.textContent = '';
      badge.onclick = null;
    }
  }
  // ダッシュボード内 UI
  const ui = document.getElementById('filesync-ui');
  if (!ui) return;
  if (state === 'connected') {
    ui.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:13px;color:var(--success)">✅ ファイルに自動保存中</span>
        <button class="btn btn-o" onclick="disconnectFileSync()" style="font-size:11px">解除</button>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:4px">保存・自動保存のたびにDocumentsのJSONファイルへ書き込まれます。</div>`;
  } else if (state === 'needs-permission') {
    ui.innerHTML = `
      <button class="btn btn-o" onclick="reconnectFileSync()" style="font-size:13px">🔗 ファイル接続を再開</button>
      <div style="font-size:11px;color:var(--text3);margin-top:4px">ブラウザ再起動後は再接続が必要です。クリック→「許可」で再開します。</div>`;
  } else if (state === 'unsupported') {
    ui.innerHTML = `<div style="font-size:12px;color:var(--text3)">⚠ この機能はChrome / Edgeのみ対応しています。</div>`;
  } else {
    ui.innerHTML = `
      <button class="btn btn-p" onclick="setupFileSync()" style="font-size:13px">📁 ファイル保存先を設定する</button>
      <div style="font-size:11px;color:var(--text3);margin-top:4px">DocumentsなどにJSONファイルを作成し、保存のたびに自動書き込みします。</div>`;
  }
}

// ===== SAVE / LOAD =====
function getAllInputs() {
  const ids = ['projectName', 'client_name', 'client_contact', 'client_region', 'ind3', 'project_phase', 'date_kickoff', 'date_delivery', 'budget', 'design_url', 'notes', 'mission_text', 'target_desc', 'target_behavior', 'avoid_image', 'persona_name', 'persona_job', 'persona_family', 'persona_lifestyle', 'persona_pain', 'persona_goal', 'persona_behavior', 'persona_quote', 'font_heading', 'font_body', 'tonmana_memo'];
  const d = {}; ids.forEach(id => { const el = document.getElementById(id); if (el) d[id] = el.value; });
  d.ind1 = document.getElementById('ind1').value;
  d.ind2 = document.getElementById('ind2').value;
  return d;
}

function saveProject(silent = false) {
  const allInputs = getAllInputs();
  const hearingData = gatherHearing();
  const fullData = {
    _schema: DATA_SCHEMA_VERSION,
    ...allInputs,
    chips: S.chips, colors: S.colors, scale: S.scale, mediums: S.mediums,
    competitors: S.competitors, refs: S.refs, bullets: S.bullets, tactics: S.tactics, cjm: S.cjm, schedule: S.schedule, meetings: S.meetings,
    hearing: hearingData
  };
  const projectName = document.getElementById('projectName').value.trim();

  if (!currentProjectId) {
    if (silent) return;
    const name = projectName || prompt('案件名を入力してください:');
    if (!name) return;
    const id = 'proj_' + Date.now();
    const now = new Date().toISOString();
    const projects = getProjects();
    projects.unshift({
      id, name,
      status: '進行中',
      createdAt: now, updatedAt: now,
      client: allInputs.client_name || '',
      industry: (allInputs.ind1 || '') + (allInputs.ind2 ? ' > ' + allInputs.ind2 : ''),
      mediums: [...S.mediums],
      data: fullData
    });
    setProjects(projects);
    currentProjectId = id;
    updateSaveState();
    showToast('保存しました（⌘S で随時保存できます）');
    autoBackup(name, fullData);
    writeAllToFile();
    return;
  }

  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === currentProjectId);
  if (idx < 0) return;
  projects[idx].name = projectName || projects[idx].name;
  projects[idx].updatedAt = new Date().toISOString();
  projects[idx].client = allInputs.client_name || '';
  projects[idx].industry = (allInputs.ind1 || '') + (allInputs.ind2 ? ' > ' + allInputs.ind2 : '');
  projects[idx].mediums = [...S.mediums];
  projects[idx].data = fullData;
  setProjects(projects);
  writeAllToFile();

  if (silent) {
    const el = document.getElementById('autosave-indicator');
    if (el) {
      const t = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      el.textContent = '自動保存 ' + t;
      el.style.opacity = '1';
      clearTimeout(el._fadeTimer);
      el._fadeTimer = setTimeout(() => { el.style.opacity = '0'; }, 3000);
    }
  } else {
    showToast('保存しました');
    autoBackup(projects[idx].name, fullData);
  }
}

function loadData() {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = ev => {
      try { restoreData(JSON.parse(ev.target.result)); showToast('読み込みました'); }
      catch { showToast('読込エラー'); }
    };
    reader.readAsText(e.target.files[0]);
  }; input.click();
}

function restoreData(d) {
  Object.entries(d).forEach(([k, val]) => { if (typeof val === 'string') { const el = document.getElementById(k); if (el) el.value = val; } });
  if (d.ind1) { document.getElementById('ind1').value = d.ind1; updateInd2(); setTimeout(() => { if (d.ind2) document.getElementById('ind2').value = d.ind2; }, 50); }
  if (d.chips) Object.assign(S.chips, d.chips);
  if (d.colors) { Object.assign(S.colors, d.colors); renderPalette(); }
  if (d.scale) Object.assign(S.scale, d.scale);
  if (d.mediums) { S.mediums = d.mediums; renderSidebarMeds(); updateRefFilter(); }
  if (d.competitors) { S.competitors = d.competitors; renderComps(); }
  if (d.refs) { S.refs = d.refs; renderRefTable(); }
  if (d.bullets) { Object.assign(S.bullets, d.bullets); ['goals', 'asis', 'tobe'].forEach(k => renderBullets(k + '-list', k)); }
  if (d.tactics) { S.tactics = d.tactics; renderTactics(); }
  if (d.cjm) { Object.assign(S.cjm, d.cjm); initCJM(); }
  if (d.schedule) { S.schedule = d.schedule; if (typeof renderGantt === 'function') renderGantt(); }
  if (d.meetings) { S.meetings = d.meetings; renderMinutesList(); }
  if (d.scale?.x != null) {
    const pin = document.getElementById('scalePin');
    if (pin) { pin.style.left = (d.scale.x * 100) + '%'; pin.style.top = (d.scale.y * 100) + '%'; pin.style.display = 'block'; }
    const sr = document.getElementById('scaleResult');
    if (sr) sr.textContent = '📍 ' + d.scale.label;
  }
  document.querySelectorAll('.chip').forEach(c => {
    const grp = c.closest('[id$="-chips"]')?.id.replace('-chips', '');
    if (grp && S.chips[grp]?.includes(c.textContent.trim())) c.classList.add('on');
  });
  updateCompHint();
  if (d.hearing) restoreHearing(d.hearing);
}

// ===== OUTPUT =====
function buildOutput() {
  const d = getAllInputs();
  const allC = [...S.colors.main, ...S.colors.sub, ...S.colors.accent];
  const refs = S.refs.filter(r => r.url);
  document.getElementById('output-container').innerHTML = `
  <div class="ogrid">
    <div class="ocard">
      <div class="otitle">基本情報</div>
      <div class="orow"><span class="ok">クライアント</span><span class="ov">${d.client_name || '—'}${d.client_contact ? ' / ' + d.client_contact : ''}</span></div>
      <div class="orow"><span class="ok">業種</span><span class="ov">${d.ind1 || '—'}${d.ind2 ? ' > ' + d.ind2 : ''}${d.ind3 ? ' (' + d.ind3 + ')' : ''}</span></div>
      <div class="orow"><span class="ok">地域</span><span class="ov">${d.client_region || '—'}</span></div>
      <div class="orow"><span class="ok">制作物</span><span class="ov">${S.mediums.join('、') || '—'}</span></div>
      <div class="orow"><span class="ok">納品</span><span class="ov">${d.date_delivery || '—'}</span></div>
      <div class="orow"><span class="ok">予算</span><span class="ov">${d.budget || '—'}</span></div>
    </div>
    <div class="ocard">
      <div class="otitle">ターゲット</div>
      <div class="orow"><span class="ok">年齢層</span><span class="ov">${gc('age')}</span></div>
      <div class="orow"><span class="ok">性別</span><span class="ov">${gc('gender')}</span></div>
      <div class="orow" style="flex-direction:column;gap:4px"><span class="ok">像</span><span style="font-size:11px">${d.target_desc || '—'}</span></div>
    </div>
    <div class="ocard full">
      <div class="otitle">目的・ゴール</div>
      ${(S.bullets.goals || []).map(b => `<div style="font-size:12px;padding:2px 0">・${b.text}</div>`).join('') || '<span style="color:var(--text3);font-size:11px">未入力</span>'}
    </div>
    <div class="ocard">
      <div class="otitle">ペルソナ</div>
      <div class="orow"><span class="ok">名前</span><span class="ov">${d.persona_name || '—'}</span></div>
      <div class="orow"><span class="ok">属性</span><span class="ov">${d.persona_job || '—'}</span></div>
      <div class="orow" style="flex-direction:column;gap:3px"><span class="ok">悩み</span><span style="font-size:11px">${d.persona_pain || '—'}</span></div>
    </div>
    <div class="ocard">
      <div class="otitle">トンマナ</div>
      <div class="orow"><span class="ok">KW</span><span class="ov" style="font-size:11px">${gc('image')}</span></div>
      <div class="orow"><span class="ok">スケール</span><span class="ov" style="font-size:11px">${S.scale.label || '未設定'}</span></div>
      ${allC.length ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">${allC.map(c => `<div style="width:24px;height:24px;border-radius:4px;background:${c};border:1px solid rgba(0,0,0,.08)"></div>`).join('')}</div>` : ''}
    </div>
    <div class="ocard full">
      <div class="otitle">施策</div>
      ${S.tactics.map((t, i) => `<div style="padding:5px 0;border-bottom:1px solid var(--bg);font-size:12px"><strong>${i + 1}. ${t.title}</strong>${t.detail ? `<span style="color:var(--text2);margin-left:6px">— ${t.detail}</span>` : ''}</div>`).join('') || '<span style="color:var(--text3);font-size:11px">未入力</span>'}
    </div>
    <div class="ocard full">
      <div class="otitle">参考サイト（${refs.length}件）</div>
      ${refs.slice(0, 6).map((r, i) => `<div style="font-size:12px;padding:3px 0;border-bottom:1px solid var(--bg)">${i + 1}. <span style="background:var(--blue-bg);color:var(--blue);font-size:10px;padding:1px 6px;border-radius:100px;margin-right:4px">${r.type}</span><a href="${r.url}" target="_blank" style="color:var(--accent)">${r.title || r.url}</a>${r.cc ? ` — <span style="color:var(--text2);font-size:11px">${r.cc}</span>` : ''}</div>`).join('') || '<span style="color:var(--text3);font-size:11px">未登録</span>'}
    </div>
  </div>`;
}

function copyOutput() {
  const d = getAllInputs();
  const text = `【ディレクション方針書】\n案件名：${d.projectName || '未入力'}\n${'='.repeat(44)}\n■ クライアント: ${d.client_name || '—'}\n■ 業種: ${d.ind1} > ${d.ind2} ${d.ind3 ? '(' + d.ind3 + ')' : ''}\n■ 地域: ${d.client_region || '—'}\n■ 制作物: ${S.mediums.join('、') || '—'}\n■ 納品: ${d.date_delivery || '—'} / 予算: ${d.budget || '—'}\n\n■ 目的・ゴール\n${(S.bullets.goals || []).map(b => '  ・' + b.text).join('\n') || '  —'}\n\n■ As Is\n${(S.bullets.asis || []).map(b => '  ・' + b.text).join('\n') || '  —'}\n\n■ To Be\n${(S.bullets.tobe || []).map(b => '  ・' + b.text).join('\n') || '  —'}\n\n■ Mission: ${d.mission_text || '—'}\n\n■ 施策\n${S.tactics.map((t, i) => `  ${i + 1}. ${t.title}${t.detail ? '\n     ' + t.detail : ''}`).join('\n') || '  —'}\n\n■ ターゲット\n  年齢層: ${gc('age')}\n  性別: ${gc('gender')}\n  像: ${d.target_desc || '—'}\n\n■ ペルソナ: ${d.persona_name || '—'}（${d.persona_job || '—'}）\n  悩み: ${d.persona_pain || '—'}\n\n■ イメージKW: ${gc('image')}\n■ スケール: ${S.scale.label || '未設定'}\n${'='.repeat(44)}`.trim();
  navigator.clipboard.writeText(text).then(() => showToast('コピーしました'));
}

function genPrompt() {
  const d = getAllInputs();
  const prompt = `以下のヒアリング・ディレクション情報をもとに、デザイン・制作の方針書を詳しく作成してください。\n\nクライアント：${d.client_name}\n業種：${d.ind1} > ${d.ind2} ${d.ind3 ? '(' + d.ind3 + ')' : ''}\n地域：${d.client_region}\n制作物：${S.mediums.join('、')}\nMission：${d.mission_text}\nターゲット：${d.target_desc}\nペルソナの悩み：${d.persona_pain}\nイメージKW：${gc('image')}\nイメージスケール：${S.scale.label}\n\n【出力してほしいこと】\n1. タイポグラフィ・フォントの方向性\n2. 写真・イラストの方向性\n3. レイアウト・余白の考え方\n4. UIコンポーネントの印象（角丸・線の細さ等）\n5. キャッチコピー案（3案）\n6. ページ構成の提案`;
  navigator.clipboard.writeText(prompt).then(() => showToast('プロンプトをコピー。このチャットに貼り付けてください'));
}

// ===== PROJECT DEFINITION SHEET (スプレッドシート直貼り用TSV) =====
function genProjectDef() {
  const d = getAllInputs();
  const xe = s => (s || '').replace(/\t/g, '　').replace(/\n/g, ' ');
  const qa = (key, idx) => (QS[key]?.[idx]?.answer || '');
  const qaAll = key => (QS[key] || []).filter(q => q.answer).map(q => `【${q.q}】${q.answer}`).join(' / ');

  const problems  = [qa('biz-bg', 1), qa('biz-bg', 0)].filter(Boolean).join(' / ');
  const goals     = (S.bullets.goals || []).map(b => b.text).join(' / ') || xe(d.mission_text);
  const target    = [xe(d.persona_name) ? `${xe(d.persona_name)}（${xe(d.persona_job)}）` : '', xe(d.target_desc)].filter(Boolean).join(' ');
  const insight   = [xe(d.persona_pain), xe(d.persona_quote)].filter(Boolean).join(' / ');
  const query     = qa('tgt-cur', 2) || xe(d.target_behavior);
  const strengths = qaAll('strength');
  const comps     = (S.competitors || []).map(c => c.name + (c.url ? `（${c.url}）` : '')).join(' / ') || '';
  const refUrls   = (S.refs || []).filter(r => r.url).slice(0, 5).map(r => (r.title ? `${r.title} ` : '') + r.url + (r.cc ? `（${r.cc}）` : '')).join(' / ');
  const impression= [S.scale.label, (S.chips.image || []).join('・'), xe(d.avoid_image) ? `避けたい：${xe(d.avoid_image)}` : ''].filter(Boolean).join(' ／ ');
  const tactics   = (S.tactics || []).map(t => t.title).join(' / ');
  const mtg       = (S.meetings || []).slice(0, 3).map(m => `[${m.date || ''}]${m.title || ''}`).join(' / ');

  // TABで区切ったTSV — スプレッドシートのA列から貼ると B=ラベル C=内容 になります
  const rows = [
    ['', '※赤は必須項目'],
    ['', '要　件　定　義'],
    ['', 'プロジェクト名',                          xe(d.projectName)],
    ['', 'プロジェクト詳細',                        xe(d.notes)],
    ['', 'URL',                                      qa('req', 0) || ''],
    ['', '提供資料URL等',                            xe(d.design_url)],
    ['', '現状の課題、依頼背景',                    problems],
    ['', '目的（定量/機能的）とCVポイント',         goals],
    ['', '流入経路とデバイス',                      [S.mediums.join('・'), xe(d.target_behavior)].filter(Boolean).join(' / ')],
    ['', 'メインターゲット（N1）',                  target],
    ['', '検索クエリ',                              query],
    ['', 'インサイト',                              insight],
    ['', '競合他社・ベンチマーク',                  comps],
    ['', '企業や商材の特長、優位性・独自性（なぜ選ばれるのか？）', strengths],
    ['', '期待するデザインクオリティやアウトプットイメージ', refUrls],
    ['', '与えたい印象',                            impression],
    ['', 'デザインの仕様・ページ数',                S.mediums.join('・')],
    ['', '希望納品形式',                            ''],
    ['', '希望納品スケジュール',                    xe(d.date_delivery)],
    ['', '予算の上限',                              xe(d.budget)],
    ['', 'その他必要な施策・クリエイティブ',        tactics],
    ['', '発注判断軸',                              ''],
    ['', 'mtgメモ',                                 mtg],
    ['', '補足・注意事項',                          xe(d.notes)],
  ];

  const tsv = rows.map(r => r.join('\t')).join('\n');
  const out  = document.getElementById('projdef-out');
  const wrap = document.getElementById('projdef-wrap');
  if (out)  out.textContent = tsv;
  if (wrap) wrap.style.display = '';
  wrap?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyProjectDef() {
  const out = document.getElementById('projdef-out');
  if (!out) return;
  navigator.clipboard.writeText(out.textContent).then(() => showToast('コピーしました。スプレッドシートのA1セルに貼り付けてください'));
}

// ===== FIGMA SLIDE PROMPT GENERATOR =====
function genFigmaPrompt() {
  const d = getAllInputs();
  const xe = s => (s || '');

  const goals   = (S.bullets.goals || []).map(b => '  - ' + b.text).join('\n') || '  （未入力）';
  const asis    = (S.bullets.asis  || []).map(b => '  - ' + b.text).join('\n') || '  （未入力）';
  const tobe    = (S.bullets.tobe  || []).map(b => '  - ' + b.text).join('\n') || '  （未入力）';
  const tactics = (S.tactics || []).map(t => '  - ' + t.title + (t.detail ? '：' + t.detail : '')).join('\n') || '  （未入力）';
  const refs    = (S.refs || []).slice(0, 8).map(r => `  - [${r.type}] ${r.title || ''} ${r.url}${r.cc ? '  ※クライアントコメント:' + r.cc : ''}`).join('\n') || '  （未登録）';

  const mainC = (S.colors.main   || []).join(', ') || '（未設定）';
  const subC  = (S.colors.sub    || []).join(', ') || '（未設定）';
  const accC  = (S.colors.accent || []).join(', ') || '（未設定）';

  const schedule = S.schedule || { kickoff: '', groups: [] };
  const schedRows = (schedule.groups || []).map(g => {
    const tasks = g.tasks || [];
    const s = tasks[0]?.startDate || g.startDate || '—';
    const e = tasks[tasks.length - 1]?.endDate || '—';
    return `  - ${g.name}：${tasks.length}タスク（${s} → ${e}）、完了 ${tasks.filter(t => t.status === '完了').length}件`;
  }).join('\n') || '  （未設定）';

  const cjm = S.cjm || { rows: [], stages: [], data: {} };
  const cjmText = cjm.rows.length
    ? cjm.rows.map(row =>
        `  【${row}】\n` + cjm.stages.map(st =>
          `    ${st}: ${cjm.data[row + '_' + st] || '—'}`).join('\n')
      ).join('\n')
    : '  （未設定）';

  const prompt =
`# Figma キックオフスライドデッキ 作成プロンプト
# ─────────────────────────────────────────────
# 以下の情報をもとに、Figmaでキックオフ用スライドデッキを作成してください。
# フォーマット: 16:9 / 1920×1080px / 6枚構成
# ─────────────────────────────────────────────

## ① プロジェクト基本情報

案件名     : ${xe(d.projectName) || '（未設定）'}
クライアント: ${xe(d.client_name) || '（未設定）'}
業種       : ${xe(d.ind1)}${d.ind2 ? ' / ' + xe(d.ind2) : ''}${d.ind3 ? '（' + xe(d.ind3) + '）' : ''}
地域       : ${xe(d.client_region) || '（未設定）'}
担当者     : ${xe(d.client_contact) || '（未設定）'}
制作物     : ${S.mediums.join('、') || '（未設定）'}
キックオフ : ${xe(d.date_kickoff) || '（未設定）'}
納期       : ${xe(d.date_delivery) || '（未設定）'}
予算       : ${xe(d.budget) || '（未設定）'}


## ② デザイン方針

カラーパレット:
  メインカラー  : ${mainC}
  サブカラー   : ${subC}
  アクセント   : ${accC}
  テキスト     : ${(S.colors.text || []).join(', ') || '（未設定）'}

タイポグラフィ:
  見出しフォント: ${xe(d.font_heading) || 'Noto Sans JP Bold'}
  本文フォント  : ${xe(d.font_body)    || 'Noto Sans JP Regular'}

イメージ / トーン:
  スケール     : ${S.scale.label || '（未設定）'}
  メモ         : ${xe(d.tonmana_memo) || '（未設定）'}

デザイン基本ルール:
  - スライドヘッダー帯: メインカラー（${(S.colors.main || [])[0] || '#2c4a3e'}）、白文字
  - 本文エリア: 白背景、テキストは濃いグレー系
  - 強調ボックス: メインカラー背景 + 白文字
  - カード: 薄いグレー背景（#f9fafb）、8pxの角丸
  - フォントサイズ目安: 大見出し 40-48pt、スライド見出し 24-28pt、本文 14-16pt、小テキスト 11-12pt


## ③ スライド構成と掲載コンテンツ

---

### Slide 1：表紙
レイアウト : メインカラーのグラデーション全面背景（中央揃え）
コンテンツ :
  - 大見出し（白太字）: 「${xe(d.projectName) || '案件名'}」
  - サブタイトル（白・やや透明）: 「${xe(d.client_name) || 'クライアント名'} — キックオフ資料」
  - 情報バッジ（白半透明・横並び・角丸）:
      📅 キックオフ ${xe(d.date_kickoff) || '—'}
      🏁 納期 ${xe(d.date_delivery) || '—'}
      🏢 ${xe(d.ind1) + (d.ind2 ? ' / ' + xe(d.ind2) : '')}
      🛠 ${S.mediums.join('・') || '—'}
      💰 ${xe(d.budget) || '—'}

---

### Slide 2：スケジュール
レイアウト : ヘッダー帯（メインカラー）+ 白背景テーブル
ヘッダー   : 「📅 スケジュール」
テーブル列 : グループ名 / タスク数 / 開始日 / 終了日 / 完了数
コンテンツ :
${schedRows}

---

### Slide 3：要件定義
レイアウト : ヘッダー帯 + 3列×2行グリッドカード + 制作物チップ
ヘッダー   : 「📋 要件定義」
グリッドカード:
  クライアント: ${xe(d.client_name) || '—'}
  業種        : ${xe(d.ind1) + (d.ind2 ? ' / ' + xe(d.ind2) : '')}
  担当者      : ${xe(d.client_contact) || '—'}
  キックオフ  : ${xe(d.date_kickoff) || '—'}
  納期        : ${xe(d.date_delivery) || '—'}
  予算        : ${xe(d.budget) || '—'}
制作物チップ（メインカラー背景・白文字・角丸）:
  ${S.mediums.join(' ／ ') || '（未選択）'}
${d.notes ? `備考ボックス（黄みの薄い背景）:\n  ${xe(d.notes)}` : ''}

---

### Slide 4：目的・ゴール
レイアウト : ヘッダー帯 + 3カラムの矢印フロー（As Is → To Be → 施策）+ Mission ボックス + ゴール一覧
ヘッダー   : 「🎯 目的・ゴール」
As Is（現状）:
${asis}
To Be（目指す姿）:
${tobe}
施策:
${tactics}
Mission（メインカラー背景・白太字の強調ボックス）:
  「${xe(d.mission_text) || '（未設定）'}」
ゴール:
${goals}

---

### Slide 5：ペルソナ・カスタマージャーニー
レイアウト : ヘッダー帯 + 左右2分割（左: ペルソナカード、右: CJMテーブル）
ヘッダー   : 「👤 ペルソナ・カスタマージャーニー」
ペルソナカード（左・薄グレー角丸カード）:
  名前     : ${xe(d.persona_name) || '（未設定）'}
  属性     : ${xe(d.persona_job) || '—'}  ${xe(d.persona_family) || ''}
  日常     : ${xe(d.persona_lifestyle) || '—'}
  悩み     : ${xe(d.persona_pain) || '—'}
  ゴール   : ${xe(d.persona_goal) || '—'}
  行動     : ${xe(d.persona_behavior) || '—'}
  一言     : 「${xe(d.persona_quote) || '—'}」
CJM テーブル（右）:
  ステージ : ${(cjm.stages || []).join(' / ')}
${cjmText}

---

### Slide 6：参考サイト
レイアウト : ヘッダー帯 + 4列グリッド（最大8枚のカード）
ヘッダー   : 「🔗 参考サイト」
各カード構成: [種別バッジ] → サイト名（太字）→ URL（グレー）→ クライアントコメント（あれば）
              ※ スクリーンショット画像があればカード上部に表示
コンテンツ :
${refs}


## ④ Figma 作業手順（参考）

1. Figmaで新規ファイルを作成
2. フレームサイズを「Presentation → Slide 16:9（1920×1080）」に設定
3. 上記の6枚分のフレームを並べる
4. カラースタイルを登録（メインカラー・サブカラー・テキストカラー）
5. テキストスタイルを登録（見出し・本文・小テキスト）
6. スライドヘッダー帯・カード・テーブル行をコンポーネント化すると修正が楽
7. PDF出力: File → Export → Select all frames → PDF`;

  const out  = document.getElementById('figma-prompt-out');
  const wrap = document.getElementById('figma-prompt-wrap');
  if (out)  out.textContent = prompt;
  if (wrap) { wrap.style.display = ''; wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  showToast('Figmaプロンプトを生成しました');
}

function copyFigmaPrompt() {
  const txt = document.getElementById('figma-prompt-out')?.textContent || '';
  navigator.clipboard.writeText(txt).then(() => showToast('コピーしました'));
}

// ===== KICKOFF SLIDES EXPORT (legacy — replaced by genFigmaPrompt) =====
function exportSlides() {
  const d = getAllInputs();
  const xe = s => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const goals    = (S.bullets.goals || []).map(b => b.text);
  const asis     = (S.bullets.asis  || []).map(b => b.text);
  const tobe     = (S.bullets.tobe  || []).map(b => b.text);
  const tactics  = (S.tactics || []);
  const refs     = (S.refs || []).slice(0, 8);
  const schedule = S.schedule || { kickoff: '', groups: [] };
  const cjm      = S.cjm || { rows: [], stages: [], data: {} };

  const li = arr => arr.length ? arr.map(t => `<li>${xe(t)}</li>`).join('') : '<li style="color:#9ca3af">（未入力）</li>';

  const scheduleRows = (schedule.groups || []).map(g => {
    const tasks = g.tasks || [];
    const start = tasks[0]?.startDate || g.startDate || '—';
    const end   = tasks[tasks.length - 1]?.endDate || '—';
    const done  = tasks.filter(t => t.status === '完了').length;
    return `<tr><td>${xe(g.name)}</td><td>${tasks.length}件</td><td>${xe(start)}</td><td>${xe(end)}</td><td>${done}/${tasks.length}</td></tr>`;
  }).join('');

  const refCards = refs.map(r => `
    <div class="ref-card">
      ${r.img ? `<img src="${r.img}" style="width:100%;height:56px;object-fit:cover;border-radius:4px;margin-bottom:6px">` : ''}
      <div class="ref-type">${xe(r.type)}</div>
      <div style="font-size:9pt;font-weight:600;color:#1c1917;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${xe(r.title || r.url)}</div>
      <div class="ref-url">${xe(r.url)}</div>
      ${r.cc ? `<div style="font-size:8pt;color:#374151;margin-top:4px;border-top:1px solid #e5e7eb;padding-top:4px">${xe(r.cc)}</div>` : ''}
    </div>`).join('');

  const cjmHTML = cjm.rows.length ? `
    <table class="cjm-tbl">
      <thead><tr><th></th>${cjm.stages.map(s => `<th>${xe(s)}</th>`).join('')}</tr></thead>
      <tbody>${cjm.rows.map(row => `<tr><td class="cjm-lbl">${xe(row)}</td>${cjm.stages.map(st => `<td>${xe(cjm.data[row+'_'+st] || '')}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>` : '<p style="color:#9ca3af;font-size:10pt">（CJMは未入力です）</p>';

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans JP','Hiragino Sans',sans-serif;background:#111827}
    .slide{width:1280px;height:720px;background:#fff;overflow:hidden;position:relative;display:flex;flex-direction:column;margin:0 auto 2px}
    .sh{background:#2c4a3e;color:#fff;padding:14px 36px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
    .sh-title{font-size:14pt;font-weight:700}
    .sh-badge{font-size:9pt;opacity:.7}
    .sb{flex:1;padding:22px 36px;overflow:hidden}
    /* Cover */
    .cover{background:linear-gradient(135deg,#1a3328 0%,#2c4a3e 50%,#3d6b5e 100%);justify-content:center;align-items:center;text-align:center}
    .cv-title{font-size:32pt;font-weight:700;color:#fff;margin-bottom:10px;line-height:1.2}
    .cv-sub{font-size:14pt;color:rgba(255,255,255,.7);margin-bottom:28px}
    .cv-chips{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
    .cv-chip{background:rgba(255,255,255,.15);color:rgba(255,255,255,.9);padding:5px 16px;border-radius:20px;font-size:10pt;border:1px solid rgba(255,255,255,.2)}
    /* Two-col */
    .two{display:grid;grid-template-columns:1fr 1fr;gap:24px;height:100%}
    .panel{background:#f9fafb;border-radius:8px;padding:16px;overflow:hidden}
    .plabel{font-size:8pt;text-transform:uppercase;letter-spacing:2px;color:#2c4a3e;font-weight:700;margin-bottom:8px}
    .ptitle{font-size:15pt;font-weight:700;color:#1c1917;margin-bottom:14px}
    ul.bl{list-style:none;margin:0;padding:0}
    ul.bl li{padding:5px 0;font-size:9.5pt;line-height:1.5;border-bottom:1px solid #f0f0f0;color:#374151}
    ul.bl li::before{content:'●';color:#2c4a3e;margin-right:8px;font-size:7pt}
    table.sch{width:100%;border-collapse:collapse;font-size:9pt}
    table.sch th{background:#2c4a3e;color:#fff;padding:6px 10px;text-align:left;font-size:8.5pt;font-weight:600}
    table.sch td{padding:5px 10px;border-bottom:1px solid #e5e7eb;color:#374151}
    table.sch tr:nth-child(even) td{background:#f9fafb}
    /* Goals */
    .arrow-flow{display:grid;grid-template-columns:1fr 24px 1fr 24px 1fr;gap:0;align-items:start;margin-bottom:14px}
    .flow-box{background:#f9fafb;border-radius:8px;padding:12px;font-size:9pt}
    .flow-label{font-size:8pt;font-weight:700;color:#2c4a3e;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px}
    .flow-arrow{font-size:18pt;color:#d1d5db;display:flex;align-items:center;justify-content:center;padding-top:12px}
    .mission-box{background:#2c4a3e;color:#fff;border-radius:8px;padding:12px 16px;font-size:10pt;font-weight:600;margin-top:10px}
    /* Persona */
    .persona-card{background:#f9fafb;border-radius:8px;padding:16px;height:100%}
    .p-name{font-size:15pt;font-weight:700;color:#1c1917;margin-bottom:2px}
    .p-sub{font-size:9.5pt;color:#6b7280;margin-bottom:12px}
    .p-row{display:flex;gap:8px;margin-bottom:7px;align-items:flex-start;font-size:9pt}
    .p-lbl{background:#2c4a3e;color:#fff;padding:2px 8px;border-radius:4px;font-size:8pt;white-space:nowrap;flex-shrink:0}
    table.cjm-tbl{width:100%;border-collapse:collapse;font-size:8pt;margin-top:6px}
    table.cjm-tbl th{background:#2c4a3e;color:#fff;padding:4px 8px;text-align:left;font-weight:600}
    table.cjm-tbl td{padding:4px 8px;border:1px solid #e5e7eb;vertical-align:top;line-height:1.4;color:#374151}
    table.cjm-tbl .cjm-lbl{background:#f3f4f6;font-weight:600;color:#1c1917;white-space:nowrap}
    /* Refs */
    .ref-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .ref-card{border:1px solid #e5e7eb;border-radius:6px;padding:10px;overflow:hidden;background:#fff}
    .ref-type{font-size:7pt;color:#2c4a3e;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
    .ref-url{color:#6b7280;font-size:7.5pt;word-break:break-all;overflow:hidden;max-height:2.4em}
    /* Spec */
    .spec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .spec-item{background:#f9fafb;border-radius:8px;padding:12px}
    .spec-lbl{font-size:8pt;color:#6b7280;margin-bottom:4px}
    .spec-val{font-size:12pt;font-weight:700;color:#1c1917}
    .med-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
    .med-chip{background:#2c4a3e;color:#fff;padding:4px 14px;border-radius:16px;font-size:9pt;font-weight:600}
    @media print{
      body{background:#fff}
      .no-print{display:none}
      @page{size:33.87cm 19.05cm;margin:0}
      .slide{width:33.87cm;height:19.05cm;page-break-after:always;page-break-inside:avoid;margin:0}
    }`;

  const win = window.open('', '_blank', 'width=1300,height=800');
  win.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<title>${xe(d.projectName || 'キックオフ資料')}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>${css}</style>
<style>body{zoom:${Math.round(Math.min((window.screen.width-40)/1280,1)*100)/100}}</style>
</head><body>
<div class="no-print" style="position:fixed;bottom:16px;right:16px;z-index:100;display:flex;gap:8px">
  <button onclick="window.print()" style="background:#2c4a3e;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">🖨 PDF保存</button>
  <button onclick="window.close()" style="background:#e5e7eb;color:#374151;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:13px">✕ 閉じる</button>
</div>

<!-- SLIDE 1: 表紙 -->
<div class="slide cover">
  <div class="cv-title">${xe(d.projectName || 'プロジェクト名')}</div>
  <div class="cv-sub">${xe(d.client_name || 'クライアント名')} — キックオフ資料</div>
  <div class="cv-chips">
    ${d.date_kickoff ? `<span class="cv-chip">📅 キックオフ ${xe(d.date_kickoff)}</span>` : ''}
    ${d.date_delivery ? `<span class="cv-chip">🏁 納期 ${xe(d.date_delivery)}</span>` : ''}
    ${d.ind1 ? `<span class="cv-chip">🏢 ${xe(d.ind1)}${d.ind2 ? ' / '+xe(d.ind2) : ''}</span>` : ''}
    ${S.mediums.length ? `<span class="cv-chip">🛠 ${S.mediums.map(xe).join('・')}</span>` : ''}
    ${d.budget ? `<span class="cv-chip">💰 ${xe(d.budget)}</span>` : ''}
  </div>
</div>

<!-- SLIDE 2: スケジュール -->
<div class="slide">
  <div class="sh"><span class="sh-title">📅 スケジュール</span><span class="sh-badge">Phase 0</span></div>
  <div class="sb">
    ${schedule.groups.length ? `
    <table class="sch">
      <thead><tr><th>フェーズ / グループ</th><th>タスク数</th><th>開始日</th><th>終了日</th><th>進捗</th></tr></thead>
      <tbody>${scheduleRows}</tbody>
    </table>` : '<p style="color:#9ca3af;margin-top:40px;text-align:center;font-size:12pt">（スケジュールは未入力です）</p>'}
  </div>
</div>

<!-- SLIDE 3: 要件定義 -->
<div class="slide">
  <div class="sh"><span class="sh-title">📋 要件定義</span><span class="sh-badge">Requirements</span></div>
  <div class="sb">
    <div class="spec-grid">
      <div class="spec-item"><div class="spec-lbl">クライアント</div><div class="spec-val" style="font-size:11pt">${xe(d.client_name||'—')}</div></div>
      <div class="spec-item"><div class="spec-lbl">業種</div><div class="spec-val" style="font-size:10pt">${xe((d.ind1||'')+(d.ind2?' / '+d.ind2:''))}</div></div>
      <div class="spec-item"><div class="spec-lbl">担当者</div><div class="spec-val" style="font-size:10pt">${xe(d.client_contact||'—')}</div></div>
      <div class="spec-item"><div class="spec-lbl">キックオフ日</div><div class="spec-val">${xe(d.date_kickoff||'—')}</div></div>
      <div class="spec-item"><div class="spec-lbl">納期</div><div class="spec-val">${xe(d.date_delivery||'—')}</div></div>
      <div class="spec-item"><div class="spec-lbl">予算</div><div class="spec-val">${xe(d.budget||'—')}</div></div>
    </div>
    <div class="med-chips">${S.mediums.length ? S.mediums.map(m => `<span class="med-chip">${xe(m)}</span>`).join('') : '<span style="color:#9ca3af;font-size:10pt">制作物未選択</span>'}</div>
    ${d.notes ? `<div style="margin-top:14px;background:#fef9c3;border-radius:8px;padding:12px 14px;font-size:9.5pt;color:#713f12"><strong>備考：</strong>${xe(d.notes)}</div>` : ''}
  </div>
</div>

<!-- SLIDE 4: 目的・ゴール -->
<div class="slide">
  <div class="sh"><span class="sh-title">🎯 目的・ゴール</span><span class="sh-badge">Phase A</span></div>
  <div class="sb">
    <div class="arrow-flow">
      <div class="flow-box"><div class="flow-label">As Is（現状）</div><ul class="bl">${li(asis)}</ul></div>
      <div class="flow-arrow">→</div>
      <div class="flow-box"><div class="flow-label">To Be（目指す姿）</div><ul class="bl">${li(tobe)}</ul></div>
      <div class="flow-arrow">→</div>
      <div class="flow-box"><div class="flow-label">施策</div><ul class="bl">${tactics.length ? tactics.map(t => `<li>${xe(t.title)}</li>`).join('') : '<li style="color:#9ca3af">（未入力）</li>'}</ul></div>
    </div>
    ${d.mission_text ? `<div class="mission-box">Mission: ${xe(d.mission_text)}</div>` : ''}
    ${goals.length ? `<div style="margin-top:10px"><div class="flow-label" style="margin-bottom:6px">ゴール</div><ul class="bl">${li(goals)}</ul></div>` : ''}
  </div>
</div>

<!-- SLIDE 5: ペルソナ・CJM -->
<div class="slide">
  <div class="sh"><span class="sh-title">👤 ペルソナ・カスタマージャーニー</span><span class="sh-badge">Phase B</span></div>
  <div class="sb two">
    <div class="persona-card">
      <div class="p-name">${xe(d.persona_name||'（未設定）')}</div>
      <div class="p-sub">${xe(d.persona_job||'')}${d.persona_family?'　'+xe(d.persona_family):''}</div>
      ${d.persona_lifestyle?`<div class="p-row"><span class="p-lbl">日常</span><span>${xe(d.persona_lifestyle)}</span></div>`:''}
      ${d.persona_pain?`<div class="p-row"><span class="p-lbl">悩み</span><span>${xe(d.persona_pain)}</span></div>`:''}
      ${d.persona_goal?`<div class="p-row"><span class="p-lbl">ゴール</span><span>${xe(d.persona_goal)}</span></div>`:''}
      ${d.persona_behavior?`<div class="p-row"><span class="p-lbl">行動</span><span>${xe(d.persona_behavior)}</span></div>`:''}
      ${d.persona_quote?`<div style="margin-top:10px;font-style:italic;color:#374151;font-size:9.5pt;border-left:3px solid #2c4a3e;padding-left:10px">${xe(d.persona_quote)}</div>`:''}
    </div>
    <div style="overflow:auto">${cjmHTML}</div>
  </div>
</div>

<!-- SLIDE 6: 参考サイト -->
<div class="slide">
  <div class="sh"><span class="sh-title">🔗 参考サイト</span><span class="sh-badge">Phase C</span></div>
  <div class="sb">
    ${refs.length ? `<div class="ref-grid">${refCards}</div>` : '<p style="color:#9ca3af;margin-top:40px;text-align:center;font-size:12pt">（参考サイトは未登録です）</p>'}
  </div>
</div>

</body></html>`);
  win.document.close();
}

function showToast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function hesc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.max(el.scrollHeight, 64) + 'px';
}
function initAutoResize(container) {
  (container || document).querySelectorAll('.q-answer textarea, .free-note textarea').forEach(ta => autoResize(ta));
}

// ===== PROJECT MANAGEMENT (localStorage) =====
const STORAGE_KEY = 'direction_board_projects';
const DATA_SCHEMA_VERSION = 3; // Increment when data structure changes incompatibly
let currentProjectId = null;

function getProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function setProjects(projects) { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); }

// ===== BACKUP / RESTORE ALL PROJECTS =====
function exportAllProjects() {
  const projects = getProjects();
  const backup = {
    _schema: DATA_SCHEMA_VERSION,
    _exportedAt: new Date().toISOString(),
    _appVersion: 'direction-board-v3',
    projects
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  a.download = `direction-board-backup-${date}.json`;
  a.click();
  localStorage.setItem('direction_board_last_backup', new Date().toISOString());
  renderDashboard();
  showToast(`${projects.length}件の案件をバックアップしました`);
}

function importAllProjects() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const backup = JSON.parse(ev.target.result);
        // Support both raw array (old format) and wrapped backup object
        const incoming = Array.isArray(backup) ? backup : (backup.projects || []);
        if (!incoming.length) { showToast('案件データが見つかりません'); return; }
        const existing = getProjects();
        const existingIds = new Set(existing.map(p => p.id));
        let added = 0, skipped = 0;
        incoming.forEach(p => {
          if (existingIds.has(p.id)) { skipped++; }
          else { existing.push(p); added++; }
        });
        setProjects(existing);
        renderDashboard();
        showToast(`${added}件を復元、${skipped}件は重複のためスキップしました`);
      } catch { showToast('読み込みエラー: JSONファイルを確認してください'); }
    };
    reader.readAsText(e.target.files[0]);
  };
  input.click();
}

function newProject() {
  const id = 'proj_' + Date.now();
  const name = prompt('案件名を入力してください:');
  if (!name || !name.trim()) return;
  const projects = getProjects();
  const now = new Date().toISOString();
  projects.unshift({ id, name: name.trim(), status: '進行中', createdAt: now, updatedAt: now, client: '', industry: '', mediums: [], data: null });
  setProjects(projects);
  openProject(id);
  showToast('案件を作成しました');
}

function openProject(id) {
  const projects = getProjects();
  const proj = projects.find(p => p.id === id);
  if (!proj) return;
  currentProjectId = id;
  updateSaveState();
  if (proj.data) { try { restoreData(proj.data); } catch (e) {} }
  else { resetState(); }
  document.getElementById('projectName').value = proj.name;
  hideDashboard();
  showToast('「' + proj.name + '」を開きました');
}

function resetState() {
  S.chips = {}; S.colors = { main: [], sub: [], accent: [] };
  S.scale = { x: null, y: null, label: '' };
  S.mediums = []; S.competitors = []; S.refs = [];
  S.bullets = { goals: [], asis: [], tobe: [] }; S.tactics = [];
  S.cjm = { rows: ['行動', '思考・感情', 'タッチポイント', '課題・障壁', '施策アイデア'], stages: ['認知', '興味・検討', '決定・行動', '利用・継続'], data: {} };
  S.schedule = { kickoff: '', groups: [] };
  S.meetings = [];
  ['client_name', 'client_contact', 'client_region', 'ind3', 'date_kickoff', 'date_delivery', 'budget', 'notes',
    'mission_text', 'target_desc', 'target_behavior', 'avoid_image', 'persona_name', 'persona_job',
    'persona_family', 'persona_lifestyle', 'persona_pain', 'persona_goal', 'persona_behavior', 'persona_quote',
    'font_heading', 'font_body', 'tonmana_memo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('ind1').value = '';
  document.getElementById('ind2').value = '';
  document.getElementById('ind2').disabled = true;
  document.querySelectorAll('.chip.on').forEach(c => c.classList.remove('on'));
  S.colors = { main: [], sub: [], accent: [], text: [] };
  ['main', 'sub', 'accent', 'text'].forEach(type => {
    const pal = document.getElementById('pal-' + type);
    if (pal) { while (pal.children.length > 1) pal.removeChild(pal.firstChild); }
  });
  const _pin = document.getElementById('scalePin'); if (_pin) _pin.style.display = 'none';
  const _sr  = document.getElementById('scaleResult'); if (_sr) _sr.textContent = 'マップをクリックしてポジションを選択';
  if (typeof imageWordSel !== 'undefined') { imageWordSel.clear(); if (typeof renderImageScale === 'function') renderImageScale(); }
  renderMinutesList();
  renderSidebarMeds(); updateRefFilter();
  renderBullets('goals-list', 'goals'); renderBullets('asis-list', 'asis'); renderBullets('tobe-list', 'tobe');
  renderTactics(); renderComps(); renderRefTable(); initCJM();
  resetHearing();
}

// ─── 議事録 ──────────────────────────────────────────────────
function _minField(id) { return document.getElementById(id)?.value?.trim() || ''; }

function genMinPrompt() {
  const transcript = _minField('min-transcript');
  if (!transcript) { showToast('文字起こし / メモを入力してください'); return; }
  const clientName = v('client_name') || '（クライアント名）';
  const projName   = v('project_name') || '（プロジェクト名）';
  const date       = _minField('min-date')      || '（未設定）';
  const purpose    = _minField('min-purpose')   || '（未設定）';
  const attendees  = _minField('min-attendees') || '（未設定）';

  const prompt =
`以下のミーティングの文字起こし / メモを、Webディレクターの視点で詳細な議事録にまとめてください。

【プロジェクト情報】
クライアント: ${clientName}
プロジェクト: ${projName}
日付: ${date}
参加者: ${attendees}
目的: ${purpose}

【文字起こし / メモ】
${transcript}

---

上記をもとに、以下の形式で議事録を作成してください。
各セクションはできる限り詳細に記載し、省略しないでください。

## 概要
（このミーティングで何が話し合われたか、全体像を3〜5文で説明してください）

## 決定事項
（合意・確定した内容をすべて箇条書きで記載してください。背景や理由も含めて詳しく残してください）
-

## 保留・検討中事項
（結論が出なかった事項、次回以降に持ち越した検討事項を箇条書きで記載してください）
-

## 議論の内容
（主要なトピックごとに、どのような議論が行われたかを詳しく記載してください。重要な発言・意見・懸念点なども含めてください）

### トピック1:
### トピック2:
（必要に応じてトピックを追加してください）

## 制作者側 宿題（文字起こしから抽出）
（制作者・ディレクター側が次回までに対応すべきアクションをすべて抽出してください）
-

## クライアント側 宿題（文字起こしから抽出）
（クライアント側が次回までに用意・確認すべき事項をすべて抽出してください）
-

## 次回打ち合わせ
（文字起こしに記載があれば日時・形式を抽出してください。記載がなければ「未定」と記載）

## 備考・その他
（補足事項、共有された参考情報、懸念点など）`;

  const wrap = document.getElementById('min-prompt-wrap');
  const out  = document.getElementById('min-prompt-out');
  if (out)  out.textContent  = prompt;
  if (wrap) wrap.style.display = '';
  const cb = document.getElementById('min-copy-btn');
  if (cb) cb.style.display = '';
  showToast('プロンプトを生成しました');
}

function genHearingPrompt() {
  const transcript = _minField('min-transcript');
  if (!transcript) { showToast('文字起こし / メモを入力してください'); return; }
  const clientName = v('client_name') || '（クライアント名）';

  const prompt =
`以下のヒアリング文字起こしを、Webディレクションのヒアリングシート全項目に沿って整理してください。

クライアント: ${clientName}

【文字起こし / メモ】
${transcript}

---

以下の全項目に沿って、文字起こしから情報を抽出・整理してください。
情報がない項目は「未確認」と記載してください。
どの項目にも当てはまらない情報は、最後の「その他」にまとめてください。

## 1. 案件概要
- 依頼内容（ご依頼いただく内容の全体像）:
- 前提・補足情報（既存素材・参照データ・制約など）:
- メモ・補足:

## 2. 事業・課題・目標

### 2-1. 背景・現状課題
- 依頼の背景・きっかけ（なぜ今このタイミングなのか）:
- 現在一番困っていること（解決しないと起きる問題・影響）:
- この課題はいつ頃から？:
- 過去に同じ課題を解決しようとしたことはあるか、その結果は？:
- メモ・補足:

### 2-2. KGI / KPI / 数値目標
- KGI（最終目標）:
- KSF（成功要因）:
- KPI 目標値:
- KPI 現状値:
- 広告予算額（広告/LP案件の場合）:
- 目標 CPA:
- 現状 CPA:
- 限界 CPA:
- リピート率:
- LTV:
- メモ・補足:

### 2-3. ビジネスモデル・収益構造
- メインのサービス・商品と客単価:
- 新規とリピートの比率:
- 売上の季節性・繁忙期:
- 今後伸ばしたいサービス・商品:
- メモ・補足:

## 3. 強み・差別化ポイント
- なぜ選んでいただけていると思うか（お客様から直接聞いた理由）:
- 他社には絶対にできないこと:
- 逆に、他社に負けていると感じること:
- 断られた・選ばれなかった経験がある場合、その理由:
- お客様から嬉しかった言葉・印象に残るフィードバック:
- 絶対に譲れないこだわり・ポリシー:
- 創業・サービス開始のストーリー:
- 10年後、どんな存在になりたいか:
- お客様の期待値を超えた瞬間はどんな場面か:
- 「価格が高い」と言われたとき、どう答えているか:
- メモ・気づいた強み（ヒアリング中に感じたこと）:

## 4. ターゲット

### 4-1. 現在のターゲット
- 年代・性別・職業:
- 抱えている悩み・不満:
- 商材を調べるシーン・媒体・検索キーワード:
- 認知から購買までの流れ:
- 選ばれる理由・重視していること:
- 表に出にくい本音・インサイト:
- メモ・補足:

### 4-2. 今後きてほしいターゲット
- 年代・性別・職業:
- 抱えている悩みは？:
- 調べるシーン・媒体・検索キーワード:
- 今のサービス・制作物でそのターゲットにリーチできると思うか:
- そのターゲットに選ばれるために何が変わる必要があるか:
- メモ・補足:

## 5. 購買心理・意思決定
- 問い合わせ直前に一番迷うこと・不安に思うこと:
- 比較して最後に選んでくれた方の決め手:
- 問い合わせをためらってやめた方が多い場合、その理由:
- 「来てほしくない」ターゲット外の方はいるか:
- お客様が最初に感じる疑問・懸念:
- 使い始めてよかったと実感する瞬間はどんな場面か:
- このサービスを人に紹介するとき、どう説明するか:
- メモ・コピーに使えそうな言葉:

## 6. 制作物の詳細

### 6-1. Web / LP（該当の場合）
- 制作物の目的・目標KPI（目的 / 目標値 / 現状値）:
- ページ数・希望納品形式:
- 開発方法の希望（HTML/CSS / WordPress / STUDIO / その他）:
- 現在のサイトの問題点・リニューアルの理由:
- 現在のアクセス数・流入経路（GA4など）:
- 参考にしたいサイト（3つ以上）:
- CVR・コンバージョン動線で重視すること:
- 必須コンテンツ・ページ構成:
- CMS・更新頻度の希望:
- 指定カラー・使用フォントの有無:
- メモ・補足:

### 6-2. ロゴ（該当の場合）
- 社名・ネーミングの由来:
- 表記（アルファベット？和文？大文字・小文字のルール）:
- 事業の特徴・会社のビジョン:
- ロゴを刷新しようと思ったきっかけ:
- ロゴを見た方にどんな印象を持ってもらいたいか:
- デザインイメージの方向性:
- ターゲット層（取引先・エンドユーザー）:
- キーカラー・こだわりモチーフ・避けてほしいデザイン:
- 使用場面（名刺・Web・看板・SNS など）:
- その他ご要望・制約:
- メモ・補足:

### 6-3. チラシ・名刺（該当の場合）
- 配布場所・対象エリア:
- サイズ・仕様（A4両面 / A5片面 / 折りパンフ など）:
- 印刷部数・印刷会社の指定:
- 掲載必須の情報（サービス名・電話番号・QRコード・料金表・地図など）:
- 現状のチラシ・名刺の問題点:
- ロゴ・Webサイトとの統一感の希望:
- メモ・補足:

### 6-4. LINE / SNS（該当の場合）
- LINEで実現したいこと（予約受付 / クーポン配信 / 問い合わせ対応 など）:
- 現在のLINE運用状況（公式アカウントの有無・登録者数）:
- リッチメニューに置きたいボタン・メニュー:
- 自動応答・チャットボットの希望:
- SNSアカウントの状況・投稿頻度・フォロワー数:
- 反応の良いコンテンツの傾向:
- メモ・補足:

### 6-5. ITコンサル・Web環境（該当の場合）
- 現在のサイト・システムはいつ制作したか:
- サーバー・ドメインの契約先・更新時期:
- Googleアナリティクス（GA4）は入っているか:
- Googleサーチコンソールは設定しているか:
- サイトの更新は誰がどのように行っているか:
- お問い合わせフォーム・予約システムは正常に動作しているか:
- SSL（https）は対応しているか:
- Googleビジネスプロフィールは設定しているか:
- SNSと公式サイトは連携しているか:
- 現在のWebで困っていること・気になっていること:
- メモ・補足:

## 7. 競合・参考サイト
- 意識している競合・同業他社（URLがあれば）:
- ベンチマークにしているサイト・会社（業種問わず）:
- 競合と自社の違い・優れていると思う点:
- 競合のどこが嫌いか・どこが羨ましいか:
- 比較・相見積もりの状況（他社候補・その特徴）:
- メモ・補足:

## 8. 発注・スケジュール
- 発注の判断軸・一番重視すること（クオリティ / 価格 / スピード / 提案力）:
- 希望スケジュール・納期:
- 予算の上限:
- やりとりの希望ツール（Slack / Chatwork / LINE / メール）:
- 決裁者の確認（同席・自己決裁）:
- 今後必要になりそうな施策（名刺・会社資料・採用サイト・バナーなど）:
- メモ・補足・その他施策の相談:

## 9. ネクストアクション
- 制作者側の宿題（次回提案日・送付物など）:
- クライアント側の宿題（返事期日・準備いただくものなど）:
- 次回打ち合わせ日程:
- やりとりの手段・支援体制（Slack / Chatwork / LINE / メール / 決裁者の確認など）:

## その他
（上記のどの項目にも当てはまらない情報・発言・懸念点など）
-`;

  const wrap = document.getElementById('min-prompt-wrap');
  const out  = document.getElementById('min-prompt-out');
  if (out)  out.textContent  = prompt;
  if (wrap) wrap.style.display = '';
  const cb = document.getElementById('min-copy-btn');
  if (cb) cb.style.display = '';
  showToast('ヒアリング整理プロンプトを生成しました');
}

function copyMinPrompt() {
  const txt = document.getElementById('min-prompt-out')?.textContent || '';
  navigator.clipboard.writeText(txt).then(() => showToast('コピーしました'));
}

function saveMinutes() {
  const result = document.getElementById('min-result')?.value.trim() || '';
  if (!result) { showToast('議事録を入力してください'); return; }
  const date      = _minField('min-date')      || '';
  const purpose   = _minField('min-purpose')   || '（無題）';
  const attendees = _minField('min-attendees') || '';
  S.meetings = S.meetings || [];
  S.meetings.unshift({ id: 'min_' + Date.now(), date, purpose, attendees, content: result });
  renderMinutesList();
  showToast('議事録を保存しました');
}

function renderMinutesList() {
  const wrap = document.getElementById('min-saved-wrap');
  const list = document.getElementById('min-saved-list');
  if (!wrap || !list) return;
  const mins = S.meetings || [];
  if (mins.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  list.innerHTML = mins.map(m => `
    <div class="min-saved-item" id="msi-${m.id}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1;min-width:0">
          <span style="font-size:12px;font-weight:600;color:var(--text)">${esc(m.purpose)}</span>
          ${m.date ? `<span style="font-size:11px;color:var(--text3);margin-left:8px">${esc(m.date)}</span>` : ''}
          ${m.attendees ? `<div style="font-size:11px;color:var(--text3);margin-top:2px">${esc(m.attendees)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;margin-left:10px;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="toggleMinContent('${m.id}')" id="mtoggle-${m.id}" style="font-size:11px;border:1px solid var(--accent);background:none;border-radius:4px;padding:2px 8px;cursor:pointer;color:var(--accent)">内容を見る</button>
          <button onclick="printMinutes('${m.id}')" style="font-size:11px;border:1px solid var(--border);background:none;border-radius:4px;padding:2px 8px;cursor:pointer;color:var(--text2)">PDF出力</button>
          <button onclick="deleteMinute('${m.id}')" style="font-size:11px;color:var(--danger);border:1px solid var(--danger);background:none;border-radius:4px;padding:2px 8px;cursor:pointer">削除</button>
        </div>
      </div>
      <div id="mcontent-${m.id}" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
        <pre style="white-space:pre-wrap;font-family:inherit;font-size:12px;line-height:1.7;color:var(--text2);margin:0;max-height:400px;overflow-y:auto;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:12px">${esc(m.content)}</pre>
      </div>
    </div>`
  ).join('');
}

function toggleMinContent(id) {
  const content = document.getElementById('mcontent-' + id);
  const btn     = document.getElementById('mtoggle-' + id);
  if (!content) return;
  const isOpen = content.style.display !== 'none';
  content.style.display = isOpen ? 'none' : '';
  if (btn) btn.textContent = isOpen ? '内容を見る' : '閉じる';
}

function printMinutes(id) {
  const m = (S.meetings || []).find(x => x.id === id);
  if (!m) return;
  const clientName = v('client_name') || '';
  const win = window.open('', '_blank', 'width=820,height=700');
  win.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
    <title>${m.purpose} 議事録</title>
    <style>
      body{font-family:'Noto Sans JP','Hiragino Sans',sans-serif;padding:40px 52px;font-size:13px;line-height:1.8;color:#1c1917;max-width:760px;margin:0 auto}
      h1{font-size:20px;font-weight:700;border-bottom:2px solid #2c4a3e;padding-bottom:10px;margin-bottom:8px}
      .meta{color:#6b7280;font-size:12px;margin-bottom:28px;display:flex;gap:20px;flex-wrap:wrap}
      .meta span::before{margin-right:4px}
      pre{white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.8}
      @media print{body{padding:20px 30px}button{display:none}}
    </style>
  </head><body>
    <h1>${m.purpose}</h1>
    <div class="meta">
      ${m.date ? `<span>📅 ${m.date}</span>` : ''}
      ${m.attendees ? `<span>👥 ${m.attendees}</span>` : ''}
      ${clientName ? `<span>🏢 ${clientName}</span>` : ''}
    </div>
    <pre>${m.content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

function deleteMinute(id) {
  S.meetings = (S.meetings || []).filter(m => m.id !== id);
  renderMinutesList();
  showToast('削除しました');
}

function updateProjectTitle() {
  if (!currentProjectId) return;
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === currentProjectId);
  if (idx >= 0) { projects[idx].name = document.getElementById('projectName').value; setProjects(projects); }
}

function deleteProject(id, e) {
  e.stopPropagation();
  const projects = getProjects();
  const proj = projects.find(p => p.id === id);
  if (!proj) return;
  if (!confirm('「' + proj.name + '」を削除しますか？\nこの操作は取り消せません。')) return;
  setProjects(projects.filter(p => p.id !== id));
  if (currentProjectId === id) currentProjectId = null;
  renderDashboard();
  showToast('削除しました');
}

function duplicateProject(id, e) {
  e.stopPropagation();
  const projects = getProjects();
  const proj = projects.find(p => p.id === id);
  if (!proj) return;
  const now = new Date().toISOString();
  const newProj = { ...JSON.parse(JSON.stringify(proj)), id: 'proj_' + Date.now(), name: proj.name + '（コピー）', createdAt: now, updatedAt: now };
  projects.unshift(newProj);
  setProjects(projects);
  renderDashboard();
  showToast('複製しました');
}

function updateStatus(id, val, e) {
  e.stopPropagation();
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx >= 0) { projects[idx].status = val; projects[idx].updatedAt = new Date().toISOString(); setProjects(projects); }
  renderDashboard();
}

function exportProject(id, e) {
  e.stopPropagation();
  const projects = getProjects();
  const proj = projects.find(p => p.id === id);
  if (!proj || !proj.data) { showToast('保存データがありません'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(proj.data, null, 2)], { type: 'application/json' }));
  a.download = (proj.name || 'project') + '-direction.json';
  a.click();
}

// ===== DASHBOARD UI =====
function showDashboard() { renderDashboard(); document.getElementById('dashboard').style.display = 'block'; }
function hideDashboard() {
  document.getElementById('dashboard').style.display = 'none';
  updateSaveState();
}

function updateSaveState() {
  const badge = document.getElementById('unsaved-badge');
  if (!badge) return;
  badge.style.display = currentProjectId ? 'none' : '';
}

const STATUS_COLORS = {
  '進行中': { bg: '#eef4f1', color: '#2c4a3e', border: '#b8d4c8' },
  '提案中': { bg: '#fdf0e8', color: '#b5622a', border: '#e8c9a8' },
  '完了':   { bg: '#eef1f8', color: '#2a4a7a', border: '#c5d0e8' },
  '保留':   { bg: '#f5f3ef', color: '#a8a39c', border: '#e4e0d8' }
};

function renderBackupReminder() {
  const el = document.getElementById('db-backup-reminder');
  if (!el) return;
  const last = localStorage.getItem('direction_board_last_backup');
  if (!last) {
    el.innerHTML = `<div style="background:#fff8e1;border:1px solid #f9a825;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span style="font-size:13px;color:#5d4037;flex:1">⚠ まだ全案件バックアップが作成されていません。万一に備えてバックアップを作成しておくことをおすすめします。</span>
      <button class="btn btn-o" onclick="exportAllProjects()" style="white-space:nowrap;font-size:12px">バックアップを今すぐ作成</button>
    </div>`;
    return;
  }
  const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince >= 7) {
    const d = Math.floor(daysSince);
    el.innerHTML = `<div style="background:#fff8e1;border:1px solid #f9a825;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span style="font-size:13px;color:#5d4037;flex:1">⚠ 最後のバックアップから <strong>${d}日</strong> 経過しています。定期的なバックアップをおすすめします。</span>
      <button class="btn btn-o" onclick="exportAllProjects()" style="white-space:nowrap;font-size:12px">バックアップを今すぐ作成</button>
    </div>`;
  } else {
    el.innerHTML = '';
  }
}

function renderDashboard() {
  renderBackupReminder();
  const projects = getProjects();
  const search = (document.getElementById('db-search')?.value || '').toLowerCase();
  const filterStatus = document.getElementById('db-filter-status')?.value || '';
  const sort = document.getElementById('db-sort')?.value || 'updated';

  const total = projects.length;
  const active = projects.filter(p => p.status === '進行中').length;
  const proposal = projects.filter(p => p.status === '提案中').length;
  document.getElementById('db-stats').innerHTML = [
    { label: '総案件数', val: total + '件', color: 'var(--accent)' },
    { label: '進行中', val: active + '件', color: 'var(--success)' },
    { label: '提案中', val: proposal + '件', color: 'var(--warm)' }
  ].map(s => `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:4px">${s.label}</div>
      <div style="font-size:24px;font-weight:700;color:${s.color};font-family:'Shippori Mincho B1',serif">${s.val}</div>
    </div>`).join('');

  let list = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search) || (p.client || '').toLowerCase().includes(search);
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });
  if (sort === 'updated') list.sort((a, b) => (b.updatedAt || '') > (a.updatedAt || '') ? 1 : -1);
  else if (sort === 'created') list.sort((a, b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1);
  else list.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  const cards = document.getElementById('db-cards');
  const empty = document.getElementById('db-empty');
  if (list.length === 0) { cards.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  cards.innerHTML = list.map(p => {
    const sc = STATUS_COLORS[p.status] || STATUS_COLORS['保留'];
    const updDate = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) : '';
    const meds = (p.mediums || []).slice(0, 3).map(m => `<span style="font-size:10px;padding:2px 7px;background:var(--bg);border-radius:100px;color:var(--text2)">${m}</span>`).join('');
    const moreMeds = (p.mediums || []).length > 3 ? `<span style="font-size:10px;color:var(--text3)">+${(p.mediums || []).length - 3}</span>` : '';
    const isCurrent = p.id === currentProjectId;
    return `
    <div onclick="openProject('${p.id}')" style="background:var(--surface);border:1.5px solid ${isCurrent ? 'var(--accent)' : sc.border};border-radius:12px;padding:18px;cursor:pointer;transition:all .2s;position:relative" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow=''">
      ${isCurrent ? '<div style="position:absolute;top:12px;right:12px;font-size:9px;background:var(--accent);color:#fff;padding:2px 7px;border-radius:100px">編集中</div>' : ''}
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;font-size:14px;color:var(--text);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
          <div style="font-size:11px;color:var(--text3)">${p.client || 'クライアント未設定'}${p.industry ? ' · ' + p.industry.split(' > ')[0] : ''}</div>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <select onclick="event.stopPropagation()" onchange="updateStatus('${p.id}',this.value,event)"
          style="font-size:11px;padding:3px 8px;border-radius:100px;border:1px solid ${sc.border};background:${sc.bg};color:${sc.color};font-family:'Noto Sans JP',sans-serif;cursor:pointer;outline:none">
          ${['進行中', '提案中', '完了', '保留'].map(s => `<option${s === p.status ? ' selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      ${(p.mediums || []).length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${meds}${moreMeds}</div>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border)">
        <span style="font-size:10px;color:var(--text3)">更新 ${updDate}</span>
        <div style="display:flex;gap:4px">
          <button onclick="exportProject('${p.id}',event)" title="JSONエクスポート" style="padding:4px 8px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text3);font-size:11px;cursor:pointer;font-family:'Noto Sans JP',sans-serif;transition:all .15s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text3)'">↓</button>
          <button onclick="duplicateProject('${p.id}',event)" title="複製" style="padding:4px 8px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text3);font-size:11px;cursor:pointer;font-family:'Noto Sans JP',sans-serif;transition:all .15s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text3)'">⊕</button>
          <button onclick="deleteProject('${p.id}',event)" title="削除" style="padding:4px 8px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text3);font-size:11px;cursor:pointer;font-family:'Noto Sans JP',sans-serif;transition:all .15s" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text3)'">×</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ===== PRE-HEARING FORM =====
// Column mapping: CSV col index → Direction Board field
// Col 0 = Timestamp (skip), 1〜14 = questions in order
const PF_MAP = [
  null, // 0: Timestamp
  { type: 'input',   id: 'client_name'  },                    // 1: 会社名
  { type: 'input',   id: 'client_contact' },                  // 2: 担当者名
  { type: 'input',   id: 'client_region' },                   // 3: 所在地
  { type: 'hmeta',   id: 'm_url'         },                   // 4: WebサイトURL
  { type: 'qs',      key: 'req',      idx: 0 },               // 5: ご依頼内容
  { type: 'qs',      key: 'biz-bg',   idx: 0 },               // 6: きっかけ・背景
  { type: 'qs',      key: 'biz-bg',   idx: 1 },               // 7: お困りのこと
  { type: 'input',   id: 'kpi-kgi'    },                      // 8: 目標・KGI
  { type: 'qs',      key: 'biz-model',idx: 0 },               // 9: サービス・客単価
  { type: 'qs',      key: 'tgt-cur',  idx: 0 },               // 10: ターゲット層
  { type: 'refs'                       },                      // 11: 参考サイト
  { type: 'input',   id: 'budget'     },                      // 12: 予算
  { type: 'input',   id: 'date_delivery' },                   // 13: 希望納期
  { type: 'fn',      id: 'fn-req'     },                      // 14: その他ご要望
];

const PF_LABELS = [
  '', '会社名・屋号', '担当者名', '所在地', 'WebサイトURL',
  'ご依頼内容', '制作のきっかけ・背景', 'お困りのこと',
  '目標・KGI', 'サービス・商品・客単価', 'ターゲット層',
  '参考サイト', '予算の目安', '希望納期', 'その他ご要望'
];

let _pfLastRow = null; // stores last parsed CSV row for applyFormPreview

const PRE_FORM_SCRIPT = `// ============================================
// Direction Board — 事前ヒアリングフォーム作成スクリプト
// ============================================
// 【使い方】
//   1. Googleドライブ（drive.google.com）を開く
//   2. 「新規」→「Googleスプレッドシート」で空のシートを作成
//   3. 作成したスプレッドシートのメニューから
//      「拡張機能」→「Apps Script」を開く
//   4. 表示されたエディタのコードをすべて削除し、
//      このスクリプトをすべて貼り付ける
//   5. 上部メニューで「createHearingForm」を選択して ▶ 実行
//   6. 初回は権限承認が必要（「詳細」→「安全でないページへ移動」→「許可」）
//   7. 実行後にポップアップでフォームURLが表示される
// ============================================

function createHearingForm() {
  // スプレッドシートから実行することでポップアップが使用可能になります
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const form = FormApp.create('【事前ヒアリング】お仕事のご依頼について');
  form.setDescription(
    'ご依頼ありがとうございます。\\n' +
    'ヒアリング前に基本的な情報をご記入いただくことで、打ち合わせ時間を有効に使えます。\\n' +
    '10〜15分程度でお答えいただけますと幸いです。\\n' +
    'ご不明な点があれば空欄のままで構いません。'
  );

  form.addTextItem()
    .setTitle('会社名・屋号（クライアント名）').setRequired(true);
  form.addTextItem()
    .setTitle('担当者名').setRequired(true);
  form.addTextItem()
    .setTitle('所在地（都道府県・市区町村）');
  form.addTextItem()
    .setTitle('貴社のWebサイトURL（現在のサイトがあれば）');
  form.addParagraphTextItem()
    .setTitle('今回のご依頼内容を教えてください（制作物の概要）').setRequired(true);
  form.addParagraphTextItem()
    .setTitle('制作を検討されたきっかけ・背景を教えてください');
  form.addParagraphTextItem()
    .setTitle('現在一番お困りのこと・解決したい課題は何ですか？');
  form.addTextItem()
    .setTitle('達成したい目標・KGI（例：月間問い合わせ20件、年商1億円達成）');
  form.addParagraphTextItem()
    .setTitle('メインのサービス・商品の内容と、おおよその客単価を教えてください');
  form.addParagraphTextItem()
    .setTitle('主なお客様のイメージ（年代・性別・職業など）を教えてください');
  form.addParagraphTextItem()
    .setTitle('参考にしたいサイトがあれば、URLと好きな理由を教えてください（1〜3件）');
  form.addTextItem()
    .setTitle('予算の目安（おおよそで構いません。例：30万〜50万円）');
  form.addTextItem()
    .setTitle('希望する納期または公開日');
  form.addParagraphTextItem()
    .setTitle('その他、ご要望・ご不明点があればお書きください');

  // 回答先をこのスプレッドシートに設定
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const formUrl = form.getPublishedUrl();

  // URLを「フォーム情報」シートに書き込む（後からでも確認できるように）
  let infoSheet = ss.getSheetByName('フォーム情報');
  if (!infoSheet) infoSheet = ss.insertSheet('フォーム情報');
  infoSheet.getRange('A1').setValue('フォームURL（クライアントへ送付）');
  infoSheet.getRange('A2').setValue(formUrl);
  infoSheet.getRange('A1').setFontWeight('bold');
  infoSheet.getRange('A2').setFontColor('#1155CC');
  infoSheet.autoResizeColumn(1);

  Logger.log('フォームURL: ' + formUrl);

  // スプレッドシートバインドなのでポップアップが使用できます
  ui.alert(
    '✅ フォームを作成しました！',
    'フォームURL（クライアントへ送付）:\\n\\n' + formUrl +
    '\\n\\n次のステップ:\\n' +
    '1. このURLをクライアントへ送付\\n' +
    '2. 回答後、このスプレッドシートの「フォームの回答」シートを開く\\n' +
    '3. ファイル → ダウンロード → カンマ区切り形式（.csv）\\n' +
    '4. Direction Board の「③ フォーム回答をインポート」でCSVを取り込む',
    ui.ButtonSet.OK
  );
}`;

function showPreFormScript() {
  const out  = document.getElementById('pf-script-out');
  const wrap = document.getElementById('pf-script-wrap');
  if (out)  out.textContent = PRE_FORM_SCRIPT;
  if (wrap) wrap.style.display = '';
}
function copyPreFormScript() {
  navigator.clipboard.writeText(PRE_FORM_SCRIPT).then(() => showToast('スクリプトをコピーしました'));
}

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i + 1];
    if (inQ) {
      if (ch === '"' && nx === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') { inQ = true; }
      else if (ch === ',') { row.push(field.trim()); field = ''; }
      else if (ch === '\n' || (ch === '\r' && nx === '\n')) {
        if (ch === '\r') i++;
        row.push(field.trim()); field = '';
        if (row.some(c => c)) rows.push(row);
        row = [];
      } else field += ch;
    }
  }
  if (field || row.length) { row.push(field.trim()); if (row.some(c => c)) rows.push(row); }
  return rows;
}

function importPreFormCSV() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.csv';
  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseCSV(ev.target.result);
        // Last data row (skip header)
        const dataRows = rows.filter((_, i) => i > 0);
        if (!dataRows.length) { showToast('回答データが見つかりません'); return; }
        const lastRow = dataRows[dataRows.length - 1];
        _pfLastRow = lastRow;
        showPreFormPreview(lastRow);
      } catch (err) { showToast('CSVの読み込みに失敗しました'); console.error(err); }
    };
    reader.readAsText(e.target.files[0], 'UTF-8');
  };
  input.click();
}

function showPreFormPreview(cols) {
  const body = document.getElementById('pf-preview-body');
  const wrap = document.getElementById('pf-preview');
  if (!body || !wrap) return;
  body.innerHTML = PF_LABELS.slice(1).map((lbl, i) => {
    const val = cols[i + 1] || '';
    if (!val) return '';
    return `<div class="pf-preview-row">
      <span class="pf-preview-lbl">${lbl}</span>
      <span class="pf-preview-val">${esc(val.slice(0, 120))}${val.length > 120 ? '…' : ''}</span>
    </div>`;
  }).join('');
  wrap.style.display = '';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applyFormPreview() {
  if (!_pfLastRow) return;
  applyFormRow(_pfLastRow);
  document.getElementById('pf-preview').style.display = 'none';
  showToast('ヒアリングシートに反映しました');
  go('p1b');
}

function applyFormRow(cols) {
  PF_MAP.forEach((mapping, colIdx) => {
    if (!mapping) return;
    const val = (cols[colIdx] || '').trim();
    if (!val) return;

    if (mapping.type === 'input') {
      const el = document.getElementById(mapping.id);
      if (el) el.value = val;
    } else if (mapping.type === 'hmeta') {
      const el = document.getElementById(mapping.id);
      if (el) el.value = val;
    } else if (mapping.type === 'fn') {
      const el = document.getElementById(mapping.id);
      if (el) { el.value = val; if (typeof autoResize === 'function') autoResize(el); }
    } else if (mapping.type === 'qs') {
      if (QS[mapping.key] && QS[mapping.key][mapping.idx]) {
        QS[mapping.key][mapping.idx].answer = val;
        if (typeof renderQ === 'function') renderQ(mapping.key);
      }
    } else if (mapping.type === 'refs') {
      // Extract URLs from the answer and add to refs
      const lines = val.split('\n').filter(l => l.trim());
      const urlRe = /https?:\/\/[^\s、,　]+/g;
      let hasUrl = false;
      lines.forEach(line => {
        const urls = line.match(urlRe) || [];
        urls.forEach(url => {
          hasUrl = true;
          const comment = line.replace(url, '').replace(/[、,\s]+/, '').trim();
          addRef('参考', url, '', comment, '（フォーム事前回答）');
        });
      });
      if (!hasUrl && val) addRef('参考', '', val.slice(0, 60), '', '（フォーム事前回答）');
    }
  });
  // Re-render ind2 if client_name changed and trigger sidebar update
  if (typeof renderSidebarMeds === 'function') renderSidebarMeds();
}

// ===== INIT =====
initCJM();
addComp();
addRef();
updateRefFilter();
updateCompHint();
initHearing();
initHearingScrollSpy();
// initA11y() is called at the bottom of direction-app-v3-tools.js

const _initProjects = getProjects();
if (_initProjects.length === 0) { showDashboard(); }

// ===== AUTO-SAVE (30秒ごと、既存案件のみ) =====
setInterval(() => { if (currentProjectId) saveProject(true); }, 30000);

// ===== Cmd+S / Ctrl+S で保存 =====
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    saveProject();
  }
});

// ===== 初期表示の未保存状態を反映 =====
updateSaveState();

// ===== ファイル同期の初期化 =====
initFileSync();

