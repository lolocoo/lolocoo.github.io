(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = 16 * (clientWidth / 375) + 'px';
        };
    
    recalc();
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
})(document, window);


let stringify = JSON.stringify;
let app = {
    url:  'https://form.powski.cn/forms/2',
    posturl: 'https://form.powski.cn/forms/1/formdata',
    formdata() {
        $.ajax({
            url: this.url
        }).then(res => {
            this.data = res;
            this.initIndexPage();
        });
    },
    submitIndexForm() {
        let that = this;
        this.$body.on('click', '#form-submit', function(){
            console.log('hello');
            $.ajax({
                url: that.posturl,
                type: 'POST',
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                data: stringify({
                    'mobile': '123456',
                    'name': 'shit'
                })
            }).then(res => {
                console.log(res);
                $('#app-lottery').addClass('show');
            })
        });
    },
    initIndexPage() {
        this.$title.html(this.data.title);
        this.$description.html(this.data.desc);
        this.submitIndexForm()
    },
    init() {
        this.$body = $('body');
        this.$title = $('#form-title');
        this.$description = $('#form-desc');
        this.formdata();
    }
}

$(function(){
    app.init();
});