const renderUiPosts = (ids) => {
  ids.forEach((id) => {
    const post = document.querySelector(`a[data-id="${id}"]`);
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  });
};

export default renderUiPosts;
