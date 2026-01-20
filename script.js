// script.js - Clean Professional Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Register Service Worker for offline functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    // Music Database
    const musicDatabase = {
        eng: [
            { 
                id: 'apt',
                filename: 'apt.mp3',
                title: 'APT.', 
                artist: 'Mild Minds',
                duration: '3:42',
                path: 'eng/apt.mp3'
            },
            { 
                id: 'cakebytheocean',
                filename: 'cakebytheocean.mp3',
                title: 'Cake By The Ocean', 
                artist: 'DNCE',
                duration: '3:39',
                path: 'eng/cakebytheocean.mp3'
            },
            { 
                id: 'dandelions',
                filename: 'dandelions.mp3',
                title: 'Dandelions', 
                artist: 'Ruth B.',
                duration: '3:53',
                path: 'eng/dandelions.mp3'
            },
            { 
                id: 'devilindisguise',
                filename: 'devilindisguise.mp3',
                title: 'Devil In Disguise', 
                artist: 'Marino',
                duration: '2:58',
                path: 'eng/devilindisguise.mp3'
            },
            { 
                id: 'dietmountaindew',
                filename: 'dietmountaindew.mp3',
                title: 'Diet Mountain Dew', 
                artist: 'Lana Del Rey',
                duration: '3:43',
                path: 'eng/dietmountaindew.mp3'
            },
            { 
                id: 'fairytale',
                filename: 'fairytale.mp3',
                title: 'Fairytale', 
                artist: 'Alexander Rybak',
                duration: '3:03',
                path: 'eng/fairytale.mp3'
            },
            { 
                id: 'heatwaves',
                filename: 'heatwaves.mp3',
                title: 'Heat Waves', 
                artist: 'Glass Animals',
                duration: '3:58',
                path: 'eng/heatwaves.mp3'
            },
            { 
                id: 'mmmyeah',
                filename: 'mmmyeah.mp3',
                title: 'Mmm Yeah', 
                artist: 'Austin Mahone ft. Pitbull',
                duration: '3:45',
                path: 'eng/mmmyeah.mp3'
            },
            { 
                id: 'perfect',
                filename: 'perfect.mp3',
                title: 'Perfect', 
                artist: 'Ed Sheeran',
                duration: '4:23',
                path: 'eng/perfect.mp3'
            },
            { 
                id: 'seeyouagain',
                filename: 'seeyouagain.mp3',
                title: 'See You Again', 
                artist: 'Wiz Khalifa ft. Charlie Puth',
                duration: '3:57',
                path: 'eng/seeyouagain.mp3'
            },
            { 
                id: 'shapeofyou',
                filename: 'shapeofyou.mp3',
                title: 'Shape of You', 
                artist: 'Ed Sheeran',
                duration: '3:53',
                path: 'eng/shapeofyou.mp3'
            },
            { 
                id: 'smoothoperator',
                filename: 'smoothoperator.mp3',
                title: 'Smooth Operator', 
                artist: 'Sade',
                duration: '4:15',
                path: 'eng/smoothoperator.mp3'
            },
            { 
                id: 'starboy',
                filename: 'starboy.mp3',
                title: 'Starboy', 
                artist: 'The Weeknd ft. Daft Punk',
                duration: '3:50',
                path: 'eng/starboy.mp3'
            },
            { 
                id: 'staywithme',
                filename: 'staywithme.mp3',
                title: 'Stay With Me', 
                artist: 'Sam Smith',
                duration: '2:52',
                path: 'eng/staywithme.mp3'
            },
            { 
                id: 'untilifoundyou',
                filename: 'untilifoundyou.mp3',
                title: 'Until I Found You', 
                artist: 'Stephen Sanchez',
                duration: '2:57',
                path: 'eng/untilifoundyou.mp3'
            }
        ],
        hin: []
    };

    // DOM Elements
    const engTab = document.getElementById('eng-tab');
    const hinTab = document.getElementById('hin-tab');
    const engSongsContainer = document.getElementById('eng-songs');
    const hinSongsContainer = document.getElementById('hin-songs');
    const miniPlayer = document.getElementById('mini-player');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const progressFill = document.getElementById('progress-fill');
    const progressThumb = document.getElementById('progress-thumb');
    const progressBarMini = document.querySelector('.progress-bar-mini');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const totalSongsEl = document.getElementById('total-songs');
    const totalDurationEl = document.getElementById('total-duration');
    const audioPlayer = document.getElementById('audio-player');
    const miniPlayerClickable = document.getElementById('mini-player-clickable');
    const cachedSongsEl = document.getElementById('cached-songs');

    // Player State
    let currentSong = null;
    let isPlaying = false;
    let isMuted = false;
    let currentCategory = 'eng';
    let currentSongIndex = -1;
    let currentSongs = [];
    let lastPlayingCard = null;
    let queue = [];
    let updateProgressInterval = null;

    // Initialize Application
    function init() {
        renderSongs('eng');
        setupEventListeners();
        updateStats();
        updateOfflineStatus();
    }

    // Update offline status
    function updateOfflineStatus() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Service worker is active
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Ready for Offline';
            }
            cachedSongsEl.textContent = musicDatabase.eng.length;
        }
    }

    // Render songs for a category
    function renderSongs(category) {
        const container = category === 'eng' ? engSongsContainer : hinSongsContainer;
        const songs = musicDatabase[category];
        currentSongs = songs;

        container.innerHTML = '';

        if (songs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <h3>No ${category === 'eng' ? 'English' : 'Hindi'} Songs</h3>
                <p>Add your ${category === 'eng' ? 'English' : 'Hindi'} songs to the '${category}/' folder</p>
                <button class="add-songs-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Songs
                </button>
            `;
            container.appendChild(emptyState);

            const addBtn = emptyState.querySelector('.add-songs-btn');
            addBtn.addEventListener('click', () => {
                showNotification(`Add MP3 files to the '${category}/' folder`);
            });
            return;
        }

        songs.forEach((song, index) => {
            const songCard = createSongCard(song, index);
            container.appendChild(songCard);
        });
    }

    // Create song card element
    function createSongCard(song, index) {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.dataset.id = song.id;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="song-header">
                <div class="song-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                </div>
                <div class="song-meta">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
            </div>
            <div class="song-footer">
                <div class="song-duration">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>${song.duration}</span>
                </div>
                <div class="song-actions">
                    <button class="action-btn play-btn" data-action="play" title="Play">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                    </button>
                    <button class="action-btn" data-action="queue" title="Add to Queue">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="playing-indicator">
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                playSong(song, index);
            }
        });

        const playBtn = card.querySelector('.play-btn');
        const queueBtn = card.querySelector('[data-action="queue"]');

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSong(song, index);
        });

        queueBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToQueue(song);
        });

        return card;
    }

    // Set up event listeners
    function setupEventListeners() {
        engTab.addEventListener('click', () => switchCategory('eng'));
        hinTab.addEventListener('click', () => switchCategory('hin'));

        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);
        muteBtn.addEventListener('click', toggleMute);

        progressBarMini.addEventListener('click', seekAudio);
        progressBarMini.addEventListener('mousemove', (e) => {
            updateThumbPosition(e);
            progressThumb.style.opacity = '1';
        });
        progressBarMini.addEventListener('mouseleave', () => {
            progressThumb.style.opacity = '0';
        });

        miniPlayerClickable.addEventListener('click', openFullPlayer);

        audioPlayer.addEventListener('loadedmetadata', updateDuration);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', playNext);
        audioPlayer.addEventListener('error', handleAudioError);

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlayPause();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                if (audioPlayer.duration) {
                    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
                }
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                if (audioPlayer.duration) {
                    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
                }
            }
        });
    }

    // Switch between categories
    function switchCategory(category) {
        currentCategory = category;

        engTab.classList.toggle('active', category === 'eng');
        hinTab.classList.toggle('active', category === 'hin');

        engSongsContainer.classList.toggle('active', category === 'eng');
        hinSongsContainer.classList.toggle('active', category === 'hin');

        currentSongs = musicDatabase[category];
        currentSongIndex = -1;

        if (lastPlayingCard) {
            lastPlayingCard.classList.remove('playing');
        }
        if (isPlaying) {
            pauseAudio();
        }
    }

    // Play a song
    function playSong(song, index) {
        if (lastPlayingCard) {
            lastPlayingCard.classList.remove('playing');
        }

        const cards = document.querySelectorAll('.song-card');
        if (cards[index]) {
            cards[index].classList.add('playing');
            lastPlayingCard = cards[index];
        }

        currentSong = song;
        currentSongIndex = index;

        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;

        miniPlayer.classList.add('active');

        audioPlayer.src = song.path;

        const playPromise = audioPlayer.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayButton();
                startProgressUpdate();
            }).catch(error => {
                console.error('Error playing audio:', error);
                showNotification('Click the play button to start playback');
                isPlaying = false;
                updatePlayButton();
            });
        }
    }

    // Play audio
    function playAudio() {
        if (!currentSong) return;

        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayButton();
            startProgressUpdate();
        }).catch(error => {
            console.error('Error playing audio:', error);
            showNotification('Error playing audio');
        });
    }

    // Pause audio
    function pauseAudio() {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayButton();
        stopProgressUpdate();
    }

    // Toggle play/pause
    function togglePlayPause() {
        if (!currentSong) {
            if (currentSongs.length > 0) {
                playSong(currentSongs[0], 0);
            }
            return;
        }

        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    // Play previous song
    function playPrevious() {
        if (currentSongs.length === 0) return;

        let newIndex = currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = currentSongs.length - 1;
        }

        playSong(currentSongs[newIndex], newIndex);
    }

    // Play next song
    function playNext() {
        if (currentSongs.length === 0) return;

        if (queue.length > 0) {
            const nextSong = queue.shift();
            const index = currentSongs.findIndex(song => song.id === nextSong.id);
            if (index !== -1) {
                playSong(currentSongs[index], index);
                showNotification('Playing from queue');
                return;
            }
        }

        let newIndex = currentSongIndex + 1;
        if (newIndex >= currentSongs.length) {
            newIndex = 0;
        }

        playSong(currentSongs[newIndex], newIndex);
    }

    // Toggle mute
    function toggleMute() {
        isMuted = !isMuted;
        audioPlayer.muted = isMuted;

        const volumeSvg = volumeIcon.querySelector('svg');
        if (isMuted) {
            volumeSvg.innerHTML = '<path d="M17 6l-6 6H7v6h4l6 6V6z"/><path d="M21 9l-6 6M15 9l6 6"/>';
        } else {
            volumeSvg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>';
        }
    }

    // Update play button icon
    function updatePlayButton() {
        const playSvg = playIcon.querySelector('svg');
        if (isPlaying) {
            playSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        } else {
            playSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        }
    }

    // Update progress bar
    function updateProgress() {
        if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;

        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progress}%`;
        progressThumb.style.left = `${progress}%`;

        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }

    // Update duration display
    function updateDuration() {
        if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
            totalTimeEl.textContent = formatTime(audioPlayer.duration);
        }
    }

    // Seek audio
    function seekAudio(e) {
        if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;

        const rect = progressBarMini.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        const time = percent * audioPlayer.duration;

        audioPlayer.currentTime = time;
        updateProgress();
    }

    // Update thumb position on hover
    function updateThumbPosition(e) {
        if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;

        const rect = progressBarMini.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        progressThumb.style.left = `${percent * 100}%`;
    }

    // Start progress update interval
    function startProgressUpdate() {
        stopProgressUpdate();
        updateProgressInterval = setInterval(updateProgress, 100);
    }

    // Stop progress update interval
    function stopProgressUpdate() {
        if (updateProgressInterval) {
            clearInterval(updateProgressInterval);
            updateProgressInterval = null;
        }
    }

    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Add song to queue
    function addToQueue(song) {
        if (queue.some(item => item.id === song.id)) {
            showNotification('Song already in queue');
            return;
        }

        queue.push(song);
        showNotification(`${song.title} added to queue`);
    }

    // Show notification
    function showNotification(message) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('slide-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Handle audio error
    function handleAudioError() {
        console.error('Audio error:', audioPlayer.error);
        showNotification('Error playing audio file');

        isPlaying = false;
        updatePlayButton();
        stopProgressUpdate();

        if (lastPlayingCard) {
            lastPlayingCard.classList.remove('playing');
        }
    }

    // Open full player
    function openFullPlayer() {
        if (!currentSong) {
            showNotification('Select a song first');
            return;
        }

        const playerState = {
            song: currentSong,
            category: currentCategory,
            songs: currentSongs,
            queue: queue,
            currentTime: audioPlayer.currentTime,
            isPlaying: isPlaying
        };

        try {
            localStorage.setItem('playerState', JSON.stringify(playerState));
            window.location.href = 'player/index.html';
        } catch (error) {
            console.error('Error saving player state:', error);
            showNotification('Cannot open player. Please try again.');
        }
    }

    // Update stats
    function updateStats() {
        const totalSongs = musicDatabase.eng.length + musicDatabase.hin.length;

        let totalSeconds = 0;
        musicDatabase.eng.forEach(song => {
            const [mins, secs] = song.duration.split(':').map(Number);
            totalSeconds += mins * 60 + secs;
        });

        totalSongsEl.textContent = totalSongs;
        totalDurationEl.textContent = formatTime(totalSeconds);
    }

    // Initialize the application
    init();
});