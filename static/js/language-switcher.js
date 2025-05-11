/**
 * 语言切换功能
 * Language Switcher Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const languageSwitcher = document.getElementById('language-switcher');
    if (!languageSwitcher) return;

    const languageBtns = document.querySelectorAll('.language-btn');
    if (!languageBtns.length) return;

    // Function to set language
    function setLanguage(lang) {
        // Re-query elements each time language is set
        const zhElements = document.querySelectorAll('.lang-zh');
        const enElements = document.querySelectorAll('.lang-en');

        const activeBtnSelector = `[data-lang="${lang}"]`;
        const inactiveBtnSelector = lang === 'zh' ? '[data-lang="en"]' : '[data-lang="zh"]';

        if (lang === 'zh') {
            zhElements.forEach(el => el.style.display = (el.tagName === 'SPAN' || el.tagName === 'A') ? 'inline' : 'block');
            enElements.forEach(el => el.style.display = 'none');
            document.documentElement.lang = 'zh';
        } else { // 'en'
            zhElements.forEach(el => el.style.display = 'none');
            enElements.forEach(el => el.style.display = (el.tagName === 'SPAN' || el.tagName === 'A') ? 'inline' : 'block');
            document.documentElement.lang = 'en';
        }

        const activeBtn = document.querySelector(activeBtnSelector);
        const inactiveBtn = document.querySelector(inactiveBtnSelector);
        if (activeBtn) activeBtn.classList.add('active');
        if (inactiveBtn) inactiveBtn.classList.remove('active');
        
        // Update placeholders
        const inputElements = document.querySelectorAll('input[data-placeholder-zh], textarea[data-placeholder-zh]');
        inputElements.forEach(input => {
            const placeholderAttr = lang === 'zh' ? 'data-placeholder-zh' : 'data-placeholder-en';
            input.placeholder = input.getAttribute(placeholderAttr) || ''; // Fallback to empty if attribute missing
        });

        // Update aria-labels
        const ariaLabelElements = document.querySelectorAll('[data-aria-label-zh]');
        ariaLabelElements.forEach(el => {
            const ariaLabelAttr = lang === 'zh' ? 'data-aria-label-zh' : 'data-aria-label-en';
            el.setAttribute('aria-label', el.getAttribute(ariaLabelAttr) || '');
        });
    }

    // Determine initial language
    const initialLang = localStorage.getItem('preferredLanguage') || 'zh';
    setLanguage(initialLang);

    // Add event listeners to buttons
    languageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
        });
    });

    // Expose setLanguage globally for other scripts
    window.setAppLanguage = setLanguage;
});