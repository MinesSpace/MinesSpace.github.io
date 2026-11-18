/* ==========================================================================
   MINES SPACE · graphiques des pages « Résultats de vol »
   La page indique la mission via <body data-mission="ms0|ms1"> ; les données
   viennent de js/ms0-data.js ou js/ms1-data.js. Les couleurs reprennent les
   jetons du thème ; au passage clair / sombre, les graphiques sont recréés.
   Libellés selon <html lang>.
   ========================================================================== */
/* global ms0_data, ms1_data */
(function () {
    'use strict';
    if (typeof window.Chart === 'undefined') return;

    var root = document.documentElement;
    var en = (root.getAttribute('lang') || 'fr').slice(0, 2) === 'en';
    var mission = document.body.getAttribute('data-mission');
    var L = en
        ? { time: 'Time (s)', temp: 'Temperature (°C)', press: 'Pressure (hPa)', acc: 'Acceleration (g)', gyr: 'Angular rate (rad/s)', alt: 'Altitude (m)', speed: 'Speed (km/h)', dist: 'Distance (m)' }
        : { time: 'Temps (s)', temp: 'Température (°C)', press: 'Pression (hPa)', acc: 'Accélération (g)', gyr: 'Vitesse angulaire (rad/s)', alt: 'Altitude (m)', speed: 'Vitesse (km/h)', dist: 'Distance (m)' };

    function token(name) {
        return getComputedStyle(root).getPropertyValue(name).trim();
    }

    // Points {x, y} : l'axe du temps reste à l'échelle même si l'échantillonnage varie
    function series(rows, col, scale) {
        return rows.map(function (r) { return { x: r[0], y: scale ? r[col] * scale : r[col] }; });
    }

    // Description des graphiques : [id du canvas, titre axe gauche, titre axe droit, séries]
    var specs = [];
    if (mission === 'ms0' && typeof ms0_data !== 'undefined') {
        // Colonnes : 0 temps, 1 pression (Pa), 2-4 accéléromètres, 5-7 gyromètres, 8 température
        specs = [
            ['chart-temp-press', L.temp, L.press, [
                [L.temp, series(ms0_data, 8), '--chart-1', 'y'],
                [L.press, series(ms0_data, 1, 0.01), '--chart-2', 'y2']
            ]],
            ['chart-acc', L.acc, null, [
                ['X', series(ms0_data, 2), '--chart-1'],
                ['Y', series(ms0_data, 3), '--chart-2'],
                ['Z', series(ms0_data, 4), '--chart-3']
            ]],
            ['chart-gyr', L.gyr, null, [
                ['X', series(ms0_data, 5), '--chart-1'],
                ['Y', series(ms0_data, 6), '--chart-2'],
                ['Z', series(ms0_data, 7), '--chart-3']
            ]]
        ];
    } else if (mission === 'ms1' && typeof ms1_data !== 'undefined') {
        // Colonnes : 0 temps, 1 altitude, 2 vitesse, 3 distance
        specs = [
            ['chart-alt', L.alt, null, [[L.alt, series(ms1_data, 1), '--chart-1']]],
            ['chart-speed', L.speed, null, [[L.speed, series(ms1_data, 2), '--chart-2']]],
            ['chart-dist', L.dist, null, [[L.dist, series(ms1_data, 3), '--chart-3']]]
        ];
    }

    var charts = [];

    function axis(title, position, ink, grid, hideGrid) {
        return {
            position: position,
            title: { display: true, text: title, color: ink },
            ticks: { color: ink },
            grid: { color: grid, drawOnChartArea: !hideGrid },
            border: { color: grid }
        };
    }

    function build() {
        charts.forEach(function (c) { c.destroy(); });
        charts = [];
        var ink = token('--muted'), grid = token('--line');

        specs.forEach(function (spec) {
            var canvas = document.getElementById(spec[0]);
            if (!canvas) return;
            var scales = {
                x: Object.assign(axis(L.time, 'bottom', ink, grid), { type: 'linear' }),
                y: axis(spec[1], 'left', ink, grid)
            };
            if (spec[2]) scales.y2 = axis(spec[2], 'right', ink, grid, true);

            charts.push(new window.Chart(canvas, {
                type: 'line',
                data: {
                    datasets: spec[3].map(function (s) {
                        var c = token(s[2]);
                        return { label: s[0], data: s[1], yAxisID: s[3] || 'y', borderColor: c, backgroundColor: c };
                    })
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: { mode: 'nearest', axis: 'x', intersect: false },
                    elements: { point: { radius: 0 }, line: { borderWidth: 2, tension: 0.15 } },
                    // Palette automatique de Chart.js désactivée : les couleurs viennent du thème du site
                    plugins: {
                        colors: { enabled: false },
                        legend: { position: 'bottom', labels: { color: ink, boxWidth: 12, boxHeight: 2 } }
                    },
                    scales: scales
                }
            }));
        });
    }

    window.Chart.defaults.font.family = token('--font-body') || 'sans-serif';
    build();

    var last = root.getAttribute('data-theme');
    new MutationObserver(function () {
        var now = root.getAttribute('data-theme');
        if (now !== last) { last = now; build(); }
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
