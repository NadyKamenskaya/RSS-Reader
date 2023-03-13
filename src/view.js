const renderErrors = (i18next, elements, error) => {
  const { input, feedback, buttonForm } = elements;

  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18next(error);

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
  feedback.textContent = i18next('success');

  titleCard.textContent = i18next('feeds');

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

const renderPosts = (i18next, elements, posts) => {
  const { input, postsContainer, buttonForm } = elements;

  const titleCard = document.createElement('h2');
  titleCard.classList.add('card-title', 'h4');
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const divCard = document.createElement('div');
  divCard.classList.add('card-body');
  const listCard = document.createElement('ul');
  listCard.classList.add('list-group', 'border-0', 'rounded-0');

  postsContainer.innerHTML = '';

  titleCard.textContent = i18next('posts');

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
    button.textContent = i18next('button');

    elCard.appendChild(link);
    elCard.appendChild(button);
    listCard.appendChild(elCard);
  });

  divCard.appendChild(titleCard);
  container.appendChild(divCard);
  container.appendChild(listCard);
  postsContainer.appendChild(container);

  input.removeAttribute('readonly');
  buttonForm.disabled = false;
};

const renderUiPosts = (postsId) => {
  postsId.forEach((id) => {
    const post = document.querySelector(`a[data-id="${id}"]`);
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (elements, post) => {
  const {
    modalTitle, modalBody, linkFooter,
  } = elements;

  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  // modalContainer.classList.add('show');
  // modalContainer.style.display = 'block';
  // modalContainer.removeAttribute('aria-hidden', 'true');
  // modalContainer.setAttribute('aria-modal', 'true');
  linkFooter.setAttribute('href', post.link);
};

const renderState = (elements, value) => {
  const { input, buttonForm, feedback } = elements;

  switch (value) {
    case 'reading':
      input.removeAttribute('readonly', 'readonly');
      buttonForm.disabled = false;
      break;
    case 'sending':
      input.classList.remove('is-invalid');
      input.setAttribute('readonly', 'readonly');
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
      buttonForm.disabled = true;
      break;
    default:
      throw new Error(`Unknown state: ${value}`);
  }
};

const initView = (i18next, elements) => (path, value) => {
  switch (path) {
    case 'urlForm.error':
      renderErrors(i18next, elements, value);
      break;
    case 'urlForm.feeds':
      renderFeeds(i18next, elements, value);
      break;
    case 'urlForm.posts':
      renderPosts(i18next, elements, value);
      break;
    case 'uiPosts':
      renderUiPosts(value);
      break;
    case 'uiModal':
      renderModal(elements, value);
      break;
    case 'uiState':
      renderState(elements, value);
      break;
    default:
      break;
  }
};

export default initView;
