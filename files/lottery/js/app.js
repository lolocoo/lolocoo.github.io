const qs = (elem) => document.querySelector(elem);
const qsa = (elems) => document.querySelectorAll(elems);
const stringify = JSON.stringify;
const ls = window.localStorage;
const $body = qs('body');
const $app = qs('#app');
const originUrl = 'https://form.powski.cn';
// service 
let service = {
    index(id = 2) {
        return fetch(`https://form.powski.cn/forms/${id}`).then(res => res.json());
    },
    user({ id = 1, mobile = '', name =''} = {}) {
        let option = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: stringify({mobile, name})
        };
        return fetch(`https://form.powski.cn/forms/${id}/formdata`, option).then(res => res.json());
    }
};

let lottery = {
    timer: null,
    selectIndex: 0,
    speed: 100,
    couter: 0,
    loop: 40,
    win: 0,
    roll() {
        let allItems = qsa('[class*="prize"]');
        allItems.forEach(item => item.classList.remove('selected'));
        qs(`.prize-${this.couter % 8}`).classList.add('selected');
    },
    draw(elem) {
        this.timer = setTimeout(() => {
            this.couter++;
            if (this.couter > this.loop + this.win - 6) {
                this.speed += 100;
            }
            this.roll();
            if (this.couter < this.loop + this.win) {
                this.draw();
            } else {
                this.couter = 0;
                this.speed = 100;
                // app.switchPage('Loading');
                app.initPrizePage();
                ls.participation = true;
                clearTimeout(this.timer);
            }
        }, this.speed);
    },
    initLotteryPage(data) {
        // <div class="prize-level">${item['prize_item_name']}</div>
        let createItem = (index) => {
            let item = data[index];
            return `
            <div class="item prize-${index}">
                <div class="prize-image"><img src="${originUrl + item['image']}" /></div>
                <div class="prize-name">${item['prize_name']}</div>
            </div>
            `
        }
        let pageSource = `
            <div class="lottery">
                ${createItem(0)}
                ${createItem(1)}
                ${createItem(2)}
                ${createItem(7)}
                <div id="drawBtn" class="item prize"></div>
                ${createItem(3)}
                ${createItem(6)}
                ${createItem(5)}
                ${createItem(4)}
        </div>`;
        qs('#pageLottery').innerHTML = pageSource;
        app.switchPage('Index');
        qs('#drawBtn').addEventListener('click', () => {
            this.draw();
        })
    },
    init(data) {
        this.initLotteryPage(data);
    }
};

let pageLoading = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 300);
});

let app = {
    currentPage: '',
    toast(message) {
        if (qsa('.toast').length) return;
        let toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = message;
        $body.appendChild(toast);
        setTimeout(() => toast.remove(), 1000);
    },
    validateForm() {
        let $name = qs('#username'), $mobile = qs('#mobile');
        let mobileReg = /(^1[3|4|5|7|8|9]\d{9}$)|(^09\d{8}$)/;
        let nameReg = /^[\u4E00-\u9FA5]{2,4}$/;
        if ([$name, $mobile].every(item => !item.value)) {
            this.toast('请填写表单');
            return false;
        }
        if ($name.value.length < 2) {
            this.toast('请正确填写姓名');
            return false;
        }
        if (!mobileReg.test($mobile.value)) {
            this.toast('请正确填写手机号');
            return false;
        }
        return true;
    },
    switchPage(pageName, cb) {
        qsa('.page').forEach(page => page.classList.remove('visible'));
        qs(`#page${pageName}`).classList.add('visible');
        cb && cb();
    },
    initPrizePage() {
        let html = document.createElement('div');
        let prize = this.prize;
        html.id = 'pageAck';
        html.className = 'page'
        html.innerHTML = `
            <h3>${this.indexData.winText}</h3>
            <h3>${prize.prize_item_name}</h3>
            <p><img src="${originUrl + prize.image}" /></p>
            <p>${prize.prize_name}</p>
            <p>${this.indexData.acceptDesc}</p>
            <p>谢谢您的参与</p>
        `;
        $app.appendChild(html);
        setTimeout(() => this.switchPage('Ack'), 600);
    },
    initIndexPage(id) {
        let that = this;
        service.index(id).then(res => {
            app.indexData = res;
            qs('#formTitle').innerHTML = res.title;
            qs('#formDescription').innerHTML = res.desc;
            app.switchPage('Index');
            qs('#sendUserInfo').addEventListener('touchend', () => {
                if (!this.validateForm()) return false;
                service.user({ id, mobile: qs('#mobile').value, name: qs('#username').value }).then(res => {
                    console.log(res);
                    that.prize = res.prize;
                    // lottery.win = app.prize.id - 1;
                    lottery.win = app.indexData.prizes.findIndex(item => item.id == app.prize.id);
                    app.switchPage('Lottery', lottery.init(app.indexData.prizes));
                });
            }, false);
        });
        
    },
    init(id) {
        this.initIndexPage(id);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init(26);
}, false);

(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = 16 *(clientWidth / 375) + 'px';
        };
    
    recalc();
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
})(document, window);