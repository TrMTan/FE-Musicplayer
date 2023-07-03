/**
    1. Render songs
    2.Scroll top
    3.Play / pause/ seek
    4. CD rotate
    5.Next / Prev
    6.Random
    7.Next / repeat when ended
    8.Active song
    9.Scroll active song into view
    10.Play song when click
**/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const playlist = $('.playlist');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play'); 
const player = $('.player');
const progress = $('#progress');
const html = $('html');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    // config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    // setConfig: function(key, value) {
    //     this.config[key] = value;
    //     localStorage.setItem(PLAYER_STORAGE_KEY, this.config);
    // },

    songs: [
        {
            name: 'Waiting For You',
            singer: 'Mono',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.png'
        },
        {
            name: 'Ưng quá chừng',
            singer: 'Amee',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.png'
        },
        {
            name: 'Ghệ iu dấu của em ơi',
            singer: 'Tlinh',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.png'
        },
        {
            name: 'Thu cuối',
            singer: 'Tlinh',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Meo Meo',
            singer: 'Tlinh',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'Gâu Gâu',
            singer: 'Tlinh',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        }
    ],
    // 1. Render songs
    // 2. Scroll top
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        });
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    // Xử lý sự kiện
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // xử lý phóng to thu nhỏ cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : '0';
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }

        // Khi bài hát được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi bài hát được pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // Xử lý khi tua bài hát
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // bấm space để dừng và tiếp tục bài hát
        html.onkeypress = function(e) {
            e.preventDefault();
            if(e.keyCode == 32 && _this.isPlaying){
                audio.pause();
            }else if(e.keyCode == 32 && _this.isPlaying == false){
                audio.play();
            }
        }

        // Chuyển sang bài hát tiếp theo
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Chuyển sang bài hát trước đó
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Xử lý bật / tắt random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            // _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);

        }
        // Xử lý lặp lại 1 bài hát
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            // _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
        // xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play();
            } else {
                nextBtn.onclick();
            }
        }
        // lắng nghe ahnfh vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                // xử lý khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                // xử lý khi click vào song option
                if(e.target.closest('.option')) {

                }
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest', 
            })
        }, 300)
    },
    // Lấy bài hát đầu tiên
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },
    // loadConfig: function() {
    //     this.isRandom = this.config.isRandom;
    //     this.isRepeat = this.config.isRepeat;
    // },
    // Next bài hát tiếp theo
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    // Quay lại bài hát lúc trước
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    // Random bài hát
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        // gán cấu hình từ config vào ứng dụng
        // this.config();

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        //  tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();
    }
}

app.start();

