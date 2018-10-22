jQuery(function () {
    // responsive helper
    ResponsiveHelper.addRange({
        '..767': {
            on: function () {
                $('.table-container').showMoreTable({
                    numberOfVisibleCol: 5,
                    opener: '.table-opener a',
                    openerTextShow: 'show-more <span>></span>',
                    openerTextHide: 'close <span><</span>',
                    scrollToTableTop: false,
                    scrollAnimationSpeed: 100
                });
            },
            off: function () {
                $('.table-container').showMoreTable('destroy');
            }
        }
    });
});

; (function ($) {
    function ShowMoreTable(options) {
        this.options = $.extend({
            numberOfVisibleCol: 5,
            opener: '.table-opener a',
            openerTextShow: 'show-more',
            openerTextHide: 'close',
            scrollToTableTop: true,
            scrollAnimationSpeed: 100
        }, options);
        this.init();
    }

    ShowMoreTable.prototype = {

        init: function () {
            if (this.options.holder) {
                this.findElements();
                this.hideRow();
                this.attachEvents();
                this.makeCallback('onInit', this);
            }
        },
        findElements: function () {
            this.win = $(window);
            this.holder = $(this.options.holder);
            this.numberOfVisibleCol = this.options.numberOfVisibleCol - 1;
            this.table = this.holder.find('table');
            this.openClass = 'table-open';
            this.opener = this.holder.find(this.options.opener);
            this.scrollAnimationSpeed = this.options.scrollAnimationSpeed;
            this.isAnimate = true;
        },
        attachEvents: function () {
            var self = this;

            this.onClickHandler = function (e) {
                e.preventDefault();

                if (self.holder.hasClass(self.openClass)) {
                    self.hideRow();
                    self.holder.removeClass(self.openClass);

                    if (self.options.scrollToTableTop) {
                        self.scrollToTableTop();
                    }
                } else {
                    self.showRow();
                }
            }


            this.onResizeHandler = function () {
                self.findAllTables();
            }

            // add handlers
            this.opener.on('click', this.onClickHandler);
            this.win.on('resize', this.onResizeHandler);
        },
        hideRow: function () {
            var that = this;

            this.table.each(function () {
                var tableRow = $(this).find('tr');

                tableRow.each(function (index) {
                    if (index > that.numberOfVisibleCol) {
                        $(this).hide();
                    }
                });
            });

            this.opener.html(this.options.openerTextShow);

        },
        showRow: function () {
            this.findAllTables();
            this.table.find('tr').show();
            this.holder.addClass(this.openClass);
            this.opener.html(this.options.openerTextHide);
        },
        findAllTables: function () {
            this.table = this.holder.find('table');
        },
        scrollToTableTop: function () {
            var page = $('html, body');
            var holderTop = this.holder.offset().top;
            var that = this;

            if (this.isAnimate) {
                this.isAnimate = false;
                page.animate({
                    scrollTop: holderTop
                }, this.scrollAnimationSpeed, function () {
                    that.isAnimate = true;
                });
            }
        },
        destroy: function () {
            // call destroy method - element.showMoreTable('destroy');
            // destroy event
            this.opener.off('click', this.onClickHandler);
            this.win.off('resize', this.onResizeHandler);

            this.showRow();
            this.holder.removeClass(this.openClass);
            this.opener.html(this.options.openerTextShow);
            // destroy data
            this.holder.removeData('ShowMoreTable');
        },
        makeCallback: function (name) {
            if (typeof this.options[name] === 'function') {
                var args = Array.prototype.slice.call(arguments);

                args.shift();
                this.options[name].apply(this, args);
            }
        }
    };

    // jQuery plugin interface
    $.fn.showMoreTable = function (opt) {
        var args = Array.prototype.slice.call(arguments);
        var method = args[0];

        return this.each(function () {
            var $holder = jQuery(this);
            var instance = $holder.data('ShowMoreTable');

            if (typeof opt === 'object' || typeof opt === 'undefined') {
                $holder.data('ShowMoreTable', new ShowMoreTable($.extend({
                    holder: this
                }, opt)));
            } else if (typeof method === 'string' && instance) {
                if (typeof instance[method] === 'function') {
                    args.shift();
                    instance[method].apply(instance, args);
                }
            }
        });
    };
}(jQuery));
