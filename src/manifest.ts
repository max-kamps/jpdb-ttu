import type { JsonObject } from 'type-fest';

function includeIf(condition: boolean, object: JsonObject): JsonObject {
    return condition ? object : {};
}

export default (engine: 'gecko' | 'chromium'): JsonObject => {
    // Chromium doesn't support SVG icons :/
    const icons =
        engine === 'gecko'
            ? { 128: 'icons/logo.svg' }
            : Object.fromEntries([16, 24, 32, 48, 64, 96, 128].map(size => [size, `icons/logo_${size}.png`]));

    return {
        manifest_version: 2,
        name: 'Breader',
        version: '13.0',
        description: 'JPDB parsing and mining in your browser',
        icons,

        ...includeIf(engine === 'gecko', {
            browser_specific_settings: {
                gecko: {
                    id: ' {ec12956c-1b03-4829-a79a-b501802dd407}',
                },
            },
        }),

        browser_action: {
            default_icon: icons,
            default_title: 'JPDBreader',
            default_popup: 'browser_popup/popup.html',
        },
        content_scripts: [
            {
                matches: ['*://reader.ttsu.app/*', '*://ttu-ebook.web.app/*'],
                js: ['integrations/ttu.js'],
                css: ['content/word.css'],
            },
            {
                matches: [
                    '*://anacreondjt.gitlab.io/texthooker.html',
                    '*://learnjapanese.moe/texthooker.html',
                    '*://kamwithk.github.io/exSTATic/tracker.html',
                    '*://renji-xd.github.io/texthooker-ui/',
                ],
                js: ['integrations/anacreon.js'],
                css: ['content/word.css'],
            },
            {
                matches: ['file:///*mokuro*.html'],
                js: ['integrations/mokuro.js'],
                css: ['content/word.css'],
            },
            {
                matches: ['*://app.readwok.com/*'],
                js: ['integrations/readwok.js'],
                css: ['content/word.css'],
            },
            {
                matches: ['*://ja.wikipedia.org/*', '*://ja.m.wikipedia.org/*'],
                js: ['integrations/wikipedia.js'],
                css: ['content/word.css'],
            },
            {
                matches: ['*://*.youtube.com/*'],
                js: ['integrations/youtube.js'],
                css: ['content/word.css'],
            },
            {
                matches: ['*://bunpro.jp/*'],
                js: ['integrations/bunpro.js'],
                css: ['content/word.css'],
            },
        ],
        background: {
            page: 'background/background.html',
            persistent: true,
        },
        web_accessible_resources: [
            'integrations/common.js',
            'content/background_comms.js',
            'content/content.js',
            'content/dialog.js',
            'content/dialog.css',
            'content/parse.js',
            'content/popup.js',
            'content/popup.css',
            'content/word.js',
            'content/word.css',
            'content/toast.js',
            'content/toast.css',
            'util.js',
            'jsx.js',
            'common.css',
            'themes.css',
        ],
        permissions: [
            'tabs',
            'activeTab',
            'contextMenus',
            'https://jpdb.io/*',
            '*://reader.ttsu.app/*',
            '*://ttu-ebook.web.app/*',
            '*://anacreondjt.gitlab.io/texthooker.html',
            '*://learnjapanese.moe/texthooker.html',
            '*://kamwithk.github.io/exSTATic/tracker.html',
            '*://renji-xd.github.io/texthooker-ui/',
            'file:///*mokuro*.html',
            '*://ja.wikipedia.org/*',
            '*://ja.m.wikipedia.org/*',
            '*://app.readwok.com/*',
            '*://*.youtube.com/*',
            '*://bunpro.jp/*',
        ],
    };
};
