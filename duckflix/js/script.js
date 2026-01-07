// Duckflix JavaScript

const API_KEY = '94a5af30a57474c56b6c4cc7e5e45207';
const NOW_PLAYING_API_URL = 'https://api.themoviedb.org/3/movie/now_playing';
const POPULAR_API_URL = 'https://api.themoviedb.org/3/movie/popular';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const REVIEWS_API_URL = 'https://api.themoviedb.org/3/movie';
const VIDEOS_API_URL = 'https://api.themoviedb.org/3/movie';
const RATING_API_URL = 'https://api.themoviedb.org/3/movie';
const GUEST_SESSION_URL = 'https://api.themoviedb.org/3/authentication/guest_session/new';

// Guest Session ID
let guestSessionId = null;
// 현재 모달의 영화 ID
let currentMovieId = null;
// 선택된 평점
let selectedRating = 0;

// 현재 상영 중인 영화 상태
let allMovies = [];
let displayedCount = 10;

// 인기있는 영화 상태
let allPopularMovies = [];
let displayedPopularCount = 10;

const MOVIES_PER_PAGE = 10;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Duckflix가 로드되었습니다!');
    
    // Guest Session 생성
    createGuestSession();
    
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
    
    // 각 영화의 평균 평점 표시
    moviesToShow.forEach(movie => {
        updateMovieCardAverageRating(movie.id);
    });
    
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
    
    // 각 영화의 평균 평점 표시
    moviesToShow.forEach(movie => {
        updateMovieCardAverageRating(movie.id);
    });
    
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
                <div class="movie-my-rating" id="movie-rating-${movie.id}" style="display: none;">
                    <span class="rating-star">⭐</span>
                    <span class="rating-value-text">평점: <span class="rating-number">0</span></span>
                </div>
            </div>
            <div class="movie-review-count" id="movie-review-count-${movie.id}" style="display: none;"></div>
        </div>
    `;
}

// 영화 카드 클릭 이벤트 추가
function attachMovieClickEvents(container) {
    const movieCards = container.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        // 클릭 이벤트
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
        
        // 호버 이벤트 - 리뷰 개수 표시
        card.addEventListener('mouseenter', function() {
            const movieId = parseInt(this.dataset.movieId);
            loadReviewCount(movieId, this);
        });
        
        card.addEventListener('mouseleave', function() {
            const reviewCountElement = this.querySelector('.movie-review-count');
            if (reviewCountElement) {
                reviewCountElement.style.display = 'none';
            }
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
async function openModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalHeader = document.getElementById('modalHeader');
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    // 현재 영화 ID 저장
    currentMovieId = movie.id;
    
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
    
    // 평점 및 리뷰 일괄 등록 이벤트 설정
    setupRatingReviewEvents(movie.id);
    
    // 평점 이벤트 설정 (별점 선택용)
    setupRatingEvents();
    
    // 평점 초기화 (등록한 평점 표시 안 함)
    resetRating();
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('movieModal');
    
    // 재생 중인 영상 정지 및 초기화
    const iframe = modal.querySelector('.modal-video');
    if (iframe) {
        // iframe의 src를 제거하여 영상 정지 및 초기화
        iframe.src = '';
    }
    
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

// LocalStorage에 리뷰 저장 (평점 포함)
function saveReviewToLocalStorage(movieId, reviewText, rating) {
    try {
        const reviews = JSON.parse(localStorage.getItem('duckflix_reviews') || '{}');
        if (!reviews[movieId]) {
            reviews[movieId] = [];
        }
        
        const newReview = {
            id: `local-${Date.now()}`,
            author: '나',
            content: reviewText,
            rating: rating || null,
            created_at: new Date().toISOString(),
            isLocal: true
        };
        
        reviews[movieId].push(newReview);
        localStorage.setItem('duckflix_reviews', JSON.stringify(reviews));
        console.log('리뷰 저장 완료:', movieId);
        return newReview;
    } catch (error) {
        console.error('리뷰 저장 오류:', error);
        return null;
    }
}

// LocalStorage에서 리뷰 업데이트
function updateReviewInLocalStorage(movieId, reviewId, reviewText, rating) {
    try {
        const reviews = JSON.parse(localStorage.getItem('duckflix_reviews') || '{}');
        if (reviews[movieId]) {
            const reviewIndex = reviews[movieId].findIndex(r => r.id === reviewId);
            if (reviewIndex !== -1) {
                reviews[movieId][reviewIndex].content = reviewText;
                reviews[movieId][reviewIndex].rating = rating || null;
                reviews[movieId][reviewIndex].created_at = new Date().toISOString();
                localStorage.setItem('duckflix_reviews', JSON.stringify(reviews));
                console.log('리뷰 업데이트 완료:', reviewId);
                return reviews[movieId][reviewIndex];
            }
        }
        return null;
    } catch (error) {
        console.error('리뷰 업데이트 오류:', error);
        return null;
    }
}

// LocalStorage에서 리뷰 불러오기
function getReviewsFromLocalStorage(movieId) {
    try {
        const reviews = JSON.parse(localStorage.getItem('duckflix_reviews') || '{}');
        return reviews[movieId] || [];
    } catch (error) {
        console.error('리뷰 불러오기 오류:', error);
        return [];
    }
}

// LocalStorage에서 리뷰 삭제
function deleteReviewFromLocalStorage(movieId, reviewId) {
    try {
        const reviews = JSON.parse(localStorage.getItem('duckflix_reviews') || '{}');
        if (reviews[movieId]) {
            reviews[movieId] = reviews[movieId].filter(review => review.id !== reviewId);
            localStorage.setItem('duckflix_reviews', JSON.stringify(reviews));
            console.log('리뷰 삭제 완료:', reviewId);
        }
    } catch (error) {
        console.error('리뷰 삭제 오류:', error);
    }
}

// 리뷰 개수 표시 업데이트
function updateReviewsCount(count) {
    const reviewsCountElement = document.getElementById('reviewsCount');
    if (reviewsCountElement) {
        reviewsCountElement.textContent = `(${count})`;
    }
}

// 리뷰 가져오기
async function loadReviews(movieId) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    // LocalStorage에서 저장된 리뷰 불러오기
    const localReviews = getReviewsFromLocalStorage(movieId);
    
    try {
        const response = await fetch(`${REVIEWS_API_URL}/${movieId}/reviews?api_key=${API_KEY}&language=ko-KR&page=1`);
        
        if (!response.ok) {
            throw new Error('리뷰를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        const tmdbReviews = data.results || [];
        
        // 리뷰 개수 캐시 업데이트 (TMDB 리뷰 + 로컬 리뷰)
        reviewCountCache[movieId] = (data.total_results || 0) + localReviews.length;
        
        // 로컬 리뷰를 먼저 표시하고, 그 다음 TMDB 리뷰 표시
        const allReviews = [...localReviews, ...tmdbReviews];
        
        // 리뷰 개수 표시 업데이트
        updateReviewsCount(allReviews.length);
        
        if (allReviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="no-reviews">리뷰가 없습니다.</div>';
            updateReviewsCount(0);
            return;
        }
        
        // 리뷰 렌더링
        reviewsContainer.innerHTML = allReviews.map(review => createReviewCard(review, movieId)).join('');
        
    } catch (error) {
        console.error('Error:', error);
        // 오류가 발생해도 로컬 리뷰는 표시
        if (localReviews.length > 0) {
            updateReviewsCount(localReviews.length);
            reviewsContainer.innerHTML = localReviews.map(review => createReviewCard(review, movieId)).join('');
        } else {
            updateReviewsCount(0);
            reviewsContainer.innerHTML = `<div class="error">리뷰를 불러오는 중 오류가 발생했습니다: ${error.message}</div>`;
        }
    }
}

// 리뷰 개수 캐시
const reviewCountCache = {};

// 리뷰 개수 가져오기 (호버 시 사용)
async function loadReviewCount(movieId, cardElement) {
    // 캐시에 있으면 바로 표시
    if (reviewCountCache[movieId] !== undefined) {
        displayReviewCount(movieId, reviewCountCache[movieId], cardElement);
        return;
    }
    
    try {
        const response = await fetch(`${REVIEWS_API_URL}/${movieId}/reviews?api_key=${API_KEY}&language=ko-KR&page=1`);
        
        if (response.ok) {
            const data = await response.json();
            const totalResults = data.total_results || 0;
            
            // 캐시에 저장
            reviewCountCache[movieId] = totalResults;
            
            // 표시
            displayReviewCount(movieId, totalResults, cardElement);
        } else {
            // 오류 시 0으로 표시
            reviewCountCache[movieId] = 0;
            displayReviewCount(movieId, 0, cardElement);
        }
    } catch (error) {
        console.error('리뷰 개수 로드 오류:', error);
        reviewCountCache[movieId] = 0;
        displayReviewCount(movieId, 0, cardElement);
    }
}

// 리뷰 개수 표시
function displayReviewCount(movieId, count, cardElement) {
    const reviewCountElement = cardElement.querySelector(`#movie-review-count-${movieId}`);
    if (reviewCountElement) {
        if (count > 0) {
            reviewCountElement.textContent = `리뷰 ${count}개`;
            reviewCountElement.style.display = 'block';
        } else {
            reviewCountElement.style.display = 'none';
        }
    }
}

// 리뷰 카드 생성
function createReviewCard(review, movieId) {
    const author = review.author || '익명';
    const content = review.content || '';
    // 로컬 리뷰는 review.rating, TMDB 리뷰는 review.author_details?.rating
    const rating = review.rating || review.author_details?.rating;
    let createdAt = '';
    if (review.created_at) {
        const date = new Date(review.created_at);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        createdAt = `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    }
    const isLocal = review.isLocal || false;
    
    // HTML 태그 제거하고 텍스트만 추출
    const fullText = content.replace(/<[^>]*>/g, '');
    const isLong = fullText.length > 500;
    const truncatedText = isLong ? fullText.substring(0, 500) + '...' : fullText;
    const reviewId = `review-${review.id || Math.random().toString(36).substr(2, 9)}`;
    
    return `
        <div class="review-card ${isLocal ? 'local-review' : ''}" id="${reviewId}">
            <div class="review-header">
                <div class="review-author">${author} ${isLocal ? '<span class="local-badge">내 리뷰</span>' : ''}</div>
                ${rating ? `<div class="review-rating">⭐ ${rating}/10</div>` : ''}
                ${isLocal ? `
                    <div class="review-actions">
                        <button class="edit-review-btn" onclick="editLocalReview('${movieId}', '${review.id}')" title="리뷰 수정">✏️</button>
                        <button class="delete-review-btn" onclick="deleteLocalReview('${movieId}', '${review.id}')" title="리뷰 삭제">×</button>
                    </div>
                ` : ''}
            </div>
            ${createdAt ? `<div class="review-date">${createdAt}</div>` : ''}
            <div class="review-content">
                <div class="review-text-short">${truncatedText}</div>
                ${isLong ? `<div class="review-text-full" style="display: none;">${fullText}</div>` : ''}
                ${isLong ? `<button class="review-toggle-btn" onclick="toggleReview('${reviewId}')">전체 보기</button>` : ''}
            </div>
        </div>
    `;
}

// 평점 및 리뷰 일괄 등록 이벤트 설정
function setupRatingReviewEvents(movieId) {
    const reviewTextarea = document.getElementById('reviewTextarea');
    const submitBtn = document.getElementById('submitRatingReviewBtn');
    
    if (!submitBtn) return;
    
    // 일괄 등록 버튼 클릭
    submitBtn.addEventListener('click', async function() {
        const rating = selectedRating || 0; // 평점이 없으면 0점으로 저장
        const reviewText = reviewTextarea ? reviewTextarea.value.trim() : '';
        
        // 리뷰가 필수
        if (!reviewText) {
            alert('리뷰를 작성해주세요.');
            return;
        }
        
        // 평점 및 리뷰 일괄 등록
        await submitRatingAndReview(movieId, rating, reviewText);
    });
    
    // Ctrl+Enter 키로 제출
    if (reviewTextarea) {
        reviewTextarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                submitBtn.click();
            }
        });
    }
}

// 평점 및 리뷰 일괄 등록
async function submitRatingAndReview(movieId, rating, reviewText) {
    const submitBtn = document.getElementById('submitRatingReviewBtn');
    
    // Guest Session이 없으면 생성 시도
    if (!guestSessionId) {
        console.log('Guest Session이 없습니다. 생성 중...');
        const created = await createGuestSession();
        if (!created) {
            alert('세션이 준비되지 않았습니다.');
            return;
        }
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = '등록 중...';
        
        // 평점이 0보다 큰 경우에만 TMDB API에 평점 제출
        if (rating > 0) {
            // 평점 제출 (TMDB API)
            const response = await fetch(
                `${RATING_API_URL}/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        value: rating
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.status_code === 1 || data.status_code === 12) {
                    // LocalStorage에 평점 저장
                    saveRatingToLocalStorage(movieId, rating);
                } else {
                    throw new Error(data.status_message || '평점 등록에 실패했습니다.');
                }
            } else if (response.status === 401) {
                // 401 오류 처리
                console.warn('Guest Session이 만료되었거나 유효하지 않습니다. 새로운 Session 생성 중...');
                guestSessionId = null;
                const created = await createGuestSession();
                if (created) {
                    await submitRatingAndReview(movieId, rating, reviewText);
                    return;
                } else {
                    alert('세션 생성에 실패했습니다. 페이지를 새로고침해주세요.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = '평점 및 리뷰 등록';
                    return;
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.status_message || '평점 등록에 실패했습니다.');
            }
        } else {
            // 평점이 0이면 LocalStorage에만 저장 (TMDB API 호출 안 함)
            saveRatingToLocalStorage(movieId, 0);
        }
        
        // 리뷰 저장 (리뷰는 필수이므로 항상 저장)
        const savedReview = saveReviewToLocalStorage(movieId, reviewText, rating);
        
        if (savedReview) {
            // 리뷰 컨테이너에 새 리뷰 추가
            const reviewsContainer = document.getElementById('reviewsContainer');
            const existingReviews = reviewsContainer.innerHTML;
            
            // 새 리뷰를 맨 위에 추가
            const newReviewHTML = createReviewCard(savedReview, movieId);
            reviewsContainer.innerHTML = newReviewHTML + existingReviews;
            
            // 리뷰 개수 캐시 업데이트
            if (reviewCountCache[movieId] !== undefined) {
                reviewCountCache[movieId]++;
            }
            
            // 리뷰 개수 표시 업데이트
            const currentReviewCount = reviewsContainer ? reviewsContainer.children.length : 0;
            updateReviewsCount(currentReviewCount);
        }
        
        // 텍스트 영역과 별점 초기화
        const reviewTextarea = document.getElementById('reviewTextarea');
        if (reviewTextarea) {
            reviewTextarea.value = '';
        }
        resetRating();
        
        // 버튼 상태 유지 (등록 완료로 변경하지 않음)
        submitBtn.disabled = false;
        submitBtn.textContent = '평점 및 리뷰 등록';
        
        // 영화 카드의 평균 평점 업데이트
        updateMovieCardAverageRating(movieId);
        
        alert('평점 및 리뷰가 등록되었습니다!');
        
    } catch (error) {
        console.error('평점 및 리뷰 등록 오류:', error);
        alert(`오류: ${error.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = '평점 및 리뷰 등록';
    }
}

// 리뷰 작성 이벤트 설정 (사용 안 함, 호환성 유지)
function setupReviewEvents(movieId) {
    const reviewTextarea = document.getElementById('reviewTextarea');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    
    if (!reviewTextarea || !submitReviewBtn) return;
    
    // 리뷰 작성 버튼 클릭
    submitReviewBtn.addEventListener('click', function() {
        const reviewText = reviewTextarea.value.trim();
        
        if (!reviewText) {
            alert('리뷰를 입력해주세요.');
            return;
        }
        
        // LocalStorage에 리뷰 저장
        const savedReview = saveReviewToLocalStorage(movieId, reviewText);
        
        if (savedReview) {
            // 리뷰 컨테이너에 새 리뷰 추가
            const reviewsContainer = document.getElementById('reviewsContainer');
            const existingReviews = reviewsContainer.innerHTML;
            
            // 새 리뷰를 맨 위에 추가
            const newReviewHTML = createReviewCard(savedReview, movieId);
            reviewsContainer.innerHTML = newReviewHTML + existingReviews;
            
            // 텍스트 영역 초기화
            reviewTextarea.value = '';
            
            // 리뷰 개수 캐시 업데이트
            if (reviewCountCache[movieId] !== undefined) {
                reviewCountCache[movieId]++;
            }
            
            alert('리뷰가 작성되었습니다!');
        } else {
            alert('리뷰 작성에 실패했습니다.');
        }
    });
    
    // Enter 키로 제출 (Shift+Enter는 줄바꿈)
    reviewTextarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitReviewBtn.click();
        }
    });
}

// 로컬 리뷰 수정
function editLocalReview(movieId, reviewId) {
    const reviews = getReviewsFromLocalStorage(movieId);
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) return;
    
    // 수정 폼 표시
    const reviewElement = document.getElementById(`review-${reviewId}`);
    if (!reviewElement) return;
    
    // 위의 큰 별점 비활성화
    const starRating = document.getElementById('starRating');
    if (starRating) {
        starRating.style.pointerEvents = 'none';
        starRating.style.opacity = '0.5';
    }
    
    const contentDiv = reviewElement.querySelector('.review-content');
    const currentText = review.content || '';
    const currentRating = review.rating || 0;
    
    // 별점 선택 UI 생성
    let starRatingHTML = '';
    for (let i = 1; i <= 10; i++) {
        const isActive = i <= currentRating;
        starRatingHTML += `<span class="edit-star ${isActive ? 'active' : ''}" data-rating="${i}" onclick="selectEditRating(${i}, '${movieId}', '${reviewId}')">⭐</span>`;
    }
    
    contentDiv.innerHTML = `
        <div class="edit-rating-section">
            <label>평점: <span id="edit-rating-value-${reviewId}">${currentRating}</span>/10</label>
            <div class="edit-star-rating" id="edit-star-rating-${reviewId}">
                ${starRatingHTML}
            </div>
        </div>
        <textarea class="edit-review-textarea" rows="4">${currentText}</textarea>
        <div class="edit-review-actions">
            <button class="save-review-btn" onclick="saveEditedReview('${movieId}', '${reviewId}')">저장</button>
            <button class="cancel-edit-btn" onclick="cancelEditReview('${movieId}', '${reviewId}')">취소</button>
        </div>
    `;
    
    // 수정 중인 평점 저장
    window.currentEditRating = currentRating;
}

// 수정 중 평점 선택
function selectEditRating(rating, movieId, reviewId) {
    window.currentEditRating = rating;
    const ratingValue = document.getElementById(`edit-rating-value-${reviewId}`);
    if (ratingValue) {
        ratingValue.textContent = rating;
    }
    
    // 별점 업데이트
    const stars = document.querySelectorAll(`#edit-star-rating-${reviewId} .edit-star`);
    stars.forEach((star, index) => {
        if (index + 1 <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// 수정된 리뷰 저장
async function saveEditedReview(movieId, reviewId) {
    const reviewElement = document.getElementById(`review-${reviewId}`);
    if (!reviewElement) return;
    
    const textarea = reviewElement.querySelector('.edit-review-textarea');
    const newText = textarea ? textarea.value.trim() : '';
    const newRating = window.currentEditRating || 0;
    
    if (!newText) {
        alert('리뷰 내용을 입력해주세요.');
        return;
    }
    
    // Guest Session이 없으면 생성 시도
    if (!guestSessionId) {
        console.log('Guest Session이 없습니다. 생성 중...');
        const created = await createGuestSession();
        if (!created) {
            alert('세션이 준비되지 않았습니다.');
            return;
        }
    }
    
    try {
        // TMDB API에 평점 업데이트
        const response = await fetch(
            `${RATING_API_URL}/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    value: newRating
                })
            }
        );
        
        if (response.ok) {
            // LocalStorage에 평점 저장
            saveRatingToLocalStorage(movieId, newRating);
            
            // LocalStorage에 리뷰 업데이트
            const updatedReview = updateReviewInLocalStorage(movieId, reviewId, newText, newRating);
            
            if (updatedReview) {
                // 리뷰 카드 다시 렌더링
                const newReviewHTML = createReviewCard(updatedReview, movieId);
                reviewElement.outerHTML = newReviewHTML;
                
                // 평균 평점 업데이트
                updateMovieCardAverageRating(movieId);
                
                // 위의 큰 별점 다시 활성화
                const starRating = document.getElementById('starRating');
                if (starRating) {
                    starRating.style.pointerEvents = 'auto';
                    starRating.style.opacity = '1';
                }
            }
        } else {
            throw new Error('평점 업데이트에 실패했습니다.');
        }
    } catch (error) {
        console.error('리뷰 수정 오류:', error);
        alert('수정 중 오류가 발생했습니다.');
    }
}

// 리뷰 수정 취소
function cancelEditReview(movieId, reviewId) {
    const reviews = getReviewsFromLocalStorage(movieId);
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) return;
    
    // 위의 큰 별점 다시 활성화
    const starRating = document.getElementById('starRating');
    if (starRating) {
        starRating.style.pointerEvents = 'auto';
        starRating.style.opacity = '1';
    }
    
    // 원래 리뷰 카드 다시 렌더링
    const reviewElement = document.getElementById(`review-${reviewId}`);
    if (reviewElement) {
        const newReviewHTML = createReviewCard(review, movieId);
        reviewElement.outerHTML = newReviewHTML;
    }
}

// 로컬 리뷰 삭제 (리뷰와 평점 모두 삭제)
async function deleteLocalReview(movieId, reviewId) {
    if (!confirm('리뷰와 평점을 모두 삭제하시겠습니까?')) {
        return;
    }
    
    // Guest Session이 없으면 생성 시도
    if (!guestSessionId) {
        console.log('Guest Session이 없습니다. 생성 중...');
        const created = await createGuestSession();
        if (!created) {
            alert('세션이 준비되지 않았습니다.');
            return;
        }
    }
    
    try {
        // TMDB API에서 평점 삭제
        const deleteUrl = `${RATING_API_URL}/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`;
        await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        // LocalStorage에서 리뷰 삭제
        deleteReviewFromLocalStorage(movieId, reviewId);
        
        // LocalStorage에서 평점도 삭제
        removeRatingFromLocalStorage(movieId);
        
        // 화면에서 제거
        const reviewElement = document.getElementById(`review-${reviewId}`);
        if (reviewElement) {
            reviewElement.remove();
        }
        
        // 리뷰 개수 캐시 업데이트
        if (reviewCountCache[movieId] !== undefined && reviewCountCache[movieId] > 0) {
            reviewCountCache[movieId]--;
        }
        
        // 리뷰 개수 표시 업데이트
        const reviewsContainer = document.getElementById('reviewsContainer');
        if (reviewsContainer) {
            const currentReviewCount = reviewsContainer.children.length;
            updateReviewsCount(currentReviewCount);
            
            // 리뷰가 없으면 메시지 표시
            if (currentReviewCount === 0) {
                reviewsContainer.innerHTML = '<div class="no-reviews">리뷰가 없습니다.</div>';
                updateReviewsCount(0);
            }
        }
        
        // 평균 평점 업데이트
        updateMovieCardAverageRating(movieId);
        
        // 별점 초기화
        resetRating();
        
        // 등록 버튼 활성화
        const submitBtn = document.getElementById('submitRatingReviewBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '평점 및 리뷰 등록';
        }
    } catch (error) {
        console.error('리뷰 및 평점 삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
}

// 영화의 평균 평점 계산
function calculateAverageRating(movieId) {
    const reviews = getReviewsFromLocalStorage(movieId);
    const ratings = reviews.filter(r => r.rating !== null && r.rating !== undefined).map(r => r.rating);
    
    if (ratings.length === 0) {
        return null;
    }
    
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    const average = sum / ratings.length;
    return parseFloat(average.toFixed(2));
}

// 영화 카드의 평균 평점 업데이트
function updateMovieCardAverageRating(movieId) {
    const averageRating = calculateAverageRating(movieId);
    
    if (averageRating !== null) {
        updateMovieCardRating(movieId, averageRating);
    } else {
        removeMovieCardRating(movieId);
    }
}

// 리뷰 전체/요약 토글
function toggleReview(reviewId) {
    const reviewCard = document.getElementById(reviewId);
    const shortText = reviewCard.querySelector('.review-text-short');
    const fullText = reviewCard.querySelector('.review-text-full');
    const toggleBtn = reviewCard.querySelector('.review-toggle-btn');
    
    if (fullText && fullText.style.display === 'none') {
        shortText.style.display = 'none';
        fullText.style.display = 'block';
        toggleBtn.textContent = '요약 보기';
    } else {
        shortText.style.display = 'block';
        if (fullText) fullText.style.display = 'none';
        toggleBtn.textContent = '전체 보기';
    }
}

// Guest Session 생성
async function createGuestSession() {
    try {
        const response = await fetch(`${GUEST_SESSION_URL}?api_key=${API_KEY}`);
        if (response.ok) {
            const data = await response.json();
            guestSessionId = data.guest_session_id;
            console.log('Guest Session 생성 완료:', guestSessionId);
            return true;
        } else {
            console.error('Guest Session 생성 실패:', response.status, response.statusText);
            const errorData = await response.json().catch(() => ({}));
            console.error('오류 상세:', errorData);
            return false;
        }
    } catch (error) {
        console.error('Guest Session 생성 오류:', error);
        return false;
    }
}

// 평점 이벤트 설정 (별점 선택용만)
function setupRatingEvents() {
    const stars = document.querySelectorAll('.star');
    const deleteBtn = document.getElementById('deleteRatingBtn');
    
    if (stars.length === 0) return;
    
    // 별점 클릭 이벤트
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStarRating(selectedRating);
            
            // 기존 평점이 있었던 경우 삭제 버튼 상태 확인
            if (deleteBtn && deleteBtn.style.display === 'block') {
                // 새로운 평점 선택 시 삭제 버튼은 유지
            }
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });
    
    // 별점 영역에서 마우스가 벗어나면 선택된 평점으로 복원
    const starRating = document.getElementById('starRating');
    if (starRating) {
        starRating.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
        });
    }
    
    // 평점 삭제 버튼 이벤트
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (!guestSessionId) {
                alert('세션이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
                return;
            }
            
            deleteRating(currentMovieId);
        });
    }
}

// 별점 업데이트
function updateStarRating(rating) {
    const ratingValue = document.getElementById('ratingValue');
    if (ratingValue) {
        ratingValue.textContent = rating;
    }
    highlightStars(rating);
}

// 별점 하이라이트
function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    if (stars.length === 0) {
        console.warn('별점 요소를 찾을 수 없습니다.');
        return;
    }
    
    stars.forEach((star) => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    console.log(`별점 하이라이트: ${rating}/10, 활성화된 별 개수: ${document.querySelectorAll('.star.active').length}`);
}

// LocalStorage에 평점 저장
function saveRatingToLocalStorage(movieId, rating) {
    try {
        const ratings = JSON.parse(localStorage.getItem('duckflix_ratings') || '{}');
        ratings[movieId] = rating;
        localStorage.setItem('duckflix_ratings', JSON.stringify(ratings));
        console.log('평점 저장 완료:', movieId, rating);
    } catch (error) {
        console.error('평점 저장 오류:', error);
    }
}

// LocalStorage에서 평점 불러오기
function getRatingFromLocalStorage(movieId) {
    try {
        const ratings = JSON.parse(localStorage.getItem('duckflix_ratings') || '{}');
        return ratings[movieId] || null;
    } catch (error) {
        console.error('평점 불러오기 오류:', error);
        return null;
    }
}

// LocalStorage에서 평점 제거
function removeRatingFromLocalStorage(movieId) {
    try {
        const ratings = JSON.parse(localStorage.getItem('duckflix_ratings') || '{}');
        delete ratings[movieId];
        localStorage.setItem('duckflix_ratings', JSON.stringify(ratings));
        console.log('평점 제거 완료:', movieId);
    } catch (error) {
        console.error('평점 제거 오류:', error);
    }
}

// 모달 열 때 LocalStorage에서 평점 불러오기
function loadRatingFromLocalStorage(movieId) {
    const savedRating = getRatingFromLocalStorage(movieId);
    
    if (savedRating) {
        // 저장된 평점이 있는 경우
        selectedRating = savedRating;
        
        // DOM 요소가 준비될 때까지 대기
        let retryCount = 0;
        const maxRetries = 10;
        
        const waitForDOM = () => {
            const ratingValue = document.getElementById('ratingValue');
            const submitBtn = document.getElementById('submitRatingBtn');
            const deleteBtn = document.getElementById('deleteRatingBtn');
            const stars = document.querySelectorAll('.star');
            
            if ((!ratingValue || !submitBtn || !deleteBtn || stars.length === 0) && retryCount < maxRetries) {
                retryCount++;
                setTimeout(waitForDOM, 100);
                return;
            }
            
            // DOM 요소가 준비되었거나 최대 재시도 횟수에 도달
            if (ratingValue) {
                ratingValue.textContent = savedRating;
            }
            
            // 별점 업데이트
            setTimeout(() => {
                if (stars.length > 0) {
                    highlightStars(savedRating);
                }
            }, 50);
            
            // 버튼 상태
            if (submitBtn) {
                submitBtn.textContent = '평점 제출 완료';
                submitBtn.disabled = true;
            }
            if (deleteBtn) {
                deleteBtn.style.display = 'block';
            }
            
            // 메시지 표시 (2초 후 사라짐)
            showRatingMessage(`내 평점: ${savedRating}/10`, '#4CAF50');
        };
        
        waitForDOM();
    } else {
        // 저장된 평점이 없는 경우 - 초기화
        resetRating();
    }
}

// 별점 초기화
function resetRating() {
    selectedRating = 0;
    const ratingValue = document.getElementById('ratingValue');
    const submitBtn = document.getElementById('submitRatingBtn');
    const deleteBtn = document.getElementById('deleteRatingBtn');
    
    if (ratingValue) {
        ratingValue.textContent = '0';
    }
    
    // 제출 버튼 초기화
    if (submitBtn) {
        submitBtn.textContent = '평점 제출';
        submitBtn.disabled = false;
    }
    
    // 삭제 버튼 숨기기
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
        deleteBtn.disabled = false;
    }
    
    highlightStars(0);
    hideRatingMessage();
}

// 평점 메시지 표시 (2초 후 자동으로 사라짐)
function showRatingMessage(message, color = '#4CAF50') {
    const ratingMessage = document.getElementById('ratingMessage');
    if (!ratingMessage) return;
    
    // 기존 타이머가 있으면 취소
    if (ratingMessage.timer) {
        clearTimeout(ratingMessage.timer);
    }
    
    ratingMessage.textContent = message;
    ratingMessage.style.color = color;
    ratingMessage.classList.add('show');
    
    // 2초 후 서서히 사라지게
    ratingMessage.timer = setTimeout(() => {
        hideRatingMessage();
    }, 2000);
}

// 평점 메시지 숨기기
function hideRatingMessage() {
    const ratingMessage = document.getElementById('ratingMessage');
    if (!ratingMessage) return;
    
    ratingMessage.classList.remove('show');
    
    // 애니메이션 완료 후 텍스트 제거
    setTimeout(() => {
        if (!ratingMessage.classList.contains('show')) {
            ratingMessage.textContent = '';
        }
    }, 500);
}

// 평점 제출
async function submitRating(movieId, rating) {
    const submitBtn = document.getElementById('submitRatingBtn');
    const deleteBtn = document.getElementById('deleteRatingBtn');
    
    // Guest Session이 없으면 생성 시도
    if (!guestSessionId) {
        console.log('Guest Session이 없습니다. 생성 중...');
        const created = await createGuestSession();
        if (!created) {
            showRatingMessage('세션이 준비되지 않았습니다.', '#e50914');
            return;
        }
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = '제출 중...';
        
        const response = await fetch(
            `${RATING_API_URL}/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    value: rating
                })
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data.status_code === 1 || data.status_code === 12) {
                showRatingMessage('평점이 등록되었습니다!', '#4CAF50');
                submitBtn.textContent = '평점 제출 완료';
                submitBtn.disabled = true;
                // 삭제 버튼 표시
                deleteBtn.style.display = 'block';
                
                // LocalStorage에 평점 저장
                saveRatingToLocalStorage(movieId, rating);
                
                // 영화 카드의 평점도 업데이트
                updateMovieCardRating(movieId, rating);
            } else {
                throw new Error(data.status_message || '평점 등록에 실패했습니다.');
            }
        } else if (response.status === 401) {
            // 401 오류: Guest Session이 만료되었거나 유효하지 않음
            console.warn('Guest Session이 만료되었거나 유효하지 않습니다. 새로운 Session 생성 중...');
            guestSessionId = null; // 기존 Session 초기화
            const created = await createGuestSession();
            if (created) {
                // 새로운 Session으로 재시도
                console.log('새로운 Guest Session으로 재시도...');
                await submitRating(movieId, rating);
            } else {
                console.error('새로운 Guest Session 생성 실패.');
                showRatingMessage('세션 생성에 실패했습니다. 페이지를 새로고침해주세요.', '#e50914');
                submitBtn.disabled = false;
                submitBtn.textContent = '평점 제출';
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.status_message || '평점 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('평점 제출 오류:', error);
        showRatingMessage(`오류: ${error.message}`, '#e50914');
        submitBtn.disabled = false;
        submitBtn.textContent = '평점 제출';
    }
}

// 영화 카드의 평점 업데이트
function updateMovieCardRating(movieId, rating) {
    const ratingElement = document.getElementById(`movie-rating-${movieId}`);
    if (ratingElement) {
        const ratingNumber = ratingElement.querySelector('.rating-number');
        if (ratingNumber) {
            ratingNumber.textContent = rating;
        }
        ratingElement.style.display = 'flex';
    }
}

// 영화 카드의 평점 제거
function removeMovieCardRating(movieId) {
    const ratingElement = document.getElementById(`movie-rating-${movieId}`);
    if (ratingElement) {
        ratingElement.style.display = 'none';
    }
}

// 평점 삭제
async function deleteRating(movieId) {
    const deleteBtn = document.getElementById('deleteRatingBtn');
    const submitBtn = document.getElementById('submitRatingBtn');
    
    if (!guestSessionId) {
        showRatingMessage('세션이 준비되지 않았습니다.', '#e50914');
        return;
    }
    
    // 확인 다이얼로그
    if (!confirm('등록한 평점을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        deleteBtn.disabled = true;
        deleteBtn.textContent = '삭제 중...';
        
        const deleteUrl = `${RATING_API_URL}/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`;
        console.log('평점 삭제 요청:', deleteUrl);
        
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('삭제 응답 상태:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            // status_code 13은 삭제 성공
            if (data.status_code === 13 || data.status_code === 1) {
                showRatingMessage('평점이 삭제되었습니다.', '#4CAF50');
                
                // UI 초기화
                resetRating();
                deleteBtn.style.display = 'none';
                deleteBtn.disabled = false;
                deleteBtn.textContent = '평점 삭제';
                submitBtn.disabled = false;
                submitBtn.textContent = '평점 제출';
                selectedRating = 0;
                
                // LocalStorage에서 평점 제거
                removeRatingFromLocalStorage(movieId);
                
                // 영화 카드의 평점도 제거
                removeMovieCardRating(movieId);
            } else {
                // status_code가 13이 아니어도 성공일 수 있음
                console.log('삭제 응답:', data);
                showRatingMessage('평점이 삭제되었습니다.', '#4CAF50');
                
                // UI 초기화
                resetRating();
                deleteBtn.style.display = 'none';
                deleteBtn.disabled = false;
                deleteBtn.textContent = '평점 삭제';
                submitBtn.disabled = false;
                submitBtn.textContent = '평점 제출';
                selectedRating = 0;
                
                // LocalStorage에서 평점 제거
                removeRatingFromLocalStorage(movieId);
                
                // 영화 카드의 평점도 제거
                removeMovieCardRating(movieId);
                
                // 평점 상태 다시 확인
                setTimeout(() => {
                    checkRatingStatus(movieId);
                }, 500);
            }
        } else if (response.status === 401) {
            // 401 오류: Guest Session이 만료되었거나 유효하지 않음
            console.warn('Guest Session이 만료되었거나 유효하지 않습니다. 새로운 Session 생성 중...');
            guestSessionId = null; // 기존 Session 초기화
            const created = await createGuestSession();
            if (created) {
                // 새로운 Session으로 재시도
                console.log('새로운 Guest Session으로 재시도...');
                await deleteRating(movieId);
            } else {
                console.error('새로운 Guest Session 생성 실패.');
                showRatingMessage('세션 생성에 실패했습니다. 페이지를 새로고침해주세요.', '#e50914');
                deleteBtn.disabled = false;
                deleteBtn.textContent = '평점 삭제';
            }
        } else {
            // 응답이 ok가 아닌 경우
            let errorMessage = '평점 삭제에 실패했습니다.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.status_message || errorMessage;
                console.error('삭제 오류 응답:', errorData);
            } catch (e) {
                console.error('삭제 오류:', response.status, response.statusText);
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('평점 삭제 오류:', error);
        showRatingMessage(`오류: ${error.message}`, '#e50914');
        deleteBtn.disabled = false;
        deleteBtn.textContent = '평점 삭제';
    }
}
