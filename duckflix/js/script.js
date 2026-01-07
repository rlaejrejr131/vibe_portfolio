// Duckflix JavaScript

const API_KEY = '94a5af30a57474c56b6c4cc7e5e45207';
const NOW_PLAYING_API_URL = 'https://api.themoviedb.org/3/movie/now_playing';
const POPULAR_API_URL = 'https://api.themoviedb.org/3/movie/popular';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const REVIEWS_API_URL = 'https://api.themoviedb.org/3/movie';
const VIDEOS_API_URL = 'https://api.themoviedb.org/3/movie';

// 현재 상영 중인 영화 상태
let allMovies = [];
let displayedCount = 10;

// 인기있는 영화 상태
let allPopularMovies = [];
let displayedPopularCount = 10;

const MOVIES_PER_PAGE = 10;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Duckflix가 로드되었습니다!');
    
    // 헤더 스크롤 효과
    initHeaderScroll();
    
    // 영화 데이터 로드
    loadMovies();
    loadPopularMovies();
    
    // 더보기 버튼 이벤트
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', showMoreMovies);
    
    const popularLoadMoreBtn = document.getElementById('popularLoadMoreBtn');
    popularLoadMoreBtn.addEventListener('click', showMorePopularMovies);
    
    // 모달 이벤트
    initModal();
});

// 헤더 스크롤 효과
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 현재 상영 중인 영화 데이터 가져오기
async function loadMovies() {
    const moviesContainer = document.getElementById('moviesContainer');
    
    try {
        // 1페이지와 2페이지를 병렬로 가져오기
        const [response1, response2] = await Promise.all([
            fetch(`${NOW_PLAYING_API_URL}?api_key=${API_KEY}&language=ko-KR&page=1`),
            fetch(`${NOW_PLAYING_API_URL}?api_key=${API_KEY}&language=ko-KR&page=2`)
        ]);
        
        if (!response1.ok || !response2.ok) {
            throw new Error('영화 데이터를 가져오는데 실패했습니다.');
        }
        
        const [data1, data2] = await Promise.all([
            response1.json(),
            response2.json()
        ]);
        
        // 두 페이지의 영화 데이터 합치기
        allMovies = [...data1.results, ...data2.results];
        displayedCount = MOVIES_PER_PAGE;
        
        if (allMovies.length === 0) {
            moviesContainer.innerHTML = '<div class="error">현재 상영 중인 영화가 없습니다.</div>';
            return;
        }
        
        // 처음 10개만 표시
        displayMovies();
        
    } catch (error) {
        console.error('Error:', error);
        moviesContainer.innerHTML = `<div class="error">오류가 발생했습니다: ${error.message}</div>`;
    }
}

// 인기있는 영화 데이터 가져오기
async function loadPopularMovies() {
    const moviesContainer = document.getElementById('popularMoviesContainer');
    
    try {
        // 1페이지와 2페이지를 병렬로 가져오기
        const [response1, response2] = await Promise.all([
            fetch(`${POPULAR_API_URL}?api_key=${API_KEY}&language=ko-KR&page=1`),
            fetch(`${POPULAR_API_URL}?api_key=${API_KEY}&language=ko-KR&page=2`)
        ]);
        
        if (!response1.ok || !response2.ok) {
            throw new Error('영화 데이터를 가져오는데 실패했습니다.');
        }
        
        const [data1, data2] = await Promise.all([
            response1.json(),
            response2.json()
        ]);
        
        // 두 페이지의 영화 데이터 합치기
        allPopularMovies = [...data1.results, ...data2.results];
        displayedPopularCount = MOVIES_PER_PAGE;
        
        if (allPopularMovies.length === 0) {
            moviesContainer.innerHTML = '<div class="error">인기있는 영화가 없습니다.</div>';
            return;
        }
        
        // 처음 10개만 표시
        displayPopularMovies();
        
    } catch (error) {
        console.error('Error:', error);
        moviesContainer.innerHTML = `<div class="error">오류가 발생했습니다: ${error.message}</div>`;
    }
}

// 현재 상영 중인 영화 표시 함수
function displayMovies() {
    const moviesContainer = document.getElementById('moviesContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // 표시할 영화만 선택
    const moviesToShow = allMovies.slice(0, displayedCount);
    
    // 영화 카드 렌더링
    moviesContainer.innerHTML = moviesToShow.map(movie => createMovieCard(movie)).join('');
    
    // 클릭 이벤트 추가
    attachMovieClickEvents(moviesContainer);
    
    // 더보기 버튼 표시/숨김 처리
    if (displayedCount >= allMovies.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// 인기있는 영화 표시 함수
function displayPopularMovies() {
    const moviesContainer = document.getElementById('popularMoviesContainer');
    const loadMoreBtn = document.getElementById('popularLoadMoreBtn');
    
    // 표시할 영화만 선택
    const moviesToShow = allPopularMovies.slice(0, displayedPopularCount);
    
    // 영화 카드 렌더링
    moviesContainer.innerHTML = moviesToShow.map(movie => createMovieCard(movie)).join('');
    
    // 클릭 이벤트 추가
    attachMovieClickEvents(moviesContainer);
    
    // 더보기 버튼 표시/숨김 처리
    if (displayedPopularCount >= allPopularMovies.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// 더보기 버튼 클릭 시 (현재 상영 중인 영화)
function showMoreMovies() {
    displayedCount += MOVIES_PER_PAGE;
    displayMovies();
}

// 더보기 버튼 클릭 시 (인기있는 영화)
function showMorePopularMovies() {
    displayedPopularCount += MOVIES_PER_PAGE;
    displayPopularMovies();
}

// 영화 카드 생성
function createMovieCard(movie) {
    const posterPath = movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';
    
    const title = movie.title || '제목 없음';
    
    // 개봉일자 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
    let releaseDateFormatted = '';
    if (movie.release_date) {
        const date = new Date(movie.release_date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        releaseDateFormatted = `${year}년 ${month}월 ${day}일`;
    }
    
    return `
        <div class="movie-card" data-movie-id="${movie.id}" data-movie-title="${title}" data-movie-poster="${posterPath}" data-movie-date="${releaseDateFormatted}">
            <img 
                src="${posterPath}" 
                alt="${title}" 
                class="movie-poster"
                loading="lazy"
            >
            <div class="movie-info">
                <div class="movie-title">${title}</div>
                ${releaseDateFormatted ? `<div class="movie-release-date">${releaseDateFormatted}</div>` : ''}
            </div>
        </div>
    `;
}

// 영화 카드 클릭 이벤트 추가
function attachMovieClickEvents(container) {
    const movieCards = container.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        card.addEventListener('click', function() {
            const movieId = this.dataset.movieId;
            const movieTitle = this.dataset.movieTitle;
            const moviePoster = this.dataset.moviePoster;
            const movieDate = this.dataset.movieDate;
            
            openModal({
                id: movieId,
                title: movieTitle,
                poster: moviePoster,
                releaseDate: movieDate
            });
        });
    });
}

// 모달 초기화
function initModal() {
    const modal = document.getElementById('movieModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    
    // 닫기 버튼 클릭
    modalClose.addEventListener('click', closeModal);
    
    // 오버레이 클릭 시 닫기
    modalOverlay.addEventListener('click', closeModal);
    
    // ESC 키로 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// 모달 열기
function openModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalHeader = document.getElementById('modalHeader');
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    // 모달 헤더 초기화
    modalHeader.innerHTML = '<div class="modal-loading">로딩 중...</div>';
    
    // 리뷰 컨테이너 초기화
    reviewsContainer.innerHTML = '<div class="loading">리뷰를 불러오는 중...</div>';
    
    // 모달 표시
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 영상 로드
    loadVideos(movie.id, movie.title, movie.releaseDate);
    
    // 리뷰 로드
    loadReviews(movie.id);
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('movieModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// 영상 가져오기
async function loadVideos(movieId, movieTitle, movieReleaseDate) {
    const modalHeader = document.getElementById('modalHeader');
    
    try {
        const response = await fetch(`${VIDEOS_API_URL}/${movieId}/videos?api_key=${API_KEY}&language=ko-KR`);
        
        if (!response.ok) {
            throw new Error('영상을 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        const videos = data.results;
        
        // YouTube 트레일러 찾기 (우선순위: Trailer > Teaser > 기타)
        let video = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (!video) {
            video = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube');
        }
        if (!video) {
            video = videos.find(v => v.site === 'YouTube');
        }
        
        if (video) {
            const videoKey = video.key;
            const videoUrl = `https://www.youtube.com/watch?v=${videoKey}`;
            const thumbnailUrl = `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;
            
            // 썸네일과 링크를 사용한 방식 (오류 153 회피)
            modalHeader.innerHTML = `
                <div class="modal-video-container">
                    <div class="video-thumbnail-wrapper" data-video-key="${videoKey}">
                        <img src="${thumbnailUrl}" alt="영상 썸네일" class="video-thumbnail" onerror="this.src='https://img.youtube.com/vi/${videoKey}/hqdefault.jpg'">
                        <div class="video-play-button">
                            <svg width="68" height="48" viewBox="0 0 68 48">
                                <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.63-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                                <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                            </svg>
                        </div>
                        <a href="${videoUrl}" target="_blank" class="youtube-direct-link" title="YouTube에서 보기">YouTube에서 보기</a>
                    </div>
                </div>
                <div class="modal-movie-info">
                    <h2 class="modal-title">${movieTitle}</h2>
                    ${movieReleaseDate ? `<div class="modal-release-date">${movieReleaseDate}</div>` : ''}
                </div>
            `;
            
            // 썸네일 클릭 시 iframe으로 전환 시도
            const thumbnailWrapper = modalHeader.querySelector('.video-thumbnail-wrapper');
            thumbnailWrapper.addEventListener('click', function() {
                loadYouTubeIframe(videoKey, this);
            });
        } else {
            // 영상이 없는 경우
            modalHeader.innerHTML = `
                <div class="modal-movie-info">
                    <h2 class="modal-title">${movieTitle}</h2>
                    ${movieReleaseDate ? `<div class="modal-release-date">${movieReleaseDate}</div>` : ''}
                    <div class="no-video">영상이 없습니다.</div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error:', error);
        modalHeader.innerHTML = `
            <div class="modal-movie-info">
                <h2 class="modal-title">${movieTitle}</h2>
                ${movieReleaseDate ? `<div class="modal-release-date">${movieReleaseDate}</div>` : ''}
                <div class="error">영상을 불러오는 중 오류가 발생했습니다.</div>
            </div>
        `;
    }
}

// YouTube iframe 동적 로드
function loadYouTubeIframe(videoKey, container) {
    // 기존 썸네일을 iframe으로 교체
    const videoUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    
    container.innerHTML = `
        <iframe 
            class="modal-video" 
            src="${videoUrl}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
    `;
    
    // 오류 발생 시 다시 썸네일로 복귀
    const iframe = container.querySelector('.modal-video');
    iframe.addEventListener('error', function() {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;
        const videoUrl = `https://www.youtube.com/watch?v=${videoKey}`;
        container.innerHTML = `
            <div class="video-thumbnail-wrapper">
                <img src="${thumbnailUrl}" alt="영상 썸네일" class="video-thumbnail" onerror="this.src='https://img.youtube.com/vi/${videoKey}/hqdefault.jpg'">
                <div class="video-play-button">
                    <svg width="68" height="48" viewBox="0 0 68 48">
                        <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.63-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                        <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                    </svg>
                </div>
                <a href="${videoUrl}" target="_blank" class="youtube-direct-link">YouTube에서 보기</a>
            </div>
        `;
    });
}

// 리뷰 가져오기
async function loadReviews(movieId) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    try {
        const response = await fetch(`${REVIEWS_API_URL}/${movieId}/reviews?api_key=${API_KEY}&language=ko-KR&page=1`);
        
        if (!response.ok) {
            throw new Error('리뷰를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        const reviews = data.results;
        
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="no-reviews">리뷰가 없습니다.</div>';
            return;
        }
        
        // 리뷰 렌더링
        reviewsContainer.innerHTML = reviews.map(review => createReviewCard(review)).join('');
        
    } catch (error) {
        console.error('Error:', error);
        reviewsContainer.innerHTML = `<div class="error">리뷰를 불러오는 중 오류가 발생했습니다: ${error.message}</div>`;
    }
}

// 리뷰 카드 생성
function createReviewCard(review) {
    const author = review.author || '익명';
    const content = review.content || '';
    const rating = review.author_details?.rating;
    const createdAt = review.created_at ? new Date(review.created_at).toLocaleDateString('ko-KR') : '';
    
    // HTML 태그 제거하고 텍스트만 추출 (간단한 처리)
    const textContent = content.replace(/<[^>]*>/g, '').substring(0, 500);
    const truncatedContent = content.length > 500 ? textContent + '...' : textContent;
    
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">${author}</div>
                ${rating ? `<div class="review-rating">⭐ ${rating}/10</div>` : ''}
            </div>
            ${createdAt ? `<div class="review-date">${createdAt}</div>` : ''}
            <div class="review-content">${truncatedContent}</div>
        </div>
    `;
}
