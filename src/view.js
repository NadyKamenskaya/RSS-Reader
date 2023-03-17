const setAttributes = (el, attrs) => {
  Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]));
};

const renderFormStatus = (elements, value) => {
  const { input } = elements;

  switch (value) {
    case 'filling':
      input.removeAttribute('readonly', 'readonly');
      break;
    case 'failed':
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Unknown state: ${value}`);
  }
};

const renderLoadingStateStatus = (i18next, elements, value) => {
  const {
    form, input, buttonForm, feedback,
  } = elements;

  switch (value) {
    case 'idle':
      input.removeAttribute('readonly', 'readonly');
      buttonForm.disabled = false;
      break;
    case 'load':
      input.classList.remove('is-invalid');
      input.setAttribute('readonly', 'readonly');
      feedback.textContent = '';
      feedback.classList.remove('text-success', 'text-danger');
      buttonForm.disabled = true;
      break;
    case 'success':
      feedback.classList.add('text-success');
      feedback.textContent = i18next('success');
      form.reset();
      input.focus();
      break;
    default:
      throw new Error(`Unknown state: ${value}`);
  }
};

const renderErrors = (i18next, elements, error) => {
  const { feedback } = elements;

  feedback.classList.add('text-danger');
  feedback.textContent = i18next(error);
};

const renderFeeds = (i18next, elements, feeds) => {
  const { feedsContainer } = elements;

  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const divCard = document.createElement('div');
  divCard.classList.add('card-body');
  const listCard = document.createElement('ul');
  listCard.classList.add('list-group', 'border-0', 'rounded-0');
  const titleCard = document.createElement('h2');
  titleCard.classList.add('card-title', 'h4');

  feedsContainer.innerHTML = '';

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
    elCard.innerHTML += titleEl.outerHTML + descriptionEl.outerHTML;
    listCard.appendChild(elCard);
  });

  divCard.appendChild(titleCard);
  container.innerHTML += divCard.outerHTML + listCard.outerHTML;
  feedsContainer.appendChild(container);
};

const renderPosts = (i18next, elements, posts) => {
  const { postsContainer } = elements;

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
    link.classList.add('fw-bold');
    setAttributes(link, {
      href: post.link, 'data-id': post.id, target: '_blank', rel: 'noopener noreferrer',
    });
    link.textContent = post.title;
    const button = document.createElement('button');
    setAttributes(button, { type: 'button', 'data-bs-toggle': 'modal', 'data-bs-target': '#modal' });
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18next('button');

    elCard.innerHTML += link.outerHTML + button.outerHTML;
    listCard.appendChild(elCard);
  });

  divCard.appendChild(titleCard);
  container.innerHTML += divCard.outerHTML + listCard.outerHTML;
  postsContainer.appendChild(container);
};

const renderUiViewedPostIds = (postIds) => {
  postIds.forEach((id) => {
    const post = document.querySelector(`a[data-id="${id}"]`);
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

const renderUiModalPostId = (state, elements, postId) => {
  const { modalTitle, modalBody, linkFooter } = elements;

  const currentPost = state.posts
    .find((post) => post.id === postId);

  modalTitle.textContent = currentPost.title;
  modalBody.textContent = currentPost.description;
  linkFooter.setAttribute('href', currentPost.link);
};

const initView = (i18next, state, elements) => (path, value) => {
  switch (path) {
    case 'form.status':
      renderFormStatus(elements, value);
      break;
    case 'loadingState.status':
      renderLoadingStateStatus(i18next, elements, value);
      break;
    case 'error':
      renderErrors(i18next, elements, value);
      break;
    case 'feeds':
      renderFeeds(i18next, elements, value);
      break;
    case 'posts':
      renderPosts(i18next, elements, value);
      break;
    case 'ui.viewedPostIds':
      renderUiViewedPostIds(value);
      break;
    case 'ui.modal.postId':
      renderUiModalPostId(state, elements, value);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }
};

export default initView;
