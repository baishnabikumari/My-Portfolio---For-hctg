'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const doc = document.documentElement;
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const themeCheckbox = document.getElementById('themeCheckbox');
    const switchEl = document.getElementById('switchEl');
    const themeTransition = document.getElementById('theme-Transition');
    const marquee = document.getElementById('marquee');
    const heroStats = document.querySelector('.hero-stats');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
    const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
    const prefersReduceMotion = window.matchMedia('(prefers-reduce-motion: reduce)').matches;
    const supportHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const safeLocalStorage = {
        get(key, fallback){
            try{
                return window.localStorage.getItem(key) ?? fallback;
            } catch {
                return fallback;
            }
        },
        set(key, value){
            try{
                window.localStorage.setItem(key, value);
            } catch {
            //ignoring
            }
        }
    };
    function setTheme(theme, persist = true){
        doc.setAttribute('data-theme', theme);
        if (themeCheckbox) themeCheckbox.checked = theme === 'light';
        if (persist) safeLocalStorage.set('portfolio-theme', theme);
    }
    function openMobileMenu(open){
        if (!hamburger || !mobileNav) return;
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        mobileNav.classList.toggle('open', open);
        mobileNav.hidden = !open;
    }
    function closeMobileMenu(){
        openMobileMenu(false);
    }
    function animateTheme(nextTheme){
        if (!themeTransition || !switchEl || prefersReduceMotion){
            setTheme(nextTheme);
            return
        }
        const rect = switchEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const color = nextTheme === 'light' ? '#FFFEE3' : '#4A4A4A';

        for (let i = 0; i < 3; i++){
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.background = color;
            ripple.style.width = '120px';
            ripple.style.height = '120px';
            ripple.style.animationDelay = `${i * 0.1}s`;
            themeTransition.appendChild(ripple);

            window.setTimeout(() => ripple.remove(), 800);
        }
        setTheme(nextTheme);
    }
    const savedTheme = safeLocalStorage.get('portfolio-theme', 'dark');
    setTheme(savedTheme, false);

    if(themeCheckbox){
        themeCheckbox.addEventListener('change', () => {
            animateTheme(themeCheckbox.checked ? 'light' : 'dark');
        });
    }
    if (nav){
        const updateNav = () => {
            nav.classList.toggle('scrolled', window.scrollY > 40);
        };
        updateNav();
        window.addEventListener('scroll', updateNav, {passive: true});
    }
    if (hamburger && mobileNav){
        hamburger.addEventListener('click', () => {
            const nextOpen = !hamburger.classList.contains('open');
            openMobileMenu(nextOpen);
        });
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        document.addEventListener('click', (event) => {
            if (!mobileNav.classList.contains('open')) return;
            if (mobileNav.contains(event.target) || hamburger.contains(event.target)) return;
            closeMobileMenu();
        });
        document.addEventListener('click', (event) => {
            if(event.key === 'Escape') closeMobileMenu();
        });
    }
    if (supportHover){
        const cursor = document.getElementById('hc-cursor');
        if (cursor){
            let mx = -100;
            let my = -100;
            let x = -100;
            let y = -100;
            let rafId = null;

            const interactiveSelector = [
                'a',
                'button',
                '.project-card',
                '.skill-card',
                '.contact-link',
                '.switch',
                '.nav-logo',
                '.nav-links',
                '.mobile-link',
                '.btn'
            ].join(',');
            function move(){
                x += (mx - x) * 0.16;
                y += (my - y) * 0.16;
                cursor.style.left = `${x}px`;
                cursor.style.top = `${y}px`;
                rafId = requestAnimationFrame(move);
            }
        }
    }
})