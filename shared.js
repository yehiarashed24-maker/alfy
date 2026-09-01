// Shared Auth, Continuous Audio Player, iOS Bottom TabBar, Love Counter, and Universal Modals System
(function () {
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

    // Global Mobile & App-Wide CSS Injection
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
                background: radial-gradient(circle at 50% 30%, #ffd8e7 0%, #fff0f5 45%, #fce7f3 100%) !important;
                min-height: 100vh;
                -webkit-font-smoothing: antialiased;
                overscroll-behavior-y: none;
                padding-bottom: env(safe-area-inset-bottom);
            }
            /* Prevent horizontal overflow */
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

            /* Universal 3D Envelope Cards */
            .envelope-3d-card {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 240, 245, 0.88) 100%) !important;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1.5px solid rgba(244, 114, 182, 0.55) !important;
                border-radius: 1.25rem !important;
                box-shadow: 0 10px 25px -4px rgba(164, 48, 115, 0.14), 0 4px 10px rgba(0, 0, 0, 0.03) !important;
                transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                perspective: 1000px;
                position: relative;
            }
            .envelope-3d-card:hover {
                transform: translateY(-8px) scale(1.03) !important;
                border-color: rgba(236, 72, 153, 0.95) !important;
                box-shadow: 0 20px 40px -6px rgba(164, 48, 115, 0.28), 0 0 25px rgba(244, 114, 182, 0.25) !important;
            }

            /* Universal Timeline Glass Cards */
            .timeline-glass-card {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 240, 245, 0.88) 100%) !important;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1.5px solid rgba(251, 207, 232, 0.8) !important;
                border-radius: 1.25rem !important;
                box-shadow: 0 10px 30px rgba(164, 48, 115, 0.1) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            .timeline-glass-card:hover {
                transform: translateY(-4px) !important;
                box-shadow: 0 16px 36px rgba(164, 48, 115, 0.18) !important;
                border-color: rgba(244, 114, 182, 0.9) !important;
            }

            /* Universal Gallery Cards */
            .glass-card {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 240, 245, 0.88) 100%) !important;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1.5px solid rgba(251, 207, 232, 0.8) !important;
                border-radius: 1.25rem !important;
                box-shadow: 0 10px 30px rgba(164, 48, 115, 0.1) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            /* Floating Hearts */
            .floating-heart {
                position: absolute;
                animation: float 15s infinite linear;
                opacity: 0;
                pointer-events: none;
                color: #fc79bd;
            }
            @keyframes float {
                0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
                10% { opacity: 0.4; }
                90% { opacity: 0.4; }
                100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
            }

            /* Scroll Reveal */
            .scroll-reveal {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease-out, transform 0.8s ease-out;
            }
            .scroll-reveal.visible, .scroll-reveal.active {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Burst hearts effect on tap
    function burstHearts(x, y) {
        for (let i = 0; i < 6; i++) {
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

    // Global Letter Modal System (Appended directly to document.body with z-[999999] & inline styling)
    function initLoveModal() {
        let modal = document.getElementById('love-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'love-modal';
            document.body.appendChild(modal);
        }
        modal.style.cssText = 'position:fixed; inset:0; z-index:999999; background:rgba(74, 4, 78, 0.45); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); display:none; align-items:center; justify-content:center; padding:1rem;';
        modal.innerHTML = `
            <div style="background:rgba(255, 245, 248, 0.98); border:1.5px solid #fbcfe8; border-radius:1.5rem; max-width:32rem; width:100%; padding:2rem 1.5rem; text-align:center; position:relative; box-shadow:0 25px 50px -12px rgba(164, 48, 115, 0.3); margin:auto;">
                <button type="button" onclick="closeLetterModal()" style="position:absolute; top:1rem; left:1rem; width:2.25rem; height:2.25rem; border-radius:9999px; background:#ffe4e6; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#a43073; box-shadow:0 1px 3px rgba(0,0,0,0.1);" title="إغلاق">
                    <span class="material-symbols-outlined" style="font-size:1.25rem;">close</span>
                </button>
                <div style="width:3.5rem; height:3.5rem; border-radius:9999px; background:#fbcfe8; border:1px solid #f472b6; display:flex; align-items:center; justify-content:center; margin:0 auto 0.75rem auto;">
                    <span class="material-symbols-outlined animate-pulse" style="font-size:2rem; color:#a43073;">favorite</span>
                </div>
                <div style="color:#a43073; font-weight:700; font-size:1.05rem; margin-bottom:0.75rem; letter-spacing:0.05em; font-family:'Cairo', sans-serif;">رسالة حب خاصة لسارة ❤️</div>
                <div style="background:#fff0f5; border:1px solid #fbcfe8; border-radius:1rem; padding:1.25rem; margin:1rem 0; box-shadow:inset 0 2px 4px rgba(0,0,0,0.03);">
                    <p id="modal-letter-text" style="color:#4a044e; font-size:1.15rem; line-height:1.8; font-weight:600; margin:0; direction:rtl; text-align:center; font-family:'Cairo', sans-serif;" dir="rtl">
                        "${SARA_MESSAGES[0]}"
                    </p>
                </div>
                <div style="width:5rem; height:2px; background:linear-gradient(to right, transparent, #a43073, transparent); margin:1rem auto;"></div>
                <div style="display:flex; align-items:center; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
                    <button type="button" onclick="openNextLetter(event)" style="padding:0.7rem 1.5rem; border-radius:9999px; background:#fc79bd; color:#ffffff; font-weight:700; font-size:0.95rem; border:none; cursor:pointer; display:flex; align-items:center; gap:0.5rem; box-shadow:0 4px 14px rgba(252, 121, 189, 0.4); font-family:'Cairo', sans-serif; transition:all 0.2s;">
                        <span>رسالة تانية لسارة</span>
                        <span class="material-symbols-outlined" style="font-size:1rem;">arrow_forward</span>
                    </button>
                    <button type="button" onclick="closeLetterModal()" style="padding:0.7rem 1.5rem; border-radius:9999px; background:#ffe4e6; color:#a43073; font-weight:700; font-size:0.95rem; border:1px solid #fbcfe8; cursor:pointer; font-family:'Cairo', sans-serif; transition:all 0.2s;">
                        إغلاق
                    </button>
                </div>
            </div>
        `;

        modal.onclick = (e) => {
            if (e.target.id === 'love-modal') window.closeLetterModal();
        };

        return modal;
    }

    window.openLetter = function(idx, e) {
        const modal = initLoveModal();
        currentLetterIdx = (typeof idx === 'number' ? idx : 0) % SARA_MESSAGES.length;
        const textEl = document.getElementById('modal-letter-text');
        if (textEl) textEl.textContent = SARA_MESSAGES[currentLetterIdx];
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
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
        const x = (e && e.clientX) ? e.clientX : (window.innerWidth / 2);
        const y = (e && e.clientY) ? e.clientY : (window.innerHeight / 2);
        burstHearts(x, y);
    };

    window.closeLetterModal = function() {
        const modal = document.getElementById('love-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Gallery Album Data & Interactive Lightbox System
    const YEAR_PHOTOS = {
        '2022': [
            { src: 'assets/2022/01_first_memory_bechamel.jpg', caption: '🍝 أول ذكرى (المكرونة بالبشاميل واشطا) • بداية الحكاية ❤️' },
            { src: 'assets/2022/2022_memory_1.jpg', caption: 'أول أيام حبنا وبداية أجمل قصة في 2022 ✨' },
            { src: 'assets/2022/2022_memory_2.jpg', caption: 'ضحكات ولحظات لا تُنسى في 2022 🌸' }
        ],
        '2023': [
            { src: 'assets/2023/2023_memory_2.jpg', caption: 'سنة الذكريات واللحظات الحلوة والسفريات ✨' },
            { src: 'assets/2023/2023_memory_1.jpg', caption: 'ضحكات متتنسيش مع سوسو في 2023 🌸' }
        ],
        '2024': [
            { src: 'assets/2024/2024_medicine.jpg', caption: '🩺 دكتورة سوسو في كلية الطب • فخور بيكي دايماً 💖' },
            { src: 'assets/2024/2024_memory_2.jpg', caption: 'حب بيكبر ومحطات أجمل سوا في 2024 🌹' },
            { src: 'assets/2024/2024_memory_1.jpg', caption: 'أحلى سهرات ولقاءات سنة 2024 ✨' }
        ],
        '2025': [
            { src: 'assets/2025/2025_memory_2.jpg', caption: 'ليلة النيل والاحتفال الجميل مع أحلى قمر 🌙' },
            { src: 'assets/2025/2025_memory_1.jpg', caption: 'أحلى سهرة واحتفال في 2025 ✨' }
        ],
        '2026': [
            { src: 'assets/2026/2026_hijab.jpg', caption: 'خطوة الحجاب وسارة القمر • أجمل وأرق بنت في الكون ❤️' }
        ]
    };

    let currentLightboxYear = '2026';
    let currentLightboxIdx = 0;

    function initGalleryModal() {
        let modal = document.getElementById('album-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'album-modal';
            document.body.appendChild(modal);
        }
        modal.style.cssText = 'position:fixed; inset:0; z-index:999999; background:rgba(255, 240, 245, 0.96); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); display:none; flex-direction:column; overflow-y:auto;';
        return modal;
    }

    window.openModal = function(year) {
        window.openGalleryModal(year);
    };

    window.openGalleryModal = function(year) {
        const modal = initGalleryModal();
        const photos = YEAR_PHOTOS[year] || [];
        currentLightboxYear = year;
        
        modal.innerHTML = `
            <!-- Sticky Modal Header -->
            <div style="position:sticky; top:0; width:100%; background:rgba(255,255,255,0.92); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid #fbcfe8; padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between; z-index:20; box-shadow:0 4px 20px rgba(164,48,115,0.08);">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div style="width:2.5rem; height:2.5rem; border-radius:9999px; background:#fbcfe8; display:flex; align-items:center; justify-content:center; color:#a43073;">
                        <span class="material-symbols-outlined" style="font-size:1.4rem;">photo_library</span>
                    </div>
                    <div>
                        <h3 style="margin:0; font-size:1.25rem; font-weight:700; color:#765469; font-family:'Playfair Display', serif;">ذكريات ${year} • Alfy & Soso ❤️</h3>
                        <span style="font-size:0.8rem; color:#a43073; font-weight:600; font-family:'Cairo', sans-serif;">${photos.length} ذكريات وصور مسجلة</span>
                    </div>
                </div>
                <button onclick="closeGalleryModal()" style="background:#ffffff; border:1px solid #fbcfe8; color:#a43073; padding:0.6rem 1.25rem; border-radius:9999px; font-weight:700; font-size:0.9rem; cursor:pointer; display:flex; align-items:center; gap:0.4rem; box-shadow:0 2px 8px rgba(0,0,0,0.06); font-family:'Cairo', sans-serif; transition:all 0.2s;">
                    <span class="material-symbols-outlined" style="font-size:1.1rem;">close</span>
                    <span>إغلاق الألبوم</span>
                </button>
            </div>

            <!-- Photos Grid -->
            <div style="max-width:1200px; width:100%; margin:0 auto; padding:2rem 1.5rem 6rem 1.5rem; flex-grow:1;">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.75rem;">
                    ${photos.map((p, i) => `
                        <div onclick="openPhotoLightbox('${year}', ${i})" style="background:#ffffff; border:1px solid #fbcfe8; border-radius:1.25rem; overflow:hidden; box-shadow:0 10px 25px -5px rgba(164,48,115,0.12); cursor:pointer; transition:all 0.3s; position:relative;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 18px 35px -5px rgba(164,48,115,0.22)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px -5px rgba(164,48,115,0.12)'">
                            <div style="position:relative; aspect-ratio:4/3; overflow:hidden; background:#fdf2f8;">
                                <img src="${p.src}" alt="${p.caption || 'Memory'}" style="width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"/>
                                <div style="position:absolute; top:0.75rem; right:0.75rem; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); color:#ffffff; font-size:0.75rem; font-weight:600; padding:0.25rem 0.6rem; border-radius:9999px; font-family:'Cairo', sans-serif;">
                                    🔍 اضغط للتكبير
                                </div>
                            </div>
                            <div style="padding:1.15rem; text-align:center;">
                                <p style="margin:0; font-size:0.95rem; font-weight:600; color:#765469; font-family:'Cairo', sans-serif; line-height:1.5;" dir="rtl">${p.caption || ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function() {
        window.closeGalleryModal();
    };

    window.closeGalleryModal = function() {
        const modal = document.getElementById('album-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Fullscreen High-Res Photo Lightbox with Next/Prev
    window.openPhotoLightbox = function(year, idx) {
        currentLightboxYear = year;
        currentLightboxIdx = idx;
        const photos = YEAR_PHOTOS[year] || [];
        const photo = photos[idx];
        if (!photo) return;

        let lightbox = document.getElementById('photo-lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'photo-lightbox';
            document.body.appendChild(lightbox);
        }

        lightbox.style.cssText = 'position:fixed; inset:0; z-index:1000000; background:rgba(15, 23, 42, 0.95); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem;';
        
        lightbox.innerHTML = `
            <!-- Top Bar -->
            <div style="position:absolute; top:1rem; left:1rem; right:1rem; display:flex; justify-content:space-between; align-items:center; z-index:30;">
                <span style="color:#ffffff; font-weight:700; font-size:0.95rem; background:rgba(255,255,255,0.15); padding:0.4rem 1rem; border-radius:9999px; font-family:'Cairo', sans-serif;" dir="rtl">
                    صورة ${idx + 1} من ${photos.length} (${year})
                </span>
                <button onclick="closePhotoLightbox()" style="background:#ffffff; border:none; color:#1e293b; width:2.5rem; height:2.5rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Image & Navigation Arrows -->
            <div style="position:relative; max-width:90vw; max-height:75vh; display:flex; align-items:center; justify-content:center;">
                ${photos.length > 1 ? `
                    <button onclick="navigateLightbox(-1)" style="position:absolute; right:-1rem; md:right:-3rem; background:rgba(255,255,255,0.25); hover:background:rgba(255,255,255,0.5); border:none; color:#ffffff; width:3rem; height:3rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:30; backdrop-filter:blur(8px);">
                        <span class="material-symbols-outlined" style="font-size:1.8rem;">chevron_right</span>
                    </button>
                ` : ''}

                <img id="lightbox-img" src="${photo.src}" alt="${photo.caption}" style="max-width:100%; max-height:75vh; border-radius:1rem; object-fit:contain; box-shadow:0 25px 60px rgba(0,0,0,0.6); border:2px solid rgba(255,255,255,0.2);"/>

                ${photos.length > 1 ? `
                    <button onclick="navigateLightbox(1)" style="position:absolute; left:-1rem; md:left:-3rem; background:rgba(255,255,255,0.25); hover:background:rgba(255,255,255,0.5); border:none; color:#ffffff; width:3rem; height:3rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:30; backdrop-filter:blur(8px);">
                        <span class="material-symbols-outlined" style="font-size:1.8rem;">chevron_left</span>
                    </button>
                ` : ''}
            </div>

            <!-- Bottom Caption -->
            <div style="margin-top:1.25rem; max-width:36rem; text-align:center; padding:0.75rem 1.5rem; background:rgba(255,255,255,0.12); backdrop-filter:blur(10px); border-radius:9999px; border:1px solid rgba(255,255,255,0.2);">
                <p id="lightbox-caption" style="color:#ffffff; margin:0; font-size:1.05rem; font-weight:600; font-family:'Cairo', sans-serif; line-height:1.4;" dir="rtl">
                    ${photo.caption || ''}
                </p>
            </div>
        `;

        lightbox.style.display = 'flex';
    };

    window.navigateLightbox = function(dir) {
        const photos = YEAR_PHOTOS[currentLightboxYear] || [];
        if (photos.length <= 1) return;
        currentLightboxIdx = (currentLightboxIdx + dir + photos.length) % photos.length;
        window.openPhotoLightbox(currentLightboxYear, currentLightboxIdx);
    };

    window.closePhotoLightbox = function() {
        const lightbox = document.getElementById('photo-lightbox');
        if (lightbox) lightbox.style.display = 'none';
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closePhotoLightbox();
            window.closeGalleryModal();
            window.closeLetterModal();
        } else if (e.key === 'ArrowRight') {
            window.navigateLightbox(-1);
        } else if (e.key === 'ArrowLeft') {
            window.navigateLightbox(1);
        }
    });

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
        lockOverlay.className = 'fixed inset-0 z-[100] bg-[#fff0f5]/95 backdrop-blur-2xl flex items-center justify-center p-4';
        lockOverlay.innerHTML = `
            <div class="bg-white/80 backdrop-blur-xl border border-[#fbcfe8] shadow-2xl rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative">
                <div class="w-20 h-20 rounded-full bg-primary-container/40 flex items-center justify-center mx-auto mb-6 shadow-inner border border-secondary/30">
                    <span class="material-symbols-outlined text-4xl text-secondary animate-pulse">lock</span>
                </div>
                <h2 class="font-headline-md text-2xl md:text-3xl text-primary font-bold mb-2">Y ❤️ A</h2>
                <p class="text-on-surface-variant font-body-md text-sm mb-6">بعض الحكايات معمولة مخصوص لينا إحنا وبس...</p>
                <div class="space-y-4">
                    <input id="story-pass-input" type="password" placeholder="Enter password..." class="w-full px-5 py-3.5 rounded-full border border-secondary/30 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-center font-body-md bg-[#fff5f8] transition-all" autocomplete="off"/>
                    <button id="story-unlock-btn" class="w-full py-3.5 rounded-full bg-secondary text-white font-bold hover:bg-secondary/90 shadow-lg shadow-secondary/25 transition-all transform hover:-translate-y-0.5 active:scale-95">
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
        playerDiv.className = 'fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 bg-[#fff0f5]/92 backdrop-blur-2xl border border-[#fbcfe8] rounded-2xl p-2.5 md:p-3 shadow-2xl shadow-secondary/15 flex flex-col gap-1.5 md:gap-2 transition-all duration-300';
        playerDiv.innerHTML = `
            <div class="flex items-center gap-2.5 md:gap-3">
                <img id="player-track-img" src="${currentTrack.img}" alt="Album cover" class="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-secondary/30 shadow-sm flex-shrink-0"/>
                <div class="flex-grow min-w-0">
                    <div id="player-track-title" class="text-primary font-bold text-xs md:text-sm truncate">${currentTrack.title}</div>
                    <div id="player-track-artist" class="text-secondary text-[10px] md:text-xs truncate font-cairo">${currentTrack.artist}</div>
                </div>
                <div class="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                    <button id="global-music-prev" class="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-primary-container/30 text-primary flex items-center justify-center transition-all ios-touch" title="Previous song">
                        <span class="material-symbols-outlined text-sm md:text-base">skip_previous</span>
                    </button>
                    <button id="global-music-play" class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary-container hover:bg-secondary text-white flex items-center justify-center transition-all shadow-sm ios-touch">
                        <span class="material-symbols-outlined text-base md:text-lg" id="play-icon">play_arrow</span>
                    </button>
                    <button id="global-music-next" class="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-primary-container/30 text-primary flex items-center justify-center transition-all ios-touch" title="Next song">
                        <span class="material-symbols-outlined text-sm md:text-base">skip_next</span>
                    </button>
                </div>
            </div>
            <div class="flex items-center gap-2 text-[9px] md:text-[10px] text-on-surface-variant px-1 font-mono">
                <span id="player-cur-time">0:00</span>
                <div id="player-progress-bar" class="flex-grow h-1.5 bg-[#ffd8e7] rounded-full overflow-hidden cursor-pointer relative">
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
                try { audioInstance.currentTime = savedTime; } catch (e) { }
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
        tabBar.className = 'fixed bottom-0 left-0 right-0 z-40 bg-[#fff0f5]/90 backdrop-blur-2xl border-t border-[#fbcfe8] flex justify-around items-center pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden shadow-[0_-4px_20px_rgba(164,48,115,0.08)]';
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
        document.addEventListener('click', function (e) {
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

    // --- Global Page Lifecycles (Singletons to prevent WebGL crashes & context loss) ---
    let heroHeartRenderer = null;
    let heroHeartMesh = null;
    let heroHeartScene = null;
    let heroHeartCamera = null;
    let heroHeartAnimId = null;
    let heroHeartRunning = false;
    let heroMouseX = 0, heroMouseY = 0;

    function setupHeroHeart() {
        const container = document.getElementById('threejs-hero-heart');
        if (!container) return;

        if (heroHeartRenderer && heroHeartRenderer.domElement) {
            container.innerHTML = '';
            container.appendChild(heroHeartRenderer.domElement);
            if (!heroHeartRunning) {
                heroHeartRunning = true;
                animateHeroHeart();
            }
            return;
        }

        if (typeof THREE === 'undefined') {
            container.innerHTML = '<span class="css-heart-fallback">💖</span>';
            return;
        }

        try {
            heroHeartScene = new THREE.Scene();
            const width = window.innerWidth;
            const height = window.innerHeight;
            heroHeartCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

            heroHeartRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
            heroHeartRenderer.setSize(width, height);
            heroHeartRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            container.innerHTML = '';
            container.appendChild(heroHeartRenderer.domElement);

            const heartShape = new THREE.Shape();
            heartShape.moveTo(0, 0);
            heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
            heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
            heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
            heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);

            const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 8, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
            const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
            geometry.rotateX(Math.PI);
            geometry.translate(0, 0.4, 0);

            const material = new THREE.MeshPhongMaterial({
                color: 0xF472B6,
                shininess: 100,
                specular: 0xffffff,
                emissive: 0xdb2777,
                emissiveIntensity: 0.2
            });
            heroHeartMesh = new THREE.Mesh(geometry, material);
            heroHeartMesh.scale.set(3.0, 3.0, 3.0);
            heroHeartScene.add(heroHeartMesh);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
            heroHeartScene.add(ambientLight);
            const pointLight1 = new THREE.PointLight(0xffffff, 1.2);
            pointLight1.position.set(2, 3, 5);
            heroHeartScene.add(pointLight1);
            const pointLight2 = new THREE.PointLight(0xf472b6, 0.6);
            pointLight2.position.set(-2, -2, 4);
            heroHeartScene.add(pointLight2);

            heroHeartCamera.position.z = 8;

            window.addEventListener('mousemove', (e) => {
                heroMouseX = (e.clientX / window.innerWidth) * 2 - 1;
                heroMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            }, { passive: true });

            window.addEventListener('resize', () => {
                if (!heroHeartRenderer || !heroHeartCamera) return;
                heroHeartCamera.aspect = window.innerWidth / window.innerHeight;
                heroHeartCamera.updateProjectionMatrix();
                heroHeartRenderer.setSize(window.innerWidth, window.innerHeight);
            }, { passive: true });

            heroHeartRunning = true;
            animateHeroHeart();

        } catch (e) {
            console.warn('Hero Heart Init Fallback:', e);
            container.innerHTML = '<span class="css-heart-fallback">💖</span>';
        }
    }

    function animateHeroHeart() {
        if (!heroHeartRunning || !heroHeartRenderer || !heroHeartScene || !heroHeartCamera) return;
        heroHeartAnimId = requestAnimationFrame(animateHeroHeart);

        if (heroHeartMesh) {
            heroHeartMesh.rotation.y += 0.01;
            heroHeartMesh.position.y = Math.sin(Date.now() * 0.002) * 0.25 + (-heroMouseY * 0.1);
            heroHeartMesh.position.x += ((heroMouseX * 0.4) - heroHeartMesh.position.x) * 0.05;

            const scale = 3.0 + Math.sin(Date.now() * 0.004) * 0.15;
            heroHeartMesh.scale.set(scale, scale, scale);
        }

        heroHeartRenderer.render(heroHeartScene, heroHeartCamera);
    }

    function pauseHeroHeart() {
        heroHeartRunning = false;
        if (heroHeartAnimId) cancelAnimationFrame(heroHeartAnimId);
    }

    window.initHeroHeart = setupHeroHeart;

    // Timeline Initializer
    window.initTimelinePage = function() {
        const scrollElements = document.querySelectorAll('.scroll-reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'active');
                }
            });
        }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" });

        scrollElements.forEach(el => {
            observer.observe(el);
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible', 'active');
            }
        });

        const drawPath = document.querySelector('.draw-path');
        const mobileDrawLine = document.querySelector('.mobile-draw-line');
        const timelineContainer = document.getElementById('timeline-container');
        
        if (drawPath && timelineContainer) {
            const length = drawPath.getTotalLength();
            drawPath.style.strokeDasharray = length;
            drawPath.style.strokeDashoffset = length;

            const onScrollTimeline = () => {
                const rect = timelineContainer.getBoundingClientRect();
                const containerTop = rect.top;
                const containerHeight = rect.height;
                const windowHeight = window.innerHeight;
                
                let scrollProgress = 0;
                if (containerTop < windowHeight) {
                    scrollProgress = (windowHeight - containerTop) / (containerHeight + windowHeight * 0.3);
                }
                scrollProgress = Math.max(0, Math.min(1, scrollProgress));
                
                const draw = length * scrollProgress;
                drawPath.style.strokeDashoffset = length - draw;
                
                if (mobileDrawLine) {
                    mobileDrawLine.style.height = `${scrollProgress * 100}%`;
                }
            };

            window.removeEventListener('scroll', window._timelineScrollHandler);
            window._timelineScrollHandler = onScrollTimeline;
            window.addEventListener('scroll', onScrollTimeline, { passive: true });
            onScrollTimeline();
        }

        initFloatingHearts();
    };

    // Letter Initializer
    window.initLetterPage = function() {
        initFloatingHearts();
    };

    // Gallery Initializer
    window.initGalleryPage = function() {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
    };

    function initFloatingHearts() {
        const container = document.getElementById('hearts-container');
        if (!container) return;
        container.innerHTML = '';
        const heartCount = 15;
        for(let i = 0; i < heartCount; i++) {
            const heart = document.createElement('span');
            heart.className = 'material-symbols-outlined floating-heart';
            heart.textContent = 'favorite';
            const leftPos = Math.random() * 100;
            const size = 16 + Math.random() * 24;
            const animDuration = 10 + Math.random() * 15;
            const animDelay = Math.random() * 10;
            heart.style.left = `${leftPos}%`;
            heart.style.fontSize = `${size}px`;
            heart.style.animationDuration = `${animDuration}s`;
            heart.style.animationDelay = `${animDelay}s`;
            const colors = ['#fc79bd', '#e5bad3', '#ffafd3'];
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(heart);
        }
    }

    // 4. Seamless SPA Navigation (Audio NEVER pauses when changing pages!)
    function initSeamlessNavigation() {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

            if (href.endsWith('.html') || href === 'index.html' || href === 'timeline.html' || href === 'gallery.html' || href === 'letter.html') {
                e.preventDefault();
                navigateSeamlessly(href);
            }
        });

        window.addEventListener('popstate', function () {
            const page = location.pathname.split('/').pop() || 'index.html';
            navigateSeamlessly(page, false);
        });
    }

    const pageCache = {};

    async function navigateSeamlessly(url, pushState = true) {
        try {
            let htmlText = pageCache[url];
            if (!htmlText) {
                const response = await fetch(url);
                if (!response.ok) {
                    window.location.href = url;
                    return;
                }
                htmlText = await response.text();
                pageCache[url] = htmlText;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            document.title = doc.title;

            const newMain = doc.querySelector('main');
            const oldMain = document.querySelector('main');
            if (newMain && oldMain) {
                oldMain.innerHTML = newMain.innerHTML;
                oldMain.className = newMain.className;
            }

            const newHeader = doc.querySelector('header');
            const oldHeader = document.querySelector('header');
            if (newHeader && oldHeader) {
                oldHeader.innerHTML = newHeader.innerHTML;
            }

            const newFooter = doc.querySelector('footer');
            const oldFooter = document.querySelector('footer');
            if (newFooter && oldFooter) {
                oldFooter.innerHTML = newFooter.innerHTML;
            }

            if (pushState) {
                history.pushState(null, '', url);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });

            updateActiveTab();
            initLoveModal();
            initCounter();

            const targetPage = (url.split('/').pop().split('?')[0] || 'index.html');
            if (targetPage === 'index.html' || targetPage === '') {
                setupHeroHeart();
            } else {
                pauseHeroHeart();
                if (targetPage === 'timeline.html') {
                    window.initTimelinePage();
                } else if (targetPage === 'gallery.html') {
                    window.initGalleryPage();
                } else if (targetPage === 'letter.html') {
                    window.initLetterPage();
                }
            }

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
        initLoveModal();
        initCounter();
        initSeamlessNavigation();

        const curPage = location.pathname.split('/').pop() || 'index.html';
        if (curPage === 'index.html' || curPage === '') {
            setupHeroHeart();
        } else if (curPage === 'timeline.html') {
            window.initTimelinePage();
        } else if (curPage === 'gallery.html') {
            window.initGalleryPage();
        } else if (curPage === 'letter.html') {
            window.initLetterPage();
        }
    });
})();
