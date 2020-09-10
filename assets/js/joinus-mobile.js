(function($) {

    'use strict';

    // =========================================================================
    // 动画兼容性处理
    // =========================================================================
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame  = window[vendors[x] + 'CancelAnimationFrame']
                                        || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if(!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if(!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
        if(!window.requestIdleCallback) {
            window.requestIdleCallback = function(callback) {
                requestAnimationFrame(callback);
            };
        }
    }());


    // =========================================================================
    // 火箭及轨道动画
    // =========================================================================
    var Rockets = function(canvas, rocket) {
        this.width        = 300;       // 画布宽度
        this.height       = 300;       // 画布高度
        this.radius       = 134;       // 轨道半径
        this.strokeWidth  = 4;         // 轨道宽度
        this.strokeColor  = '#fff91a'; // 轨道颜色
        this.dashArray    = [10];      // 轨道虚线设置
        this.dashOffset   = 0;         // 轨道虚线偏移
        this.degreeBegin  = 180;       // 轨道起始角度 (0为3点钟方向 逆时针绘制轨道)
        this.degreeEnd    = 220;       // 轨道终止角度 (0为3点钟方向 逆时针绘制轨道)
        this.dashDelta    = -1.35;     // 轨道虚线偏移变化量
        this.degreeDelta  = 0.32;      // 角度变化量
        this.rocketWidth  = 80;        // 火箭原图宽度
        this.rocketHeight = 80;        // 火箭原图高度
        this.rocketScale  = 0.5        // 火箭缩放比例
        this.rocketX      = -this.radius - this.rocketWidth * this.rocketScale / 2; // 火箭初始横坐标 (相对于画布中心)
        this.rocketY      = (-30 - this.rocketHeight / 2) * this.rocketScale;       // 火箭初始纵坐标 (相对于画布中心)

        this.canvas       = $(canvas)[0];                 // Canvas DOM
        this.ctx          = this.canvas.getContext('2d'); // Canvas Context
        this.rocketImg    = $(rocket)[0];                 // 火箭 <img> DOM
        this.centerX      = this.width / 2;               // 画布中心横坐标 (相对于左上角)
        this.centerY      = this.height / 2;              // 画布中心纵坐标 (相对于左上角)
        this.angle        = {};
        this.angle.begin  = (this.degreeBegin / 180) * Math.PI; // 轨道起始角度 (弧度 内部用)
        this.angle.end    = (this.degreeEnd / 180) * Math.PI;   // 轨道终止角度 (弧度 内部用)
        this.angle.delta  = (this.degreeDelta / 180) * Math.PI; // 轨道端点角度变化量 (弧度 内部用)
        this.angle.init   = this.angle.begin;                   // 轨道起始角度 (弧度 固定值 用于计算火箭旋转角)

        this.animate      = this._animate.bind(this);
        this.paused       = true;

        if(!this.canvas || !this.rocketImg) return false;

        var self = this;
        // 浏览器不支持 setLineDash 时的兼容性处理
        if(!this.ctx.setLineDash) {
            if('mozDash' in this.ctx) {
                this.ctx.setLineDash = function(dashArray) {
                    self.ctx.mozDash = dashArray;
                };
            } else if('webkitLineDash' in this.ctx) {
                this.ctx.setLineDash = function(dashArray) {
                    self.ctx.webkitLineDash = dashArray;
                };
            } else {
                this.ctx.setLineDash = function(dashArray) {};
            }
        }

        return this;
    };
    // 清空画布
    Rockets.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };
    // 绘制火箭
    Rockets.prototype.drawRocket = function() {
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.angle.begin - this.angle.init);
        this.ctx.drawImage(this.rocketImg, this.rocketX, this.rocketY, this.rocketScale * this.rocketWidth, this.rocketScale * this.rocketHeight);
        this.ctx.restore();
    };
    // 绘制轨道
    Rockets.prototype.drawOrbit = function() {
        this.ctx.save();
        this.ctx.lineWidth      = this.strokeWidth;
        this.ctx.strokeStyle    = this.strokeColor;
        this.ctx.lineDashOffset = this.dashOffset;
        this.ctx.setLineDash(this.dashArray);
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, this.angle.begin, this.angle.end, 1);
        this.ctx.stroke();
        this.ctx.restore();
    };
    // 绘制图形
    Rockets.prototype.render = function() {
        this.clear();
        this.drawOrbit();
        this.drawRocket();
    };
    Rockets.prototype.pause = function() {
        this.paused = true;
    };
    Rockets.prototype.play = function() {
        this.paused = false;
        this._animate();
    };
    // 生成动画
    Rockets.prototype._animate = function() {
        this.render();
        this.dashOffset += this.dashDelta;
        this.angle.begin = (this.angle.begin + this.angle.delta) % (2 * Math.PI);
        this.angle.end = (this.angle.end + this.angle.delta) % (2 * Math.PI);
        if(!this.paused) requestIdleCallback(this.animate);
    };
    Rockets.prototype.animate = function() {};

    var rockets = new Rockets('canvas', 'img.rocket');
    if(rockets) {
        rockets.render();
    }


    // =========================================================================
    // 滚动特效
    // =========================================================================
    function fx(index, prevIndex) {
        var target;
        if(index == 1) {
            target = $('.section-welcome h1, .section-welcome p');
            requestAnimationFrame(function() {
                target.removeClass('animated pulse');
                requestAnimationFrame(function() {
                    target.addClass('animated pulse');
                });
            });
            // target = $('.section-welcome h1, .section-welcome p').removeClass('animated pulse');
            // setTimeout(function() {
            //     target.addClass('animated pulse');
            // }, 17);
        } else if(index == 2) {
            target = $('.section-intro .container, .section-intro .pendulum');
            requestAnimationFrame(function() {
                target.removeClass('transparent');
                requestAnimationFrame(function() {
                    target.addClass('animated flipInY');
                });
            });
            // target = $('.section-intro .container, .section-intro .pendulum');
            // requestAnimationFrame(function() {
            //     target.removeClass('transparent');
            //     requestAnimationFrame(function() {
            //         target.addClass('animated flipInY');
            //     }, 17);
            // }, 17);
        } else if(index == 5) {
            target = document.querySelector('.section-joinus .joinus-wrapper');
            requestAnimationFrame(function() {
                target.classList.remove('animated', 'tada');
                requestAnimationFrame(function() {
                    target.classList.add('animated', 'tada');
                });
            });
            // target = document.querySelector('.section-joinus .joinus-wrapper');
            // target.classList.remove('animated', 'tada');
            // requestAnimationFrame(function() {
            //     target.classList.add('animated', 'tada');
            // }, 17);
        }
        if(index != 5) {
            var glissade = document.getElementsByClassName('glissade')[0];
            glissade.classList.add('pause', 'invisible');
            requestAnimationFrame(function() {
                glissade.classList.remove('animate', 'pause', 'invisible', 'infinite', 'sepcial');
                requestAnimationFrame(function() {
                    glissade.classList.add('animate');
                    if(index == 4) {
                        glissade.classList.add('infinite', 'sepcial');
                    }
                }, 17);
            }, 17);
        } else {
            requestAnimationFrame(function() {
                document.getElementsByClassName('glissade')[0].classList.remove('animate', 'pause', 'invisible', 'infinite', 'sepcial');
            });
        }
        if(prevIndex == 2) {
            var _temp = $('.section-intro .container, .section-intro .pendulum');
            requestAnimationFrame(function() {
                _temp.removeClass('animated flipInY');
                requestAnimationFrame(function() {
                    _temp.addClass('transparent');
                }, 17);
            }, 17);
        }
    }

    // =========================================================================
    // 全屏滚动
    // =========================================================================
    $(document).ready(function() {
        $('#fullpage').fullpage({
            lockAnchors: true,
            recordHistory: false,
            anchors: ['welcome', 'intro', 'planet', 'dept', 'joinus'],
            slidesNavigation: true,
            afterRender: function() {
                setTimeout(function() {
                    fx(1);
                }, 500);

                // 计算最后一屛(加入我们, 第五屏)中小怪兽站立高度
                $('.anonymous-monster-wrapper').css('bottom', ($(window).width() / 1080 * 181) + 'px');

                // 重定位部门介绍的导航条
                var nav = $('.section-dept .fp-slidesNav');
                nav.css('margin-left', '-' + (nav.width() / 2) + 'px');

                // Token Planet 部门导航
                $('#Map').on('touchstart', 'area', function(e) {
                    e.preventDefault();
                    var path = this.getAttribute('href').substr(1).split('/');
                    $.fn.fullpage.moveTo(path[0], path[1]);
                });
            },
            onLeave: function(index, nextIndex, direction) {
                if(nextIndex == 3) {
                    rockets.play();
                } else {
                    rockets.pause();
                }
                fx(nextIndex, index);
            }
        });

        // 当用户从掌上理工大访问时修改 [加入我们] 按钮行为
        if(/iwut/i.test(navigator.userAgent) && typeof token != 'undefined' && token.loadUrl) {
            $('.section-joinus .joinus')[0].addEventListener('touchstart', function(e) {
                e.preventDefault();
                token.loadUrl('http://token.team/join/Login/iwut');
            }, false);
        }
    });

})(jQuery);
