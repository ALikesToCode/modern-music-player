document.addEventListener('DOMContentLoaded', () => {
    // Player elements
    const playBtn = document.querySelector('.play-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const shuffleBtn = document.querySelector('.shuffle-btn');
    const repeatBtn = document.querySelector('.repeat-btn');
    const shareBtn = document.querySelector('.share-btn');
    const progressBar = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-bar');
    const volumeSlider = document.querySelector('.volume-slider');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    const playlistContainer = document.querySelector('.playlist');

    // Share modal elements
    const shareModal = document.getElementById('shareModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const copyUrlBtn = document.querySelector('.copy-url');
    const shareUrlInput = document.getElementById('shareUrl');
    const shareOptions = document.querySelectorAll('.share-option');

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

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function loadTrack(index) {
        const track = playlist[index];
        currentAudio.src = track.audioSrc;
        document.querySelector('.track-name').textContent = track.title;
        document.querySelector('.artist-name').textContent = track.artist;
        document.querySelector('.album-art').src = track.cover;
        
        // Reset progress
        progressBar.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        
        // Load audio metadata
        currentAudio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(currentAudio.duration);
            track.duration = formatTime(currentAudio.duration);
            updatePlaylistDuration(index, formatTime(currentAudio.duration));
        });

        // Update playlist active state
        updatePlaylist();

        if (isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            currentAudio.play();
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function updatePlaylist() {
        playlistContainer.innerHTML = '';

        playlist.forEach((track, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
            playlistItem.innerHTML = `
                <img src="${track.cover}" alt="${track.title}" loading="lazy">
                <div class="playlist-item-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                </div>
                <span class="duration">${track.duration}</span>
            `;
            
            playlistItem.addEventListener('click', () => {
                if (currentTrackIndex !== index) {
                    currentTrackIndex = index;
                    loadTrack(currentTrackIndex);
                    isPlaying = true;
                    updatePlayState();
                }
            });
            
            playlistContainer.appendChild(playlistItem);
        });
    }

    function updatePlaylistDuration(index, duration) {
        const playlistItems = document.querySelectorAll('.playlist-item');
        if (playlistItems[index]) {
            playlistItems[index].querySelector('.duration').textContent = duration;
        }
    }

    function updatePlayState() {
        if (isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            currentAudio.play();
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            currentAudio.pause();
        }
    }

    // Player controls
    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        updatePlayState();
    });

    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) currentAudio.play();
    });

    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) currentAudio.play();
    });

    // Progress bar
    currentAudio.addEventListener('timeupdate', () => {
        const percentage = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = `${percentage}%`;
        currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    });

    progressContainer.addEventListener('click', (e) => {
        const clickPosition = e.offsetX / progressContainer.offsetWidth;
        currentAudio.currentTime = clickPosition * currentAudio.duration;
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        currentAudio.volume = value / 100;
    });

    // Share functionality
    function openShareModal() {
        const track = playlist[currentTrackIndex];
        const shareUrl = `${window.location.origin}${window.location.pathname}?song=${track.id}`;
        const embedUrl = `${window.location.origin}${window.location.pathname}?song=${track.id}&embed=true`;
        const embedCode = `<iframe src="${embedUrl}" width="100%" height="180" frameborder="0" allow="autoplay"></iframe>`;
        
        // Update preview
        document.querySelector('.share-preview-image').src = track.cover;
        document.querySelector('.share-preview-title').textContent = track.title;
        document.querySelector('.share-preview-artist').textContent = track.artist;
        
        // Update share URL
        shareUrlInput.value = shareUrl;
        
        // Update embed code
        document.querySelector('.embed-url').value = embedCode;
        
        // Show embed preview
        const embedPreview = document.querySelector('.embed-preview');
        embedPreview.innerHTML = embedCode;
        
        // Show modal
        shareModal.classList.add('active');
        shareUrlInput.select();
    }

    function closeShareModal() {
        shareModal.classList.remove('active');
    }

    async function copyShareUrl() {
        try {
            await navigator.clipboard.writeText(shareUrlInput.value);
            const originalText = copyUrlBtn.innerHTML;
            copyUrlBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyUrlBtn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    async function copyEmbedCode() {
        try {
            const embedInput = document.querySelector('.embed-url');
            await navigator.clipboard.writeText(embedInput.value);
            const copyEmbedBtn = document.querySelector('.copy-embed');
            const originalText = copyEmbedBtn.innerHTML;
            copyEmbedBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyEmbedBtn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy embed code:', err);
        }
    }

    // Share modal event listeners
    shareBtn.addEventListener('click', openShareModal);
    closeModalBtn.addEventListener('click', closeShareModal);
    copyUrlBtn.addEventListener('click', copyShareUrl);
    document.querySelector('.copy-embed').addEventListener('click', copyEmbedCode);
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            closeShareModal();
        }
    });

    shareOptions.forEach(button => {
        button.addEventListener('click', () => {
            const track = playlist[currentTrackIndex];
            const shareUrl = `${window.location.origin}${window.location.pathname}?song=${track.id}`;
            const text = `Listen to ${track.title} by ${track.artist}`;
            
            let url;
            switch (button.dataset.platform) {
                case 'facebook':
                    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                    break;
                case 'twitter':
                    url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                    break;
                case 'whatsapp':
                    url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
                    break;
                case 'telegram':
                    url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
                    break;
            }
            
            if (url) {
                window.open(url, '_blank', 'width=600,height=400');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && shareModal.classList.contains('active')) {
            closeShareModal();
        }
    });

    // Load song from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get('song');
    if (songId) {
        const songIndex = playlist.findIndex(track => track.id === songId);
        if (songIndex !== -1) {
            currentTrackIndex = songIndex;
        }
    }

    // Initialize player
    updatePlaylist();
    loadTrack(currentTrackIndex);
});
