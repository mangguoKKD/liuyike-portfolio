(() => {
  const links = document.querySelectorAll('.sancan-gallery a');
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'project-image-dialog';
  dialog.setAttribute('aria-label', '作品图片预览');
  dialog.innerHTML = '<button type="button" aria-label="关闭图片预览" autofocus>× <span>关闭</span></button><img alt="">';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  let opener;
  let previousOverflow;
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    opener = link;
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
  }));
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
  });
})();
