/* ==========================================================================
   MINES SPACE · Google Analytics (GA4), soumis au consentement (CNIL)
   À charger dans le <head> de chaque page, avant js/main.js.
   - rien n'est chargé tant que le visiteur n'a pas cliqué « Accepter » ;
   - le choix est conservé 6 mois (clé « ms-consent »), puis redemandé ;
   - rien n'est envoyé en local (localhost, fichier ouvert directement).
   Les événements sont envoyés par js/main.js (fonction trackEvent).
   ========================================================================== */
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
});

window.MS_GA_ID = 'G-LN1GFX018X';
window.MS_CONSENT_DAYS = 182;
window.msConsent = 'unknown';

window.msEnableAnalytics = function () {
    window.msConsent = 'granted';
    if (window.msAnalyticsLoaded) {
        gtag('consent', 'update', { analytics_storage: 'granted' });
        return;
    }
    var host = window.location.hostname;
    if (!host || host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return;
    window.msAnalyticsLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.MS_GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', window.MS_GA_ID);
};

(function () {
    var choice = null;
    try { choice = JSON.parse(localStorage.getItem('ms-consent')); } catch (e) {}
    var fresh = choice && (Date.now() - choice.date) < window.MS_CONSENT_DAYS * 864e5;
    if (fresh && choice.analytics === true) window.msEnableAnalytics();
    else if (fresh) window.msConsent = 'denied';
})();
