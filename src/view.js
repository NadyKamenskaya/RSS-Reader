const initView = (i18next) => (path, value) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');
  const containerModal = document.querySelector('.modal');
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const linkFooter = document.querySelector('.full-article');

  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const divCard = document.createElement('div');
  divCard.classList.add('card-body');
  const listCard = document.createElement('ul');
  listCard.classList.add('list-group', 'border-0', 'rounded-0');
  const titleCard = document.createElement('h2');
  titleCard.classList.add('card-title', 'h4');

  const renderError = (error) => {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18next.t(error);
  };

  const renderFeeds = (feeds) => {
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
  };

  const renderPosts = (posts) => {
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
      button.textContent = 'Просмотр';

      button.addEventListener('click', (e) => {
        e.preventDefault();

        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');

        containerModal.classList.add('show');
        containerModal.style.display = 'block';
        containerModal.removeAttribute('aria-hidden', 'true');
        containerModal.setAttribute('aria-modal', 'true');

        modalTitle.textContent = post.title;
        modalBody.textContent = post.description;
        linkFooter.setAttribute('href', post.link);
      });

      elCard.appendChild(link);
      elCard.appendChild(button);
      listCard.appendChild(elCard);
    });

    divCard.appendChild(titleCard);
    container.appendChild(divCard);
    container.appendChild(listCard);
    postsContainer.appendChild(container);
  };

  switch (path) {
    case 'urlForm.error':
      renderError(value);
      break;
    case 'urlForm.feeds':
      renderFeeds(value);
      break;
    case 'urlForm.posts':
      renderPosts(value);
      break;
    default:
      break;
  }
};

export default initView;
