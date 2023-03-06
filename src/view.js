import renderErrors from './renderErrors.js';
import renderFeeds from './renderFeeds.js';
import renderPosts from './renderPosts.js';
import renderUiPosts from './renderUiPosts.js';

const initView = (state, i18next, elements) => (path, value) => {
  switch (path) {
    case 'urlForm.error':
      renderErrors(i18next, elements, value);
      break;
    case 'urlForm.feeds':
      renderFeeds(i18next, elements, value);
      break;
    case 'urlForm.posts':
      renderPosts(state, elements, value);
      break;
    case 'urlForm.uiPosts':
      renderUiPosts(value);
      break;
    default:
      break;
  }
};

export default initView;
