// script.js - Clean Professional Implementation
document.addEventListener('DOMContentLoaded', function() {
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
                id: 'untilfindyou',
                filename: 'untilfindyou.mp3',
                title: 'Until I Found You', 
                artist: 'Stephen Sanchez',
                duration: '2:57',
                path: 'eng/untilfindyou.mp3'
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
    const cacheProgressFill = document.getElementById('cache-progress-fill');
    const cachePercentage = document.getElementById('cache-percentage');
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
        simulateOfflineReady();
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
                    <i class="fas fa-folder-plus"></i>
                </div>
                <h3>No ${category === 'eng' ? 'English' : 'Hindi'} Songs</h3>
                <p>Add your ${category === 'eng' ? 'English' : 'Hindi'} songs to the '${category}/' folder</p>
                <button class="add-songs-btn">
                    <i class="fas fa-plus"></i>
                    Add Songs
                </button>
            `;
            container.appendChild(emptyState);
            
            // Add event listener to the button
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
                    <i class="fas fa-music"></i>
                </div>
                <div class="song-meta">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
            </div>
            <div class="song-footer">
                <div class="song-duration">
                    <i class="far fa-clock"></i>
                    <span>${song.duration}</span>
                </div>
                <div class="song-actions">
                    <button class="action-btn play-btn" data-action="play" title="Play">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn" data-action="queue" title="Add to Queue">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="playing-indicator">
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
            </div>
        `;
        
        // Add click events
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                playSong(song, index);
            }
        });
        
        // Add action button events
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
        // Category switching
        engTab.addEventListener('click', () => switchCategory('eng'));
        hinTab.addEventListener('click', () => switchCategory('hin'));
        
        // Player controls
        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);
        muteBtn.addEventListener('click', toggleMute);
        
        // Progress bar interaction
        progressBarMini.addEventListener('click', seekAudio);
        progressBarMini.addEventListener('mousemove', (e) => {
            updateThumbPosition(e);
            progressThumb.style.opacity = '1';
        });
        progressBarMini.addEventListener('mouseleave', () => {
            progressThumb.style.opacity = '0';
        });
        
        // Mini player click to open full player
        miniPlayerClickable.addEventListener('click', openFullPlayer);
        
        // Audio events
        audioPlayer.addEventListener('loadedmetadata', updateDuration);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', playNext);
        audioPlayer.addEventListener('error', handleAudioError);
        
        // Keyboard shortcuts
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
        
        // Update tabs
        engTab.classList.toggle('active', category === 'eng');
        hinTab.classList.toggle('active', category === 'hin');
        
        // Update song grids
        engSongsContainer.classList.toggle('active', category === 'eng');
        hinSongsContainer.classList.toggle('active', category === 'hin');
        
        // Update current songs list
        currentSongs = musicDatabase[category];
        currentSongIndex = -1;
        
        // Reset playing state
        if (lastPlayingCard) {
            lastPlayingCard.classList.remove('playing');
        }
        if (isPlaying) {
            pauseAudio();
        }
    }

    // Play a song
    function playSong(song, index) {
        // Update playing state
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
        
        // Update UI
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        
        // Show mini player
        miniPlayer.classList.add('active');
        
        // Load and play audio
        audioPlayer.src = song.path;
        
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayButton();
                startProgressUpdate();
            }).catch(error => {
                console.error('Error playing audio:', error);
                // Handle autoplay restrictions
                showNotification('Click the play button to start playback');
                isPlaying = false;
                updatePlayButton();
                // Set up click-to-play
                playPauseBtn.addEventListener('click', function handler() {
                    playAudio();
                    playPauseBtn.removeEventListener('click', handler);
                });
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
            // If no song is selected, play first song
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
            newIndex = currentSongs.length - 1; // Wrap to last song
        }
        
        playSong(currentSongs[newIndex], newIndex);
    }

    // Play next song
    function playNext() {
        if (currentSongs.length === 0) return;
        
        // Check queue first
        if (queue.length > 0) {
            const nextSong = queue.shift();
            const index = currentSongs.findIndex(song => song.id === nextSong.id);
            if (index !== -1) {
                playSong(currentSongs[index], index);
                showNotification('Playing from queue');
                return;
            }
        }
        
        // Otherwise play next in list
        let newIndex = currentSongIndex + 1;
        if (newIndex >= currentSongs.length) {
            newIndex = 0; // Wrap to first song
        }
        
        playSong(currentSongs[newIndex], newIndex);
    }

    // Toggle mute
    function toggleMute() {
        isMuted = !isMuted;
        audioPlayer.muted = isMuted;
        
        volumeIcon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }

    // Update play button icon
    function updatePlayButton() {
        playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
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
        // Don't add if already in queue
        if (queue.some(item => item.id === song.id)) {
            showNotification('Song already in queue');
            return;
        }
        
        queue.push(song);
        showNotification(`"${song.title}" added to queue`);
        
        // Update queue display
        updateQueueDisplay();
    }

    // Update queue display
    function updateQueueDisplay() {
        // This would update the queue UI if we had one
        console.log('Queue updated:', queue.map(s => s.title));
    }

    // Show notification
    function showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
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
        
        // Reset playing state
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
        
        // Save current state
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
        
        // Calculate total duration
        let totalSeconds = 0;
        musicDatabase.eng.forEach(song => {
            const [mins, secs] = song.duration.split(':').map(Number);
            totalSeconds += mins * 60 + secs;
        });
        
        totalSongsEl.textContent = totalSongs;
        totalDurationEl.textContent = formatTime(totalSeconds);
    }

    // Simulate offline ready status
    function simulateOfflineReady() {
        let progress = 0;
        const totalSongs = musicDatabase.eng.length;
        
        const cacheInterval = setInterval(() => {
            progress += 5;
            
            cacheProgressFill.style.width = `${progress}%`;
            cachePercentage.textContent = `${progress}%`;
            cachedSongsEl.textContent = Math.floor((progress / 100) * totalSongs);
            
            if (progress >= 100) {
                clearInterval(cacheInterval);
                cachePercentage.textContent = '100%';
                cachedSongsEl.textContent = totalSongs;
                
                // Update offline status
                const statusText = document.querySelector('.status-text');
                if (statusText) {
                    statusText.textContent = 'Ready for Offline';
                }
            }
        }, 100);
    }

    // Initialize the application
    init();
});