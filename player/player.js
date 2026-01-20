// player.js - Full Player Implementation
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const backBtn = document.querySelector('.back-btn');
    const albumArtLarge = document.getElementById('album-art-large');
    const songTitleLarge = document.getElementById('full-player-title');
    const songArtistLarge = document.getElementById('full-player-artist');
    const songDurationEl = document.querySelector('#song-duration span');
    const playBtnLarge = document.getElementById('play-btn-large');
    const playIconLarge = document.getElementById('play-icon-large');
    const prevBtnLarge = document.getElementById('prev-btn-large');
    const nextBtnLarge = document.getElementById('next-btn-large');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const muteBtnLarge = document.getElementById('volume-mute-btn-large');
    const volumeIconLarge = document.getElementById('volume-icon-large');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBarLarge = document.getElementById('progress-bar-large');
    const progressFillLarge = document.getElementById('progress-fill-large');
    const currentTimeLarge = document.getElementById('current-time-large');
    const totalTimeLarge = document.getElementById('total-time-large');
    const suggestionsList = document.getElementById('suggestions-list');
    const queueList = document.getElementById('queue-list');
    const refreshBtn = document.getElementById('refresh-suggestions');
    const likeBtn = document.getElementById('like-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const lyricsBtn = document.getElementById('lyrics-btn');
    const audioPlayerLarge = document.getElementById('audio-player-large');

    // Player State
    let playerState = null;
    let currentSong = null;
    let currentSongs = [];
    let currentQueue = [];
    let suggestions = [];
    let isPlaying = false;
    let isMuted = false;
    let isShuffled = false;
    let repeatMode = 'off'; // 'off', 'one', 'all'
    let volume = 80;
    let currentSongIndex = -1;
    let updateProgressInterval = null;
    let likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    let originalSongsOrder = [];
    let shuffledSongs = [];

    // Initialize Player
    function init() {
        loadPlayerState();
        setupEventListeners();
        updateVolumeDisplay();

        if (currentSong) {
            loadSong(currentSong);
            loadSuggestions();
            loadQueue();
        }
    }

    // Load player state from localStorage
    function loadPlayerState() {
        try {
            const savedState = localStorage.getItem('playerState');
            if (savedState) {
                playerState = JSON.parse(savedState);
                currentSong = playerState.song;
                currentSongs = playerState.songs || [];
                currentQueue = playerState.queue || [];
                isPlaying = playerState.isPlaying || false;
                originalSongsOrder = [...currentSongs];

                if (currentSong) {
                    updateSongInfo();
                    updatePlayButton();
                }
            }
        } catch (error) {
            console.error('Error loading player state:', error);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Navigation
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            savePlayerState();
            window.location.href = '../index.html';
        });

        // Player controls
        playBtnLarge.addEventListener('click', togglePlayPause);
        prevBtnLarge.addEventListener('click', playPrevious);
        nextBtnLarge.addEventListener('click', playNext);
        shuffleBtn.addEventListener('click', toggleShuffle);
        repeatBtn.addEventListener('click', toggleRepeat);
        muteBtnLarge.addEventListener('click', toggleMute);
        volumeSlider.addEventListener('input', updateVolume);

        // Progress bar
        progressBarLarge.addEventListener('click', seekAudio);

        // Additional controls
        likeBtn.addEventListener('click', toggleLike);
        downloadBtn.addEventListener('click', downloadSong);
        shareBtn.addEventListener('click', shareSong);
        lyricsBtn.addEventListener('click', showLyrics);
        refreshBtn.addEventListener('click', refreshSuggestions);

        // Audio events
        audioPlayerLarge.addEventListener('loadedmetadata', updateDuration);
        audioPlayerLarge.addEventListener('timeupdate', updateProgress);
        audioPlayerLarge.addEventListener('ended', handleSongEnd);
        audioPlayerLarge.addEventListener('error', handleAudioError);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (audioPlayerLarge.duration) {
                        audioPlayerLarge.currentTime = Math.max(0, audioPlayerLarge.currentTime - 5);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (audioPlayerLarge.duration) {
                        audioPlayerLarge.currentTime = Math.min(audioPlayerLarge.duration, audioPlayerLarge.currentTime + 10);
                    }
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'KeyL':
                    e.preventDefault();
                    toggleLike();
                    break;
            }
        });
    }

    // Load song
    function loadSong(song) {
        if (!song) return;

        currentSong = song;
        currentSongIndex = isShuffled ? 
            shuffledSongs.findIndex(s => s.id === song.id) :
            currentSongs.findIndex(s => s.id === song.id);

        // Update UI
        updateSongInfo();

        // Load audio
        audioPlayerLarge.src = song.path;

        if (isPlaying) {
            playAudio();
        }
    }

    // Update song info display
    function updateSongInfo() {
        if (!currentSong) return;

        songTitleLarge.textContent = currentSong.title;
        songArtistLarge.textContent = currentSong.artist;
        songDurationEl.textContent = currentSong.duration;

        // Update album art with animation
        albumArtLarge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
        </svg>`;

        // Update like button
        updateLikeButton();
    }

    // Play audio
    function playAudio() {
        if (!currentSong) return;

        const playPromise = audioPlayerLarge.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayButton();
                startProgressUpdate();
            }).catch(error => {
                console.error('Error playing audio:', error);
                showNotification('Click play button to start');
                isPlaying = false;
                updatePlayButton();
            });
        }
    }

    // Pause audio
    function pauseAudio() {
        audioPlayerLarge.pause();
        isPlaying = false;
        updatePlayButton();
        stopProgressUpdate();
    }

    // Toggle play/pause
    function togglePlayPause() {
        if (!currentSong) return;

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
            if (repeatMode === 'all') {
                newIndex = isShuffled ? shuffledSongs.length - 1 : currentSongs.length - 1;
            } else {
                newIndex = currentSongIndex;
            }
        }

        const songsList = isShuffled ? shuffledSongs : currentSongs;
        loadSong(songsList[newIndex]);
        if (isPlaying) {
            playAudio();
        }
    }

    // Play next song
    function playNext() {
        if (currentSongs.length === 0) return;

        if (currentQueue.length > 0) {
            const nextSong = currentQueue.shift();
            const index = (isShuffled ? shuffledSongs : currentSongs).findIndex(song => song.id === nextSong.id);
            if (index !== -1) {
                loadSong((isShuffled ? shuffledSongs : currentSongs)[index]);
                if (isPlaying) {
                    playAudio();
                }
                showNotification('Playing from queue');
                updateQueueDisplay();
                return;
            }
        }

        let newIndex = currentSongIndex + 1;
        const songsList = isShuffled ? shuffledSongs : currentSongs;

        if (newIndex >= songsList.length) {
            if (repeatMode === 'all') {
                newIndex = 0;
            } else {
                return; // Stop at last song if repeat is off
            }
        }

        loadSong(songsList[newIndex]);
        if (isPlaying) {
            playAudio();
        }
    }

    // Toggle shuffle
    function toggleShuffle() {
        isShuffled = !isShuffled;
        
        if (isShuffled) {
            // Create shuffled copy
            shuffledSongs = [...currentSongs].sort(() => Math.random() - 0.5);
            shuffleBtn.style.color = 'var(--primary)';
            showNotification('Shuffle On');
        } else {
            shuffleBtn.style.color = '';
            showNotification('Shuffle Off');
        }
    }

    // Toggle repeat
    function toggleRepeat() {
        const repeatModes = ['off', 'one', 'all'];
        const currentIndex = repeatModes.indexOf(repeatMode);
        repeatMode = repeatModes[(currentIndex + 1) % repeatModes.length];

        // Update button color
        repeatBtn.style.color = repeatMode === 'off' ? '' : 'var(--primary)';
        
        // Update icon
        const repeatSvg = repeatBtn.querySelector('svg');
        switch(repeatMode) {
            case 'one':
                repeatSvg.innerHTML = '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><path d="M11 16l-4 4 4 4"/>';
                showNotification('Repeat One');
                break;
            case 'all':
                repeatSvg.innerHTML = '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>';
                showNotification('Repeat All');
                break;
            default:
                repeatSvg.innerHTML = '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>';
                showNotification('Repeat Off');
        }
    }

    // Handle song end
    function handleSongEnd() {
        if (repeatMode === 'one') {
            audioPlayerLarge.currentTime = 0;
            audioPlayerLarge.play();
        } else {
            playNext();
        }
    }

    // Toggle mute
    function toggleMute() {
        isMuted = !isMuted;
        audioPlayerLarge.muted = isMuted;
        
        const volumeSvg = volumeIconLarge.querySelector('svg');
        if (isMuted) {
            volumeSvg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M17 9l6 6M23 9l-6 6"/>';
        } else {
            volumeSvg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        }
    }

    // Update volume
    function updateVolume() {
        volume = volumeSlider.value;
        audioPlayerLarge.volume = volume / 100;
        updateVolumeDisplay();
    }

    // Update volume display
    function updateVolumeDisplay() {
        const volumeSvg = volumeIconLarge.querySelector('svg');
        if (volume == 0) {
            volumeSvg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M17 9l6 6M23 9l-6 6"/>';
        } else if (volume < 50) {
            volumeSvg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        } else {
            volumeSvg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        }
    }

    // Update play button
    function updatePlayButton() {
        const playSvg = playIconLarge.querySelector('svg');
        if (isPlaying) {
            playSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        } else {
            playSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        }
    }

    // Update progress
    function updateProgress() {
        if (!audioPlayerLarge.duration || isNaN(audioPlayerLarge.duration)) return;

        const progress = (audioPlayerLarge.currentTime / audioPlayerLarge.duration) * 100;
        progressFillLarge.style.width = `${progress}%`;
        currentTimeLarge.textContent = formatTime(audioPlayerLarge.currentTime);
    }

    // Update duration
    function updateDuration() {
        if (audioPlayerLarge.duration && !isNaN(audioPlayerLarge.duration)) {
            totalTimeLarge.textContent = formatTime(audioPlayerLarge.duration);
        }
    }

    // Seek audio
    function seekAudio(e) {
        if (!audioPlayerLarge.duration || isNaN(audioPlayerLarge.duration)) return;

        const rect = progressBarLarge.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        const time = percent * audioPlayerLarge.duration;

        audioPlayerLarge.currentTime = time;
        updateProgress();
    }

    // Start progress update
    function startProgressUpdate() {
        stopProgressUpdate();
        updateProgressInterval = setInterval(updateProgress, 100);
    }

    // Stop progress update
    function stopProgressUpdate() {
        if (updateProgressInterval) {
            clearInterval(updateProgressInterval);
            updateProgressInterval = null;
        }
    }

    // Load suggestions
    function loadSuggestions() {
        if (!currentSongs || currentSongs.length === 0) return;

        // Filter out current song and get 5 random suggestions
        suggestions = currentSongs
            .filter(song => song.id !== currentSong?.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        updateSuggestionsDisplay();
    }

    // Update suggestions display
    function updateSuggestionsDisplay() {
        suggestionsList.innerHTML = '';

        if (suggestions.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'suggestion-item empty-suggestions';
            emptyItem.innerHTML = `
                <div class="suggestion-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                </div>
                <div class="suggestion-details">
                    <div class="suggestion-title">No suggestions available</div>
                    <div class="suggestion-artist">Play a song to get suggestions</div>
                </div>
            `;
            suggestionsList.appendChild(emptyItem);
            return;
        }

        suggestions.forEach(song => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <div class="suggestion-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                </div>
                <div class="suggestion-details">
                    <div class="suggestion-title">${song.title}</div>
                    <div class="suggestion-artist">${song.artist}</div>
                </div>
                <div class="suggestion-duration">${song.duration}</div>
            `;

            suggestionItem.addEventListener('click', () => {
                loadSong(song);
                if (isPlaying) {
                    playAudio();
                }
            });

            suggestionsList.appendChild(suggestionItem);
        });
    }

    // Load queue
    function loadQueue() {
        updateQueueDisplay();
    }

    // Update queue display
    function updateQueueDisplay() {
        queueList.innerHTML = '';

        if (currentQueue.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'queue-item empty-queue';
            emptyItem.innerHTML = `
                <div class="queue-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                </div>
                <div class="queue-details">
                    <div class="queue-title">Queue is empty</div>
                    <div class="queue-artist">Add songs from the library</div>
                </div>
            `;
            queueList.appendChild(emptyItem);
            return;
        }

        currentQueue.forEach((song, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            queueItem.innerHTML = `
                <div class="queue-icon">
                    <span>${index + 1}</span>
                </div>
                <div class="queue-details">
                    <div class="queue-title">${song.title}</div>
                    <div class="queue-artist">${song.artist}</div>
                </div>
                <div class="queue-duration">${song.duration}</div>
            `;

            queueItem.addEventListener('click', () => {
                currentQueue.splice(index, 1);
                loadSong(song);
                if (isPlaying) {
                    playAudio();
                }
                updateQueueDisplay();
            });

            queueList.appendChild(queueItem);
        });
    }

    // Toggle like
    function toggleLike() {
        if (!currentSong) return;

        const index = likedSongs.findIndex(song => song.id === currentSong.id);

        if (index === -1) {
            likedSongs.push(currentSong);
            showNotification('Added to favorites');
        } else {
            likedSongs.splice(index, 1);
            showNotification('Removed from favorites');
        }

        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
        updateLikeButton();
    }

    // Update like button
    function updateLikeButton() {
        if (!currentSong) return;

        const isLiked = likedSongs.some(song => song.id === currentSong.id);
        const likeSvg = likeBtn.querySelector('svg');
        if (isLiked) {
            likeSvg.style.fill = 'var(--primary)';
            likeSvg.style.stroke = 'var(--primary)';
        } else {
            likeSvg.style.fill = 'none';
            likeSvg.style.stroke = 'currentColor';
        }
    }

    // Download song
    function downloadSong() {
        if (!currentSong) {
            showNotification('No song selected');
            return;
        }

        try {
            const songUrl = `https://offlinesoundplay.github.io/${currentSong.path}`;
            
            const downloadLink = document.createElement('a');
            downloadLink.href = songUrl;
            downloadLink.download = currentSong.filename;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            
            downloadLink.click();
            
            setTimeout(() => {
                document.body.removeChild(downloadLink);
            }, 100);
            
            showNotification(`Downloading: ${currentSong.title}`);
        } catch (error) {
            console.error('Download error:', error);
            showNotification('Download failed. Please try again.');
        }
    }

    // Share song
    function shareSong() {
        if (!currentSong) {
            showNotification('No song selected');
            return;
        }

        const songUrl = `https://offlinesoundplay.github.io/${currentSong.path}`;
        const shareText = `Listening to "${currentSong.title}" by ${currentSong.artist}\n\nListen now: ${songUrl}\n\nvia OfflineSoundPlay`;

        if (navigator.share) {
            navigator.share({
                title: `${currentSong.title} - OfflineSoundPlay`,
                text: shareText,
                url: songUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                showNotification('Song link copied to clipboard!');
            }).catch(() => {
                prompt('Copy this link to share:', shareText);
            });
        }
    }

    // Show lyrics
    function showLyrics() {
        if (!currentSong) {
            showNotification('No song selected');
            return;
        }

        showNotification('Lyrics feature coming soon!');
    }

    // Refresh suggestions
    function refreshSuggestions() {
        loadSuggestions();
        showNotification('Suggestions refreshed');
    }

    // Handle audio error
    function handleAudioError() {
        console.error('Audio error:', audioPlayerLarge.error);
        showNotification('Error playing audio file');
        pauseAudio();
    }

    // Save player state
    function savePlayerState() {
        const stateToSave = {
            ...playerState,
            currentTime: audioPlayerLarge.currentTime,
            isPlaying: isPlaying,
            volume: volume,
            isMuted: isMuted,
            isShuffled: isShuffled,
            repeatMode: repeatMode,
            shuffledSongs: isShuffled ? shuffledSongs : []
        };

        try {
            localStorage.setItem('playerState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving player state:', error);
        }
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

    // Format time
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Initialize
    init();

    // Save state before leaving
    window.addEventListener('beforeunload', savePlayerState);
});