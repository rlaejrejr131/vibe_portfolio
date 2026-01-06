// AOS 초기화
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    offset: 100
});

// 포트폴리오 슬라이더
let currentSlide = 0;
const slides = document.querySelectorAll('.portfolio-item');
const prevBtn = document.querySelector('.nav-btn.prev');
const nextBtn = document.querySelector('.nav-btn.next');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
}

if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
}

// FAQ 아코디언
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(faq => faq.classList.remove('active'));
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// 이미지 갤러리 무한 스크롤 효과
const galleryRowTop = document.querySelector('.gallery-row-top');
const galleryRowBottom = document.querySelector('.gallery-row-bottom');

// 갤러리 아이템 복제하여 무한 스크롤 효과 구현
function duplicateGalleryItems() {
    if (galleryRowTop) {
        const topItems = Array.from(galleryRowTop.querySelectorAll('.gallery-item'));
        // 원본 아이템들을 2번 복제하여 충분한 길이 확보
        topItems.forEach(item => {
            const clone1 = item.cloneNode(true);
            const clone2 = item.cloneNode(true);
            galleryRowTop.appendChild(clone1);
            galleryRowTop.appendChild(clone2);
        });
    }
    
    if (galleryRowBottom) {
        const bottomItems = Array.from(galleryRowBottom.querySelectorAll('.gallery-item'));
        // 원본 아이템들을 2번 복제하여 충분한 길이 확보
        bottomItems.forEach(item => {
            const clone1 = item.cloneNode(true);
            const clone2 = item.cloneNode(true);
            galleryRowBottom.appendChild(clone1);
            galleryRowBottom.appendChild(clone2);
        });
    }
}

// DOM이 로드된 후 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', duplicateGalleryItems);
} else {
    duplicateGalleryItems();
}

// 갤러리 호버시 멈춤 효과는 CSS에서 처리됨

// 메뉴 토글
const menuToggle = document.getElementById('menuToggle');
const menuWrapper = document.querySelector('.menu-wrapper');

function toggleMenu() {
    if (menuWrapper) {
        menuWrapper.classList.toggle('active');
    }
}

if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
}

// 외부 클릭 시 메뉴 닫기
document.addEventListener('click', (e) => {
    if (menuWrapper && !menuWrapper.contains(e.target)) {
        menuWrapper.classList.remove('active');
    }
});

// 프로젝트 슬라이더
let currentProject = 1;
const projectCards = document.querySelectorAll('.project-card');
const projectDots = document.querySelectorAll('.dot');
const projectPrev = document.getElementById('projectPrev');
const projectNext = document.getElementById('projectNext');
const projectsSlider = document.getElementById('projectsSlider');

function updateProjectsSlider() {
    projectCards.forEach((card, index) => {
        card.classList.remove('active');
        if (index === currentProject) {
            card.classList.add('active');
        }
    });
    
    projectDots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentProject) {
            dot.classList.add('active');
        }
    });
    
    // 슬라이더 이동
    const activeCard = projectCards[currentProject];
    const cardWidth = activeCard.offsetWidth;
    const gap = 40;
    const offset = -currentProject * (cardWidth + gap) + (window.innerWidth / 2) - (cardWidth / 2) - (window.innerWidth > 1440 ? (window.innerWidth - 1400) / 2 : 20);
    projectsSlider.style.transform = `translateX(${offset}px)`;
}

if (projectPrev && projectNext) {
    projectPrev.addEventListener('click', () => {
        currentProject = (currentProject - 1 + projectCards.length) % projectCards.length;
        updateProjectsSlider();
    });
    
    projectNext.addEventListener('click', () => {
        currentProject = (currentProject + 1) % projectCards.length;
        updateProjectsSlider();
    });
}

if (projectDots.length > 0) {
    projectDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentProject = index;
            updateProjectsSlider();
        });
    });
}

// 초기 위치 설정
if (projectsSlider) {
    window.addEventListener('load', updateProjectsSlider);
    window.addEventListener('resize', updateProjectsSlider);
}

// 스무스 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
