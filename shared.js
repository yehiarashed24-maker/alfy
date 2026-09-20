// Shared Auth, Continuous Audio Player, iOS Bottom TabBar, Love Counter, and Universal Modals System
(function () {
    const START_DATE = new Date('2022-11-06T00:00:00+02:00');

    // Playlist with multiple romantic songs
    const PLAYLIST = [
        {
            title: 'Nano (نانو)',
            artist: 'TUL8TE & Saint Levant • سوسو ❤️',
            src: 'assets/audio/nano.mp3',
            img: 'assets/audio/cover_nano.jpg'
        },
        {
            title: 'Tamally Maak (تملي معاك)',
            artist: 'Amr Diab • سوسو ❤️',
            src: 'https://soso-our-storyy.vercel.app/02.Tamally_Maak.mp3',
            img: 'assets/audio/cover_tamally_maak.jpg'
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

            /* Responsive Album Modal Styling */
            .album-modal-header {
                position: sticky;
                top: 0;
                width: 100%;
                background: rgba(255, 255, 255, 0.94);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-bottom: 1px solid #fbcfe8;
                padding: max(0.85rem, env(safe-area-inset-top, 0.85rem)) 1.25rem 0.85rem 1.25rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                z-index: 20;
                box-shadow: 0 4px 20px rgba(164, 48, 115, 0.08);
                gap: 0.75rem;
            }
            .album-modal-title-box {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                min-width: 0;
                flex: 1;
            }
            .album-modal-icon {
                width: 2.35rem;
                height: 2.35rem;
                border-radius: 9999px;
                background: #fbcfe8;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #a43073;
                flex-shrink: 0;
            }
            .album-modal-heading {
                margin: 0;
                font-size: 1.15rem;
                font-weight: 700;
                color: #765469;
                font-family: 'Cairo', 'Playfair Display', serif;
                line-height: 1.3;
            }
            .album-modal-subtitle {
                font-size: 0.78rem;
                color: #a43073;
                font-weight: 600;
                font-family: 'Cairo', sans-serif;
                display: block;
                margin-top: 0.1rem;
            }
            .album-modal-close-btn {
                background: #ffffff;
                border: 1px solid #fbcfe8;
                color: #a43073;
                padding: 0.5rem 1rem;
                border-radius: 9999px;
                font-weight: 700;
                font-size: 0.85rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                font-family: 'Cairo', sans-serif;
                transition: all 0.2s;
                flex-shrink: 0;
                white-space: nowrap;
            }
            .album-photos-container {
                max-width: 1200px;
                width: 100%;
                margin: 0 auto;
                padding: 1.75rem 1.25rem 6rem 1.25rem;
                flex-grow: 1;
            }
            .album-photos-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
                gap: 1.5rem;
            }

            @media (max-width: 640px) {
                .album-modal-header {
                    padding: max(0.65rem, env(safe-area-inset-top, 0.65rem)) 0.75rem 0.65rem 0.75rem !important;
                    gap: 0.5rem !important;
                }
                .album-modal-icon {
                    width: 2rem !important;
                    height: 2rem !important;
                }
                .album-modal-icon span {
                    font-size: 1.15rem !important;
                }
                .album-modal-heading {
                    font-size: 0.92rem !important;
                    line-height: 1.25 !important;
                }
                .album-modal-subtitle {
                    font-size: 0.7rem !important;
                }
                .album-modal-close-btn {
                    padding: 0.4rem 0.75rem !important;
                    font-size: 0.78rem !important;
                    gap: 0.25rem !important;
                }
                .album-modal-close-btn span.material-symbols-outlined {
                    font-size: 1rem !important;
                }
                .album-photos-container {
                    padding: 1rem 0.75rem 5.5rem 0.75rem !important;
                }
                .album-photos-grid {
                    grid-template-columns: 1fr !important;
                    gap: 1rem !important;
                }
                .lightbox-nav-btn {
                    width: 2.5rem !important;
                    height: 2.5rem !important;
                }
                .lightbox-nav-btn span {
                    font-size: 1.4rem !important;
                }
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

            /* Neon Audio Visualizer Ring */
            .neon-playing {
                opacity: 1 !important;
                transform: scale(1.08) !important;
                animation: neonPulseRing 2s infinite ease-in-out !important;
            }
            @keyframes neonPulseRing {
                0% {
                    box-shadow: 0 0 12px rgba(244, 114, 182, 0.85), 0 0 25px rgba(236, 72, 153, 0.65), inset 0 0 10px rgba(251, 207, 232, 0.5);
                    border-color: rgba(244, 114, 182, 0.9);
                }
                50% {
                    box-shadow: 0 0 24px rgba(236, 72, 153, 0.95), 0 0 42px rgba(219, 39, 119, 0.85), inset 0 0 18px rgba(244, 114, 182, 0.7);
                    border-color: rgba(236, 72, 153, 1);
                }
                100% {
                    box-shadow: 0 0 12px rgba(244, 114, 182, 0.85), 0 0 25px rgba(236, 72, 153, 0.65), inset 0 0 10px rgba(251, 207, 232, 0.5);
                    border-color: rgba(244, 114, 182, 0.9);
                }
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
            <div style="background:rgba(255, 245, 248, 0.98); border:1.5px solid #fbcfe8; border-radius:1.5rem; max-width:32rem; width:100%; max-height:88vh; overflow-y:auto; padding:1.75rem 1.25rem; text-align:center; position:relative; box-shadow:0 25px 50px -12px rgba(164, 48, 115, 0.3); margin:auto;">
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

    window.openLetter = function (idx, e) {
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

    window.openRandomLetter = function (e) {
        const rand = Math.floor(Math.random() * SARA_MESSAGES.length);
        window.openLetter(rand, e);
    };

    window.openNextLetter = function (e) {
        currentLetterIdx = (currentLetterIdx + 1) % SARA_MESSAGES.length;
        const textEl = document.getElementById('modal-letter-text');
        if (textEl) textEl.textContent = SARA_MESSAGES[currentLetterIdx];
        const x = (e && e.clientX) ? e.clientX : (window.innerWidth / 2);
        const y = (e && e.clientY) ? e.clientY : (window.innerHeight / 2);
        burstHearts(x, y);
    };

    window.closeLetterModal = function () {
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
            { src: 'assets/2023/2023_memory_1.jpg', caption: 'ضحكات متتنسيش مع سوسو في 2023 🌸' },
            { src: 'assets/2023/image.jpeg', caption: 'لحظات دافئة وضحكة من القلب مع سارة ❤️' }
        ],
        '2024': [
            { src: 'assets/2024/2024_medicine.jpg', caption: '🩺 دكتورة سوسو في كلية الطب • فخور بيكي دايماً 💖' },
            { src: 'assets/2024/2024_memory_2.jpg', caption: 'حب بيكبر ومحطات أجمل سوا في 2024 🌹' },
            { src: 'assets/2024/2024_memory_1.jpg', caption: 'أحلى سهرات ولقاءات سنة 2024 ✨' }
        ],
        '2025': [
            { src: 'assets/2025/2025_hijab.jpg', caption: '🤍 خطوة الحجاب وسارة القمر • أجمل وأرق بنت في الكون ❤️' },
            { src: 'assets/2025/2025_memory_2.jpg', caption: 'ليلة النيل والاحتفال الجميل مع أحلى قمر 🌙' },
            { src: 'assets/2025/2025_memory_1.jpg', caption: 'أحلى سهرة واحتفال في 2025 ✨' }
        ],
        '2026': [
            { src: 'assets/2026/2026_memory_1.jpg', caption: '🌸 ضحكات ولحظات مميزة مع القمر سوسو ✨', pos: 'center 75%' },
            { src: 'assets/2026/2026_memory_2.jpg', caption: '💖 أحلى الذكريات والأوقات سوا في 2026 🌹', pos: 'center 60%' },
            { src: 'assets/2026/2026_memory_3.jpg', caption: '✨ جمالك ونورك اللي منوّر كل أيامي 🌙', pos: 'center 20%' },
            { src: 'assets/2026/2026_memory_4.jpg', caption: '🌹 فرحتي معاكي في كل لحظة وفي كل مكان ❤️', pos: 'center 30%' },
            { src: 'assets/2026/2026_memory_5.jpg', caption: '💖 ابتسامة سارة اللي بتاخد العقل وتخطف القلب ✨', pos: 'center 25%' },
            { src: 'assets/2026/2026_memory_6.jpg', caption: '🌸 الراحة والأمان والضحكة الحلوة في عيونك ❤️', pos: 'center 30%' },
            { src: 'assets/2026/2026_memory_7.jpg', caption: '💍 كل يوم في 2026 معاكي بداية جديدة للحبيبة الغالية ✨', pos: 'center 25%' },
            { src: 'assets/2026/2026_memory_8.jpg', caption: '🚗 أحلى حركة وضحكة شقاوة في العربية مع سوسو القمر ❤️', pos: 'center 75%' },
            { src: 'assets/2026/2026_memory_9.jpg', caption: '🌅 لقطة غروب ساحرة على البحر مع سارة حبيبتي ✨', pos: 'center 30%' },
            { src: 'assets/2026/2026_memory_10.jpg', caption: '🌙 أجواء رمضان الجميلة مع سوسو ونور الفوانيس 💖', pos: 'center 25%' },
            { src: 'assets/2026/2026_memory_11.jpg', caption: '🎂 أحلى عيد ميلاد (20) لأغلى وأجمل سارة في الدنيا 🎈🌹', pos: 'center 35%' },
            { src: 'assets/2026/2026_memory_12.jpg', caption: '🪞 سيلفي المرايا الحلو والورد منوّر الصورة بجمالك ❤️', pos: 'center 30%' },
            { src: 'assets/2026/2026_memory_13.jpg', caption: '🍳 أحلى فطار شرقي وفطير مشلتت مع القمر سوسو 😋❤️', pos: 'center 25%' },
            { src: 'assets/2026/2026_memory_14.jpg', caption: '🧃 سوسو وحركات الشقاوة مع عصير سيتي درينك الفريش 🍍✨', pos: 'center 25%' },
            { src: 'assets/2026/2026_memory_15.jpg', caption: '🕌 انعكاس سيلفي خطير في قبة الفانوس الذهبي المميز 🌙💖', pos: 'center 40%' },
            { src: 'assets/2026/2026_memory_16.jpg', caption: '✨ أحلى سيلفي وحركات الدك فيس سوا في سهرة بالليل 🌙❤️', pos: 'center 25%' }
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

    window.openModal = function (year) {
        window.openGalleryModal(year);
    };

    window.openGalleryModal = function (year) {
        const modal = initGalleryModal();
        const photos = YEAR_PHOTOS[year] || [];
        currentLightboxYear = year;

        modal.innerHTML = `
            <!-- Sticky Modal Header -->
            <div class="album-modal-header">
                <div class="album-modal-title-box">
                    <div class="album-modal-icon">
                        <span class="material-symbols-outlined">photo_library</span>
                    </div>
                    <div style="min-width:0; flex:1;">
                        <h3 class="album-modal-heading">ذكريات ${year} • Alfy & Soso ❤️</h3>
                        <span class="album-modal-subtitle">${photos.length} ذكريات وصور مسجلة</span>
                    </div>
                </div>
                <button onclick="closeGalleryModal()" class="album-modal-close-btn">
                    <span class="material-symbols-outlined">close</span>
                    <span>إغلاق الألبوم</span>
                </button>
            </div>

            <!-- Photos Grid -->
            <div class="album-photos-container">
                <div class="album-photos-grid">
                    ${photos.map((p, i) => `
                        <div onclick="openPhotoLightbox('${year}', ${i})" style="background:#ffffff; border:1px solid #fbcfe8; border-radius:1.25rem; overflow:hidden; box-shadow:0 10px 25px -5px rgba(164,48,115,0.12); cursor:pointer; transition:all 0.3s; position:relative;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 18px 35px -5px rgba(164,48,115,0.22)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px -5px rgba(164,48,115,0.12)'">
                            <div style="position:relative; aspect-ratio:4/5; overflow:hidden; background:#fdf2f8;">
                                <img src="${p.src}" alt="${p.caption || 'Memory'}" style="width:100%; height:100%; object-fit:cover; object-position:${p.pos || 'center 30%'}; display:block; transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"/>
                                <div style="position:absolute; top:0.6rem; right:0.6rem; background:rgba(0,0,0,0.55); backdrop-filter:blur(6px); color:#ffffff; font-size:0.72rem; font-weight:600; padding:0.2rem 0.55rem; border-radius:9999px; font-family:'Cairo', sans-serif;">
                                    🔍 اضغط للتكبير
                                </div>
                            </div>
                            <div style="padding:1rem; text-align:center;">
                                <p style="margin:0; font-size:0.92rem; font-weight:600; color:#765469; font-family:'Cairo', sans-serif; line-height:1.4;" dir="rtl">${p.caption || ''}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function () {
        window.closeGalleryModal();
    };

    window.closeGalleryModal = function () {
        const modal = document.getElementById('album-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Fullscreen High-Res Photo Lightbox with Next/Prev
    window.openPhotoLightbox = function (year, idx) {
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
            <div style="position:absolute; top:max(0.75rem, env(safe-area-inset-top)); left:0.75rem; right:0.75rem; display:flex; justify-content:space-between; align-items:center; z-index:30;">
                <span style="color:#ffffff; font-weight:700; font-size:0.85rem; background:rgba(255,255,255,0.18); backdrop-filter:blur(8px); padding:0.35rem 0.85rem; border-radius:9999px; font-family:'Cairo', sans-serif;" dir="rtl">
                    صورة ${idx + 1} من ${photos.length} (${year})
                </span>
                <button onclick="closePhotoLightbox()" style="background:#ffffff; border:none; color:#1e293b; width:2.25rem; height:2.25rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.3); flex-shrink:0;">
                    <span class="material-symbols-outlined" style="font-size:1.2rem;">close</span>
                </button>
            </div>

            <!-- Image & Navigation Arrows -->
            <div style="position:relative; width:100%; max-width:92vw; max-height:68vh; display:flex; align-items:center; justify-content:center;">
                ${photos.length > 1 ? `
                    <button onclick="navigateLightbox(-1)" class="lightbox-nav-btn" style="position:absolute; right:0.25rem; background:rgba(255,255,255,0.25); border:none; color:#ffffff; width:2.75rem; height:2.75rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:30; backdrop-filter:blur(8px); box-shadow:0 4px 12px rgba(0,0,0,0.25);">
                        <span class="material-symbols-outlined" style="font-size:1.6rem;">chevron_right</span>
                    </button>
                ` : ''}

                <img id="lightbox-img" src="${photo.src}" alt="${photo.caption}" style="max-width:100%; max-height:68vh; border-radius:1rem; object-fit:contain; box-shadow:0 25px 60px rgba(0,0,0,0.6); border:1.5px solid rgba(255,255,255,0.2);"/>

                ${photos.length > 1 ? `
                    <button onclick="navigateLightbox(1)" class="lightbox-nav-btn" style="position:absolute; left:0.25rem; background:rgba(255,255,255,0.25); border:none; color:#ffffff; width:2.75rem; height:2.75rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:30; backdrop-filter:blur(8px); box-shadow:0 4px 12px rgba(0,0,0,0.25);">
                        <span class="material-symbols-outlined" style="font-size:1.6rem;">chevron_left</span>
                    </button>
                ` : ''}
            </div>

            <!-- Bottom Caption -->
            <div style="margin-top:1rem; max-width:90vw; text-align:center; padding:0.6rem 1.25rem; background:rgba(255,255,255,0.15); backdrop-filter:blur(12px); border-radius:9999px; border:1px solid rgba(255,255,255,0.25);">
                <p id="lightbox-caption" style="color:#ffffff; margin:0; font-size:0.9rem; font-weight:600; font-family:'Cairo', sans-serif; line-height:1.4;" dir="rtl">
                    ${photo.caption || ''}
                </p>
            </div>
        `;

        lightbox.style.display = 'flex';

        // Mobile touch swipe gesture
        let touchStartX = 0;
        lightbox.ontouchstart = (e) => {
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
            }
        };
        lightbox.ontouchend = (e) => {
            if (e.changedTouches && e.changedTouches[0]) {
                const touchEndX = e.changedTouches[0].clientX;
                const diffX = touchStartX - touchEndX;
                if (Math.abs(diffX) > 40) {
                    if (diffX > 0) {
                        window.navigateLightbox(1);
                    } else {
                        window.navigateLightbox(-1);
                    }
                }
            }
        };
    };

    window.navigateLightbox = function (dir) {
        const photos = YEAR_PHOTOS[currentLightboxYear] || [];
        if (photos.length <= 1) return;
        currentLightboxIdx = (currentLightboxIdx + dir + photos.length) % photos.length;
        window.openPhotoLightbox(currentLightboxYear, currentLightboxIdx);
    };

    window.closePhotoLightbox = function () {
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

    // Ensure GSAP and Canvas Confetti are available
    function ensureScriptLoaded(globalVar, localSrc, cdnSrc, callback) {
        if (typeof window[globalVar] !== 'undefined') {
            if (callback) callback();
            return;
        }
        const s = document.createElement('script');
        s.src = localSrc;
        s.onload = () => { if (callback) callback(); };
        s.onerror = () => {
            const fb = document.createElement('script');
            fb.src = cdnSrc;
            fb.onload = () => { if (callback) callback(); };
            document.head.appendChild(fb);
        };
        document.head.appendChild(s);
    }
    ensureScriptLoaded('confetti', 'assets/vendor/confetti.browser.js', 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js');
    ensureScriptLoaded('gsap', 'assets/vendor/gsap.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');

    // Web Audio Sound Synthesizer for realistic iPhone message chimes & cinematic whoosh
    function playChatSound(type) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            if (type === 'cinema_bass') {
                // Deep cinematic movie studio opening swell (Dolby / Cinema feel)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(48, now);
                osc.frequency.exponentialRampToValueAtTime(72, now + 1.2);
                osc.frequency.exponentialRampToValueAtTime(36, now + 3.0);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.12, now + 0.8);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 3.3);
            } else if (type === 'whoosh') {
                // Cosmic comet pass sound
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(780, now + 0.35);
                osc.frequency.exponentialRampToValueAtTime(320, now + 1.1);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.09, now + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 1.2);
            } else if (type === 'in') {
                // Soso message pop (Sweet double bell)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'out') {
                // Alfy sent swoosh / soft tick
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(660, now);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.09, now + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'lock' || type === 'sparkle') {
                // Grand sparkle chord
                const notes = [739.99, 932.33, 1108.73, 1479.98];
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.025);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.1);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 1.2);
                });
            }
        } catch (e) {
            // Audio context blocked or unsupported
        }
    }

    // Celebration Confetti Cannon
    function triggerCelebrationConfetti() {
        if (typeof window.confetti !== 'function') return;
        const count = 130;
        const defaults = { origin: { y: 0.6 } };
        function fire(ratio, opts) {
            window.confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * ratio)
            }));
        }
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff2a6d', '#ff758c', '#ffffff'] });
        fire(0.2, { spread: 60, colors: ['#fbcfe8', '#ffd166', '#a43073'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 1.2, colors: ['#ff4d88', '#ffafd3', '#ffffff'] });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#ffd700', '#ff2a6d'] });
        fire(0.1, { spread: 120, startVelocity: 45, colors: ['#fc79bd', '#ffffff'] });
    }

    // 1. Inject Golden Comet Cinematic Prologue (3s) ➔ iPhone WhatsApp Chat (6s) ➔ Passcode Flow
    function initAuth() {
        const isUnlocked = sessionStorage.getItem('story_unlocked') === 'true';
        if (isUnlocked) {
            // Already unlocked - restore and auto-play immediately
            restoreAudioPlayback();
            return;
        }

        // Inject Styles for the Cinematic Prologue, Chat Scene & Passcode
        if (!document.getElementById('ios-chat-intro-styles')) {
            const style = document.createElement('style');
            style.id = 'ios-chat-intro-styles';
            style.textContent = `
                @keyframes chatTwinkle {
                    0%, 100% { opacity: 0.15; transform: scale(0.8); }
                    50% { opacity: 0.85; transform: scale(1.2); filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8)); }
                }
                @keyframes passShake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-9px); }
                    40%, 80% { transform: translateX(9px); }
                }
                .pass-shake {
                    animation: passShake 0.45s ease-in-out !important;
                }
                .chat-bubble-in {
                    animation: popBubbleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes popBubbleIn {
                    0% { opacity: 0; transform: translateY(12px) scale(0.88); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes cinemaTextIn {
                    0% { opacity: 0; transform: scale(0.92) translateY(18px); filter: blur(14px); letter-spacing: 0.05em; }
                    100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); letter-spacing: normal; }
                }
                @keyframes cinemaTextOut {
                    0% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
                    100% { opacity: 0; transform: scale(1.06) translateY(-16px); filter: blur(10px); }
                }
                .cinema-text-in {
                    animation: cinemaTextIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .cinema-text-out {
                    animation: cinemaTextOut 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards;
                }
                @keyframes projectorFlicker {
                    0%, 100% { opacity: 0.82; transform: scale(1); }
                    25% { opacity: 0.94; transform: scale(1.02); }
                    50% { opacity: 0.78; transform: scale(0.99); }
                    75% { opacity: 1; transform: scale(1.03); }
                }
                .animate-projector {
                    animation: projectorFlicker 3.2s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }

        const lockOverlay = document.createElement('div');
        lockOverlay.id = 'global-lock-screen';
        lockOverlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden select-none';
        lockOverlay.style.background = 'radial-gradient(ellipse at 50% 38%, #160a1a 0%, #08030b 60%, #020104 100%)';

        // Floating ambient cinema stars
        let stars = '';
        for (let i = 0; i < 20; i++) {
            const top = (Math.random() * 95).toFixed(1);
            const left = (Math.random() * 95).toFixed(1);
            const delay = (Math.random() * 3.5).toFixed(1);
            const dur = (2.2 + Math.random() * 2.8).toFixed(1);
            const size = (Math.random() * 1.1 + 0.6).toFixed(1);
            stars += `<div class="absolute pointer-events-none text-[#ffd8e7]/20 font-serif" style="top:${top}%; left:${left}%; font-size:${size}rem; animation: chatTwinkle ${dur}s ease-in-out ${delay}s infinite;">✦</div>`;
        }

        lockOverlay.innerHTML = `
            ${stars}

            <!-- Cinema Projector Light Cone & Ambient Dust -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1200px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#fffbe8]/16 via-[#fc79bd]/8 to-transparent blur-3xl animate-projector"></div>
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.035)_1px,_transparent_1px)] bg-[length:30px_30px] opacity-40"></div>
            </div>

            <!-- CINEMA WIDESCREEN LETTERBOX TOP BAR -->
            <div id="cinema-bar-top" class="fixed top-0 left-0 right-0 h-11 sm:h-16 bg-[#030105] z-40 border-b border-white/10 flex items-center justify-between px-3 sm:px-8 transition-transform duration-700 shadow-2xl">
                <div class="flex items-center gap-1.5 sm:gap-2.5 text-white/50 text-[10px] sm:text-xs font-mono tracking-wider uppercase">
                    <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span class="text-red-400 font-bold">REC ●</span>
                    <span class="text-[#ffafd3] font-bold">00:00:06</span>
                    <span class="hidden md:inline text-white/30">• 24 FPS • 2.39:1</span>
                </div>
                <div class="text-[10px] sm:text-xs text-[#ffd8e7]/80 font-cairo tracking-wider font-semibold flex items-center gap-1">
                    <span>ALFY & SOSO</span>
                    <span class="text-xs">🎬</span>
                </div>
                <button id="skip-prologue-btn" class="px-2.5 sm:px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#fbcfe8] text-[11px] sm:text-xs font-semibold tracking-wide flex items-center gap-0.5 sm:gap-1 transition-all active:scale-95 border border-white/20 font-cairo" title="تخطي المشهد إلى الشات">
                    <span>تخطي</span><span class="text-[10px]">➔</span>
                </button>
            </div>

            <!-- CINEMA WIDESCREEN LETTERBOX BOTTOM BAR -->
            <div id="cinema-bar-bottom" class="fixed bottom-0 left-0 right-0 h-11 sm:h-16 bg-[#030105] z-40 border-t border-white/10 flex items-center justify-between px-3 sm:px-8 transition-transform duration-700 shadow-2xl">
                <div class="text-[9px] sm:text-[11px] text-white/40 font-mono tracking-wider">
                    SCENE 01 • PROLOGUE
                </div>
                <div class="w-24 sm:w-56 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div id="prologue-progress-fill" class="h-full bg-gradient-to-r from-[#ffd700] via-[#fc79bd] to-[#ffafd3] w-0 transition-all ease-linear"></div>
                </div>
                <div class="text-[9px] sm:text-[11px] text-white/40 font-mono tracking-wider">
                    DOLBY 4K
                </div>
            </div>

            <!-- PHASE 1: Cinema Story Prologue Center Stage -->
            <div id="prologue-stage" class="relative z-30 max-w-2xl sm:max-w-4xl w-full px-3 sm:px-8 py-8 sm:py-10 text-center flex flex-col items-center justify-center transition-all duration-700 min-h-[320px] sm:min-h-[360px]">
                
                <!-- Studio Production Slate -->
                <div class="inline-flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[#ffafd3]/70 font-semibold mb-4 sm:mb-6 font-cairo">
                    <span class="h-[1px] w-6 sm:w-20 bg-gradient-to-r from-transparent to-[#ffafd3]/40"></span>
                    <span>A LOVE STORY PRODUCTION</span>
                    <span class="h-[1px] w-6 sm:w-20 bg-gradient-to-l from-transparent to-[#ffafd3]/40"></span>
                </div>

                <!-- Lines Absolute Stack Container (Eliminates layout shifts and ensures smooth crossfade) -->
                <div class="relative w-full h-40 sm:h-52 flex items-center justify-center">
                    <!-- Line 1 -->
                    <div id="prologue-line-1" class="absolute inset-0 flex flex-col items-center justify-center w-full opacity-0 pointer-events-none px-2">
                        <span class="inline-block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#ffafd3]/80 font-bold mb-3 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full bg-white/5 border border-white/10 font-mono">
                            MEMORIES • 06 . 11 . 2022
                        </span>
                        <h1 class="text-xl sm:text-3xl md:text-5xl font-black text-white font-cairo leading-snug sm:leading-relaxed drop-shadow-[0_0_35px_rgba(255,175,211,0.65)]">
                            « لو رجع بينا الزمن لـ ٦ نوفمبر ٢٠٢٢... »
                        </h1>
                    </div>

                    <!-- Line 2 (Solid Luxury Gold - Fixes text-clip rendering bug) -->
                    <div id="prologue-line-2" class="absolute inset-0 flex flex-col items-center justify-center w-full opacity-0 pointer-events-none px-2">
                        <span class="inline-block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#ffd700] font-bold mb-3 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/25 font-mono">
                            THE PROMISE • للأبد
                        </span>
                        <h1 class="text-xl sm:text-3xl md:text-5xl font-black text-[#ffd700] font-cairo leading-snug sm:leading-relaxed drop-shadow-[0_0_35px_rgba(255,215,0,0.65)]">
                            « هنختار نفس البداية.. ونفس الطريق ❤️ »
                        </h1>
                    </div>

                    <!-- Line 3 -->
                    <div id="prologue-line-3" class="absolute inset-0 flex flex-col items-center justify-center w-full opacity-0 pointer-events-none px-2">
                        <span class="inline-block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#fc79bd] font-bold mb-3 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full bg-[#fc79bd]/10 border border-[#fc79bd]/25 font-mono">
                            SCENE 01 • THE FIRST CHAT
                        </span>
                        <h1 class="text-xl sm:text-3xl md:text-5xl font-black text-white font-cairo leading-snug sm:leading-relaxed drop-shadow-[0_0_40px_rgba(252,121,189,0.75)]">
                            « ودي كانت أول خطوة في حكايتنا... »
                        </h1>
                    </div>
                </div>

            </div>

            <!-- PHASE 2: iPhone WhatsApp Chat Device Mockup Container (Starts Hidden, reveals after Prologue) -->
            <div id="chat-mockup-frame" style="display: none; opacity: 0; transform: scale(0.92) translateY(20px);" class="relative z-20 max-w-[94vw] sm:max-w-md w-full bg-[#180e1c]/88 backdrop-blur-2xl border border-[#fbcfe8]/25 rounded-[1.75rem] sm:rounded-[2.25rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(164,48,115,0.22)] overflow-hidden transition-all duration-700 font-sans">
                
                <!-- Story 6.5s Progress Bar -->
                <div class="w-full h-1 bg-white/10 relative overflow-hidden">
                    <div id="chat-progress-fill" class="h-full bg-gradient-to-r from-secondary via-[#fc79bd] to-[#ffd8e7] w-0 transition-all ease-linear"></div>
                </div>

                <!-- WhatsApp iOS Header -->
                <div class="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#24142a]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-white">
                    <div class="flex items-center gap-2 sm:gap-2.5">
                        <div class="relative">
                            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#ffafd3] to-secondary flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-sm border border-white/30">
                                <span>S</span>
                            </div>
                            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-[#24142a]"></span>
                        </div>
                        <div class="leading-tight">
                            <div class="font-bold text-xs sm:text-sm text-[#fce7f3] flex items-center gap-1.5 font-cairo">
                                <span>سوسو</span><span>❤️</span>
                            </div>
                            <div class="text-[10px] sm:text-[11px] text-emerald-400 font-medium font-cairo">متصل الآن • online</div>
                        </div>
                    </div>

                    <!-- Skip Button -->
                    <button id="skip-intro-btn" class="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#fbcfe8] text-[11px] sm:text-xs font-semibold tracking-wide flex items-center gap-1 transition-all active:scale-95 border border-white/15 font-cairo" title="تخطي المشهد">
                        <span>تخطي</span><span class="text-[10px]">➔</span>
                    </button>
                </div>

                <!-- Chat Messages Body -->
                <div id="chat-messages-container" class="p-3 sm:p-4 h-[315px] sm:h-[370px] flex flex-col justify-end gap-2.5 sm:gap-3 overflow-hidden relative font-cairo">
                    
                    <!-- Bubble 1: Soso -->
                    <div id="msg-bubble-1" class="self-start max-w-[88%] sm:max-w-[85%] bg-[#2b1b30] text-[#fce7f3] border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm opacity-0 transform translate-y-3">
                        <p class="text-xs sm:text-base leading-snug">ألفي.. فاكر أول يوم اتقابلنا فيه؟ 🥺❤️</p>
                        <span class="text-[9px] sm:text-[10px] text-white/40 block text-right mt-1 font-mono tracking-tighter">12:00 AM</span>
                    </div>

                    <!-- Bubble 2: Alfy -->
                    <div id="msg-bubble-2" class="self-end max-w-[90%] sm:max-w-[88%] bg-gradient-to-r from-secondary to-[#85145a] text-white rounded-2xl rounded-tr-sm px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md opacity-0 transform translate-y-3">
                        <p class="text-xs sm:text-base leading-snug">يوم 6 نوفمبر 2022.. هو في يوم يتنسي؟ ده بداية كل حاجة حلوة في عمري ❤️</p>
                        <span class="text-[9px] sm:text-[10px] text-white/70 block text-right mt-1 font-mono tracking-tighter">12:00 AM ✓✓</span>
                    </div>

                    <!-- Bubble 3: Soso -->
                    <div id="msg-bubble-3" class="self-start max-w-[88%] sm:max-w-[85%] bg-[#2b1b30] text-[#fce7f3] border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm opacity-0 transform translate-y-3">
                        <p class="text-xs sm:text-base leading-snug">أربع سنين عدّوا جنبك كأنهم حلم جميل.. بحبك أوي ✨</p>
                        <span class="text-[9px] sm:text-[10px] text-white/40 block text-right mt-1 font-mono tracking-tighter">12:01 AM</span>
                    </div>

                    <!-- Bubble 4: Alfy -->
                    <div id="msg-bubble-4" class="self-end max-w-[90%] sm:max-w-[88%] bg-gradient-to-r from-secondary to-[#85145a] text-white rounded-2xl rounded-tr-sm px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md opacity-0 transform translate-y-3">
                        <p class="text-xs sm:text-base leading-snug">عشان كدا عملتلك المكان ده مخصوص عشانك.. وجمعتلك فيه كل ذكرياتنا 🌸</p>
                        <span class="text-[9px] sm:text-[10px] text-white/70 block text-right mt-1 font-mono tracking-tighter">12:01 AM ✓✓</span>
                    </div>

                    <!-- Bubble 5: Secret Lock Climax Message -->
                    <div id="msg-bubble-5" class="self-center w-full bg-gradient-to-r from-[#fc79bd]/25 to-[#ff2a6d]/30 border border-[#ffafd3]/50 rounded-2xl p-3 sm:p-3.5 text-center shadow-[0_0_30px_rgba(255,42,109,0.35)] opacity-0 transform translate-y-3">
                        <div class="flex items-center justify-center gap-1.5 text-secondary-container font-bold text-[11px] sm:text-xs mb-1">
                            <span class="material-symbols-outlined text-xs sm:text-sm animate-pulse text-[#fc79bd]">lock</span>
                            <span class="text-[#fc79bd]">رسالة مشفرة ومقفولة</span>
                        </div>
                        <p class="text-xs sm:text-base font-bold text-white leading-snug">بس المكان ده سري ومقفول لينا إحنا وبس.. أدخلي كلمتنا السرية 🔐❤️</p>
                    </div>

                    <!-- Typing Indicator -->
                    <div id="chat-typing-dots" class="self-start px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#2b1b30] rounded-2xl rounded-tl-sm border border-white/10 opacity-0 transition-opacity">
                        <div class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-[#fc79bd] animate-bounce"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-[#fc79bd] animate-bounce [animation-delay:0.2s]"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-[#fc79bd] animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>

                </div>

                <!-- Input Footer Placeholder -->
                <div class="p-2.5 sm:p-3 bg-[#24142a]/80 border-t border-white/10 flex items-center gap-2 text-white/40 text-xs font-cairo">
                    <div class="flex-grow bg-white/5 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 border border-white/10 text-white/60 text-[11px] sm:text-xs">
                        اكتب رسالة...
                    </div>
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs sm:text-sm shadow-sm">
                        <span class="material-symbols-outlined text-sm sm:text-base">send</span>
                    </div>
                </div>
            </div>

            <!-- PHASE 3: Secret Passcode Card (Reveals seamlessly after chat) -->
            <div id="passcode-card-stage" class="absolute z-30 max-w-sm sm:max-w-md w-full px-3 sm:px-4 opacity-0 pointer-events-none scale-90 transition-all duration-700 ease-out font-sans">
                <div id="story-pass-card" class="bg-white/88 backdrop-blur-2xl border border-[#fbcfe8] shadow-2xl rounded-3xl p-5 sm:p-9 text-center relative shadow-secondary/25">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#ffd8e7] to-[#fbcfe8] flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-inner border border-secondary/30">
                        <span class="material-symbols-outlined text-2xl sm:text-3xl text-secondary animate-pulse">lock</span>
                    </div>
                    <h2 class="font-headline-md text-xl sm:text-3xl text-primary font-bold mb-1">A ❤️ S</h2>
                    <p class="text-secondary font-bold text-[11px] sm:text-xs mb-1 font-cairo">المكان ده محمي لينا إحنا وبس</p>
                    <p class="text-on-surface-variant font-body-md text-xs sm:text-sm mb-4 sm:mb-6 font-cairo">أدخلي كلمتنا السرية يا سوسو علشان تدخلي حكايتنا ❤️</p>
                    <div class="space-y-3 sm:space-y-4 font-cairo">
                        <input id="story-pass-input" type="text" placeholder="كلمتنا السرية..." class="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-full border-2 border-secondary/30 focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none text-center font-bold text-secondary text-sm sm:text-base bg-[#fff5f8] transition-all placeholder:font-normal placeholder:text-neutral-400 font-cairo" autocomplete="off" autocapitalize="none"/>
                        <button id="story-unlock-btn" class="w-full py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-secondary to-[#fc79bd] text-white font-bold hover:opacity-95 shadow-lg shadow-secondary/25 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2 font-cairo">
                            <span>افتحي عالمنا</span><span>❤️</span>
                        </button>
                        <p id="story-pass-error" class="text-error text-xs h-4 font-semibold font-cairo"></p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(lockOverlay);
        document.body.style.overflow = 'hidden';

        // Element References
        const barTop = document.getElementById('cinema-bar-top');
        const barBottom = document.getElementById('cinema-bar-bottom');
        const prologueStage = document.getElementById('prologue-stage');
        const prologueProgress = document.getElementById('prologue-progress-fill');
        const skipPrologueBtn = document.getElementById('skip-prologue-btn');
        const pLine1 = document.getElementById('prologue-line-1');
        const pLine2 = document.getElementById('prologue-line-2');
        const pLine3 = document.getElementById('prologue-line-3');

        const chatFrame = document.getElementById('chat-mockup-frame');
        const passStage = document.getElementById('passcode-card-stage');
        const skipBtn = document.getElementById('skip-intro-btn');
        const progressFill = document.getElementById('chat-progress-fill');
        const typingDots = document.getElementById('chat-typing-dots');

        const b1 = document.getElementById('msg-bubble-1');
        const b2 = document.getElementById('msg-bubble-2');
        const b3 = document.getElementById('msg-bubble-3');
        const b4 = document.getElementById('msg-bubble-4');
        const b5 = document.getElementById('msg-bubble-5');

        const passInput = document.getElementById('story-pass-input');
        const unlockBtn = document.getElementById('story-unlock-btn');
        const errText = document.getElementById('story-pass-error');
        const passCard = document.getElementById('story-pass-card');

        let isPrologueEnded = false;
        let isTransitioned = false;
        const prologueTimeouts = [];
        const chatTimeouts = [];

        // Any screen touch arms and begins background audio and deep cinema bass rumble
        const handleScreenGesture = () => {
            playAudio();
            playChatSound('cinema_bass');
            lockOverlay.removeEventListener('click', handleScreenGesture);
            lockOverlay.removeEventListener('touchstart', handleScreenGesture);
        };
        lockOverlay.addEventListener('click', handleScreenGesture, { once: true });
        lockOverlay.addEventListener('touchstart', handleScreenGesture, { once: true });

        // Attempt immediate cinema sound if allowed by browser policy
        try { playChatSound('cinema_bass'); } catch (e) {}

        // --- PHASE 1: 6-Second Cinema Prologue Execution ---
        if (prologueProgress) {
            prologueProgress.style.transition = 'width 6.0s linear';
            requestAnimationFrame(() => {
                prologueProgress.style.width = '100%';
            });
        }

        let cinemaTl = null;

        // Smooth GSAP Cinema Timeline (Hardware-accelerated, zero layout-shift)
        if (window.gsap && pLine1 && pLine2 && pLine3) {
            cinemaTl = gsap.timeline({
                onComplete: () => {
                    transitionToChat();
                }
            });

            // Line 1: In (0.0s) -> Hold -> Out (1.7s)
            cinemaTl.fromTo(pLine1,
                { opacity: 0, y: 18, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' }
            )
            .to(pLine1,
                { opacity: 0, y: -14, scale: 1.02, duration: 0.45, ease: 'power2.in' },
                '+=0.85'
            )
            // Line 2: In (2.0s) -> Hold -> Out (3.7s) (Guaranteed smooth display, bright gold)
            .fromTo(pLine2,
                { opacity: 0, y: 18, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' }
            )
            .to(pLine2,
                { opacity: 0, y: -14, scale: 1.02, duration: 0.45, ease: 'power2.in' },
                '+=0.85'
            )
            // Line 3: In (4.0s) -> Hold -> Out (5.7s)
            .fromTo(pLine3,
                { opacity: 0, y: 18, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' }
            )
            .to(pLine3,
                { opacity: 0, y: -14, scale: 1.02, duration: 0.45, ease: 'power2.in' },
                '+=0.95'
            );
        } else {
            // CSS Fallback
            const showLine = (el, show) => {
                if (!el) return;
                el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                if (show) {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0) scale(1)';
                } else {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(-14px) scale(1.02)';
                }
            };
            showLine(pLine1, true);
            prologueTimeouts.push(setTimeout(() => showLine(pLine1, false), 1600));
            prologueTimeouts.push(setTimeout(() => showLine(pLine2, true), 1950));
            prologueTimeouts.push(setTimeout(() => showLine(pLine2, false), 3600));
            prologueTimeouts.push(setTimeout(() => showLine(pLine3, true), 3950));
            prologueTimeouts.push(setTimeout(() => showLine(pLine3, false), 5600));
            prologueTimeouts.push(setTimeout(() => transitionToChat(), 5800));
        }

        // Seamless Transition: Cinema Prologue -> WhatsApp Chat
        function transitionToChat() {
            if (isPrologueEnded) return;
            isPrologueEnded = true;

            if (cinemaTl) {
                cinemaTl.kill();
                cinemaTl = null;
            }
            prologueTimeouts.forEach(t => clearTimeout(t));

            playAudio();
            playChatSound('in');

            // Slide out Letterbox Bars smoothly
            if (barTop) {
                barTop.style.transform = 'translateY(-100%)';
                barTop.style.opacity = '0';
            }
            if (barBottom) {
                barBottom.style.transform = 'translateY(100%)';
                barBottom.style.opacity = '0';
            }

            if (prologueStage) {
                prologueStage.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                prologueStage.style.opacity = '0';
                prologueStage.style.transform = 'scale(0.92) translateY(-25px)';
                prologueStage.style.pointerEvents = 'none';
            }

            setTimeout(() => {
                if (prologueStage) prologueStage.style.display = 'none';
                if (chatFrame) {
                    chatFrame.style.display = 'block';
                    void chatFrame.offsetWidth; // Force reflow
                    chatFrame.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    chatFrame.style.opacity = '1';
                    chatFrame.style.transform = 'scale(1) translateY(0)';
                    chatFrame.style.pointerEvents = 'auto';
                }
                startChatSequence();
            }, 400);
        }

        if (skipPrologueBtn) {
            skipPrologueBtn.onclick = (e) => {
                e.stopPropagation();
                transitionToChat();
            };
        }

        // --- PHASE 2: WhatsApp Chat Sequence (6.5s) ---
        function showBubble(bubble, soundType) {
            if (!bubble || isTransitioned) return;
            bubble.classList.add('chat-bubble-in');
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
            if (soundType) playChatSound(soundType);
        }

        function setTyping(visible, isRight = false) {
            if (!typingDots || isTransitioned) return;
            if (visible) {
                typingDots.style.opacity = '1';
                if (isRight) {
                    typingDots.classList.remove('self-start', 'rounded-tl-sm');
                    typingDots.classList.add('self-end', 'rounded-tr-sm', 'bg-secondary/40');
                } else {
                    typingDots.classList.remove('self-end', 'rounded-tr-sm', 'bg-secondary/40');
                    typingDots.classList.add('self-start', 'rounded-tl-sm', 'bg-[#2b1b30]');
                }
            } else {
                typingDots.style.opacity = '0';
            }
        }

        function startChatSequence() {
            if (isTransitioned) return;

            // Animate Story Progress Bar (0 to 100% over 6.5s)
            if (progressFill) {
                progressFill.style.transition = 'width 6.5s linear';
                requestAnimationFrame(() => {
                    progressFill.style.width = '100%';
                });
            }

            // Scripted Conversation Timeline
            chatTimeouts.push(setTimeout(() => { showBubble(b1, 'in'); }, 500));
            chatTimeouts.push(setTimeout(() => { setTyping(true, true); }, 1300));
            chatTimeouts.push(setTimeout(() => { setTyping(false); showBubble(b2, 'out'); }, 2000));
            chatTimeouts.push(setTimeout(() => { setTyping(true, false); }, 2900));
            chatTimeouts.push(setTimeout(() => { setTyping(false); showBubble(b3, 'in'); }, 3600));
            chatTimeouts.push(setTimeout(() => { setTyping(true, true); }, 4400));
            chatTimeouts.push(setTimeout(() => { setTyping(false); showBubble(b4, 'out'); }, 5000));
            chatTimeouts.push(setTimeout(() => { showBubble(b5, 'lock'); }, 5700));
            chatTimeouts.push(setTimeout(() => { morphToPasscode(); }, 6600));
        }

        // Function to smoothly morph from Chat to Passcode Card
        function morphToPasscode() {
            if (isTransitioned) return;
            isTransitioned = true;

            // Clear any pending chat timeouts
            chatTimeouts.forEach(t => clearTimeout(t));

            // Start audio in background
            playAudio();
            playChatSound('sparkle');

            // Animate Chat frame out and Passcode Card in
            if (chatFrame) {
                chatFrame.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                chatFrame.style.opacity = '0';
                chatFrame.style.transform = 'scale(0.92) translateY(-20px)';
                chatFrame.style.pointerEvents = 'none';
            }

            setTimeout(() => {
                if (chatFrame) chatFrame.style.display = 'none';
                if (passStage) {
                    passStage.style.pointerEvents = 'auto';
                    passStage.style.opacity = '1';
                    passStage.style.transform = 'scale(1) translateY(0)';
                }
                setTimeout(() => {
                    if (passInput) passInput.focus();
                }, 300);
            }, 450);
        }

        if (skipBtn) {
            skipBtn.onclick = (e) => {
                e.stopPropagation();
                morphToPasscode();
            };
        }

        // --- STAGE 2: Passcode Verification ---
        function checkPass() {
            const raw = (passInput.value || '').trim().toLowerCase();
            const val = raw.replace(/[\u064B-\u065F]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي');
            const validPasscodes = ['alby', 'albyy', 'albyyy', 'albi', 'albii', 'قلبي', 'قلبيي', 'البي', 'البيي'];
            if (validPasscodes.includes(val) || validPasscodes.includes(raw)) {
                sessionStorage.setItem('story_unlocked', 'true');

                triggerCelebrationConfetti();
                playChatSound('sparkle');
                playAudio();

                if (passCard) {
                    passCard.style.transition = 'all 0.5s ease';
                    passCard.style.transform = 'scale(1.05)';
                    passCard.style.boxShadow = '0 0 50px rgba(255, 42, 109, 0.6)';
                }

                setTimeout(() => {
                    lockOverlay.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
                    lockOverlay.style.opacity = '0';
                    lockOverlay.style.transform = 'scale(1.06)';

                    setTimeout(() => {
                        lockOverlay.remove();
                        document.body.style.overflow = '';
                    }, 700);
                }, 350);
            } else {
                errText.textContent = 'كلمة السر غير صحيحة يا قلبي ♡ حاولي تاني';
                passInput.classList.add('border-error');
                if (passCard) {
                    passCard.classList.remove('pass-shake');
                    void passCard.offsetWidth; // trigger reflow
                    passCard.classList.add('pass-shake');
                }
                setTimeout(() => {
                    passInput.classList.remove('border-error');
                }, 1200);
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
        playerDiv.className = 'fixed left-3 right-3 md:left-auto md:right-6 md:w-96 z-50 bg-[#fff0f5]/92 backdrop-blur-2xl border border-[#fbcfe8] rounded-2xl p-2.5 md:p-3 shadow-2xl shadow-secondary/15 flex flex-col gap-1.5 md:gap-2 transition-all duration-300';
        playerDiv.style.bottom = 'calc(0.65rem + env(safe-area-inset-bottom, 0px))';
        playerDiv.innerHTML = `
            <div class="flex items-center gap-2.5 md:gap-3">
                <div class="relative flex-shrink-0 flex items-center justify-center">
                    <div id="neon-audio-ring" class="absolute -inset-1 rounded-xl pointer-events-none opacity-0 border-2 border-secondary transition-all duration-500"></div>
                    <img id="player-track-img" src="${currentTrack.img}" alt="Album cover" class="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-secondary/30 shadow-sm relative z-10"/>
                </div>
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
            const ring = document.getElementById('neon-audio-ring');
            if (ring) ring.classList.add('neon-playing');
        };
        audioInstance.onpause = () => {
            sessionStorage.setItem('story_audio_playing', 'false');
            playIcon.textContent = 'play_arrow';
            const ring = document.getElementById('neon-audio-ring');
            if (ring) ring.classList.remove('neon-playing');
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

    // 3. Mobile Navigation is unified in the sleek Top Header Navbar
    function initMobileTabBar() {
        const existing = document.getElementById('ios-bottom-tabbar');
        if (existing) existing.remove();
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
            const script = document.createElement('script');
            script.src = 'https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js';
            script.onload = () => {
                setupHeroHeart();
            };
            document.head.appendChild(script);
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
                emissiveIntensity: 0.25
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

    // --- 3D Blooming Rose Garden & Floating Petals Engine ---
    let roseRenderer = null;
    let roseScene = null;
    let roseCamera = null;
    let rosePetals = [];
    let roseFlowers = [];
    let roseAnimId = null;
    let roseRunning = false;
    let targetRoseCameraY = 15;
    let currentRoseCameraY = 15;
    let roseMouseX = 0, roseMouseY = 0;

    function setupRoseGarden3D() {
        const canvas = document.getElementById('timeline-rose-canvas');
        if (!canvas) return;

        if (roseRenderer && roseScene) {
            if (!roseRunning) {
                roseRunning = true;
                animateRoseGarden();
            }
            return;
        }

        if (typeof THREE === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js';
            script.onload = () => {
                setupRoseGarden3D();
            };
            document.head.appendChild(script);
            return;
        }

        try {
            const width = window.innerWidth;
            const height = window.innerHeight;

            roseScene = new THREE.Scene();
            roseCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
            roseCamera.position.set(0, 15, 25);

            roseRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            roseRenderer.setSize(width, height);
            roseRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Ambient & Soft Romantic Lights
            const ambient = new THREE.AmbientLight(0xfff0f5, 1.1);
            roseScene.add(ambient);

            const pinkLight1 = new THREE.PointLight(0xf472b6, 1.8, 80);
            pinkLight1.position.set(0, 10, 15);
            roseScene.add(pinkLight1);

            const warmLight2 = new THREE.PointLight(0xffafd3, 1.4, 80);
            warmLight2.position.set(0, -20, 15);
            roseScene.add(warmLight2);

            // 1. Floating 3D Rose Petals (80 Petals with organic curved geometry)
            rosePetals = [];
            const petalShape = new THREE.Shape();
            petalShape.moveTo(0, 0);
            petalShape.bezierCurveTo(0.4, 0.5, 0.8, 1.2, 0, 2.0);
            petalShape.bezierCurveTo(-0.8, 1.2, -0.4, 0.5, 0, 0);

            const petalGeo = new THREE.ShapeGeometry(petalShape);
            const petalMat = new THREE.MeshPhongMaterial({
                color: 0xf472b6,
                emissive: 0xdb2777,
                emissiveIntensity: 0.25,
                side: THREE.DoubleSide,
                shininess: 90
            });

            for (let i = 0; i < 75; i++) {
                const petal = new THREE.Mesh(petalGeo, petalMat);
                petal.position.set(
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 70,
                    (Math.random() - 0.5) * 30
                );
                petal.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                );
                const scale = 0.5 + Math.random() * 0.7;
                petal.scale.set(scale, scale, scale);

                petal.userData = {
                    speedY: 0.02 + Math.random() * 0.03,
                    rotSpeedX: (Math.random() - 0.5) * 0.02,
                    rotSpeedY: (Math.random() - 0.5) * 0.03,
                    wobbleSpeed: 0.002 + Math.random() * 0.003,
                    initX: petal.position.x
                };
                roseScene.add(petal);
                rosePetals.push(petal);
            }

            // 2. 5 3D Blooming Rose Flower Meshes for each milestone
            roseFlowers = [];
            const roseYPositions = [15, 3, -9, -21, -33];

            roseYPositions.forEach((yPos, idx) => {
                const flowerGroup = new THREE.Group();
                flowerGroup.position.set(idx % 2 === 0 ? 0 : 0, yPos, 0);

                // Central Rose Bud
                const centerGeo = new THREE.SphereGeometry(1.0, 16, 16);
                const centerMat = new THREE.MeshPhongMaterial({
                    color: 0xdb2777,
                    emissive: 0xa43073,
                    emissiveIntensity: 0.4
                });
                const centerMesh = new THREE.Mesh(centerGeo, centerMat);
                flowerGroup.add(centerMesh);

                // Nested Petal Layers (Blooming animation targets)
                const petalsList = [];
                for (let layer = 0; layer < 3; layer++) {
                    const layerGroup = new THREE.Group();
                    const petalCount = 5 + layer * 2;
                    for (let p = 0; p < petalCount; p++) {
                        const angle = (p / petalCount) * Math.PI * 2;
                        const pMesh = new THREE.Mesh(petalGeo, petalMat);
                        pMesh.position.set(Math.cos(angle) * (0.8 + layer * 0.5), Math.sin(angle) * (0.8 + layer * 0.5), 0);
                        pMesh.rotation.z = angle - Math.PI / 2;
                        pMesh.rotation.x = 0.3 + layer * 0.3;
                        pMesh.scale.set(0.6 + layer * 0.3, 0.6 + layer * 0.3, 0.6 + layer * 0.3);
                        layerGroup.add(pMesh);
                    }
                    flowerGroup.add(layerGroup);
                    petalsList.push(layerGroup);
                }

                flowerGroup.scale.set(0.1, 0.1, 0.1); // Initial closed bud
                flowerGroup.userData = {
                    unlocked: idx === 0, // 2022 starts unlocked
                    targetScale: idx === 0 ? 1.4 : 0.1,
                    currentScale: idx === 0 ? 1.4 : 0.1,
                    petalsList
                };

                roseScene.add(flowerGroup);
                roseFlowers.push(flowerGroup);
            });

            window.addEventListener('mousemove', (e) => {
                roseMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                roseMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            }, { passive: true });

            window.addEventListener('resize', () => {
                if (!roseRenderer || !roseCamera) return;
                roseCamera.aspect = window.innerWidth / window.innerHeight;
                roseCamera.updateProjectionMatrix();
                roseRenderer.setSize(window.innerWidth, window.innerHeight);
            }, { passive: true });

            roseRunning = true;
            animateRoseGarden();

        } catch (e) {
            console.warn('3D Rose Garden Init Error:', e);
        }
    }

    function animateRoseGarden() {
        if (!roseRunning || !roseRenderer || !roseScene || !roseCamera) return;
        roseAnimId = requestAnimationFrame(animateRoseGarden);

        // Smooth camera lerp
        currentRoseCameraY += (targetRoseCameraY - currentRoseCameraY) * 0.08;
        roseCamera.position.y = currentRoseCameraY + (-roseMouseY * 1.5);
        roseCamera.position.x = roseMouseX * 1.5;
        roseCamera.lookAt(0, currentRoseCameraY, 0);

        // Animate floating petals
        const time = Date.now();
        rosePetals.forEach(petal => {
            petal.position.y -= petal.userData.speedY;
            petal.position.x = petal.userData.initX + Math.sin(time * petal.userData.wobbleSpeed) * 1.5;
            petal.rotation.x += petal.userData.rotSpeedX;
            petal.rotation.y += petal.userData.rotSpeedY;

            if (petal.position.y < currentRoseCameraY - 30) {
                petal.position.y = currentRoseCameraY + 30;
            }
        });

        // Animate blooming rose flowers
        roseFlowers.forEach(flower => {
            flower.rotation.z += 0.005;
            flower.userData.currentScale += (flower.userData.targetScale - flower.userData.currentScale) * 0.08;
            flower.scale.set(flower.userData.currentScale, flower.userData.currentScale, flower.userData.currentScale);
        });

        roseRenderer.render(roseScene, roseCamera);
    }

    function pauseRoseGarden() {
        roseRunning = false;
        if (roseAnimId) cancelAnimationFrame(roseAnimId);
    }

    // Progressive Glowing Timeline Initializer
    window.initTimelinePage = function () {
        const timelineContainer = document.getElementById('timeline-container');
        const glowLine = document.getElementById('glowing-timeline-line');
        const nodes = ['node-basket', 'node-2022', 'node-2023', 'node-2024', 'node-2025', 'node-2025-hijab', 'node-2026'];

        // 1. Scroll Reveal for Cards (Immediate visibility check + IntersectionObserver)
        const scrollElements = document.querySelectorAll('.scroll-reveal');

        scrollElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 1.5) {
                el.classList.add('visible');
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.02,
            rootMargin: "100px 0px 50px 0px"
        });

        scrollElements.forEach(el => {
            observer.observe(el);
        });

        // 2. Glowing Line Progress & Milestone Node Activation
        if (timelineContainer && glowLine) {
            const onScrollTimeline = () => {
                const rect = timelineContainer.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Calculate how much the user has scrolled through the timeline
                const triggerPoint = windowHeight * 0.65;
                let progress = (triggerPoint - rect.top) / rect.height;
                progress = Math.max(0, Math.min(1, progress));

                glowLine.style.height = `${progress * 100}%`;

                // Activate glowing nodes as the glowing line passes them
                nodes.forEach(nodeId => {
                    const nodeEl = document.getElementById(nodeId);
                    if (nodeEl) {
                        const nodeRect = nodeEl.getBoundingClientRect();
                        if (nodeRect.top < triggerPoint) {
                            nodeEl.classList.add('node-active');
                        } else {
                            nodeEl.classList.remove('node-active');
                        }
                    }
                });
            };

            window.removeEventListener('scroll', window._timelineScrollHandler);
            window._timelineScrollHandler = onScrollTimeline;
            window.addEventListener('scroll', onScrollTimeline, { passive: true });
            onScrollTimeline();
        }

        initFloatingHearts();
    };

    // Letter Initializer
    window.initLetterPage = function () {
        initFloatingHearts();
    };

    // Gallery Initializer & 3D ImageStreamHero Corridor
    const GALLERY_STREAM_PHOTOS = [
        { src: 'assets/2022/01_first_memory_bechamel.jpg', title: 'صينية المكرونة بالبشاميل 2022' },
        { src: 'assets/2022/2022_memory_1.jpg', title: 'البدايات الحلوة 2022' },
        { src: 'assets/2022/2022_memory_2.jpg', title: 'ذكريات 2022' },
        { src: 'assets/2023/2023_memory_1.jpg', title: 'خروجات وسفريات 2023' },
        { src: 'assets/2023/2023_memory_2.jpg', title: 'سحر 2023' },
        { src: 'assets/2023/image.jpeg', title: 'ضحكة من القلب 2023' },
        { src: 'assets/2024/2024_medicine.jpg', title: 'دكتورة سوسو في كلية الطب 2024' },
        { src: 'assets/2024/2024_memory_1.jpg', title: 'نجاح وفخر 2024' },
        { src: 'assets/2024/2024_memory_2.jpg', title: 'ضحكة دكتورتنا 2024' },
        { src: 'assets/2025/2025_memory_1.jpg', title: 'سهرة النيل 2025' },
        { src: 'assets/2025/2025_memory_2.jpg', title: 'احتفال النيل 2025' },
        { src: 'assets/2025/2025_hijab.jpg', title: 'خطوة الحجاب ونور العيون 2025' },
        { src: 'assets/2026/2026_memory_1.jpg', title: 'لحظات القمر سوسو 2026' },
        { src: 'assets/2026/2026_memory_2.jpg', title: 'أحلى الذكريات 2026' },
        { src: 'assets/2026/2026_memory_3.jpg', title: 'نور أيامي 2026' },
        { src: 'assets/2026/2026_memory_4.jpg', title: 'فرحتي معاكي 2026' },
        { src: 'assets/2026/2026_memory_5.jpg', title: 'ابتسامة سارة 2026' },
        { src: 'assets/2026/2026_memory_6.jpg', title: 'الراحة والأمان 2026' },
        { src: 'assets/2026/2026_memory_7.jpg', title: 'بداية جديدة سوا 2026' }
    ];

    window.setupImageStreamCorridor = function () {
        const stage = document.getElementById('corridor-stage');
        if (!stage) return;
        stage.innerHTML = '';

        const cardsCount = 9;
        const speed = 18;

        ['card-ish-r', 'card-ish-l'].forEach(railClass => {
            for (let i = 0; i < cardsCount; i++) {
                const photo = GALLERY_STREAM_PHOTOS[i % GALLERY_STREAM_PHOTOS.length];
                const card = document.createElement('div');
                card.className = `corridor-card ${railClass}`;
                card.style.animationDelay = `${-(i * speed) / cardsCount}s`;

                const img = document.createElement('img');
                img.src = photo.src;
                img.alt = photo.title;
                img.loading = 'lazy';
                img.draggable = false;

                card.appendChild(img);
                stage.appendChild(card);
            }
        });
    };

    window.initGalleryPage = function () {
        window.setupImageStreamCorridor();
        initFloatingHearts();
    };

    function initFloatingHearts() {
        const container = document.getElementById('hearts-container');
        if (!container) return;
        container.innerHTML = '';
        const heartCount = 15;
        for (let i = 0; i < heartCount; i++) {
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

    function getPageName(pathOrUrl) {
        if (!pathOrUrl) return 'index';
        const clean = pathOrUrl.split('#')[0].split('?')[0].split('/').pop().replace(/\.html$/, '');
        return (clean === '' || clean === 'index') ? 'index' : clean;
    }

    // 4. Seamless SPA Navigation (Audio NEVER pauses when changing pages!)
    function initSeamlessNavigation() {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

            const page = getPageName(href);
            if (['index', 'timeline', 'gallery', 'letter'].includes(page)) {
                e.preventDefault();
                navigateSeamlessly(href);
            }
        });

        window.addEventListener('popstate', function () {
            const page = getPageName(location.pathname);
            navigateSeamlessly(page === 'index' ? 'index.html' : page + '.html', false);
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

            const targetPage = getPageName(url);
            if (targetPage === 'index') {
                pauseRoseGarden();
                setupHeroHeart();
                window.initHomePageAnimations();
            } else if (targetPage === 'timeline') {
                pauseHeroHeart();
                window.initTimelinePage();
            } else {
                pauseHeroHeart();
                pauseRoseGarden();
                if (targetPage === 'gallery') {
                    window.initGalleryPage();
                } else if (targetPage === 'letter') {
                    window.initLetterPage();
                }
            }

            playAudio();

        } catch (err) {
            window.location.href = url;
        }
    }

    // Anime.js Interactive Romantic Animation Engine for Home Page
    window.initHomePageAnimations = function () {
        if (typeof anime === 'undefined') return;

        // 1. Hero Staggered Spring Entrance Timeline
        try {
            anime.timeline({ easing: 'easeOutExpo' })
                .add({
                    targets: '.hero-badge',
                    translateY: [-25, 0],
                    opacity: [0, 1],
                    duration: 900
                })
                .add({
                    targets: '.hero-title-name',
                    scale: [0.75, 1],
                    opacity: [0, 1],
                    duration: 1100,
                    easing: 'easeOutElastic(1, 0.55)'
                }, '-=500')
                .add({
                    targets: '.counter-box',
                    translateY: [35, 0],
                    opacity: [0, 1],
                    duration: 900
                }, '-=700');
        } catch (e) { }

        // 2. Interactive Anime.js Heart Explosion on Tap / Pointer Down
        const heroCard = document.querySelector('.hero-card-container');
        if (heroCard && !heroCard.dataset.animeBound) {
            heroCard.dataset.animeBound = 'true';
            heroCard.addEventListener('pointerdown', (e) => {
                spawnAnimeHearts(e.clientX, e.clientY);
            });
        }
    };

    function spawnAnimeHearts(x, y) {
        if (typeof anime === 'undefined') return;
        const count = 14;
        const emojis = ['💖', '❤️', '✨', '🌸', '💕'];
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.className = 'anime-burst-heart';
            heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            heart.style.cssText = `position:fixed; left:${x}px; top:${y}px; font-size:${18 + Math.random() * 18}px; pointer-events:none; z-index:99999; transform:translate(-50%, -50%);`;
            document.body.appendChild(heart);

            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
            const dist = 70 + Math.random() * 90;

            anime({
                targets: heart,
                translateX: Math.cos(angle) * dist,
                translateY: Math.sin(angle) * dist - 50,
                scale: [0.3, 1.4, 0],
                rotate: (Math.random() - 0.5) * 360,
                opacity: [1, 0],
                duration: 1300 + Math.random() * 500,
                easing: 'easeOutBack',
                complete: () => heart.remove()
            });
        }
    }

    // Realtime Love Counter with Anime.js Pulse
    function initCounter() {
        let lastSec = -1;
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
            if (secsEl) {
                secsEl.textContent = String(s).padStart(2, '0');
                if (s !== lastSec && typeof anime !== 'undefined') {
                    lastSec = s;
                    anime({
                        targets: secsEl,
                        scale: [1.28, 1],
                        duration: 450,
                        easing: 'easeOutElastic(1, .5)'
                    });
                }
            }
        }

        updateCounter();
        if (!window._loveCounterInterval) {
            window._loveCounterInterval = setInterval(updateCounter, 1000);
        }
    }

    // 1. Constellation Starlight Effect (خلفية نجوم الحب و A ❤️ S)
    function initConstellationStarlight() {
        if (document.getElementById('constellation-canvas')) return;
        const canvas = document.createElement('canvas');
        canvas.id = 'constellation-canvas';
        canvas.style.cssText = 'position:fixed; inset:0; z-index:-2; pointer-events:none; width:100vw; height:100vh;';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const stars = [];
        const starCount = Math.min(75, Math.floor(width / 20));
        let mouseX = -1000, mouseY = -1000;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            }
        });

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.7 + 0.3,
                pulse: Math.random() * 0.03 + 0.01
            });
        }

        function renderStars() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.x += s.vx;
                s.y += s.vy;

                if (s.x < 0) s.x = width;
                if (s.x > width) s.x = 0;
                if (s.y < 0) s.y = height;
                if (s.y > height) s.y = 0;

                s.alpha += Math.sin(Date.now() * 0.002 + i) * s.pulse * 0.1;
                const a = Math.max(0.2, Math.min(0.9, s.alpha));

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(244, 114, 182, ${a})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#f472b6';
                ctx.fill();

                // Connect to Mouse Cursor
                const dxMouse = mouseX - s.x;
                const dyMouse = mouseY - s.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < 160) {
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(236, 72, 153, ${0.45 * (1 - distMouse / 160)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Connect nearby stars
                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const dx = s.x - s2.x;
                    const dy = s.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(s.x, s.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.strokeStyle = `rgba(251, 207, 232, ${0.25 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(renderStars);
        }

        renderStars();
    }

    // 2. Interactive Floating Rose Petals Physics Engine
    function initFloatingRosePetals() {
        if (document.getElementById('rose-petals-canvas')) return;
        const canvas = document.createElement('canvas');
        canvas.id = 'rose-petals-canvas';
        canvas.style.cssText = 'position:fixed; inset:0; z-index:-1; pointer-events:none; width:100vw; height:100vh;';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        let windVelocityX = 0;
        let lastMouseX = 0;
        window.addEventListener('mousemove', (e) => {
            windVelocityX = (e.clientX - lastMouseX) * 0.05;
            lastMouseX = e.clientX;
        });

        const petals = [];
        const petalCount = 24;
        const petalColors = ['#f472b6', '#ec4899', '#fbcfe8', '#fda4af', '#e11d48'];

        for (let i = 0; i < petalCount; i++) {
            petals.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 12 + 10,
                speedY: Math.random() * 1.2 + 0.8,
                sway: Math.random() * 2 + 1,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.04,
                color: petalColors[Math.floor(Math.random() * petalColors.length)],
                opacity: Math.random() * 0.4 + 0.55
            });
        }

        function drawPetal(p) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.scale(Math.cos(p.angle * 0.5), 1);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
            ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.restore();
        }

        function updatePetals() {
            ctx.clearRect(0, 0, width, height);
            windVelocityX *= 0.95;

            for (let i = 0; i < petals.length; i++) {
                const p = petals[i];
                p.y += p.speedY;
                p.x += Math.sin(p.angle) * p.sway + windVelocityX;
                p.angle += p.rotSpeed;

                if (p.y > height + 20) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }
                if (p.x < -20) p.x = width + 20;
                if (p.x > width + 20) p.x = -20;

                drawPetal(p);
            }

            requestAnimationFrame(updatePetals);
        }

        updatePetals();
    }

    // 4. Romantic Love Quiz & Memory Popups System
    const LOVE_QUIZ_DATA = [
        {
            q: "إيه كانت أول ذكرى أكل تجمع بين سوسو وألفي سنة 2022؟ 🍝",
            options: [
                "🍝 صينية المكرونة بالبشاميل واشطا",
                "🍕 بيتزا مارجريتا سخنة",
                "🍔 برجر وحاجات حلوة"
            ],
            correct: 0,
            msg: "صح يا سوسو! أول ذكرى مكرونة بشاميل واشطا علمت في قلوبنا للأبد ❤️"
        },
        {
            q: "سنة 2024 كانت سنة الحب والفخر لدكتورتنا القمر في كلية إيه؟ 🩺",
            options: [
                "🎨 كلية الفنون الجميلة",
                "🩺 دكتورة سوسو في كلية الطب",
                "💻 كلية الحاسبات والمعلومات"
            ],
            correct: 1,
            msg: "صح وبرافو بيكي! دكتورة سوسو فخور بيكي في كلية الطب دايماً 💖"
        },
        {
            q: "خطوة الحجاب وسارة القمر ونور عيوني كانت في ألبوم سنة كام؟ 🤍",
            options: [
                "🤍 2025 ليلة الحجاب والنور",
                "🌸 2022 البدايات",
                "🌹 2023 السفريات"
            ],
            correct: 0,
            msg: "صح يا قمر! خطوة الحجاب كانت أجمل وأرق نور لعام 2025 ✨"
        }
    ];

    let currentQuizIdx = 0;

    window.openLoveQuizModal = function () {
        const quiz = LOVE_QUIZ_DATA[currentQuizIdx % LOVE_QUIZ_DATA.length];
        currentQuizIdx++;

        let modal = document.getElementById('quiz-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quiz-modal';
            document.body.appendChild(modal);
        }

        modal.style.cssText = 'position:fixed; inset:0; z-index:999999; background:rgba(74, 4, 78, 0.45); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); display:flex; align-items:center; justify-content:center; padding:1.25rem;';
        modal.innerHTML = `
            <div style="background:rgba(255, 245, 248, 0.98); border:1.5px solid #fbcfe8; border-radius:1.5rem; max-width:28rem; width:100%; padding:2rem 1.5rem; text-align:center; position:relative; box-shadow:0 25px 50px -12px rgba(164, 48, 115, 0.3); margin:auto;" dir="rtl">
                <button type="button" onclick="closeLoveQuizModal()" style="position:absolute; top:1rem; left:1rem; width:2.25rem; height:2.25rem; border-radius:9999px; background:#ffe4e6; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#a43073;" title="إغلاق">
                    <span class="material-symbols-outlined" style="font-size:1.25rem;">close</span>
                </button>
                <div style="width:3.5rem; height:3.5rem; border-radius:9999px; background:#fbcfe8; border:1px solid #f472b6; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
                    <span class="material-symbols-outlined animate-bounce" style="font-size:2rem; color:#a43073;">quiz</span>
                </div>
                <span style="display:inline-block; background:#ffd8e7; color:#85145a; font-weight:700; font-size:0.8rem; padding:0.25rem 0.8rem; border-radius:9999px; margin-bottom:0.75rem; font-family:'Cairo', sans-serif;">💖 سؤال ذكريات الحب بين سوسو وألفي ✨</span>
                <h3 style="color:#765469; font-size:1.15rem; font-weight:700; font-family:'Cairo', sans-serif; margin-bottom:1.25rem; line-height:1.5;">${quiz.q}</h3>
                
                <div style="display:flex; flex-direction:column; gap:0.75rem; text-align:right;">
                    ${quiz.options.map((opt, i) => `
                        <button onclick="checkLoveQuizAnswer(${i})" style="background:#ffffff; border:1.5px solid #fbcfe8; border-radius:1rem; padding:0.85rem 1rem; color:#765469; font-weight:600; font-size:0.95rem; cursor:pointer; text-align:right; font-family:'Cairo', sans-serif; transition:all 0.25s; box-shadow:0 2px 6px rgba(0,0,0,0.03);" onmouseover="this.style.borderColor='#ec4899'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#fbcfe8'; this.style.transform='translateY(0)'">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div id="quiz-result-feedback" style="margin-top:1rem; font-size:0.95rem; font-weight:700; font-family:'Cairo', sans-serif; min-height:1.5rem;"></div>
            </div>
        `;
    };

    window.checkLoveQuizAnswer = function (idx) {
        const quiz = LOVE_QUIZ_DATA[(currentQuizIdx - 1 + LOVE_QUIZ_DATA.length) % LOVE_QUIZ_DATA.length];
        const feedback = document.getElementById('quiz-result-feedback');
        if (!feedback) return;

        if (idx === quiz.correct) {
            feedback.style.color = '#a43073';
            feedback.innerHTML = `✨ ${quiz.msg}`;
            burstHearts(window.innerWidth / 2, window.innerHeight / 2);
            if (typeof anime !== 'undefined') {
                spawnAnimeHearts(window.innerWidth / 2, window.innerHeight / 2);
            }
            setTimeout(() => {
                closeLoveQuizModal();
            }, 2500);
        } else {
            feedback.style.color = '#ba1a1a';
            feedback.innerHTML = '❌ فكري تاني يا قمر! إجابة قريبة جداً ❤️';
        }
    };

    window.closeLoveQuizModal = function () {
        const modal = document.getElementById('quiz-modal');
        if (modal) modal.style.display = 'none';
    };

    function injectQuizFloatingButton() {
        if (document.getElementById('floating-quiz-pill')) return;
        const btn = document.createElement('button');
        btn.id = 'floating-quiz-pill';
        btn.onclick = () => window.openLoveQuizModal();
        const isMobile = window.innerWidth < 768;
        btn.style.cssText = isMobile
            ? 'position:fixed; bottom:calc(5.2rem + env(safe-area-inset-bottom)); left:1rem; z-index:45; background:rgba(255, 240, 245, 0.95); backdrop-filter:blur(14px); border:1.5px solid #fbcfe8; color:#a43073; font-weight:700; font-size:0.8rem; padding:0.45rem 0.9rem; border-radius:9999px; cursor:pointer; box-shadow:0 6px 18px rgba(164, 48, 115, 0.18); display:flex; align-items:center; gap:0.35rem; font-family:"Cairo", sans-serif; transition:all 0.3s;'
            : 'position:fixed; bottom:1.5rem; left:1.5rem; z-index:45; background:rgba(255, 240, 245, 0.95); backdrop-filter:blur(14px); border:1.5px solid #fbcfe8; color:#a43073; font-weight:700; font-size:0.85rem; padding:0.55rem 1.1rem; border-radius:9999px; cursor:pointer; box-shadow:0 8px 22px rgba(164, 48, 115, 0.16); display:flex; align-items:center; gap:0.4rem; font-family:"Cairo", sans-serif; transition:all 0.3s;';
        btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-pulse">quiz</span><span>سؤال حب ✨</span>`;
        btn.onmouseover = function () { this.style.transform = 'scale(1.05)'; };
        btn.onmouseout = function () { this.style.transform = 'scale(1)'; };
        document.body.appendChild(btn);
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectMobileStyles();
        initPlayer();
        initAuth();
        initLoveModal();
        initCounter();
        initSeamlessNavigation();

        initConstellationStarlight();
        initFloatingRosePetals();
        injectQuizFloatingButton();

        const curPage = getPageName(location.pathname);
        if (curPage === 'index') {
            setupHeroHeart();
            window.initHomePageAnimations();
        } else if (curPage === 'timeline') {
            window.initTimelinePage();
        } else if (curPage === 'gallery') {
            window.initGalleryPage();
        } else if (curPage === 'letter') {
            window.initLetterPage();
        }
    });
})();


