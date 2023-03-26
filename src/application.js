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

const validate = (schema, field) => schema.validate(field);

const getErrorType = (error) => {
  if (error.isParseError) {
    return 'rssInvalid';
  }
  if (error.isAxiosError) {
    return 'networkError';
  }

  return 'unknown';
};

const buildFeedObject = (feed, link, id) => ({
  feedId: id,
  link,
  title: feed.title,
  description: feed.description,
});

const buildPostObject = (post, id) => ({
  feedId: id,
  link: post.link,
  title: post.title,
  description: post.description,
  id: uniqueId(),
});

const fetchNewPosts = (state, watchedState) => {
  const promises = state.feeds.map((feed) => {
    axios.get(buildUrlProxy(feed.link))
      .then((response) => {
        const data = parse(response.data.contents);
        const currentId = uniqueId();
        data.items.forEach((item) => {
          const filter = state.posts.filter((post) => post.link === item.link);
          if (filter.length === 0) {
            watchedState.posts.push(buildPostObject(item, currentId));
          }
        });
      });
    return watchedState;
  });
  Promise.all([promises])
    .finally(() => {
      setTimeout(() => fetchNewPosts(state, watchedState), 5000);
    });
};

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

  const state = {
    loadingState: {
      error: null,
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

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const value = formData.get('url');

        watchedState.loadingState.error = null;
        watchedState.form.error = null;
        watchedState.form.status = 'filling';
        watchedState.loadingState.status = 'load';

        const arrayFeeds = state.feeds.reduce((acc, feed) => [...acc, feed.link], []);

        const schema = yup.string().url().notOneOf(arrayFeeds).required();

        validate(schema, value)
          .then((currentLink) => axios.get(buildUrlProxy(currentLink)))
          .then((response) => {
            const data = parse(response.data.contents);
            const currentId = uniqueId();
            watchedState.feeds = [...state.feeds,
              buildFeedObject(data, value, currentId)];
            data.items.forEach((item) => {
              watchedState.posts = [...state.posts, buildPostObject(item, currentId)];
            });
            watchedState.loadingState.status = 'success';
          })
          .catch((error) => {
            if (error.name === 'ValidationError') {
              watchedState.form.error = error.message;
              watchedState.form.status = 'failed';
            } else {
              watchedState.loadingState.error = getErrorType(error);
            }
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

      fetchNewPosts(state, watchedState);
    });
};

export default app;
