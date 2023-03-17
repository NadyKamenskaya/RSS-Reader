import 'bootstrap';
import './styles.scss';
import i18n from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import ru from './ru.js';
import initView from './view.js';
import parse from './parse.js';
import buildUrlProxy from './buildUrlProxy.js';

const app = () => {
  yup.setLocale({
    mixed: {
      required: 'isEmpty',
      notOneOf: 'notOneOf',
    },
    string: {
      url: 'notURL',
    },
  });

  const validate = (schema, field) => schema.validate(field);

  const state = {
    loadingState: {
      status: 'idle',
    },
    form: {
      error: null,
      status: 'filling',
    },
    feeds: [],
    posts: [],
    ui: {
      modal: {
        postId: null,
      },
      viewedPostIds: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    buttonForm: document.querySelector('.h-100'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
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
      const watchedState = onChange(state, initView(translate, state, elements));

      const fetchNewPosts = () => {
        const promises = state.feeds.forEach((feed) => {
          axios.get(buildUrlProxy(feed.link))
            .then((response) => {
              const data = parse(response.data.contents);
              const currentId = uniqueId();
              data.items.forEach((item) => {
                const filter = state.posts.filter((post) => post.link === item.link);
                if (filter.length === 0) {
                  watchedState.posts = [...state.posts, {
                    feedId: currentId,
                    link: item.link,
                    title: item.title,
                    description: item.description,
                    id: uniqueId(),
                  }];
                }
              });
              const cloneSet = new Set([...state.ui.viewedPostIds]);
              watchedState.ui.viewedPostIds.clear();
              watchedState.ui.viewedPostIds = new Set([...cloneSet]);
            });
        });
        Promise.all([promises])
          .finally(() => {
            setTimeout(fetchNewPosts, 5000);
          });
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const value = formData.get('url');

        watchedState.error = null;
        watchedState.loadingState.status = 'load';

        const arrayFeeds = state.feeds.reduce((acc, feed) => [...acc, feed.link], []);

        const schema = yup.string().url().notOneOf(arrayFeeds).required();

        validate(schema, value)
          .then((currentLink) => {
            axios.get(buildUrlProxy(currentLink))
              .then((response) => {
                const data = parse(response.data.contents);
                const currentId = uniqueId();
                watchedState.feeds = [...state.feeds, {
                  feedId: currentId,
                  link: currentLink,
                  title: data.title,
                  description: data.description,
                }];
                data.items.forEach((item) => {
                  watchedState.posts = [...state.posts, {
                    feedId: currentId,
                    link: item.link,
                    title: item.title,
                    description: item.description,
                    id: uniqueId(),
                  }];
                });
                const cloneSet = new Set([...state.ui.viewedPostIds]);
                watchedState.ui.viewedPostIds.clear();
                watchedState.ui.viewedPostIds = new Set([...cloneSet]);
                watchedState.loadingState.status = 'success';
                watchedState.loadingState.status = 'idle';
              })
              .catch((error) => {
                switch (error.message) {
                  case 'rssInvalid':
                    watchedState.error = 'rssInvalid';
                    break;
                  case 'Network Error':
                    watchedState.error = 'networkError';
                    break;
                  default:
                    watchedState.error = 'unknown';
                    break;
                }
                watchedState.form.status = 'filling';
                watchedState.loadingState.status = 'idle';
              });
          })
          .catch((error) => {
            watchedState.error = error.message;
            watchedState.form.status = 'failed';
            watchedState.form.status = 'filling';
            watchedState.loadingState.status = 'idle';
          });
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const currentPostId = (e.target.tagName === 'A')
          ? e.target.dataset.id
          : e.target.previousElementSibling.dataset.id;

        if (e.target.tagName === 'BUTTON') {
          watchedState.ui.modal.postId = currentPostId;
        }
        watchedState.ui.viewedPostIds.add(currentPostId);
      });

      fetchNewPosts();
    });
};

export default app;
