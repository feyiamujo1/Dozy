var paoc_ideal_timer = 0;
(function($) {
    "use strict";
    $('.paoc-popup iframe[src*="vimeo.com"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="dailymotion.com"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="youtube.com"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="m.youtube.com"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="youtu.be"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="screencast-o-matic.com"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="videopress.com"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="video.wordpress.com"]').wrap('<div class="paoc-iframe-wrap" />');
    $('.paoc-popup iframe[src*="fast.wistia.net"]').wrap('<div class="paoc-iframe-wrap" />');
    $(document).on('mousemove keypress scroll click touchstart touchmove', function() {
        paoc_ideal_timer = 0
    });
    $('.paoc-popup-page-load.paoc-popup-js').each(function(index) {
        var target = $(this).attr('id');
        if (typeof(target) !== 'undefined') {
            var options = $('#' + target).data('popup-conf');
            var data_opts = $('#' + target).data('conf');
            var paoc_active_flag = popupaoc_popup_active_flag(index, target, data_opts, options);
            if (paoc_active_flag == 1) {
                setTimeout(function() {
                    popupaoc_open_popup(target, options, data_opts)
                }, data_opts.open_delay)
            }
            return !1
        }
    });
    $(document).on('click', '[class*="paoc-popup-cust-"]', function() {
        var html_classes = $(this).attr("class").split(' ');
        $.each(html_classes, function(class_key, class_val) {
            var normal_cls_pos = class_val.indexOf('paoc-popup-cust-');
            if (normal_cls_pos < 0) {
                return
            }
            var target = class_val.replace("paoc-popup-cust-", "paoc-popup-");
            target = target.trim();
            var popup_ele = $('.' + target).attr('id');
            var options = $('#' + popup_ele).data('popup-conf');
            var data_opts = $('#' + popup_ele).data('conf');
            if (typeof(popup_ele) !== 'undefined' && (data_opts.popup_type == 'simple_link' || data_opts.popup_type == 'button' || data_opts.popup_type == 'image')) {
                var paoc_active_flag = popupaoc_popup_active_flag(class_key, popup_ele, data_opts, options);
                if (paoc_active_flag == 1) {
                    setTimeout(function() {
                        popupaoc_open_popup(popup_ele, options, data_opts)
                    }, data_opts.open_delay)
                }
            }
        });
        return !1
    });
    $(document).on('click', '.paoc-popup-close', function() {
        $('.custombox-content').removeClass('paoc-cb-popup-complete');
        $('html').removeClass('custombox-lock');
        Custombox.modal.close()
    })
})(jQuery);

function popupaoc_open_popup(target, options, data_opts) {
    var paoc_popup_open = 1;
    if (typeof popupaoc_popup_befoer_open === "function") {
        paoc_popup_open = popupaoc_popup_befoer_open(paoc_popup_open, target, options, data_opts)
    }
    if (paoc_popup_open != 1) {
        return
    }
    popupaoc_set_popup_events(target, options, data_opts);
    new Custombox.modal(options).open()
}

function popupaoc_set_popup_events(target, options, data_opts) {
    options.content.onOpen = function() {
        jQuery('html').addClass('custombox-lock');
        jQuery('.custombox-overlay, .custombox-content').removeClass('paoc-popup-active');
        jQuery('.custombox-overlay').not('.paoc-popup-overlay').addClass('paoc-popup-active paoc-popup-overlay paoc-popup-overlay-' + data_opts.id);
        jQuery('.custombox-content').not('.paoc-cb-popup').addClass('paoc-popup-active paoc-cb-popup paoc-cb-popup-' + data_opts.id + ' paoc-popup-' + options.content.positionX + '-' + options.content.positionY);
        if (options.overlay.active == !1 && options.content.fullscreen == !1) {
            jQuery('.custombox-content.paoc-popup-active').addClass('paoc-hide-overlay')
        }
        if (options.overlay.active == !1) {
            jQuery('html').css({
                'overflow': 'auto',
                'margin-right': '0'
            })
        }
        var slick_slider_id = jQuery('.slick-slider').attr('id');
        if (typeof(slick_slider_id) !== 'undefined' && slick_slider_id != '') {
            jQuery('#' + slick_slider_id).slick('setPosition')
        }
        jQuery(document.body).trigger('paoc_popup_open', [target, options])
    };
    options.content.onComplete = function() {
        jQuery('.custombox-content').addClass('paoc-cb-popup-complete');
        if (data_opts.disappear != 0) {
            if (data_opts.disappear_mode == 'normal') {
                var IdleInterval = setInterval(function() {
                    paoc_ideal_timer = paoc_ideal_timer + 1;
                    if (paoc_ideal_timer >= data_opts.disappear) {
                        Custombox.modal.close();
                        clearInterval(IdleInterval)
                    }
                }, 1000)
            } else if (data_opts.disappear_mode == 'force') {
                setTimeout(function() {
                    Custombox.modal.close()
                }, (data_opts.disappear * 1000))
            }
        }
        jQuery(window).trigger('resize');
        jQuery(document.body).trigger('paoc_popup_complete', [target, options])
    };
    options.content.onClose = function() {
        jQuery('html').removeClass('custombox-lock');
        var cookie_name = data_opts.cookie_prefix + '_' + data_opts.id;
        if (data_opts.cookie_expire !== '') {
            popupaoc_create_cookie(cookie_name, 1, data_opts.cookie_expire, data_opts.cookie_unit, 'Lax')
        }
        jQuery(document.body).trigger('paoc_popup_close', [target, options])
    }
}

function popupaoc_popup_active_flag(index, $this, data_opts, options) {
    var paoc_check_active = !1;
    if (typeof(data_opts.cookie_expire) !== 'undefined' && data_opts.cookie_expire !== '' && popupaoc_get_cookie_value(data_opts.cookie_prefix + '_' + data_opts.id) != null) {
        return 0
    }
    paoc_check_active = 1;
    return paoc_check_active
}

function popupaoc_create_cookie(name, value, time_val, type, samesite) {
    var date, expires, expire_time, samesite;
    time_val = time_val ? time_val : !1;
    type = type ? type : 'day';
    samesite = samesite ? ";SameSite=" + samesite : '';
    if (type == 'hour') {
        expire_time = (time_val * 60 * 60 * 1000)
    } else if (type == 'minutes') {
        expire_time = (time_val * 60 * 1000)
    } else {
        expire_time = (time_val * 24 * 60 * 60 * 1000)
    }
    if (time_val) {
        date = new Date();
        date.setTime(date.getTime() + expire_time);
        expires = "; expires=" + date.toGMTString()
    } else {
        expires = ""
    }
    document.cookie = encodeURIComponent(name) + "=" + value + expires + "; path=/" + samesite
}

function popupaoc_get_cookie_value(cookie_name) {
    var result = null;
    var nameEQ = cookie_name + "=";
    var get_cookie = document.cookie.split(';');
    for (var i = 0; i < get_cookie.length; i++) {
        var c = get_cookie[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length)
        }
        if (c.indexOf(nameEQ) == 0) {
            result = c.substring(nameEQ.length, c.length)
        }
    }
    return result
}