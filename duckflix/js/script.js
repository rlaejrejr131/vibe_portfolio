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
                <div class="movie-my-rating" id="movie-rating-${movie.id}" style="display: none;">
                    <span class="rating-star">⭐</span>
                    <span class="rating-value-text">내 평점: <span class="rating-number">0</span>/10</span>
                </div>
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
    
    // 평점 이벤트 설정
    setupRatingEvents();
    
    // 평점 초기화
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
    
    // HTML 태그 제거하고 텍스트만 추출
    const fullText = content.replace(/<[^>]*>/g, '');
    const isLong = fullText.length > 500;
    const truncatedText = isLong ? fullText.substring(0, 500) + '...' : fullText;
    const reviewId = `review-${review.id || Math.random().toString(36).substr(2, 9)}`;
    
    return `
        <div class="review-card" id="${reviewId}">
            <div class="review-header">
                <div class="review-author">${author}</div>
                ${rating ? `<div class="review-rating">⭐ ${rating}/10</div>` : ''}
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

// 평점 이벤트 설정
function setupRatingEvents() {
    const stars = document.querySelectorAll('.star');
    const submitBtn = document.getElementById('submitRatingBtn');
    const deleteBtn = document.getElementById('deleteRatingBtn');
    const ratingMessage = document.getElementById('ratingMessage');
    
    // 별점 클릭 이벤트
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStarRating(selectedRating);
            
            // 평점이 변경되면 제출 버튼 활성화
            const submitBtn = document.getElementById('submitRatingBtn');
            const deleteBtn = document.getElementById('deleteRatingBtn');
            const ratingMessage = document.getElementById('ratingMessage');
            
            submitBtn.disabled = false;
            submitBtn.textContent = '평점 제출';
            
            // 기존 평점이 있었던 경우 메시지 표시
            if (deleteBtn.style.display === 'block') {
                showRatingMessage('새로운 평점을 선택했습니다.', '#808080');
            } else {
                hideRatingMessage();
            }
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });
    
    // 별점 영역에서 마우스가 벗어나면 선택된 평점으로 복원
    document.getElementById('starRating').addEventListener('mouseleave', function() {
        highlightStars(selectedRating);
    });
    
    // 평점 제출 버튼
    submitBtn.addEventListener('click', function() {
        if (selectedRating === 0) {
            showRatingMessage('평점을 선택해주세요.', '#e50914');
            return;
        }
        
        if (!guestSessionId) {
            showRatingMessage('세션이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.', '#e50914');
            return;
        }
        
        submitRating(currentMovieId, selectedRating);
    });
    
    // 평점 삭제 버튼
    deleteBtn.addEventListener('click', function() {
        if (!guestSessionId) {
            showRatingMessage('세션이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.', '#e50914');
            return;
        }
        
        deleteRating(currentMovieId);
    });
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
