document.addEventListener('DOMContentLoaded', function () {
  // Bootstrap ScrollSpy
  const mainNav = document.querySelector('#mainNav');
  new bootstrap.ScrollSpy(document.body, {
    target: '#mainNav',
    offset: 74
  });

  // Collapse navbar on link click for mobile
  const navbarToggler = document.querySelector('.navbar-toggler');
  const responsiveNavItems = document.querySelectorAll('#navbarResponsive .nav-link');
  responsiveNavItems.forEach(function (item) {
    item.addEventListener('click', () => {
      if (window.getComputedStyle(navbarToggler).display !== 'none') {
        navbarToggler.click();
      }
    });
  });

  // Language Translations
  const translations = {
    zh: {
      name: '陈奕帆',
      language: '中文',
      nav_home: '首页',
      nav_research: '研究',
      nav_awards: '奖项',
      nav_internship: '实习',
      cv_download: '下载简历',
      home_title: '首页',
      research_title: '研究',
      awards_title: '奖项',
      internship_title: '实习',
      sidebar_research: '研究',
      sidebar_lunar_meteorite: '月球陨石',
      sidebar_iodp: 'IODP',
      sidebar_programs: '无用程序',
      sidebar_cs2_tactics: 'CS2战术',
      sidebar_docs_hunter: '文档猎人',
      sidebar_raman_painter: '拉曼画家',
      sidebar_coursework: '课程',
      sidebar_geochemistry: '地球化学',
      sidebar_instrument_technique: '仪器技术',
      sidebar_instruments: '实验仪器',
      sidebar_microscope: 'Leica显微镜',
      sidebar_epma: 'EPMA',
      sidebar_ftir: 'FTIR',
      sidebar_sims: 'SIMS',
      footer_copyright: '© 2025 陈奕帆'
    },
    en: {
      name: 'YiFan Chen',
      language: 'English',
      nav_home: 'Home',
      nav_research: 'Research',
      nav_awards: 'Awards',
      nav_internship: 'Internship',
      cv_download: 'Download CV',
      home_title: 'Home',
      research_title: 'Research',
      awards_title: 'Awards',
      internship_title: 'Internship',
      sidebar_research: 'Research',
      sidebar_lunar_meteorite: 'Lunar Meteorite',
      sidebar_iodp: 'IODP',
      sidebar_programs: 'Useless Programs',
      sidebar_cs2_tactics: 'CS2 Tactics',
      sidebar_docs_hunter: 'Documents Hunter',
      sidebar_raman_painter: 'Raman Painter',
      sidebar_coursework: 'Coursework',
      sidebar_geochemistry: 'Geochemistry',
      sidebar_instrument_technique: 'Instrument Technique',
      sidebar_instruments: 'Experiment Instruments',
      sidebar_microscope: 'Leica Microscope',
      sidebar_epma: 'EPMA',
      sidebar_ftir: 'FTIR',
      sidebar_sims: 'SIMS',
      footer_copyright: '© 2025 YiFan Chen'
    }
  };

  // Load Markdown Content
  function loadMarkdownContent(lang) {
    const sections = ['home', 'research', 'awards', 'internship'];
    sections.forEach(section => {
      fetch(`contents/${section}_${lang}.md`)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to load ${section}_${lang}.md`);
          return response.text();
        })
        .then(text => {
          const mdElement = document.getElementById(`${section}-md`);
          mdElement.innerHTML = marked.parse(text, { mangle: false, headerIds: false });
          MathJax.typesetPromise([mdElement]).catch(err => console.error('MathJax error:', err));
        })
        .catch(err => console.error(`Error loading ${section}_${lang}.md:`, err));
    });
  }

  // Update Static Text
  function updateStaticText(lang) {
    document.querySelectorAll('[data-lang-key]').forEach(element => {
      const key = element.getAttribute('data-lang-key');
      if (translations[lang][key]) {
        element.textContent = translations[lang][key];
      }
    });
    document.documentElement.lang = lang;
  }

  // Language Switching
  function setLanguage(lang) {
    localStorage.setItem('language', lang);
    updateStaticText(lang);
    loadMarkdownContent(lang);
  }

  // Initialize Language
  const savedLang = localStorage.getItem('language') || 'zh';
  setLanguage(savedLang);

  // Language Toggle Event Listeners
  document.querySelectorAll('.lang-switch').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = button.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Load YAML Config
  fetch('contents/config.yml')
    .then(response => response.text())
    .then(data => {
      const config = jsyaml.load(data);
      Object.keys(config).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          element.textContent = config[key];
        } else {
          console.warn(`Element with ID "${key}" not found for YAML config`);
        }
      });
    })
    .catch(err => console.error('Error loading config.yml:', err));
});