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
            document.addEventListener('mousemove',(e) => {
                mx = e.clientX;
                my = e.clientY;
                if(rafId === null) move();
            });
            document.querySelectorAll(interactiveSelector).forEach((el) => {
                el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
                el.addEventListener('mousedown', () => cursor.classList.add('is-pressed'));
                el.addEventListener('mouseup', () => cursor.classList.remove('is-pressed'));
                el.addEventListener('blur', () => cursor.classList.remove('is-hover', 'is-pressed'));
            });

            document.addEventListener('mousedown', () => cursor.classList.add('is-pressed'));
            document.addEventListener('mouseup', () => cursor.classList.remove('is-pressed'));
        }
    }
    const revealElements = document.querySelectorAll('.reveal, .fade-up');

    if('intersectionObserver' in window && !prefersReduceMotion){
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting){
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {threshold: 0.08, rootMargin: '0px 0px -32px 0px'});

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        window.addEventListener('load', () => {
            setTimeout(() => {
                document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
            }, 100);
        });
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }
    function animateNumber(el, target, duration, suffix = ''){
        if(!el) return;
        let startTime = null;

        const step = (timestamp) => {
            if(startTime === null) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration,1);
            const easing = 1 - Math.pow(2, -10 * progress);
            el.textContent = `${Math.round(easing * target)}${suffix}`;
            if(progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    const statsTarget = [
        document.getElementById('cnt-repos'),
        document.getElementById('cnt-projects'),
        document.getElementById('cnt-hours')
    ];

    if ('IntersectionObserver' in window && heroStats && !prefersReduceMotion){
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(!entry.isIntersecting) return;

                animateNumber(statsTarget[0], Number(statsTarget[0]?.dataset.target || 20), 1200, statsTarget[0]?.dataset.suffix || '+');
                animateNumber(statsTarget[1], Number(statsTarget[1]?.dataset.target || 6), 1000, statsTarget[1]?.dataset.suffix || '+');
                animateNumber(statsTarget[2], Number(statsTarget[2]?.dataset.target || 30), 1400, statsTarget[2]?.dataset.suffix || '+');

                statsObserver.disconnect();
            });
        }, {threshold: 0.5});
    }

})