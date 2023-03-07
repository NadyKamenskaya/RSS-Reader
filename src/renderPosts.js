const renderPosts = (state, i18next, elements, posts) => {
  const {
    postsContainer, modalContainer, modalTitle, modalBody, linkFooter,
  } = elements;

  const titleCard = document.createElement('h2');
  titleCard.classList.add('card-title', 'h4');
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const divCard = document.createElement('div');
  divCard.classList.add('card-body');
  const listCard = document.createElement('ul');
  listCard.classList.add('list-group', 'border-0', 'rounded-0');

  postsContainer.innerHTML = '';

  titleCard.textContent = 'Посты';

  posts.forEach((post) => {
    const elCard = document.createElement('li');
    elCard.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.setAttribute('href', post.link);
    link.classList.add('fw-bold');
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18next.t('button');

    elCard.addEventListener('click', (e) => {
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal', 'link-secondary');
      if (!state.urlForm.uiPosts.includes(link.dataset.id)) {
        state.urlForm.uiPosts.push(link.dataset.id);
      }

      if (e.target.textContent === 'Просмотр') {
        modalContainer.classList.add('show');
        modalContainer.style.display = 'block';
        modalContainer.removeAttribute('aria-hidden', 'true');
        modalContainer.setAttribute('aria-modal', 'true');

        modalTitle.textContent = post.title;
        modalBody.textContent = post.description;
        linkFooter.setAttribute('href', post.link);
      }
    });

    elCard.appendChild(link);
    elCard.appendChild(button);
    listCard.appendChild(elCard);
  });

  divCard.appendChild(titleCard);
  container.appendChild(divCard);
  container.appendChild(listCard);
  postsContainer.appendChild(container);

  modalContainer.addEventListener('click', (event) => {
    if (event.target.textContent === 'Закрыть') {
      modalContainer.classList.remove('show');
      modalContainer.style.display = 'none';
      modalContainer.setAttribute('aria-hidden', 'true');
      modalContainer.removeAttribute('aria-modal', 'true');
    }
  });
};

export default renderPosts;
