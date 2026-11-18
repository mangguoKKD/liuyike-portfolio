(() => {
  const key = 'yike-portfolio-annotations-v1';
  const selectors = '.profile-heading, .profile-basic-list>div, .profile-awards li, .profile-skills-list>div, .portfolio-panel-intro, .portfolio-list article, .study-note';
  const targets = [...document.querySelectorAll(selectors)];
  targets.forEach((element, index) => element.dataset.noteTarget = String(index + 1));
  let notes = {};
  try { notes = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { notes = {}; }
  let enabled = false;
  let current = null;

  const ui = document.createElement('div');
  ui.id = 'annotation-ui';
  ui.innerHTML = `<button class="annotation-toggle" type="button" aria-pressed="false">✎ 批注模式 <span class="annotation-count"></span></button>
    <aside class="annotation-panel" aria-label="网页批注" hidden>
      <div class="annotation-header"><strong>网页批注</strong><button class="annotation-close" type="button" aria-label="关闭批注面板">×</button></div>
      <p class="annotation-help">点击页面中的信息或条目，写下要修改的细节。批注保存在当前浏览器。</p>
      <p class="annotation-context">先点击页面内容</p>
      <textarea class="annotation-input" rows="4" placeholder="在这里写修改意见…" aria-label="批注内容"></textarea>
      <div class="annotation-actions"><button class="annotation-save" type="button">保存批注</button><button class="annotation-delete" type="button">删除此条</button></div>
      <div class="annotation-list"></div>
      <button class="annotation-copy" type="button">复制全部批注</button>
      <p class="annotation-status" role="status"></p>
    </aside>`;
  document.body.append(ui);
  const toggle = ui.querySelector('.annotation-toggle');
  const panel = ui.querySelector('.annotation-panel');
  const input = ui.querySelector('.annotation-input');
  const context = ui.querySelector('.annotation-context');
  const status = ui.querySelector('.annotation-status');
  const excerpt = element => element.textContent.replace(/\s+/g, ' ').trim().slice(0, 90);
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(notes)); } catch { status.textContent = '当前浏览器无法保存批注，请先复制。'; } };
  const render = () => {
    targets.forEach(element => element.classList.toggle('has-annotation', Boolean(notes[element.dataset.noteTarget])));
    const entries = Object.entries(notes).filter(([id, note]) => note && targets[Number(id) - 1]);
    ui.querySelector('.annotation-count').textContent = entries.length ? `(${entries.length})` : '';
    const list = ui.querySelector('.annotation-list');
    list.replaceChildren();
    for (const [id, note] of entries) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'annotation-item';
      button.textContent = `${excerpt(targets[Number(id) - 1])} — ${note}`;
      button.addEventListener('click', () => {
        const target = targets[Number(id) - 1];
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        select(target);
      });
      list.append(button);
    }
  };
  function select(target) {
    current?.classList.remove('annotation-selected');
    current = target;
    current.classList.add('annotation-selected');
    context.textContent = excerpt(target);
    input.value = notes[target.dataset.noteTarget] || '';
    panel.hidden = false;
    input.focus();
    status.textContent = '';
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    document.body.classList.toggle('annotation-mode', enabled);
    toggle.setAttribute('aria-pressed', String(enabled));
    panel.hidden = !enabled;
    if (!enabled) { current?.classList.remove('annotation-selected'); current = null; }
    status.textContent = enabled ? '批注模式已开启，点击页面内容。' : '';
  });
  ui.querySelector('.annotation-close').addEventListener('click', () => { panel.hidden = true; });
  document.addEventListener('click', event => {
    if (!enabled || ui.contains(event.target)) return;
    const target = event.target.closest('[data-note-target]');
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    select(target);
  }, true);
  ui.querySelector('.annotation-save').addEventListener('click', () => {
    if (!current) { status.textContent = '先点击页面中的一条内容。'; return; }
    const value = input.value.trim();
    if (!value) { status.textContent = '请先填写批注。'; return; }
    notes[current.dataset.noteTarget] = value;
    persist(); render(); status.textContent = '已保存。';
  });
  ui.querySelector('.annotation-delete').addEventListener('click', () => {
    if (!current) return;
    delete notes[current.dataset.noteTarget];
    input.value = '';
    persist(); render(); status.textContent = '已删除。';
  });
  ui.querySelector('.annotation-copy').addEventListener('click', async () => {
    const lines = Object.entries(notes).filter(([id, note]) => note && targets[Number(id) - 1])
      .map(([id, note], index) => `${index + 1}. 【${excerpt(targets[Number(id) - 1])}】\n${note}`);
    if (!lines.length) { status.textContent = '还没有批注。'; return; }
    try { await navigator.clipboard.writeText(lines.join('\n\n')); status.textContent = '已复制，可以直接粘贴发给我。'; }
    catch { status.textContent = '复制失败，请检查浏览器的剪贴板权限。'; }
  });
  render();
})();
