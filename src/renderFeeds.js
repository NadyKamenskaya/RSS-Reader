const renderFeeds = (i18next, elements, feeds) => {
  const { input, feedback, feedsContainer } = elements;

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

  elements.form.reset();
  elements.input.focus();
};

export default renderFeeds;
