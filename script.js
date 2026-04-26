'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const doc = document.documentElement;
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const themeCheckbox = document.getElementById('themeCheckbox');
    const switchEl = document.getElementById('themeSwitch');
    const themeTransition = document.getElementById('theme-transition');
    const marquee = document.getElementById('marquee');
    const heroStats = document.querySelector('.hero-stats');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
    const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
    const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const safeLocalStorage = {
        get(key, fallback) {
            try {
                return window.localStorage.getItem(key) ?? fallback;
            } catch {
                return fallback;
            }
        },
        set(key, value) {
            try {
                window.localStorage.setItem(key, value);
            } catch {
                //ignoring
            }
        }
    };
    function setTheme(theme, persist = true) {
        doc.setAttribute('data-theme', theme);
        if (themeCheckbox) themeCheckbox.checked = theme === 'light';
        if (persist) safeLocalStorage.set('portfolio-theme', theme);
    }
    function openMobileMenu(open) {
        if (!hamburger || !mobileNav) return;
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        mobileNav.classList.toggle('open', open);
        mobileNav.hidden = !open;
    }
    function closeMobileMenu() {
        openMobileMenu(false);
    }
    function animateTheme(nextTheme) {
        if (!themeTransition || !switchEl || prefersReduceMotion) {
            setTheme(nextTheme);
            return
        }
        const rect = switchEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const color = nextTheme === 'light' ? '#FFFEE3' : '#4A4A4A';

        for (let i = 0; i < 3; i++) {
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

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            animateTheme(themeCheckbox.checked ? 'light' : 'dark');
        });
    }
    if (nav) {
        const updateNav = () => {
            nav.classList.toggle('scrolled', window.scrollY > 40);
        };
        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });
    }
    if (hamburger && mobileNav) {
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
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMobileMenu();
        });
    }
    if (supportHover) {
        const cursor = document.getElementById('hc-cursor');
        if (cursor) {
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
            function move() {
                x += (mx - x) * 0.16;
                y += (my - y) * 0.16;
                cursor.style.left = `${x}px`;
                cursor.style.top = `${y}px`;
                rafId = requestAnimationFrame(move);
            }
            document.addEventListener('mousemove', (e) => {
                mx = e.clientX;
                my = e.clientY;
                if (rafId === null) move();
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

    if ('IntersectionObserver' in window && !prefersReduceMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        window.addEventListener('load', () => {
            setTimeout(() => {
                document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
            }, 100);
        });
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }
    function animateNumber(el, target, duration, suffix = '') {
        if (!el) return;
        let startTime = null;

        const step = (timestamp) => {
            if (startTime === null) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easing = 1 - Math.pow(2, -10 * progress);
            el.textContent = `${Math.round(easing * target)}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    const statsTarget = [
        document.getElementById('cnt-repos'),
        document.getElementById('cnt-projects'),
        document.getElementById('cnt-hours')
    ];

    if ('IntersectionObserver' in window && heroStats && !prefersReduceMotion) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                animateNumber(statsTarget[0], Number(statsTarget[0]?.dataset.target || 20), 1200, statsTarget[0]?.dataset.suffix || '+');
                animateNumber(statsTarget[1], Number(statsTarget[1]?.dataset.target || 6), 1000, statsTarget[1]?.dataset.suffix || '+');
                animateNumber(statsTarget[2], Number(statsTarget[2]?.dataset.target || 30), 1400, statsTarget[2]?.dataset.suffix || '+');

                statsObserver.disconnect();
            });
        }, { threshold: 0.5 });

        statsObserver.observe(heroStats);
    } else {
        statsTarget.forEach(el => {
            if (!el) return;
            el.textContent = `${el.dataset.target || ''}${el.dataset.suffix || ''}`;
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            const offset = nav?.offsetHeight || 60;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top,
                behavior: prefersReduceMotion ? 'auto' : 'smooth'
            });
            closeMobileMenu();
        });
    });
    if ('IntersectionObserver' in window && navLinks.length) {
        const setActive = (id) => {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        };
        document.querySelectorAll('section[id]').forEach(section => {
            const observe = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            }, { threshold: 0.45 });
            observe.observe(section);
        });

        const current = document.querySelector('section[id]');
        if (current) setActive(current.id);
    }
    if (marquee && marquee.parentElement) {
        marquee.parentElement.addEventListener('mouseenter', () => {
            marquee.style.animationPlayState = "paused";
        });
        marquee.parentElement.addEventListener('mouseleave', () => {
            marquee.style.animationPlayState = 'running';
        });
    }
    if (supportHover && !prefersReduceMotion) {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', function (event) {
                const rect = this.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                this.style.transform = `translateY(-4px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
        });
    }
    if ('IntersectionObserver' in window && !prefersReduceMotion) {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = (parseInt(entry.target.style.getPropertyValue('--si'), 10) || 0) * 80;
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.skill-card').forEach(card => skillObserver.observe(card));
    } else {
        document.querySelectorAll('.skill-card').forEach(card => card.classList.add('visible'));
    }
    console.log('%c Baishnabi Kumari', 'background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;font-weight:600;font-size:14px;padding:4px 12px;border-radius:6px;');
    console.log('%c Hack Club YSWS ⚬ India ', 'color:#8b949e;font-size:12px;');

    const SFX = (() => {
        let ctx = null;
        function getCtx() {
            if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
            return ctx;
        }
        function click() {
            try {
                const c = getCtx();
                const o = c.createOscillator();
                const g = c.createGain();
                o.frequency.value = 380 + Math.random() * 40;
                o.type = 'sine';
                g.gain.setValueAtTime(0.18, c.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);
                o.connect(g);
                g.connect(c.destination);
                o.start();
                o.stop(c.currentTime + 0.09);
            } catch (e) { }
        }
        function toggle() {
            try {
                const c = getCtx();
                [0, 0.04].forEach((delay, i) => {
                    const o = c.createOscillator();
                    const g = c.createGain();
                    o.frequency.value = i == 0 ? 600 : 420;
                    o.type = 'square';
                    g.gain.setValueAtTime(0.08, c.currentTime + delay);
                    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + 0.06);
                    o.connect(g);
                    g.connect(c.destination);
                    o.start(c.currentTime + delay);
                    o.stop(c.currentTime + delay + 0.06);
                });
            } catch (e) { }
        }
        function whoosh() {
            try {
                const c = getCtx();
                const bufferSize = c.sampleRate * 0.12;
                const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
                }
                const source = c.createBufferSource();
                const g = c.createGain();
                const filter = c.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1800;
                filter.Q.value = 0.8;
                source.buffer = buffer;
                g.gain.setValueAtTime(0.07, c.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
                source.connect(filter);
                filter.connect(g);
                g.connect(c.destination);
                source.start();
            } catch (e) { }
        }
        return { click, toggle, whoosh };
    })();
    //ripple effect
    function createRipple(el, e) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            pointer-radius: none;
            transform: scale(0);
            background: rgba(255,255,255,0.18);
            width: 80px;
            height: 80px;
            left: ${x - 40 + (Math.random() * 8 - 4)}px;
            top: ${y - 40 + (Math.random() * 8 - 4)}px;
            animation: rippleBtn 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
        `;
        el.style.position = 'relative';
        el.style.overflow = 'hidden';
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    }
    //ripple keyframe on page
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
    @keyframes rippleBtn{
        to{
            transform: scale(5.5);
            opacity: 0;
        }
    }`;
    document.head.appendChild(rippleStyle);

    //press/tilt effect
    function applyPressEffect(el) {
        const tiltX = (Math.random() * 2 - 1).toFixed(2);
        const tiltY = (Math.random() * 1).toFixed(2);
        el.style.transform = `scale(0.95) rotate(${tiltX}deg) translateY(${tiltY}px)`;
        el.style.transition = 'transform 0.1s ease';
    }
    function removePressEffect(el) {
        el.style.transform = '';
        el.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
    }
    function applyMagnetic(el) {
        let wobbleId = null;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.22;
            const dy = (e.clientY - cy) * 0.22;
            //some tiny organic wobble lets see how its goes
            const wobble = Math.sin(Date.now() / 180) * 0.6;
            el.style.transform = `translate(${dx}px, ${dy + wobble}px)`;
            el.style.transition = 'transform 0.15s ease';
        });
        el.addEventListener('mouseleave', () => {
            cancelAnimationFrame(wobbleId);
            el.style.transform = '';
            el.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        });
    }
    document.querySelectorAll('.btn, .footer-links a, .footer-top').forEach(el => {
        applyMagnetic(el);

        el.addEventListener('mousedown', (e) => {
            createRipple(el, e);
            applyPressEffect(el);
            SFX.click();
        });
        el.addEventListener('mouseup', () => removePressEffect(el));
        el.addEventListener('mouseleave', () => removePressEffect(el));
    });
    let lastWhoosh = 0;
    document.querySelectorAll('.nav-links a, .mobile-link').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const now = Date.now();
            if (now - lastWhoosh > 120) {
                SFX.whoosh();
                lastWhoosh = now;
            }
        });
    });
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            SFX.toggle();
        });
    }
    document.querySelectorAll('.project-card, .skill-card, .contact-link').forEach(el => {
        el.addEventListener('mousedown', () => applyPressEffect(el));
        el.addEventListener('mouseup', () => removePressEffect(el));
        el.addEventListener('mouseleave', () => removePressEffect(el));
    });
});