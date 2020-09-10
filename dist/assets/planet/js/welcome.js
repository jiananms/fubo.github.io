(function($) {

    "use strict";

    // =========================================================================
    // 气泡
    // =========================================================================
    function bubbleAnimation(container) {
        var $bubbles = $(container).find(".bubble").addClass("bubble-sticky");
        setTimeout(function() {
            $bubbles.removeClass("bubble-sticky");
        }, 4500);
    }

    var isIE = window.navigator.userAgent.match(/Trident|MSIE/);
    if(isIE) {
        $("map").on("focus", "area", function() { // 清除虚线边框
            this.blur();
        });
    }

    $(".bubble-fallback-container").removeClass("hidden");
    $("map").on("mouseover touchmove", "area", function() {
        var dept = $(this).data("dept");
        $(".bubble-fallback-container ." + dept).addClass("bubble-active");
    });
    $("map").on("mouseout touchleave", "area", function() {
        var dept = $(this).data("dept");
        $(".bubble-fallback-container ." + dept).removeClass("bubble-active");
    });
    bubbleAnimation(".bubble-fallback-container");


    // =========================================================================
    // 屏幕自适应
    // =========================================================================
    function calcZoomRatio(width, height, pageWidth, pageHeight) {
        var xRatio = pageWidth < width ? pageWidth / width : 1;
        var yRatio = pageHeight < height ? pageHeight / height : 1;
        return xRatio < yRatio ? xRatio : yRatio;
    }
    function fitScreenFix() {
        var pageWidth = $(window).width(), pageHeight = $(window).height();
        $(".section").each(function() {
            var width = $(this).data("section-width") || $(this).find("> .fp-tableCell").css("zoom", 1).width();
            var height = $(this).data("section-height") || $(this).find("> .fp-tableCell").css("zoom", 1).height();
            if(height) $(this).find("> .fp-tableCell").css("zoom", calcZoomRatio(width, height, pageWidth, pageHeight));
        });
        $(".section .slide").each(function() {
            var height = $(this).data("section-height") || $(this).find("> .fp-tableCell").css("zoom", 1)[0].scrollHeight;
            if(height) $(this).find("> .fp-tableCell").css("zoom", calcZoomRatio(980, height, pageWidth, pageHeight));
        });
    }


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
        this.width        = 570;       // 画布宽度
        this.height       = 570;       // 画布高度
        this.radius       = 258;       // 轨道半径
        this.strokeWidth  = 4;         // 轨道宽度
        this.strokeColor  = "#fff91a"; // 轨道颜色
        this.dashArray    = [10];      // 轨道虚线设置
        this.dashOffset   = 0;         // 轨道虚线偏移
        this.degreeBegin  = 180;       // 轨道起始角度 (0为3点钟方向 逆时针绘制轨道)
        this.degreeEnd    = 220;       // 轨道终止角度 (0为3点钟方向 逆时针绘制轨道)
        this.dashDelta    = -1.35;     // 轨道虚线偏移变化量
        this.degreeDelta  = 0.24;      // 角度变化量
        this.rocketWidth  = 80;        // 火箭原图宽度
        this.rocketHeight = 80;        // 火箭原图高度
        this.rocketX      = -this.radius - this.rocketWidth / 2; // 火箭初始横坐标 (相对于画布中心)
        this.rocketY      = -30 - this.rocketHeight / 2;         // 火箭初始纵坐标 (相对于画布中心)

        this.canvas       = $(canvas)[0];                 // Canvas DOM
        this.ctx          = this.canvas.getContext("2d"); // Canvas Context
        this.rocketImg    = $(rocket)[0];                 // 火箭 <img> DOM
        this.centerX      = this.width / 2;               // 画布中心横坐标 (相对于左上角)
        this.centerY      = this.height / 2;              // 画布中心纵坐标 (相对于左上角)
        this.angle        = {};
        this.angle.begin  = (this.degreeBegin / 180) * Math.PI; // 轨道起始角度 (弧度 内部用)
        this.angle.end    = (this.degreeEnd / 180) * Math.PI;   // 轨道终止角度 (弧度 内部用)
        this.angle.delta  = (this.degreeDelta / 180) * Math.PI; // 轨道端点角度变化量 (弧度 内部用)
        this.angle.init   = this.angle.begin;                   // 轨道起始角度 (弧度 固定值 用于计算火箭旋转角)

        this.animate = $.proxy(this._animate, this);
        this.paused  = false;

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
        this.ctx.drawImage(this.rocketImg, this.rocketX, this.rocketY);
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

    var rockets = new Rockets("canvas", "img.rocket");
    if(rockets) {
        rockets.render();
        $(document).ready(function() {
            rockets.animate();
        });
    }


    // =========================================================================
    // 全屏滚动
    // =========================================================================
    $(document).ready(function() {
        var angel=0;
        $('#fullpage').fullpage({
            lockAnchors: false,
            anchors: ['main', 'dept'],
            onLeave: function(index, nextIndex, direction) {
                if(nextIndex == 1) {
                    rockets.play();
                } else {
                    rockets.pause();
                }
            },
            afterResize: function() {
                fitScreenFix();
            }
        });
        $(window).resize();
    });

}).call(this, jQuery);
