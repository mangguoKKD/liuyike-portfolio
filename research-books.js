(() => {
  const shelf = document.querySelector('.research-two-books');
  const reader = document.getElementById('research-reader');
  const frame = reader?.querySelector('.research-reader-frame');
  const readerHome = reader?.parentNode;
  const readerNextSibling = reader?.nextSibling;
  const counter = document.getElementById('research-page-count');
  const previous = document.getElementById('research-prev');
  const next = document.getElementById('research-next');
  if (!shelf || !reader || !frame || !counter || !previous || !next) return;

  const volumes = {
    research: {
      cover: ['01 / RESEARCH · 2024—2025', '把问题写进\n论文里', 'TWO PAPERS'],
      papers: [
        {
          journal: 'International Review of Economics and Finance', year: '2024', volume: '96', article: '103664',
          ranking: 'SSCI Q1 · CAS Q2',
          title: 'Can Chinese investors manage climate risk domestically and globally?',
          doi: 'https://doi.org/10.1016/j.iref.2024.103664',
          authors: 'Yike Liu · Zihan Xu · Xiaoyun Xing · Yuxuan Zhu',
          keywords: 'Climate risk · Stock market · Investment portfolio · TVP-VAR-DY model',
          abstract: [
            'Climate risk is increasing and poses a risk for investors in China’s traditional stock market. In this paper, we construct a TVP-VAR-DY model and use benchmark regression and asset portfolio to explore the impact of climate risk on the Chinese stock market and whether assets with risk aversion attributes or green and low-carbon features can effectively manage climate risk. In particular, we compare China’s climate risk with global climate risk and explore transition and physical risks separately. The results show that climate risk does affect the Chinese stock market and that Chinese climate risk has a greater impact on the stock market than global climate risk. However, the good news is that the metal assets, as well as the equity-type and bond-type green assets, are effective in reducing cross-market spillovers under China’s climate risk, indicating that these assets can provide diversification benefits against climate-driven risks domestically.',
            'We also find that the metals and the equity-type assets could dampen the spillover effect against global transition risk, and the bond-type ones serve this function against global physical risk. The results further show that, for China’s stock market investors, adding green bonds to their portfolios could reduce the downside risk, regardless of climate risk type or origin. In addition, we can infer that investors are suggested to use traditional safe-haven assets and bond-type green ones to manage climate risk.'
          ],
          abstractZh: [
            '气候风险日益加剧，也给中国传统股票市场的投资者带来风险。本文构建 TVP-VAR-DY 模型，结合基准回归和资产组合分析，探讨气候风险对中国股市的影响，以及具有避险属性或绿色低碳特征的资产能否有效管理气候风险。具体而言，研究比较中国与全球气候风险，并分别考察转型风险和物理风险。结果表明，气候风险确实会影响中国股市，且中国气候风险的影响大于全球气候风险。不过，金属资产、绿色权益类资产和绿色债券均能降低中国气候风险下的跨市场风险溢出，说明这些资产可在国内气候风险冲击下提供分散投资的益处。',
            '研究还发现，金属资产和绿色权益类资产可减弱全球转型风险的溢出效应，而绿色债券更有助于应对全球物理风险。对中国股市投资者而言，无论气候风险的类型或来源如何，将绿色债券纳入投资组合都能降低下行风险。此外，研究认为投资者可运用传统避险资产和绿色债券管理气候风险。'
          ]
        },
        {
          journal: 'Finance Research Letters', year: '2025', volume: '75', article: '106817',
          ranking: 'SSCI Q1 · CAS Q2',
          title: 'Correlation among climate risk, climate policy uncertainty, and carbon-intensive stock markets in China',
          doi: 'https://doi.org/10.1016/j.frl.2025.106817',
          authors: 'Yuxuan Zhu · Yike Liu · Ye Zhou · Xiaoyun Xing · Xiuya Wang',
          keywords: 'Climate policy uncertainty · Climate risk · Carbon-intensive stock market · Network analysis',
          abstract: [
            'This paper investigates the correlation between climate risk, climate policy uncertainty, and carbon-intensive stock markets in China. Using daily closing prices for eight carbon-intensive stock sectors from January 3, 2017 to July 27, 2022, we construct a complex network based on Kendall rank correlations. Additionally, the minimum spanning tree is employed to elucidate the topological structure, thereby demonstrating the impact of climate risk and climate policy uncertainty on China’s carbon-intensive markets. The paper shows that the proposal of dual carbon targets has made China’s carbon-intensive stock markets more susceptible to shocks resulting from climate change.'
          ],
          abstractZh: [
            '本文研究气候风险、气候政策不确定性与中国高碳行业股票市场之间的关联。研究使用 2017 年 1 月 3 日至 2022 年 7 月 27 日八个高碳行业板块的每日收盘价，基于 Kendall 秩相关系数构建复杂网络，并利用最小生成树揭示其拓扑结构，以说明气候风险和气候政策不确定性对中国高碳行业市场的影响。研究表明，“双碳”目标的提出，使中国高碳行业股票市场更容易受到气候变化冲击。'
          ]
        }
      ]
    },
    competition: {
      cover: ['02 / COMPETITION · 2024', '让研究走进\n真实场景', 'NATIONAL FIRST PRIZE'],
      pages: [
        ['COMPETITION / 竞赛', '“正大杯”第十四届全国大学生市场调查与分析大赛', '市场调查与分析 · 项目负责人', '2024.2—2024.6'],
        ['ACHIEVEMENT / 成绩', '国家一等奖', '作为项目负责人参与完成竞赛项目。', 'RESEARCH IN PRACTICE']
      ]
    }
  };

  let flipbook = null;
  let active = null;
  let opener = null;
  let resizeTimer = null;
  const abstractLanguage = ['en', 'en'];

  function text(tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    return element;
  }

  function page(kind, parts, theme = '') {
    const element = document.createElement('div');
    element.className = `research-flip-page ${kind} ${theme}`.trim();
    if (kind === 'research-flip-cover' && theme === 'research-flip-white') {
      const cover = document.createElement('div');
      cover.className = 'research-editorial-cover';
      const top = text('div', 'research-cover-top', '');
      const logo = document.createElement('img');
      logo.src = 'assets/research/elsevier-mark.png';
      logo.alt = 'Elsevier';
      top.append(logo, text('span', '', 'LIU YIKE / 2024—2025\nTWO JOURNAL ARTICLES'));
      const heading = text('div', 'research-cover-heading', '');
      heading.append(text('strong', '', 'RESEARCH\nOUTPUTS'), text('small', '', '科研成果 · 气候金融'));
      const artwork = document.createElement('img');
      artwork.className = 'research-cover-illustration';
      artwork.src = 'assets/research/climate-finance-cover.svg?v=3';
      artwork.alt = '';
      cover.append(top, heading, artwork, text('div', 'research-cover-bottom', 'CLIMATE FINANCE / RISK'));
      element.append(cover);
      return element;
    }
    const content = document.createElement('div');
    content.className = 'research-flip-page-content';
    content.append(
      text('span', 'research-flip-kicker', parts[0]),
      text('strong', 'research-flip-title', parts[1]),
      text('p', 'research-flip-detail', parts[2]),
      text('span', 'research-flip-meta', parts[3] || '')
    );
    element.append(content);
    return element;
  }

  function researchPage(kind, label) {
    const element = document.createElement('div');
    element.className = `research-flip-page research-flip-inside ${kind}`;
    const content = document.createElement('div');
    content.className = 'research-article-page';
    content.append(text('span', 'research-article-kicker', label));
    element.append(content);
    return [element, content];
  }

  function contentsPage(papers) {
    const [element, content] = researchPage('research-contents-page', 'CONTENTS / 目录');
    content.append(text('h3', 'research-contents-heading', '两篇气候金融研究'));
    const list = document.createElement('div');
    list.className = 'research-contents-list';
    papers.forEach((paper, index) => {
      const item = document.createElement('div');
      item.className = 'research-contents-item';
      item.append(
        text('span', 'research-contents-number', `0${index + 1} / ${paper.year}`),
        text('strong', 'research-contents-journal', paper.journal),
        text('span', 'research-contents-ranking', paper.ranking),
        text('small', 'research-contents-paper', paper.title)
      );
      list.append(item);
    });
    content.append(list, text('span', 'research-article-footer', 'LIU YIKE / RESEARCH'));
    return element;
  }

  function articleInfoPage(paper, index) {
    const [element, content] = researchPage('research-paper-info', `ARTICLE 0${index + 1} / ${paper.year}`);
    element.dataset.paper = String(index + 1);
    const masthead = document.createElement('div');
    masthead.className = 'research-article-masthead';
    const logo = document.createElement('img');
    logo.src = 'assets/research/elsevier-mark.png';
    logo.alt = 'Elsevier';
    const journalCover = document.createElement('img');
    journalCover.className = 'research-journal-cover';
    journalCover.src = `assets/research/${index === 0 ? 'iref-cover.png' : 'frl-cover.png'}`;
    journalCover.alt = `${paper.journal} 期刊封面`;
    masthead.append(logo, text('strong', '', paper.journal), journalCover);
    const citation = document.createElement('div');
    citation.className = 'research-article-citation';
    citation.append(text('span', '', `VOL. ${paper.volume} / ${paper.year}`), text('span', '', `ARTICLE ${paper.article}`));
    const authors = document.createElement('p');
    authors.className = 'research-article-authors';
    paper.authors.split(' · ').forEach((author, authorIndex) => {
      if (authorIndex) authors.append(document.createTextNode(' · '));
      authors.append(text(author === 'Yike Liu' ? 'strong' : 'span', author === 'Yike Liu' ? 'research-featured-author' : '', author));
    });
    const figure = document.createElement('figure');
    figure.className = 'research-article-figure';
    const resultImage = document.createElement('img');
    resultImage.src = `assets/research/${index === 0 ? 'climate-risk-domestic-spillover.png' : 'carbon-sector-network.png'}`;
    resultImage.alt = index === 0 ? '国内转型风险与物理风险对中国股市净溢出效应的并排对比图' : '气候风险指标与高碳行业之间的风险溢出网络图';
    figure.append(resultImage);
    const fullTextLink = text('a', 'research-full-text-link', '点击查看原文 ↗');
    fullTextLink.href = paper.doi;
    fullTextLink.target = '_blank';
    fullTextLink.rel = 'noopener noreferrer';
    fullTextLink.setAttribute('aria-label', `查看论文全文：${paper.title}（在新标签页打开）`);
    fullTextLink.addEventListener('click', event => event.stopPropagation());
    content.append(masthead, text('h3', 'research-article-title', paper.title), authors, figure, citation, text('p', 'research-article-keywords', `KEYWORDS  ${paper.keywords}`), fullTextLink);
    return element;
  }

  function articleAbstractPage(paper, index, paragraph, part) {
    const continued = part > 0;
    const [element, content] = researchPage('research-paper-abstract', `ARTICLE 0${index + 1} / ABSTRACT${continued ? ' · CONTINUED' : ''}`);
    element.dataset.paper = String(index + 1);
    const titlebar = document.createElement('div');
    titlebar.className = 'research-abstract-titlebar';
    const heading = text('h3', 'research-abstract-heading', continued ? 'ABSTRACT / CONTINUED' : 'ABSTRACT');
    const toggle = text('button', 'research-abstract-toggle', '查看中文');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', `切换第 ${index + 1} 篇论文摘要的语言`);
    toggle.addEventListener('click', event => {
      event.stopPropagation();
      abstractLanguage[index] = abstractLanguage[index] === 'en' ? 'zh' : 'en';
      frame.querySelectorAll(`.research-paper-abstract[data-paper="${index + 1}"]`).forEach(page => updateAbstractPage(page, index));
    });
    titlebar.append(heading, toggle);
    const body = document.createElement('div');
    body.className = 'research-abstract-body';
    const english = text('p', 'research-abstract-en', paragraph);
    english.lang = 'en';
    const chinese = text('p', 'research-abstract-zh', paper.abstractZh[part]);
    chinese.lang = 'zh-CN';
    body.append(english, chinese);
    content.append(titlebar, body, text('span', 'research-article-footer', `${paper.journal.toUpperCase()} · ${paper.year}`));
    updateAbstractPage(element, index);
    return element;
  }

  function updateAbstractPage(page, index) {
    const chinese = abstractLanguage[index] === 'zh';
    const continued = page.querySelector('.research-abstract-heading').textContent.includes('CONTINUED') || page.querySelector('.research-article-kicker').textContent.includes('CONTINUED');
    page.querySelector('.research-abstract-heading').textContent = chinese ? (continued ? '摘要 / 续' : '摘要') : (continued ? 'ABSTRACT / CONTINUED' : 'ABSTRACT');
    page.querySelector('.research-abstract-toggle').textContent = chinese ? '查看英文原文' : '查看中文译文';
    page.querySelector('.research-abstract-en').hidden = chinese;
    page.querySelector('.research-abstract-zh').hidden = !chinese;
  }

  function researchNextPage() {
    const [element, content] = researchPage('research-next-page', 'RESEARCH IN PROGRESS / 研究进行中');
    content.append(
      text('h3', 'research-next-heading', '从实证研究\n走向模型构建'),
      text('p', 'research-next-intro', '以 SFC 模型刻画经济金融系统、能源与气候系统之间的双向反馈。')
    );
    const diagram = document.createElement('figure');
    diagram.className = 'research-sfc-diagram';
    const ecosystemImage = document.createElement('img');
    ecosystemImage.src = 'assets/research/sfc-ecosystem-module.png';
    ecosystemImage.alt = 'CHINA-SFC 中经济系统与生态系统模块的双向关系';
    const sectorImage = document.createElement('img');
    sectorImage.src = 'assets/research/sfc-sector-flows.png';
    sectorImage.alt = 'SFC 模型中居民、企业、银行与政府部门之间的资金流动';
    diagram.append(ecosystemImage, sectorImage);
    content.append(diagram, text('span', 'research-article-footer', '2024—至今 · 持续研究中'));
    return element;
  }

  function competitionPage(kind, label) {
    const element = document.createElement('div');
    element.className = `research-flip-page research-flip-inside competition-report-page ${kind}`;
    const content = document.createElement('div');
    content.className = 'competition-page-content';
    content.append(text('span', 'competition-kicker', label));
    element.append(content);
    return [element, content];
  }

  function competitionFigure(src, alt, caption, className = '') {
    const figure = document.createElement('figure');
    figure.className = `competition-figure ${className}`.trim();
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    figure.append(image, text('figcaption', '', caption));
    return figure;
  }

  function competitionProjectCover() {
    const element = document.createElement('div');
    element.className = 'research-flip-page research-flip-inside competition-project-cover';
    const label = text('span', 'competition-project-label', 'ORIGINAL REPORT / 原作品封面');
    const frame = document.createElement('div');
    frame.className = 'competition-original-cover-frame';
    const image = document.createElement('img');
    image.src = 'assets/research/competition-cover.png';
    image.alt = '北京市宠物殡葬市场发展现状和宠物主选择意愿影响因素分析竞赛作品封面';
    frame.append(image);
    element.append(label, frame, text('span', 'competition-project-caption', '把美好留给回忆，将生命归还自然'));
    return element;
  }

  function competitionOpeningCover() {
    const element = document.createElement('div');
    element.className = 'research-flip-page research-flip-inside competition-opening-cover competition-shelf-cover';
    const source = document.querySelector('.competition-shelf-cover');
    if (source) Array.from(source.children).forEach(child => element.append(child.cloneNode(true)));
    return element;
  }

  function competitionDesignPage() {
    const [element, content] = competitionPage('competition-design-page', '01 / RESEARCH DESIGN · 研究设计');
    content.append(text('h3', 'competition-heading', '从 900 份问卷出发'));
    const stats = document.createElement('div');
    stats.className = 'competition-stats';
    [['900', '发放问卷'], ['675', '有效样本'], ['84.38%', '有效回收率']].forEach(([value, label]) => {
      const item = document.createElement('div');
      item.append(text('strong', '', value), text('span', '', label));
      stats.append(item);
    });
    const copy = document.createElement('div');
    copy.className = 'competition-copy';
    copy.append(text('p', '', '围绕北京市宠物殡葬市场，研究依次回答三个问题：行业发展到哪里、宠物主如何看待这项服务、哪些因素影响最终选择。'), text('p', '', '采用便利抽样、简单随机抽样、分层抽样与二阶自加权 PPS 抽样，共发放 900 份问卷、获得 675 份有效样本，有效率 84.38%；问卷通过信度、效度与游程检验。'), text('p', '', '研究结合问卷、网络评论与机构信息，形成“市场现状与需求—人群画像—选择机制”的完整分析框架。'));
    content.append(stats, copy, competitionFigure('assets/research/competition-research-framework.png', '宠物殡葬市场调查研究思路图', '图 1.6　研究由实地调研与问卷调查出发，沿“市场现状—需求分析—影响因素”三条路径汇合至结论与建议。', 'competition-framework-figure'), text('span', 'competition-footer', 'DATA / SURVEY / MARKET INSIGHT'));
    return element;
  }

  function competitionMarketPage() {
    const [element, content] = competitionPage('competition-insights-page', '02 / MARKET · 市场现状与需求');
    content.append(text('h3', 'competition-heading', '从市场信息中识别需求'));
    const copy = document.createElement('div');
    copy.className = 'competition-copy compact';
    copy.append(text('p', '', '研究先以问卷描述性统计刻画公众认知与行业问题，再爬取宠物殡葬机构评论、价格及位置数据。'), text('p', '', '通过 NLP 情感分析定位不满意原因，并结合词云、共现网络和 LDA 主题模型提炼核心需求：情感慰藉、纪念形式、服务流程、环境质量与收费透明度。'));
    content.append(copy, competitionFigure('assets/research/competition-market-distribution.png', '北京市宠物殡葬机构人均消费与区域分布图', '图 3.12—3.13　机构人均消费差异明显，样本机构主要集中在朝阳、丰台、昌平等区域。', 'competition-market-figure'), competitionFigure('assets/research/competition-wordcloud.png', '宠物殡葬网络评论词云与需求词云', '网络文本显示，消费者既关注情感慰藉，也在意服务流程、环境与收费透明度。', 'competition-wordcloud-figure'), text('span', 'competition-footer', 'NLP / SENTIMENT / LDA / MARKET SCRAPING'));
    return element;
  }

  function competitionPortraitsPage() {
    const [element, content] = competitionPage('competition-portraits-page', '03 / PORTRAITS · 人群画像');
    content.append(text('h3', 'competition-heading', '两类人群，八种画像'));
    const copy = document.createElement('div');
    copy.className = 'competition-copy compact';
    copy.append(text('p', '', '研究按选择意愿将宠物主分为“暂不接受宠物殡葬”与“接受宠物殡葬”两组，并分别进行 K-means 聚类。'), text('p', '', '暂不接受者形成无缘型、无感型、无偏型、无知型四类画像；接受者形成深情型、成熟型、稳定型、主力型四类画像。二元 Logistic 回归进一步检验年龄、收入、宗教等个人特征与选择意愿的关系。'));
    const portraits = document.createElement('div');
    portraits.className = 'competition-portrait-pair';
    portraits.append(
      competitionFigure('assets/research/competition-personas.png', '暂不接受宠物殡葬人群的四类画像', '图 4.6　暂不接受者：无缘型、无感型、无偏型、无知型。', 'competition-personas-figure'),
      competitionFigure('assets/research/competition-accepting-personas.png', '接受宠物殡葬人群的四类画像', '图 4.9　接受者：深情型、成熟型、稳定型、主力型。', 'competition-personas-figure')
    );
    content.append(copy, portraits, text('span', 'competition-footer', 'K-MEANS / BINARY LOGIT / PERSONAS'));
    return element;
  }

  function competitionModelPage() {
    const [element, content] = competitionPage('competition-model-page', '03 / MODEL & FINDINGS · 机制与结论');
    content.append(text('h3', 'competition-heading', '哪些因素推动选择？'));
    const copy = document.createElement('div');
    copy.className = 'competition-copy compact';
    copy.append(text('p', '', '随机森林首先对影响两类宠物主选择意愿的三级指标进行重要度排序；因子分析进一步提取费用标准、专业效率、人际影响、社会影响、个人规范、感知有用与感知易用等核心因素。'), text('p', '', '随后通过结构方程模型分别检验各因素对选择意愿的直接作用，以及感知有用、感知易用等变量的中介与交互路径。'));
    content.append(copy, competitionFigure('assets/research/competition-sem-accepted.png', '接受宠物殡葬人群选择意愿的结构方程模型路径图', '图 5.6　费用、效率、人际与社会影响、个人规范通过直接路径和感知变量共同作用于选择意愿。', 'competition-sem-figure'), competitionFigure('assets/research/competition-direct-effects.png', '结构方程模型直接效应路径系数表', '表 5.6　多数直接路径达到显著水平；人际影响对选择意愿的直接作用不显著。', 'competition-effects-figure'));
    const findings = document.createElement('div');
    findings.className = 'competition-findings';
    findings.append(text('strong', '', '关键差异'), text('p', '', '暂不接受者最受费用标准影响；接受者更重视个人规范与专业效率。两组人群均存在显著的中介路径效应。'));
    content.append(findings, text('span', 'competition-footer', 'RANDOM FOREST / FACTOR ANALYSIS / SEM'));
    return element;
  }

  function competitionConclusionsPage() {
    const [element, content] = competitionPage('competition-conclusions-page', '05 / CONCLUSIONS · 结论与建议');
    content.append(text('h3', 'competition-heading', '从发现走向行动'));
    const list = document.createElement('ol');
    list.className = 'competition-conclusion-list';
    [
      '行业知名度与社会了解程度仍然偏低，公众对随意掩埋宠物遗体的环境危害认知不足。',
      '宠物主重视纪念形式，但现有产品与服务不够丰富；价格偏高、收费不透明仍是突出痛点。',
      '两类宠物主呈现不同的画像与决策逻辑，需要分群沟通、差异化产品和针对性营销。',
      '费用标准、专业效率、个人规范、社会影响、感知有用与感知易用共同影响选择意愿。'
    ].forEach(item => list.append(text('li', '', item)));
    const findings = document.createElement('div');
    findings.className = 'competition-findings competition-recommendations';
    findings.append(text('strong', '', '四方建议'), text('p', '', '机构：扩大宣传、丰富纪念服务、培训人员并实行分级透明定价；暂不接受者：了解无害化处理与收费标准；接受者：反馈个性化需求并分享经验；政府：完善法规监管、处罚与公众反馈渠道。'));
    content.append(list, findings, text('span', 'competition-footer', 'SERVICE / CONSUMER / GOVERNANCE / ENVIRONMENT'));
    return element;
  }

  function updateControls() {
    if (!flipbook) return;
    const index = flipbook.getCurrentPageIndex();
    const count = flipbook.getPageCount();
    const singlePage = flipbook.getOrientation() === 'portrait';
    counter.textContent = singlePage ? `${index + 1} / ${count}` : `${Math.floor(index / 2) + 1} / ${Math.ceil(count / 2)}`;
    previous.disabled = index === 0;
    next.disabled = index >= count - (singlePage ? 1 : 2);
  }

  function renderBook(book, pageIndex = 0) {
    flipbook?.destroy();
    flipbook = null;
    const host = document.createElement('div');
    host.className = 'research-flipbook';
    host.setAttribute('aria-label', `${book === 'research' ? '科研' : '竞赛'}书页`);
    frame.replaceChildren(host);
    const volume = volumes[book];
    const theme = book === 'competition' ? 'research-flip-rose' : 'research-flip-white';
    const pages = book === 'competition' ? [competitionOpeningCover()] : [page('research-flip-cover', [...volume.cover.slice(0, 2), '', volume.cover[2]], theme)];
    if (book === 'research') {
      pages.push(contentsPage(volume.papers));
      volume.papers.forEach((paper, index) => {
        pages.push(articleInfoPage(paper, index));
        paper.abstract.forEach((paragraph, part) => pages.push(articleAbstractPage(paper, index, paragraph, part)));
      });
      pages.push(researchNextPage());
    } else {
      pages.push(competitionProjectCover(), competitionDesignPage(), competitionMarketPage(), competitionPortraitsPage(), competitionModelPage(), competitionConclusionsPage());
    }
    pages.push(page('research-flip-back', ['LIU YIKE / PORTFOLIO', book === 'research' ? '未完待续' : '继续探索', '', book === 'research' ? 'RESEARCH IN PROGRESS' : volume.cover[2]], theme));
    pages.forEach(item => host.append(item));

    // Keep each leaf near A4 proportions; allow two full-size leaves in the spread.
    const singlePage = frame.clientWidth < 780;
    const pageWidth = Math.min(Math.floor(frame.clientHeight * 210 / 297), Math.floor(frame.clientWidth / (singlePage ? 1 : 2)));
    const pageHeight = Math.floor(pageWidth * 297 / 210);
    host.style.width = `${pageWidth * (singlePage ? 1 : 2)}px`;
    host.style.height = `${pageHeight}px`;
    flipbook = new St.PageFlip(host, {
      width: pageWidth, height: pageHeight, size: 'fixed', autoSize: false, showCover: false,
      drawShadow: true, maxShadowOpacity: 0.55,
      flippingTime: matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 950,
      usePortrait: true, mobileScrollSupport: false
    });
    flipbook.on('flip', updateControls);
    flipbook.on('init', updateControls);
    flipbook.loadFromHTML(pages);
    if (pageIndex > 0) flipbook.turnToPage(pageIndex);
    updateControls();
  }

  function open(book, button) {
    if (!window.St?.PageFlip) return;
    active = book;
    opener = button;
    reader.dataset.book = book;
    document.body.append(reader);
    reader.classList.add('is-detached-reader');
    document.body.classList.add('research-reader-open');
    reader.hidden = false;
    shelf.classList.add('is-reading');
    requestAnimationFrame(() => renderBook(book, 0));
    reader.querySelector('.research-reader-close').focus();
  }

  function close() {
    if (reader.hidden) return;
    clearTimeout(resizeTimer);
    flipbook?.destroy();
    flipbook = null;
    frame.replaceChildren();
    reader.hidden = true;
    reader.classList.remove('is-detached-reader');
    document.body.classList.remove('research-reader-open');
    if (readerHome) readerHome.insertBefore(reader, readerNextSibling);
    shelf.classList.remove('is-reading');
    active = null;
    opener?.focus();
  }

  // StPageFlip recalculates a fixed book as a smaller spread on resize.
  // Recreate it at the new A4 leaf size, keeping the current page.
  window.addEventListener('resize', () => {
    if (!active || reader.hidden) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!active || reader.hidden) return;
      const pageIndex = flipbook?.getCurrentPageIndex() || 0;
      renderBook(active, pageIndex);
    }, 180);
  });

  document.querySelectorAll('.research-book-cover').forEach(button => button.addEventListener('click', () => open(button.dataset.book, button)));
  reader.querySelector('.research-reader-close').addEventListener('click', close);
  previous.addEventListener('click', () => flipbook?.flipPrev('bottom'));
  next.addEventListener('click', () => flipbook?.flipNext('bottom'));
  document.addEventListener('keydown', event => {
    if (reader.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') flipbook?.flipNext('bottom');
    if (event.key === 'ArrowLeft') flipbook?.flipPrev('bottom');
  });
})();
