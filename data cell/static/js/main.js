let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');

function enabledarkmode() {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkmode', 'active');
}

function disabledarkmode() {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkmode', null);
}

if (darkmode === 'active') enabledarkmode();

themeSwitch.addEventListener('click', () => {
  darkmode = localStorage.getItem('darkmode');
  darkmode !== 'active' ? enabledarkmode() : disabledarkmode();
});

const navbarToggler = document.querySelector('.navbar-toggler');
const linksMenu = document.getElementById('links');
const nav_close = document.querySelector('.nav-close');
const drop_down_btn = document.querySelector('.drop-down');
const drop_down_list = document.querySelector('.drop-down-list');

// فتح / غلق عند الضغط على الهامبرغر
navbarToggler.addEventListener('click', () => {
  linksMenu.classList.toggle('show');
});

nav_close.addEventListener('click', () => {
  linksMenu.classList.toggle('show');
});

linksMenu.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    if (link.closest('.drop-down')) return;

    linksMenu.classList.remove('show');
  });
});

// غلق عند الضغط خارج القائمة
document.addEventListener('click', (e) => {
  if (!linksMenu.contains(e.target) && !navbarToggler.contains(e.target)) {
    linksMenu.classList.remove('show');
  }
});

drop_down_btn.addEventListener('click', () => {
  drop_down_list.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (!drop_down_list.contains(e.target) && !drop_down_btn.contains(e.target)) {
    drop_down_list.classList.remove('active');
  }
});

function moveLoginButton() {
  const loginBtn = document.querySelector('.login-btn');
  const linksMenu = document.getElementById('links');
  const loginMobile = document.querySelector('.login-mobile button');

  if (window.innerWidth <= 991) {
    // Move button to sidebar
    loginMobile.textContent = loginBtn.textContent;
    loginMobile.parentElement.style.display = 'block';
    loginBtn.style.display = 'none';
  } else {
    // Move button back to navbar
    loginBtn.style.display = 'flex';
    loginMobile.parentElement.style.display = 'none';
  }
}

// Initial check
moveLoginButton();

// Update on resize
window.addEventListener('resize', moveLoginButton);

// search

const searchInput = document.getElementById('search-input');

if (searchInput) {
  searchInput.addEventListener('keyup', function () {
    fetch(`/search/?q=${this.value}`)
      .then((res) => res.json())
      .then((data) => {
        let results = document.getElementById('search-results');

        results.innerHTML = '';

        data.forEach((item) => {
          results.innerHTML += `
<div class="result-item">
${item.title}
</div>
`;
        });

        results.style.display = 'block';
      });
  });
}

// scroll to top

const topBtn = document.getElementById('myBtn');

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

if (topBtn) {
  const toggleTopBtn = () => {
    topBtn.style.display = window.scrollY > 200 ? 'block' : 'none';
  };

  window.addEventListener('scroll', toggleTopBtn);
  topBtn.addEventListener('click', scrollToTop);
  toggleTopBtn();
}

// blog pagination + data loading

const blogPostsContainer = document.getElementById('blogPosts');
const blogPagination = document.getElementById('blogPagination');
const blogPrev = document.getElementById('blogPrev');
const blogNext = document.getElementById('blogNext');
const blogFeaturedTitle = document.getElementById('blogFeaturedTitle');
const blogFeaturedExcerpt = document.getElementById('blogFeaturedExcerpt');
const blogFeaturedDate = document.getElementById('blogFeaturedDate');
const blogFeaturedLink = document.getElementById('blogFeaturedLink');

if (blogPostsContainer && blogPagination) {
  const pageSize = 8;
  let currentPage = 1;
  let postItems = [];
  const paginationWrap = blogPagination.closest('.blog-pagination-wrap');
  const paginationBar = blogPagination.closest('.blog-pagination');
  const blogDataUrl = '/static/data/blog-data.json';

  const resolveImagePath = (image) => {
    if (!image) return '../../static/img/preview.png';
    if (/^https?:\/\//i.test(image)) return image;
    return `../../static/img/${image}`;
  };

  const setFeatured = (featured) => {
    if (!featured) return;

    if (blogFeaturedTitle) {
      blogFeaturedTitle.textContent = featured.title || '';
    }
    if (blogFeaturedExcerpt) {
      blogFeaturedExcerpt.textContent = featured.excerpt || '';
    }
    if (blogFeaturedDate) {
      blogFeaturedDate.textContent = featured.dateLabel || featured.date || '';
    }
    if (blogFeaturedLink) {
      const link = featured.url || '#latest';
      const isExternal = /^https?:\/\//i.test(link);
      blogFeaturedLink.href = link;
      if (isExternal) {
        blogFeaturedLink.target = '_blank';
        blogFeaturedLink.rel = 'noopener noreferrer';
      } else {
        blogFeaturedLink.removeAttribute('target');
        blogFeaturedLink.removeAttribute('rel');
      }
    }
  };

  const buildPostItem = (post) => {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-6 blog-post-item';

    const tag = post.tag || '';
    const tagHtml = tag ? `<span class="post-tag">${tag}</span>` : '';
    const dateText = post.dateLabel || post.date || '';
    const imageSrc = resolveImagePath(post.image);
    const imageAlt = post.imageAlt || post.title || 'مقال من المدونة';
    const link = post.url || '#latest';
    const isExternal = /^https?:\/\//i.test(link);
    const linkAttrs = isExternal
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';

    col.innerHTML = `
<article class="post-card card h-100">
  <div class="post-media">
    <img src="${imageSrc}" alt="${imageAlt}" loading="lazy" decoding="async">
    ${tagHtml}
  </div>
  <div class="post-body card-body">
    <h5>${post.title || ''}</h5>
    <p>${post.excerpt || ''}</p>
    <div class="post-meta">
      <span><i class="fa-solid fa-calendar"></i> ${dateText}</span>
    </div>
    <a href="${link}" class="post-btn"${linkAttrs}>اقرأ المقال</a>
  </div>
</article>
`;

    return col;
  };

  const renderPage = () => {
    if (postItems.length === 0) return;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    postItems.forEach((item, index) => {
      item.style.display = index >= start && index < end ? '' : 'none';
    });
  };

  const createNumberItem = (page) => {
    const li = document.createElement('li');
    li.className = 'page-item';

    if (page === currentPage) {
      li.classList.add('active');
      li.setAttribute('aria-current', 'page');
      const span = document.createElement('span');
      span.className = 'page-link';
      span.textContent = page;
      li.appendChild(span);
      return li;
    }

    const link = document.createElement('a');
    link.className = 'page-link';
    link.href = '#';
    link.dataset.page = page;
    link.textContent = page;
    li.appendChild(link);
    return li;
  };

  const updatePrevNext = (totalPages) => {
    if (!blogPrev || !blogNext) return;

    const prevDisabled = totalPages <= 1 || currentPage === 1;
    const nextDisabled = totalPages <= 1 || currentPage === totalPages;

    blogPrev.classList.toggle('disabled', prevDisabled);
    blogPrev.setAttribute('aria-disabled', prevDisabled ? 'true' : 'false');
    if (prevDisabled) {
      blogPrev.removeAttribute('data-page');
    } else {
      blogPrev.dataset.page = String(currentPage - 1);
    }

    blogNext.classList.toggle('disabled', nextDisabled);
    blogNext.setAttribute('aria-disabled', nextDisabled ? 'true' : 'false');
    if (nextDisabled) {
      blogNext.removeAttribute('data-page');
    } else {
      blogNext.dataset.page = String(currentPage + 1);
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(postItems.length / pageSize);

    if (paginationWrap) {
      paginationWrap.style.display = totalPages <= 1 ? 'none' : '';
    }

    blogPagination.innerHTML = '';
    if (totalPages <= 1) {
      updatePrevNext(totalPages);
      return;
    }

    for (let page = 1; page <= totalPages; page++) {
      blogPagination.appendChild(createNumberItem(page));
    }

    updatePrevNext(totalPages);
  };

  const handlePaginationClick = (event) => {
    const target = event.target.closest('[data-page]');
    if (!target) return;

    event.preventDefault();
    const nextPage = Number(target.dataset.page);
    if (!nextPage || nextPage === currentPage) return;

    currentPage = nextPage;
    renderPage();
    renderPagination();
    blogPostsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderMessage = (message) => {
    blogPostsContainer.innerHTML = `
<div class="col-12 text-center text-secondary py-5">${message}</div>
`;
    postItems = [];
    if (paginationWrap) {
      paginationWrap.style.display = 'none';
    }
  };

  const loadPosts = () => {
    fetch(blogDataUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load blog data');
        return res.json();
      })
      .then((data) => {
        const posts = Array.isArray(data) ? data : data.posts;
        setFeatured(data.featured);

        if (!Array.isArray(posts) || posts.length === 0) {
          renderMessage('لا توجد مقالات الآن.');
          return;
        }

        blogPostsContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        posts.forEach((post) => {
          fragment.appendChild(buildPostItem(post));
        });
        blogPostsContainer.appendChild(fragment);
        postItems = Array.from(
          blogPostsContainer.querySelectorAll('.blog-post-item')
        );
        currentPage = 1;
        renderPage();
        renderPagination();
      })
      .catch(() => {
        renderMessage('تعذّر تحميل المقالات الآن.');
      });
  };

  if (paginationBar) {
    paginationBar.addEventListener('click', handlePaginationClick);
  } else {
    blogPagination.addEventListener('click', handlePaginationClick);
  }

  loadPosts();
}

// home latest posts (first 3 from blog JSON)

const homeLatestPosts = document.getElementById('homeLatestPosts');

if (homeLatestPosts) {
  const blogDataUrl = '/static/data/blog-data.json';

  const resolveImagePath = (image) => {
    if (!image) return '../../static/img/preview.png';
    if (/^https?:\/\//i.test(image)) return image;
    return `../../static/img/${image}`;
  };

  const renderMessage = (message) => {
    homeLatestPosts.innerHTML = `
<div class="col-12 text-center text-secondary py-4">${message}</div>
`;
  };

  const buildHomePost = (post) => {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';

    const tag = post.tag || '';
    const tagHtml = tag ? `<span class="post-tag">${tag}</span>` : '';
    const dateText = post.dateLabel || post.date || '';
    const readTime = post.readTime
      ? `<span><i class="fa-solid fa-clock"></i> ${post.readTime}</span>`
      : '';
    const imageSrc = resolveImagePath(post.image);
    const imageAlt = post.imageAlt || post.title || 'مقال من المدونة';
    const link = post.url || '../blog/blog.html';
    const isExternal = /^https?:\/\//i.test(link);
    const linkAttrs = isExternal
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';

    col.innerHTML = `
<article class="post-card card h-100">
  <div class="post-media">
    <img src="${imageSrc}" alt="${imageAlt}" loading="lazy" decoding="async">
    ${tagHtml}
  </div>
  <div class="post-body card-body">
    <h5>${post.title || ''}</h5>
    <p>${post.excerpt || ''}</p>
    <div class="post-meta">
      <span><i class="fa-solid fa-calendar"></i> ${dateText}</span>
      ${readTime}
    </div>
    <a href="${link}" class="post-btn"${linkAttrs}>اقرأ المقال</a>
  </div>
</article>
`;

    return col;
  };

  fetch(blogDataUrl)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load blog data');
      return res.json();
    })
    .then((data) => {
      const posts = Array.isArray(data) ? data : data.posts;
      if (!Array.isArray(posts) || posts.length === 0) {
        renderMessage('لا توجد مقالات الآن.');
        return;
      }

      const topPosts = posts.slice(0, 3);
      homeLatestPosts.innerHTML = '';
      const fragment = document.createDocumentFragment();
      topPosts.forEach((post) => {
        fragment.appendChild(buildHomePost(post));
      });
      homeLatestPosts.appendChild(fragment);
    })
    .catch(() => {
      renderMessage('تعذّر تحميل المقالات الآن.');
    });
}

const container = document.getElementById('videosContainer');
const modal = document.getElementById('videoModal');
const frame = document.getElementById('videoFrame');
const close = document.querySelector('.close');

fetch('/static/data/random-videos.json')
  .then((res) => res.json())
  .then((data) => {
    data.forEach((video) => {
      const card = document.createElement('div');

      card.className = 'col-lg-3 col-md-6 mb-4';

      card.innerHTML = `
    
      <div class="course-card">

        <div class="img-container">
          <img src="${video.thumbnail}" class="course-img" alt="${video.title}">
        </div>

        <div class="course-content">

          <h5 class="course-title">${video.title}</h5>

          <p class="course-desc">
            ${video.desc}
          </p>

        </div>

      </div>
      
    `;

      card.onclick = function () {
        frame.src = video.video;

        modal.style.display = 'flex';
      };

      container.appendChild(card);
    });
  });

close.onclick = function () {
  modal.style.display = 'none';
  frame.src = '';
};

window.onclick = function (e) {
  if (e.target == modal) {
    modal.style.display = 'none';
    frame.src = '';
  }
};

const video_container = document.getElementById('videosContainer');
const video_modal = document.getElementById('videoModal');
const video_frame = document.getElementById('videoFrame');

const videosPagination = document.getElementById('videosPagination');
const videosPrev = document.getElementById('videosPrev');
const videosNext = document.getElementById('videosNext');

if (video_container && videosPagination) {
  const pageSize = 8;
  let currentPage = 1;
  let videoItems = [];

  fetch('/static/data/random-videos.json')
    .then((res) => res.json())
    .then((data) => {
      video_container.innerHTML = '';

      const fragment = document.createDocumentFragment();

      data.forEach((video) => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-6 mb-4 video-item';

        col.innerHTML = `

<div class="course-card">

  <div class="img-container">
    <img src="${video.thumbnail}" class="course-img" alt="${video.title}">
  </div>

  <div class="course-content">

    <h5 class="course-title">${video.title}</h5>

    <p class="course-desc">${video.desc || ''}</p>

  </div>

</div>
`;

        col.onclick = () => {
          video_frame.src = video.video;
          video_modal.style.display = 'flex';
        };

        fragment.appendChild(col);
      });

      video_container.appendChild(fragment);

      videoItems = Array.from(video_container.querySelectorAll('.video-item'));

      renderVideos();
      renderPagination();
    });

  function renderVideos() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    videoItems.forEach((item, index) => {
      item.style.display = index >= start && index < end ? '' : 'none';
    });
  }

  function renderPagination() {
    const totalPages = Math.ceil(videoItems.length / pageSize);

    videosPagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = 'page-item';

      if (i === currentPage) li.classList.add('active');

      li.innerHTML = `
<a class="page-link" href="#" data-page="${i}">
${i}
</a>
`;

      videosPagination.appendChild(li);
    }

    videosPrev.classList.toggle('disabled', currentPage === 1);
    videosNext.classList.toggle('disabled', currentPage === totalPages);
  }

  // بعد renderPagination() و renderVideos()
  videosPrev.addEventListener('click', function (e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderVideos();
      renderPagination();
      video_container.scrollIntoView({ behavior: 'smooth' });
    }
  });

  videosNext.addEventListener('click', function (e) {
    e.preventDefault();
    const totalPages = Math.ceil(videoItems.length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderVideos();
      renderPagination();
      video_container.scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-page]');

    if (!target) return;

    e.preventDefault();

    const page = Number(target.dataset.page);

    if (!page || page === currentPage) return;

    currentPage = page;

    renderVideos();
    renderPagination();

    video_container.scrollIntoView({ behavior: 'smooth' });
  });
}
