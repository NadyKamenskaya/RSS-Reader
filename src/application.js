import i18n from 'i18next';
import keyBy from 'lodash/keyBy.js';
import uniqueId from 'lodash/uniqueId.js';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import ru from './ru.js';
import initView from './view.js';
import parsers from './parsers.js';
import buildUrlProxy from './buildUrlProxy.js';

const app = () => {
  yup.setLocale({
    string: {
      url: 'notURL',
    },
  });

  const schema = yup.object().shape({
    website: yup.string().url(),
  });

  const validate = (fields) => {
    try {
      schema.validateSync(fields, { abortEarly: false });
      return {};
    } catch (e) {
      return keyBy(e.inner, 'path');
    }
  };

  const state = {
    urlForm: {
      data: {
        website: '',
      },
      error: '',
      feeds: [],
      posts: [],
    },
    uiPosts: [],
    uiModal: {},
    uiState: '',
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    buttonForm: document.querySelector('.h-100'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalContainer: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    linkFooter: document.querySelector('.full-article'),
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then((translate) => {
      const watchedState = onChange(state, initView(translate, elements));

      const timeout = () => {
        const currentId = uniqueId();
        state.urlForm.feeds.map((feed) => {
          axios.get(buildUrlProxy(feed.link))
            .then((response) => parsers(response.data.contents))
            .then((data) => {
              data.items.map((item) => {
                const filter = state.urlForm.posts.filter((post) => post.link === item.link);
                if (filter.length === 0) {
                  watchedState.urlForm.posts = [...state.urlForm.posts, {
                    feedId: currentId,
                    link: item.link,
                    title: item.title,
                    description: item.description,
                    id: item.id,
                  }];
                }

                return watchedState.urlForm.posts;
              });
              watchedState.uiPosts = [...state.uiPosts];
            })
            .catch((err) => {
              throw err;
            });
          return watchedState;
        });
        setTimeout(timeout, 5000);
      };

      elements.input.addEventListener('change', (event) => {
        if (event.target.value.length === 0) {
          watchedState.urlForm.error = 'isEmpty';
        }
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const value = formData.get('url');

        watchedState.urlForm.data.website = value;
        watchedState.uiState = 'sending';
        watchedState.uiState = 'reading';
        const error = validate(watchedState.urlForm.data).website;

        if (watchedState.urlForm.feeds.find((feed) => feed.link === value)) {
          watchedState.urlForm.error = 'notOneOf';
        } else if (error) {
          watchedState.urlForm.error = error.message;
        } else {
          const currentId = uniqueId();
          watchedState.urlForm.error = '';

          axios.get(buildUrlProxy(watchedState.urlForm.data.website))
            .then((response) => parsers(response.data.contents))
            .then((data) => {
              data.items.map((item) => {
                watchedState.urlForm.posts = [...state.urlForm.posts, {
                  feedId: currentId,
                  link: item.link,
                  title: item.title,
                  description: item.description,
                  id: item.id,
                }];

                return watchedState.urlForm.posts;
              });
              watchedState.uiPosts = [...state.uiPosts];
              watchedState.urlForm.feeds = [...state.urlForm.feeds, {
                feedId: currentId,
                link: `${value}`,
                title: data.title,
                description: data.description,
              }];
              return watchedState;
            })
            .catch((err) => {
              if (err.message) {
                watchedState.urlForm.error = 'networkError';
                return watchedState;
              }
              throw err;
            })
            .finally(() => {
              setTimeout(timeout, 5000);
            });
        }
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const currentPostId = (e.target.tagName === 'A')
          ? e.target.dataset.id
          : e.target.previousElementSibling.dataset.id;

        if (!state.uiPosts.includes(currentPostId)) {
          watchedState.uiPosts.push(currentPostId);
        }
        if (e.target.tagName === 'BUTTON') {
          const currentPost = state.urlForm.posts
            .filter((post) => post.id === currentPostId);
          watchedState.uiModal = {
            title: currentPost[0].title,
            description: currentPost[0].description,
            link: currentPost[0].link,
          };
        }
      });
      return watchedState;
    });
};

export default app;
