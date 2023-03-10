const renderErrors = (i18next, elements, error) => {
  const { input, feedback, buttonForm } = elements;

  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18next.t(error);

  input.removeAttribute('readonly');
  buttonForm.disabled = false;
};

const renderFeeds = (i18next, elements, feeds) => {
  const {
    form, input, buttonForm, feedback, feedsContainer,
  } = elements;

  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const divCard = document.createElement('div');
  divCard.classList.add('card-body');
  const listCard = document.createElement('ul');
  listCard.classList.add('list-group', 'border-0', 'rounded-0');
  const titleCard = document.createElement('h2');
  titleCard.classList.add('card-title', 'h4');

  feedsContainer.innerHTML = '';

  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18next.t('success');

  titleCard.textContent = 'Фиды';

  feeds.forEach((feed) => {
    const elCard = document.createElement('li');
    elCard.classList.add('list-group-item', 'border-0', 'border-end-0');
    const titleEl = document.createElement('h3');
    titleEl.classList.add('h6', 'm-0');
    const descriptionEl = document.createElement('p');
    descriptionEl.classList.add('m-0', 'small', 'text-black-50');

    titleEl.textContent = feed.title;
    descriptionEl.textContent = feed.description;
    elCard.appendChild(titleEl);
    elCard.appendChild(descriptionEl);
    listCard.appendChild(elCard);
  });

  divCard.appendChild(titleCard);
  container.appendChild(divCard);
  container.appendChild(listCard);
  feedsContainer.appendChild(container);

  form.reset();
  input.focus();
  input.removeAttribute('readonly');
  buttonForm.disabled = false;
};

const renderPosts = (state, i18next, elements, posts) => {
  const {
    input, postsContainer, modalContainer, modalTitle, modalBody, linkFooter, buttonForm,
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

  input.removeAttribute('readonly');
  buttonForm.disabled = false;
};

const renderUiPosts = (ids) => {
  ids.forEach((id) => {
    const post = document.querySelector(`a[data-id="${id}"]`);
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

const initView = (state, i18next, elements) => (path, value) => {
  switch (path) {
    case 'urlForm.error':
      renderErrors(i18next, elements, value);
      break;
    case 'urlForm.feeds':
      renderFeeds(i18next, elements, value);
      break;
    case 'urlForm.posts':
      renderPosts(state, i18next, elements, value);
      break;
    case 'urlForm.uiPosts':
      renderUiPosts(value);
      break;
    default:
      break;
  }
};

export default initView;
