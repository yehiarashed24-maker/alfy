// Shared Auth, Continuous Audio Player, iOS Bottom TabBar, Love Counter, and Universal Modals System
(function() {
    const START_DATE = new Date('2022-11-06T00:00:00+02:00');

    // Playlist with multiple romantic songs
    const PLAYLIST = [
        {
            title: 'Nano (نانو)',
            artist: 'TUL8TE & Saint Levant • سوسو ❤️',
            src: 'assets/audio/nano.mp3',
            img: 'assets/2026/2026_hijab.jpg'
        },
        {
            title: 'Tamally Maak (تملي معاك)',
            artist: 'Amr Diab • سوسو ❤️',
            src: 'https://soso-our-storyy.vercel.app/02.Tamally_Maak.mp3',
            img: 'assets/2022/01_first_memory_bechamel.jpg'
        }
    ];

    // Sara Love Messages (Global Data)
    const SARA_MESSAGES = [
        "\"يا سارة، أنتِ أجمل صدفة نوّرت حياتي وحوّلتها لأحلى قصة حب. بحبك من كل قلبي ❤️\"",
        "\"سارة.. في عيونك لقيت أماني، وفي ابتسامتك لقيت كل سعادة الدنيا ✨\"",
        "\"كل يوم بيمر وأنتِ معايا بحس إنه هدية غالية من ربنا.. مفيش في قلبي غيرك يا سارة 🌸\"",
        "\"سارة.. أنتِ مش بس حبيبتي، أنتِ راحتي وبيتي ونبض قلبي للأبد 💖\"",
        "\"لو اتعاد عمري ألف مرة، هختارك أنتِ يا سارة في كل مرة وبنفس الحب والعشق 💍\"",
        "\"ضحكتك يا سارة كفيلة تخلّي الدنيا كلها تنوّر وتضحك في عيوني.. بحبك يا أغلى ما عندي 🌹\"",
        "\"يا سارة، حبك هو النور والأمان اللي مالي طريقي، ومعاكِ بس عرفت معنى السعادة الحقيقية ♡\""
    ];

    let currentLetterIdx = 0;

    // Determine current song index (strictly alternates every single time the user enters/opens the site)
    let lastTrack = parseInt(localStorage.getItem('story_last_played_idx') ?? '-1', 10);
    let currentTrackIndex = (lastTrack + 1) % PLAYLIST.length;
    localStorage.setItem('story_last_played_idx', currentTrackIndex);
    sessionStorage.setItem('story_current_track', currentTrackIndex);

    let audioInstance = null;

    // Global Mobile & iOS App-Like CSS Injection
    function injectMobileStyles() {
        if (document.getElementById('ios-mobile-styles')) return;
        const style = document.createElement('style');
        style.id = 'ios-mobile-styles';
        style.textContent = `
            * {
                -webkit-tap-highlight-color: transparent;
                box-sizing: border-box;
            }
            body {
                -webkit-font-smoothing: antialiased;
                overscroll-behavior-y: none;
                padding-bottom: env(safe-area-inset-bottom);
            }
            /* Prevent horizontal overflow on iPhone */
            html, body {
                max-width: 100vw;
                overflow-x: hidden;
            }
            /* iOS Touch Active Scale */
            .ios-touch:active, .envelope-3d-card:active {
                transform: scale(0.95);
                transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            }
            /* iOS Tab Bar Active Indicator */
            .ios-tab-active {
                color: #a43073 !important;
                position: relative;
            }
            .ios-tab-active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background-color: #a43073;
                border-radius: 50%;
            }
            .burst-heart {
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                animation: burstFade 2s ease-out forwards;
            }
            @keyframes burstFade {
                0% { transform: scale(0.5) translateY(0); opacity: 1; }
                100% { transform: scale(1.6) translateY(-100px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Burst hearts effect on tap
    function burstHearts(x, y) {
        for(let i = 0; i < 6; i++) {
            const h = document.createElement('span');
            h.className = 'material-symbols-outlined burst-heart text-secondary';
            h.textContent = 'favorite';
            h.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
            h.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
            h.style.fontSize = (18 + Math.random() * 20) + 'px';
            document.body.appendChild(h);
            setTimeout(() => h.remove(), 2100);
        }
    }

    // Global Letter Modal Functions
    window.openLetter = function(idx, e) {
        currentLetterIdx = idx % SARA_MESSAGES.length;
        const textEl = document.getElementById('modal-letter-text');
        const modal = document.getElementById('love-modal');
        if (textEl) textEl.textContent = SARA_MESSAGES[currentLetterIdx];
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        const x = (e && e.clientX) ? e.clientX : (window.innerWidth / 2);
        const y = (e && e.clientY) ? e.clientY : (window.innerHeight / 2);
        burstHearts(x, y);
    };

    window.openRandomLetter = function(e) {
        const rand = Math.floor(Math.random() * SARA_MESSAGES.length);
        window.openLetter(rand, e);
    };

    window.openNextLetter = function(e) {
        currentLetterIdx = (currentLetterIdx + 1) % SARA_MESSAGES.length;
        const textEl = document.getElementById('modal-letter-text');
        if (textEl) textEl.textContent = SARA_MESSAGES[currentLetterIdx];
        burstHearts(window.innerWidth / 2, window.innerHeight / 2);
    };

    window.closeLetterModal = function() {
        const modal = document.getElementById('love-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // 1. Inject Lock Screen if not authenticated
    function initAuth() {
        const isUnlocked = sessionStorage.getItem('story_unlocked') === 'true';
        if (isUnlocked) {
            // Already unlocked - restore and auto-play immediately
            restoreAudioPlayback();
            return;
        }

        const lockOverlay = document.createElement('div');
        lockOverlay.id = 'global-lock-screen';
        lockOverlay.className = 'fixed inset-0 z-[100] bg-surface-container-lowest/90 backdrop-blur-2xl flex items-center justify-center p-4';
        lockOverlay.innerHTML = `
            <div class="bg-surface-container-lowest/95 border border-secondary/30 shadow-2xl rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative">
                <div class="w-20 h-20 rounded-full bg-primary-container/40 flex items-center justify-center mx-auto mb-6 shadow-inner border border-secondary/30">
                    <span class="material-symbols-outlined text-4xl text-secondary animate-pulse">lock</span>
                </div>
                <h2 class="font-headline-md text-2xl md:text-3xl text-primary font-bold mb-2">Y ❤️ A</h2>
                <p class="text-on-surface-variant font-body-md text-sm mb-6">بعض الحكايات معمولة مخصوص لينا إحنا وبس...</p>
                <div class="space-y-4">
                    <input id="story-pass-input" type="password" placeholder="Enter password..." class="w-full px-5 py-3.5 rounded-full border border-outline-variant/60 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-center font-body-md bg-surface-container-low transition-all" autocomplete="off"/>
                    <button id="story-unlock-btn" class="w-full py-3.5 rounded-full bg-secondary text-white font-bold hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all transform hover:-translate-y-0.5 active:scale-95">
                        Open Our Story ❤️
                    </button>
                    <p id="story-pass-error" class="text-error text-xs h-4 font-semibold"></p>
                </div>
            </div>
        `;
        document.body.appendChild(lockOverlay);
        document.body.style.overflow = 'hidden';

        const passInput = document.getElementById('story-pass-input');
        const unlockBtn = document.getElementById('story-unlock-btn');
        const errText = document.getElementById('story-pass-error');

        function checkPass() {
            const val = passInput.value.trim().toLowerCase();
            if (val === 'alby' || val === 'albyy' || val === 'albi' || val === 'قلبي' || val === 'البي') {
                sessionStorage.setItem('story_unlocked', 'true');
                lockOverlay.style.transition = 'opacity 0.5s ease-out';
                lockOverlay.style.opacity = '0';
                
                // Immediately trigger play inside this direct user gesture
                playAudio();

                setTimeout(() => {
                    lockOverlay.remove();
                    document.body.style.overflow = '';
                }, 500);
            } else {
                errText.textContent = 'كلمة السر غير صحيحة ♡ حاول مرة أخرى';
                passInput.classList.add('border-error');
            }
        }

        unlockBtn.onclick = checkPass;
        passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPass(); });
    }

    // 2. Persistent Romantic Audio Player (iOS Docked & Responsive)
    function loadTrack(idx, shouldPlay = true) {
        currentTrackIndex = (idx + PLAYLIST.length) % PLAYLIST.length;
        localStorage.setItem('story_last_played_idx', currentTrackIndex);
        sessionStorage.setItem('story_current_track', currentTrackIndex);
        sessionStorage.setItem('story_audio_time', '0');
        const track = PLAYLIST[currentTrackIndex];

        const audio = document.getElementById('global-bg-audio');
        const img = document.getElementById('player-track-img');
        const title = document.getElementById('player-track-title');
        const artist = document.getElementById('player-track-artist');

        if (audio && track) {
            audio.src = track.src;
            if (img) img.src = track.img;
            if (title) title.textContent = track.title;
            if (artist) artist.textContent = track.artist;
            if (shouldPlay) {
                playAudio();
            }
        }
    }

    function initPlayer() {
        if (document.getElementById('floating-music-player')) return;

        const currentTrack = PLAYLIST[currentTrackIndex];
        const savedTime = parseFloat(sessionStorage.getItem('story_audio_time') || '0');

        const playerDiv = document.createElement('div');
        playerDiv.id = 'floating-music-player';
        playerDiv.className = 'fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border border-secondary/25 rounded-2xl p-2.5 md:p-3 shadow-2xl flex flex-col gap-1.5 md:gap-2 transition-all duration-300';
        playerDiv.innerHTML = `
            <div class="flex items-center gap-2.5 md:gap-3">
                <img id="player-track-img" src="${currentTrack.img}" alt="Album cover" class="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-outline-variant/40 shadow-sm flex-shrink-0"/>
                <div class="flex-grow min-w-0">
                    <div id="player-track-title" class="text-primary font-bold text-xs md:text-sm truncate">${currentTrack.title}</div>
                    <div id="player-track-artist" class="text-secondary text-[10px] md:text-xs truncate">${currentTrack.artist}</div>
                </div>
                <div class="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                    <button id="global-music-prev" class="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-surface-container-high text-primary flex items-center justify-center transition-all ios-touch" title="Previous song">
                        <span class="material-symbols-outlined text-sm md:text-base">skip_previous</span>
                    </button>
                    <button id="global-music-play" class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-white flex items-center justify-center transition-all shadow-sm ios-touch">
                        <span class="material-symbols-outlined text-base md:text-lg" id="play-icon">play_arrow</span>
                    </button>
                    <button id="global-music-next" class="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-surface-container-high text-primary flex items-center justify-center transition-all ios-touch" title="Next song">
                        <span class="material-symbols-outlined text-sm md:text-base">skip_next</span>
                    </button>
                </div>
            </div>
            <div class="flex items-center gap-2 text-[9px] md:text-[10px] text-on-surface-variant px-1 font-mono">
                <span id="player-cur-time">0:00</span>
                <div id="player-progress-bar" class="flex-grow h-1.5 bg-surface-container-high rounded-full overflow-hidden cursor-pointer relative">
                    <div id="player-progress-fill" class="h-full bg-secondary w-0 rounded-full"></div>
                </div>
                <span id="player-dur-time">0:00</span>
            </div>
            <audio id="global-bg-audio" preload="auto" src="${currentTrack.src}"></audio>
        `;
        document.body.appendChild(playerDiv);

        audioInstance = document.getElementById('global-bg-audio');
        const playBtn = document.getElementById('global-music-play');
        const prevBtn = document.getElementById('global-music-prev');
        const nextBtn = document.getElementById('global-music-next');
        const playIcon = document.getElementById('play-icon');
        const curTime = document.getElementById('player-cur-time');
        const durTime = document.getElementById('player-dur-time');
        const progressBar = document.getElementById('player-progress-bar');
        const progressFill = document.getElementById('player-progress-fill');

        const fmt = t => {
            if (!isFinite(t)) return '0:00';
            return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
        };

        playBtn.onclick = () => {
            if (audioInstance.paused) {
                playAudio();
            } else {
                audioInstance.pause();
                sessionStorage.setItem('story_audio_playing', 'false');
                playIcon.textContent = 'play_arrow';
            }
        };

        prevBtn.onclick = () => {
            loadTrack(currentTrackIndex - 1, true);
        };

        nextBtn.onclick = () => {
            loadTrack(currentTrackIndex + 1, true);
        };

        // Auto-play next track in playlist when song ends
        audioInstance.onended = () => {
            loadTrack(currentTrackIndex + 1, true);
        };

        audioInstance.onplay = () => { 
            sessionStorage.setItem('story_audio_playing', 'true');
            playIcon.textContent = 'pause'; 
        };
        audioInstance.onpause = () => { 
            sessionStorage.setItem('story_audio_playing', 'false');
            playIcon.textContent = 'play_arrow'; 
        };

        audioInstance.ontimeupdate = () => {
            sessionStorage.setItem('story_audio_time', audioInstance.currentTime);
            curTime.textContent = fmt(audioInstance.currentTime);
            const progress = (audioInstance.duration ? (audioInstance.currentTime / audioInstance.duration) * 100 : 0);
            progressFill.style.width = progress + '%';
        };

        audioInstance.onloadedmetadata = () => {
            durTime.textContent = fmt(audioInstance.duration);
            if (savedTime > 0 && Math.abs(audioInstance.currentTime - savedTime) > 1) {
                audioInstance.currentTime = Math.min(savedTime, audioInstance.duration - 1);
            }
        };

        progressBar.onclick = (e) => {
            if (audioInstance.duration) {
                const rect = progressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioInstance.currentTime = pos * audioInstance.duration;
            }
        };

        window.addEventListener('beforeunload', () => {
            if (audioInstance) {
                sessionStorage.setItem('story_audio_time', audioInstance.currentTime);
                sessionStorage.setItem('story_current_track', currentTrackIndex);
            }
        });
    }

    function playAudio() {
        if (!audioInstance) {
            audioInstance = document.getElementById('global-bg-audio');
        }
        if (audioInstance) {
            const savedTime = parseFloat(sessionStorage.getItem('story_audio_time') || '0');
            if (savedTime > 0 && Math.abs(audioInstance.currentTime - savedTime) > 1 && audioInstance.currentTime < 1) {
                try { audioInstance.currentTime = savedTime; } catch(e) {}
            }
            if (audioInstance.paused) {
                const playPromise = audioInstance.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        sessionStorage.setItem('story_audio_playing', 'true');
                        const playIcon = document.getElementById('play-icon');
                        if (playIcon) playIcon.textContent = 'pause';
                    }).catch(() => {
                        // Browser policy blocked immediate autoplay; wait for first interaction
                    });
                }
            }
        }
    }

    function restoreAudioPlayback() {
        playAudio();
        const triggerOnFirstGesture = () => {
            playAudio();
            window.removeEventListener('click', triggerOnFirstGesture);
            window.removeEventListener('touchstart', triggerOnFirstGesture);
            window.removeEventListener('keydown', triggerOnFirstGesture);
        };
        window.addEventListener('click', triggerOnFirstGesture, { once: true });
        window.addEventListener('touchstart', triggerOnFirstGesture, { once: true });
        window.addEventListener('keydown', triggerOnFirstGesture, { once: true });
    }

    // 3. Native iOS Mobile Bottom TabBar (Home, Timeline, Gallery, رسالة)
    function initMobileTabBar() {
        if (document.getElementById('ios-bottom-tabbar')) {
            updateActiveTab();
            return;
        }

        const tabBar = document.createElement('nav');
        tabBar.id = 'ios-bottom-tabbar';
        tabBar.className = 'fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/85 backdrop-blur-2xl border-t border-outline-variant/30 flex justify-around items-center pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]';
        tabBar.innerHTML = `
            <a href="index.html" data-tab="index.html" class="flex flex-col items-center gap-0.5 text-on-surface-variant py-1 px-3 rounded-xl ios-touch transition-all">
                <span class="material-symbols-outlined text-2xl">home</span>
                <span class="text-[10px] font-medium font-sans">Home</span>
            </a>
            <a href="timeline.html" data-tab="timeline.html" class="flex flex-col items-center gap-0.5 text-on-surface-variant py-1 px-3 rounded-xl ios-touch transition-all">
                <span class="material-symbols-outlined text-2xl">auto_stories</span>
                <span class="text-[10px] font-medium font-sans">Timeline</span>
            </a>
            <a href="gallery.html" data-tab="gallery.html" class="flex flex-col items-center gap-0.5 text-on-surface-variant py-1 px-3 rounded-xl ios-touch transition-all">
                <span class="material-symbols-outlined text-2xl">photo_library</span>
                <span class="text-[10px] font-medium font-sans">Gallery</span>
            </a>
            <a href="letter.html" data-tab="letter.html" class="flex flex-col items-center gap-0.5 text-on-surface-variant py-1 px-3 rounded-xl ios-touch transition-all">
                <span class="material-symbols-outlined text-2xl">favorite</span>
                <span class="text-[10px] font-medium font-cairo">رسالة</span>
            </a>
        `;
        document.body.appendChild(tabBar);
        updateActiveTab();
    }

    function updateActiveTab() {
        const path = location.pathname.split('/').pop() || 'index.html';
        const tabs = document.querySelectorAll('#ios-bottom-tabbar a');
        tabs.forEach(tab => {
            const tabHref = tab.getAttribute('data-tab');
            if (tabHref === path || (path === '' && tabHref === 'index.html')) {
                tab.classList.add('ios-tab-active', 'font-bold');
                tab.classList.remove('text-on-surface-variant');
            } else {
                tab.classList.remove('ios-tab-active', 'font-bold');
                tab.classList.add('text-on-surface-variant');
            }
        });
    }

    // 4. Seamless SPA Navigation (Audio NEVER pauses when changing pages!)
    function initSeamlessNavigation() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

            // Target is an internal page
            if (href.endsWith('.html') || href === 'index.html' || href === 'timeline.html' || href === 'gallery.html' || href === 'letter.html') {
                e.preventDefault();
                navigateSeamlessly(href);
            }
        });

        window.addEventListener('popstate', function() {
            const page = location.pathname.split('/').pop() || 'index.html';
            navigateSeamlessly(page, false);
        });
    }

    async function navigateSeamlessly(url, pushState = true) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                window.location.href = url;
                return;
            }
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            // Update title
            document.title = doc.title;

            // Update Main and Header
            const newMain = doc.querySelector('main');
            const oldMain = document.querySelector('main');
            if (newMain && oldMain) {
                oldMain.innerHTML = newMain.innerHTML;
                oldMain.className = newMain.className;
            }

            // Update Header nav active indicators
            const newHeader = doc.querySelector('header');
            const oldHeader = document.querySelector('header');
            if (newHeader && oldHeader) {
                oldHeader.innerHTML = newHeader.innerHTML;
            }

            // Update footer
            const newFooter = doc.querySelector('footer');
            const oldFooter = document.querySelector('footer');
            if (newFooter && oldFooter) {
                oldFooter.innerHTML = newFooter.innerHTML;
            }

            if (pushState) {
                history.pushState(null, '', url);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Re-run inline scripts from new page
            const scripts = doc.querySelectorAll('main script, body > script:not([src="shared.js"])');
            scripts.forEach(s => {
                const newScript = document.createElement('script');
                if (s.src) {
                    newScript.src = s.src;
                } else {
                    newScript.textContent = s.textContent;
                }
                document.body.appendChild(newScript);
                setTimeout(() => newScript.remove(), 100);
            });

            // Update active mobile tab
            updateActiveTab();

            // Initialize page-specific features
            initCounter();

            // Timeline observers
            const scrollElements = document.querySelectorAll('.scroll-reveal');
            if (scrollElements.length > 0) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('active');
                            const line = entry.target.querySelector('.mobile-draw-line');
                            if (line) line.style.height = '100%';
                        }
                    });
                }, { threshold: 0.1 });
                scrollElements.forEach(el => observer.observe(el));
            }

            // Keep audio playing seamlessly!
            playAudio();

        } catch (err) {
            window.location.href = url;
        }
    }

    // 5. Realtime Love Counter
    function initCounter() {
        function updateCounter() {
            let s = Math.max(0, Math.floor((Date.now() - START_DATE.getTime()) / 1000));
            let d = Math.floor(s / 86400);
            s %= 86400;
            let h = Math.floor(s / 3600);
            s %= 3600;
            let m = Math.floor(s / 60);
            s %= 60;

            const daysEl = document.getElementById('love-days');
            const hoursEl = document.getElementById('love-hours');
            const minsEl = document.getElementById('love-mins');
            const secsEl = document.getElementById('love-secs');

            if (daysEl) daysEl.textContent = d.toLocaleString('en-US');
            if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
            if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
            if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
        }

        updateCounter();
        if (!window._loveCounterInterval) {
            window._loveCounterInterval = setInterval(updateCounter, 1000);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectMobileStyles();
        initPlayer();
        initMobileTabBar();
        initAuth();
        initCounter();
        initSeamlessNavigation();
    });
})();
