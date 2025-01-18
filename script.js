document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.querySelector('.play-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const shuffleBtn = document.querySelector('.shuffle-btn');
    const repeatBtn = document.querySelector('.repeat-btn');
    const shareBtn = document.querySelector('.share-btn');
    const progressBar = document.querySelector('.progress');
    const volumeSlider = document.querySelector('.volume-slider');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');

    let isPlaying = false;
    let currentAudio = new Audio();
    let currentTrackIndex = 0;

    // Playlist data
    const playlist = [
        {
            title: 'Conversation of Plant',
            artist: 'AI generated music',
            duration: '0:00',
            audioSrc: '/music/conversation_of_plant.mp3',
            cover: 'https://picsum.photos/200?1',
            id: 'conversation_of_plant'
        },
        {
            title: 'Non-cooperation Movement',
            artist: 'AI generated music',
            duration: '0:00',
            audioSrc: '/music/Non-cooperation-movenment.mp3',
            cover: 'https://picsum.photos/200?2',
            id: 'non_cooperation_movement'
        }
    ];

    // Update OpenGraph metadata
    function updateOpenGraphMetadata(track) {
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?song=${track.id}`;
        
        document.querySelector('meta[property="og:title"]').setAttribute('content', track.title);
        document.querySelector('meta[property="og:description"]').setAttribute('content', `Now playing: ${track.title} by ${track.artist}`);
        document.querySelector('meta[property="og:url"]').setAttribute('content', shareUrl);
        document.querySelector('meta[property="og:image"]').setAttribute('content', track.cover);
        document.querySelector('#og-audio').setAttribute('content', window.location.origin + track.audioSrc);
        document.querySelector('#og-audio-title').setAttribute('content', track.title);
        document.querySelector('#og-audio-artist').setAttribute('content', track.artist);

        // Update URL without reloading the page
        window.history.replaceState({}, '', shareUrl);
    }

    // Share functionality
    async function shareSong() {
        const track = playlist[currentTrackIndex];
        const shareUrl = `${window.location.origin}${window.location.pathname}?song=${track.id}`;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: track.title,
                    text: `Listen to ${track.title} by ${track.artist}`,
                    url: shareUrl
                });
            } else {
                // Fallback to copying to clipboard
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    }

    // Load song from URL parameter
    function loadSongFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const songId = urlParams.get('song');
        
        if (songId) {
            const songIndex = playlist.findIndex(track => track.id === songId);
            if (songIndex !== -1) {
                currentTrackIndex = songIndex;
                loadTrack(currentTrackIndex);
            }
        }
    }

    function loadTrack(index) {
        const track = playlist[index];
        currentAudio.src = track.audioSrc;
        document.querySelector('.track-name').textContent = track.title;
        document.querySelector('.artist-name').textContent = track.artist === 'Unknown Artist' ? 'AI generated music' : track.artist;
        document.querySelector('.album-art').src = track.cover;
        updateOpenGraphMetadata(track);
        
        // Update active playlist item
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Reset progress
        let progressWidth = 0;
        progressBar.style.width = '0%';
        
        // Load audio metadata
        currentAudio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(currentAudio.duration);
            track.duration = formatTime(currentAudio.duration);
            updatePlaylistDuration(index, formatTime(currentAudio.duration));
        });

        if (isPlaying) {
            currentAudio.play();
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function updatePlaylistDuration(index, duration) {
        const playlistItems = document.querySelectorAll('.playlist-item');
        if (playlistItems[index]) {
            playlistItems[index].querySelector('.duration').textContent = duration;
        }
    }

    // Toggle play/pause
    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            currentAudio.play();
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            currentAudio.pause();
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        currentAudio.volume = value / 100;
    });

    // Progress bar interaction
    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const progressBarWidth = progressBar.offsetWidth;
        const percentage = (clickPosition / progressBarWidth);
        currentAudio.currentTime = percentage * currentAudio.duration;
    });

    // Update progress bar and time
    currentAudio.addEventListener('timeupdate', () => {
        const percentage = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = `${percentage}%`;
        currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    });

    // Next and Previous buttons
    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    });

    // Populate playlist
    const playlistContainer = document.querySelector('.playlist');
    playlistContainer.innerHTML = ''; // Clear default item

    playlist.forEach((track, index) => {
        const playlistItem = document.createElement('div');
        playlistItem.className = `playlist-item ${index === 0 ? 'active' : ''}`;
        playlistItem.innerHTML = `
            <img src="${track.cover}" alt="${track.title}">
            <div class="playlist-item-info">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
            </div>
            <span class="duration">${track.duration}</span>
        `;
        playlistContainer.appendChild(playlistItem);

        // Add click event to playlist items
        playlistItem.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });
    });

    // Initialize shuffle and repeat button states
    let isShuffled = false;
    let isRepeating = false;

    shuffleBtn.addEventListener('click', () => {
        isShuffled = !isShuffled;
        shuffleBtn.style.color = isShuffled ? '#1db954' : '#fff';
    });

    repeatBtn.addEventListener('click', () => {
        isRepeating = !isRepeating;
        repeatBtn.style.color = isRepeating ? '#1db954' : '#fff';
    });

    // Handle track ending
    currentAudio.addEventListener('ended', () => {
        if (isRepeating) {
            currentAudio.play();
        } else if (isShuffled) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * playlist.length);
            } while (newIndex === currentTrackIndex && playlist.length > 1);
            currentTrackIndex = newIndex;
            loadTrack(currentTrackIndex);
        } else {
            nextBtn.click();
        }
    });

    // Add share button event listener
    shareBtn.addEventListener('click', shareSong);

    // Load song from URL when page loads
    loadSongFromUrl();

    // Initial load
    loadTrack(0);
});
