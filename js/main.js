/* ==========================================================================
   Mines Space · interactions
   Thème, menu mobile, scrollspy, révélations, filtre, fiches projet,
   carrousel photo + agrandissement, formulaire de contact (Google Form).
   ========================================================================== */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

    /* ---------- Textes de l'interface (FR / EN selon <html lang>) ---------- */
    var LANG = (root.getAttribute('lang') || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr';
    var T = {
        fr: {
            themeToDark: 'Activer le mode sombre',
            themeToLight: 'Activer le mode clair',
            menuOpen: 'Ouvrir le menu',
            menuClose: 'Fermer le menu',
            carouselPause: 'Mettre en pause le défilement des photos',
            carouselPlay: 'Reprendre le défilement des photos',
            required: 'Ce champ est requis.',
            badEmail: 'Adresse e-mail invalide.',
            send: 'Envoyer le message',
            sending: 'Envoi en cours…',
            sendError: 'L’envoi a échoué. Vérifiez votre connexion, ou écrivez-nous à minesspace.asso@gmail.com.'
        },
        en: {
            themeToDark: 'Switch to dark mode',
            themeToLight: 'Switch to light mode',
            menuOpen: 'Open menu',
            menuClose: 'Close menu',
            carouselPause: 'Pause the photo carousel',
            carouselPlay: 'Resume the photo carousel',
            required: 'This field is required.',
            badEmail: 'Invalid email address.',
            send: 'Send message',
            sending: 'Sending…',
            sendError: 'Sending failed. Check your connection, or email us at minesspace.asso@gmail.com.'
        }
    }[LANG];

    function storageGet(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ }
    }

    /* ---------- Statistiques (Google Analytics 4) ----------
       Événements envoyés (visibles dans GA > Rapports > Engagement > Événements) :
         section_view       section vue au moins une fois (section)
         cta_click          bouton de l'accueil (label)
         mission_open       fiche d'une mission ouverte (mission_name)
         mission_link       lien d'une fiche : résultats, document, 3D (mission_name, link_text)
         missions_filter    filtre FUSEX / Minif (category)
         alumni_open        liste des anciens membres dépliée
         photo_open         photo agrandie (photo)
         carousel_control   flèches / pause du carrousel (action)
         contact_click      e-mail ou réseau social (method, location)
         generate_lead      formulaire de contact envoyé (method, visitor_type)
         contact_form_error échec réseau à l'envoi du formulaire
         theme_change       mode clair / sombre (theme)
       Aucune donnée personnelle n'est transmise (ni nom, ni e-mail, ni message).
       Rien n'est enregistré tant que le visiteur n'a pas accepté les cookies de mesure. */
    // Nommée trackEvent (et non track) : « track » désigne déjà la piste du carrousel plus bas.
    function trackEvent(name, params) {
        if (window.msConsent !== 'granted') return;
        if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    }

    /* ---------- Consentement aux cookies (CNIL) ---------- */
    var consentBox = document.getElementById('consent');

    function saveConsent(granted) {
        storageSet('ms-consent', JSON.stringify({ analytics: granted, date: Date.now() }));
    }

    // Supprime les cookies _ga / _ga_XXXX sur le domaine et ses parents (ex. .minesspace.fr)
    function clearAnalyticsCookies() {
        var parts = window.location.hostname.split('.');
        var domains = [''];
        for (var i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
        document.cookie.split(';').forEach(function (cookie) {
            var name = cookie.split('=')[0].trim();
            if (name.indexOf('_ga') !== 0) return;
            domains.forEach(function (domain) {
                document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
            });
        });
    }

    // Le bandeau est centré avec un voile : on place le focus sur le premier choix
    function showConsent() {
        if (!consentBox) return;
        consentBox.hidden = false;
        var first = consentBox.querySelector('[data-consent]');
        if (first) first.focus({ preventScroll: true });
    }
    function hideConsent() {
        if (consentBox) consentBox.hidden = true;
    }

    if (consentBox) {
        consentBox.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-consent]');
            if (!btn) return;
            var granted = btn.getAttribute('data-consent') === 'accept';
            saveConsent(granted);
            if (granted) {
                if (typeof window.msEnableAnalytics === 'function') window.msEnableAnalytics();
            } else {
                window.msConsent = 'denied';
                if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
                clearAnalyticsCookies();
            }
            hideConsent();
        });
        if (window.msConsent === 'unknown') showConsent();
    }

    document.querySelectorAll('[data-consent-open]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            showConsent();
            var first = consentBox && consentBox.querySelector('[data-consent]');
            if (first) first.focus();
        });
    });

    function sectionOf(el) {
        var host = el.closest('section[id], footer, header');
        if (!host) return 'page';
        if (host.tagName === 'FOOTER') return 'footer';
        if (host.tagName === 'HEADER') return 'navigation';
        return host.id;
    }

    /* ---------- Thème clair / sombre ---------- */
    var themeBtn = document.querySelector('[data-theme-toggle]');
    var themeMetas = document.querySelectorAll('meta[name="theme-color"]');

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (themeBtn) {
            themeBtn.setAttribute('aria-label', theme === 'dark' ? T.themeToLight : T.themeToDark);
        }
        themeMetas.forEach(function (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#0e0d12' : '#f7f6f9');
        });
    }

    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            storageSet('ms-theme', next);
            trackEvent('theme_change', { theme: next });
        });
    }

    // Suit le système tant que l'utilisateur n'a rien choisi
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        var stored = storageGet('ms-theme');
        if (stored !== 'light' && stored !== 'dark') applyTheme(e.matches ? 'dark' : 'light');
    });

    /* ---------- Navigation : bordure au scroll ---------- */
    var nav = document.querySelector('[data-nav]');
    function onScroll() {
        if (nav) nav.toggleAttribute('data-scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Menu mobile ---------- */
    var menuBtn = document.querySelector('[data-menu-toggle]');
    var menuPanel = document.getElementById('nav-panel');
    var menuIcon = menuBtn ? menuBtn.querySelector('use') : null;

    function setMenu(open) {
        if (!nav || !menuBtn) return;
        nav.toggleAttribute('data-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? T.menuClose : T.menuOpen);
        if (menuIcon) menuIcon.setAttribute('href', open ? '#i-close' : '#i-menu');
    }

    if (menuBtn && menuPanel) {
        menuBtn.addEventListener('click', function () {
            setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
        });
        menuPanel.addEventListener('click', function (e) {
            if (e.target.closest('a')) setMenu(false);
        });
        document.addEventListener('click', function (e) {
            if (nav.hasAttribute('data-open') && !nav.contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.hasAttribute('data-open')) {
                setMenu(false);
                menuBtn.focus();
            }
        });
        window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
            if (e.matches) setMenu(false);
        });
    }

    /* ---------- Scrollspy ---------- */
    var spyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
    if ('IntersectionObserver' in window && spyLinks.length) {
        var spyTargets = spyLinks
            .map(function (a) { return document.getElementById(a.getAttribute('data-spy')); })
            .filter(Boolean);
        var hero = document.getElementById('accueil');
        if (hero) spyTargets.push(hero);

        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                spyLinks.forEach(function (a) {
                    if (a.getAttribute('data-spy') === id) a.setAttribute('aria-current', 'true');
                    else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        spyTargets.forEach(function (el) { spy.observe(el); });
    }

    /* ---------- Révélation au scroll (une seule fois) ---------- */
    var revealEls = document.querySelectorAll('[data-reveal]');

    function finishReveal(el) {
        el.removeAttribute('data-reveal');
        el.classList.remove('is-in');
        el.style.transitionDelay = '';
    }

    if ('IntersectionObserver' in window) {
        var revealer = new IntersectionObserver(function (entries) {
            var batch = entries.filter(function (entry) { return entry.isIntersecting; });
            batch.forEach(function (entry, i) {
                var el = entry.target;
                var delay = Math.min(i, 6) * 60; // décalage 60 ms par élément d'un même lot
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('is-in');
                revealer.unobserve(el);
                // Rend la main aux transitions propres de l'élément (survol des cartes)
                window.setTimeout(function () { finishReveal(el); }, delay + 650);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        revealEls.forEach(function (el) { revealer.observe(el); });
    } else {
        revealEls.forEach(finishReveal);
    }

    /* ---------- Filtre de l'historique ---------- */
    var filterBtns = document.querySelectorAll('[data-filter]');
    var missions = document.querySelectorAll('.mission');
    // Années de la frise qui contiennent des missions filtrables (pas la saison en cours ni l'origine)
    var missionYears = Array.prototype.filter.call(document.querySelectorAll('.timeline__year'), function (row) {
        return !!row.querySelector('.mission');
    });

    function fadeIn(el) {
        if (!el.animate) return;
        el.animate(
            reduceMotion.matches
                ? [{ opacity: 0 }, { opacity: 1 }]
                : [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
            { duration: 220, easing: EASE_OUT }
        );
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var filter = btn.getAttribute('data-filter');
            filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
            trackEvent('missions_filter', { category: filter });

            missions.forEach(function (card) {
                var show = filter === 'all' || card.getAttribute('data-category') === filter;
                var wasHidden = card.hidden;
                card.hidden = !show;
                if (show && wasHidden) fadeIn(card);
            });

            // Une année sans mission visible disparaît de la frise
            missionYears.forEach(function (row) {
                var wasHidden = row.hidden;
                row.hidden = !row.querySelector('.mission:not([hidden])');
                if (!row.hidden && wasHidden) fadeIn(row);
            });
        });
    });

    /* ---------- Dialogs : fermeture commune ---------- */
    function wireDialog(dialog) {
        if (!dialog) return;
        dialog.addEventListener('click', function (e) {
            // Clic sur le fond (::backdrop) : la cible est le <dialog> lui-même
            if (e.target === dialog) dialog.close();
        });
        dialog.querySelectorAll('[data-dialog-close]').forEach(function (btn) {
            btn.addEventListener('click', function () { dialog.close(); });
        });
    }

    /* ---------- Fiches projet ---------- */
    var projectDialog = document.getElementById('project-dialog');
    var projectContent = projectDialog ? projectDialog.querySelector('[data-dialog-content]') : null;
    wireDialog(projectDialog);

    document.addEventListener('click', function (e) {
        var opener = e.target.closest('[data-dialog-open]');
        if (!opener || !projectDialog || !projectContent) return;
        var card = opener.closest('.card-hit');
        var tpl = card ? card.querySelector('template[data-detail]') : null;
        if (!tpl) return;
        projectContent.replaceChildren(tpl.content.cloneNode(true));
        projectContent.scrollTop = 0;
        projectDialog.showModal();
        trackEvent('mission_open', { mission_name: currentMissionName() });
    });

    function currentMissionName() {
        var title = projectContent ? projectContent.querySelector('.detail__title') : null;
        return title ? title.textContent.trim() : '';
    }

    if (projectContent) {
        projectContent.addEventListener('click', function (e) {
            var link = e.target.closest('a[href]');
            if (!link) return;
            trackEvent('mission_link', { mission_name: currentMissionName(), link_text: link.textContent.trim() });
            // Un lien d'ancre dans la fiche ferme la fenêtre avant de défiler
            if (link.getAttribute('href').charAt(0) === '#') projectDialog.close();
        });
    }

    /* ---------- Carrousel : photos du dossier assets/carrousel/ ----------
       En ligne, le site lit directement le contenu de ce dossier sur GitHub : il suffit d'y
       déposer une photo (voir assets/carrousel/LISEZ-MOI.txt). Le nom du fichier donne l'ordre
       et les légendes :  « 12 - Légende française = English caption.jpg ».
       En local, ou si GitHub ne répond pas, la liste de secours assets/carrousel/photos.js est utilisée. */
    var carousel = document.querySelector('[data-carousel]');
    var track = carousel ? carousel.querySelector('[data-carousel-track]') : null;
    var carouselToggle = document.querySelector('[data-carousel-toggle]');
    var photos = [];
    var SPEED = 28; // pixels par seconde : lent, lisible
    var carouselStep = null; // défini plus bas selon le mode (animé ou défilement manuel)
    var IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

    // « 12 - Décollage d'ASTRA 1 = ASTRA 1 lift-off.jpg » → légendes FR et EN
    function photoFromName(name) {
        var base = name.replace(/\.[^.]+$/, '').replace(/^\s*\d+\s*[-_.)]?\s*/, '');
        var parts = base.split('=');
        var fr = parts[0].trim();
        var enCaption = parts.slice(1).join('=').trim();
        return { fichier: name, legende: fr || name, legende_en: enCaption };
    }

    function fallbackList() {
        return Array.isArray(window.MS_CARROUSEL) ? window.MS_CARROUSEL.slice() : [];
    }

    function loadPhotoList() {
        var repo = carousel && carousel.getAttribute('data-github');
        var host = window.location.hostname;
        var isLocal = !host || host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
        if (!repo || isLocal || !window.fetch) return Promise.resolve(fallbackList());

        // Petit cache de 10 minutes par visiteur : limite les appels à GitHub (60 par heure)
        try {
            var cached = JSON.parse(sessionStorage.getItem('ms-carrousel'));
            if (cached && Date.now() - cached.t < 6e5 && cached.list.length) return Promise.resolve(cached.list);
        } catch (e) { /* stockage indisponible */ }

        var known = {};
        fallbackList().forEach(function (p) { known[p.fichier] = p; });

        return fetch('https://api.github.com/repos/' + repo + '/contents/assets/carrousel', { headers: { Accept: 'application/vnd.github+json' } })
            .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
            .then(function (files) {
                var list = files
                    .filter(function (f) { return f.type === 'file' && IMAGE_EXT.test(f.name); })
                    .sort(function (a, b) { return a.name.localeCompare(b.name, 'fr', { numeric: true }); })
                    .map(function (f) {
                        var p = photoFromName(f.name);
                        p.brut = f.download_url;
                        if (known[f.name]) { p.largeur = known[f.name].largeur; p.hauteur = known[f.name].hauteur; }
                        return p;
                    });
                if (!list.length) return fallbackList();
                try { sessionStorage.setItem('ms-carrousel', JSON.stringify({ t: Date.now(), list: list })); } catch (e) { /* ignoré */ }
                return list;
            })
            .catch(function () { return fallbackList(); });
    }

    function renderPhotos(list) {
        var base = carousel.getAttribute('data-photos') || 'assets/carrousel/';
        list.forEach(function (photo) {
            if (!photo || !photo.fichier) return;
            var url = base + encodeURIComponent(photo.fichier);
            var caption = (LANG === 'en' && photo.legende_en) || photo.legende || '';

            var li = document.createElement('li');
            li.className = 'carousel__item';
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gallery__btn';
            btn.setAttribute('data-lightbox', url);
            btn.setAttribute('data-caption', caption);
            if (photo.brut) btn.setAttribute('data-raw', photo.brut);
            var img = document.createElement('img');
            img.alt = caption;
            img.decoding = 'async';
            img.loading = 'lazy';
            // Dimensions connues (liste de secours) ; sinon format 3:2 provisoire, corrigé au chargement
            img.width = photo.largeur || 1500;
            img.height = photo.hauteur || 1000;
            // Photo tout juste déposée : le site publié peut ne pas l'avoir encore → copie GitHub
            if (photo.brut) img.addEventListener('error', function () {
                if (img.src !== photo.brut) img.src = photo.brut;
            }, { once: true });
            img.src = url;
            var cap = document.createElement('span');
            cap.className = 'gallery__caption';
            cap.textContent = caption;
            btn.appendChild(img);
            btn.appendChild(cap);
            li.appendChild(btn);
            track.appendChild(li);
        });
    }

    function setCarouselDuration() {
        // La piste contient deux fois la série : une boucle = la moitié de sa largeur
        var loopWidth = track.scrollWidth / 2;
        track.style.setProperty('--marquee-duration', Math.max(30, loopWidth / SPEED).toFixed(1) + 's');
    }

    function setCarouselPaused(paused) {
        carousel.toggleAttribute('data-paused', paused);
        carouselToggle.setAttribute('aria-pressed', String(paused));
        carouselToggle.setAttribute('aria-label', paused ? T.carouselPlay : T.carouselPause);
        carouselToggle.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    }

    function setupCarousel() {
        photos = Array.prototype.slice.call(track.querySelectorAll('[data-lightbox]'));
        photos.forEach(function (btn, i) { btn.setAttribute('data-index', String(i)); });
        if (!photos.length) return;

        if (reduceMotion.matches) {
            // Pas de mouvement automatique : la rangée se fait défiler à la main
            if (carouselToggle) carouselToggle.hidden = true;
            carouselStep = function (dir) {
                carousel.scrollBy({ left: dir * carousel.clientWidth * 0.8, behavior: 'auto' });
            };
            return;
        }

        // Duplique la série pour une boucle sans à-coup ; les copies sont ignorées
        // par les lecteurs d'écran et le clavier, mais restent cliquables à la souris.
        Array.prototype.slice.call(track.children).forEach(function (item) {
            var clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('data-clone', '');
            clone.querySelectorAll('button, a').forEach(function (el) { el.tabIndex = -1; });
            var cloneImg = clone.querySelector('img'), raw = clone.querySelector('[data-raw]');
            if (cloneImg && raw) cloneImg.addEventListener('error', function () {
                var r = raw.getAttribute('data-raw');
                if (cloneImg.src !== r) cloneImg.src = r;
            }, { once: true });
            track.appendChild(clone);
        });
        setCarouselDuration();
        carousel.setAttribute('data-running', '');

        var resizeTimer = null;
        function scheduleDuration() {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(setCarouselDuration, 200);
        }
        window.addEventListener('resize', scheduleDuration);
        // Une photo sans dimensions connues change la largeur de la piste une fois chargée
        track.addEventListener('load', scheduleDuration, true);

        if (carouselToggle) {
            carouselToggle.addEventListener('click', function () {
                var paused = !carousel.hasAttribute('data-paused');
                setCarouselPaused(paused);
                trackEvent('carousel_control', { action: paused ? 'pause' : 'play' });
            });
        }

        // Flèches : avance (ou recule) d'environ une photo en 500 ms, puis le défilement lent reprend.
        // Plusieurs clics rapprochés s'additionnent pour faire défiler plus vite.
        var nudge = null;
        var easeOut = function (p) { return 1 - Math.pow(1 - p, 5); };

        carouselStep = function (dir) {
            var anim = track.getAnimations().filter(function (a) { return a.animationName === 'marquee'; })[0];
            if (!anim || anim.currentTime === null) return;
            var duration = Number(anim.effect.getComputedTiming().duration);
            var stepTime = duration / photos.length;
            var from = nudge ? nudge.value : anim.currentTime;
            var target = (nudge ? nudge.target : from) + dir * stepTime;
            var startedAt = performance.now();
            if (nudge) window.cancelAnimationFrame(nudge.raf);
            nudge = { value: from, target: target, raf: 0 };

            (function frame(now) {
                var p = Math.min(1, (now - startedAt) / 500);
                nudge.value = from + (target - from) * easeOut(p);
                // La piste boucle : on reste dans [0, durée[ sans à-coup visible
                anim.currentTime = ((nudge.value % duration) + duration) % duration;
                if (p < 1) nudge.raf = window.requestAnimationFrame(frame);
                else nudge = null;
            })(startedAt);
        };

        // Inutile d'animer hors de l'écran
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                carousel.toggleAttribute('data-offscreen', !entries[0].isIntersecting);
            }).observe(carousel);
        }
    }

    if (carousel && track) {
        loadPhotoList().then(function (list) {
            renderPhotos(list);
            setupCarousel();
        });
    }

    var prevBtn = document.querySelector('[data-carousel-prev]');
    var nextBtn = document.querySelector('[data-carousel-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () {
        if (carouselStep) carouselStep(-1);
        trackEvent('carousel_control', { action: 'previous' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
        if (carouselStep) carouselStep(1);
        trackEvent('carousel_control', { action: 'next' });
    });

    /* ---------- Agrandissement des photos ---------- */
    var lightbox = document.getElementById('lightbox');
    var lbImg = lightbox ? lightbox.querySelector('[data-lightbox-img]') : null;
    var lbCaption = lightbox ? lightbox.querySelector('[data-lightbox-caption]') : null;
    var lbCount = lightbox ? lightbox.querySelector('[data-lightbox-count]') : null;
    var lbIndex = 0;
    wireDialog(lightbox);

    function showPhoto(i) {
        var n = photos.length;
        if (!n) return;
        lbIndex = (i + n) % n;
        var item = photos[lbIndex];
        var thumb = item.querySelector('img');
        var raw = item.getAttribute('data-raw');
        lbImg.onerror = raw ? function () { lbImg.onerror = null; lbImg.src = raw; } : null;
        lbImg.src = item.getAttribute('data-lightbox');
        lbImg.alt = thumb ? thumb.alt : '';
        lbCaption.textContent = item.getAttribute('data-caption') || '';
        lbCount.textContent = (lbIndex + 1) + ' / ' + n;
    }

    if (lightbox && lbImg) {
        // Délégation : fonctionne aussi pour les copies du carrousel et les photos chargées après coup
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-lightbox]');
            if (!btn || !photos.length) return;
            showPhoto(Number(btn.getAttribute('data-index')) || 0);
            lightbox.showModal();
            trackEvent('photo_open', { photo: btn.getAttribute('data-caption') || '' });
        });
        lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', function () { showPhoto(lbIndex - 1); });
        lightbox.querySelector('[data-lightbox-next]').addEventListener('click', function () { showPhoto(lbIndex + 1); });
        lightbox.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(lbIndex - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(lbIndex + 1); }
        });
    }

    /* ---------- Statistiques : clics de contact, accueil, anciens, sections vues ---------- */
    var SOCIALS = [
        { method: 'linkedin', match: 'linkedin.com/company/mines-space' },
        { method: 'instagram', match: 'instagram.com/mines_space' },
        { method: 'facebook', match: 'facebook.com/MinesSpace' }
    ];

    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (!link) return;
        var href = link.getAttribute('href');
        if (href.indexOf('mailto:') === 0) {
            trackEvent('contact_click', { method: 'email', location: sectionOf(link) });
            return;
        }
        for (var i = 0; i < SOCIALS.length; i++) {
            if (href.indexOf(SOCIALS[i].match) !== -1) {
                trackEvent('contact_click', { method: SOCIALS[i].method, location: sectionOf(link) });
                return;
            }
        }
        if (link.closest('.hero__actions')) trackEvent('cta_click', { label: link.textContent.trim() });
    });

    var alumniPanel = document.querySelector('.alumni-panel');
    if (alumniPanel) {
        alumniPanel.addEventListener('toggle', function () {
            if (alumniPanel.open) trackEvent('alumni_open');
        });
    }

    // Chaque section n'est comptée qu'une fois par visite, quand elle passe au milieu de l'écran
    // (fonctionne aussi pour les sections plus hautes que l'écran, comme la frise)
    if ('IntersectionObserver' in window) {
        var seen = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                trackEvent('section_view', { section: entry.target.id });
                seen.unobserve(entry.target);
            });
        }, { rootMargin: '-50% 0px -50% 0px' });
        document.querySelectorAll('main > section[id]').forEach(function (s) {
            if (s.id !== 'accueil') seen.observe(s);
        });
    }

    /* ---------- Formulaire de contact ----------
       Les réponses partent vers le Google Form « Nous contacter par mail ».
       Ce formulaire a 4 pages : 0 = « Vous êtes », 1 = particulier, 2 = entreprise, 3 = message.
       Si le Google Form est modifié, mettre à jour les identifiants ci-dessous et dans index.html. */
    var GF = {
        kind: 'entry.1145234919',
        kindCompany: 'Une entreprise - A company',
        nameIndividual: 'entry.585949797',
        nameCompany: 'entry.1145965896',
        company: 'entry.17440860'
    };

    var form = document.getElementById('contact-form');
    if (!form) return;

    var companyField = form.querySelector('[data-company]');
    var companyInput = document.getElementById('f-company');
    var subjectInput = document.getElementById('f-subject');
    var chips = form.querySelectorAll('[data-subject]');
    var submitBtn = form.querySelector('[data-submit]');
    var submitLabel = form.querySelector('[data-submit-label]');
    var statusEl = form.querySelector('[data-form-status]');
    var success = document.querySelector('[data-form-success]');
    var resetBtn = document.querySelector('[data-form-reset]');

    function isCompany() {
        var kind = form.elements[GF.kind];
        return kind && kind.value === GF.kindCompany;
    }

    function syncKind() {
        var company = isCompany();
        companyField.hidden = !company;
        companyInput.required = company;
        if (!company) setError(companyInput, '');
    }
    form.querySelectorAll('input[name="' + GF.kind + '"]').forEach(function (radio) {
        radio.addEventListener('change', syncKind);
    });

    function syncChips() {
        chips.forEach(function (chip) {
            chip.setAttribute('aria-pressed', String(chip.getAttribute('data-subject') === subjectInput.value.trim()));
        });
    }
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            subjectInput.value = chip.getAttribute('data-subject');
            setError(subjectInput, '');
            syncChips();
        });
    });
    subjectInput.addEventListener('input', syncChips);

    function setError(input, message) {
        var err = document.getElementById(input.id + '-error');
        if (message) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
        if (err) err.textContent = message;
    }

    function validate() {
        var firstInvalid = null;
        form.querySelectorAll('.input').forEach(function (input) {
            if (input.closest('[hidden]')) return;
            var value = input.value.trim();
            var message = '';
            if (input.required && !value) message = T.required;
            else if (input.type === 'email' && value && !input.checkValidity()) message = T.badEmail;
            setError(input, message);
            if (message && !firstInvalid) firstInvalid = input;
        });
        return firstInvalid;
    }

    form.addEventListener('input', function (e) {
        if (e.target.matches('.input[aria-invalid="true"]') && e.target.value.trim()) setError(e.target, '');
    });

    function buildPayload() {
        var data = new URLSearchParams();
        new FormData(form).forEach(function (value, key) {
            data.append(key, typeof value === 'string' ? value.trim() : value);
        });
        if (isCompany()) {
            data.set(GF.nameCompany, data.get(GF.nameIndividual) || '');
            data.delete(GF.nameIndividual);
            data.set('pageHistory', '0,2,3');
        } else {
            data.delete(GF.company);
            data.set('pageHistory', '0,1,3');
        }
        return data;
    }

    function setSending(sending) {
        submitBtn.disabled = sending;
        submitLabel.textContent = sending ? T.sending : T.send;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        statusEl.textContent = '';
        var invalid = validate();
        if (invalid) { invalid.focus(); return; }

        setSending(true);
        var visitorType = isCompany() ? 'entreprise' : 'particulier';
        var controller = 'AbortController' in window ? new AbortController() : null;
        var timer = controller ? window.setTimeout(function () { controller.abort(); }, 15000) : null;

        // Google Forms n'expose pas de CORS : la réponse est opaque, seule une erreur réseau est détectable.
        fetch(form.action, {
            method: 'POST',
            mode: 'no-cors',
            body: buildPayload(),
            signal: controller ? controller.signal : undefined
        }).then(function () {
            trackEvent('generate_lead', { method: 'formulaire', visitor_type: visitorType });
            form.reset();
            syncKind();
            syncChips();
            form.hidden = true;
            success.hidden = false;
            success.focus();
        }).catch(function () {
            trackEvent('contact_form_error');
            statusEl.textContent = T.sendError;
        }).then(function () {
            if (timer) window.clearTimeout(timer);
            setSending(false);
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            success.hidden = true;
            form.hidden = false;
            document.getElementById('f-name').focus();
        });
    }
})();
