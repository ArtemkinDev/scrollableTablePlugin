jQuery(function () {
    $('.table-container').scrollableTable({
        scrollStep: 100,
        createFirstFixedCol: true,
        scrollAnimationTime: 200
    });
});


; (function ($) {
    function ScrollableTable(options) {
        this.options = $.extend({
            tableWrapper: '.table-wrapper',
            table: '.response-table',
            tableCloneClass: 'table-clone',
            btnNext: '.table-navigation-btn-next',
            btnPrev: '.table-navigation-btn-prev',
            scrollStep: 100,
            createFirstFixedCol: true,
            scrollAnimationTime: 300
        }, options);
        this.init();
    }

    ScrollableTable.prototype = {

        init: function () {
            if (this.options.holder) {
                this.findElements();
                this.buildFixedCol();
                this.checkScrollPosition();
                this.attachEvents();
                this.makeCallback('onInit', this);
            }
        },
        findElements: function () {
            this.win = $(window);
            this.holder = $(this.options.holder);
            this.wrapper = this.holder.find(this.options.tableWrapper);
            this.wrapperWidth = this.wrapper.width();
            this.table = this.holder.find(this.options.table);
            this.tableWidth = this.table.width();
            this.btnNext = this.holder.find(this.options.btnNext);
            this.btnPrev = this.holder.find(this.options.btnPrev);
            this.currentScroll = this.wrapper.scrollLeft();
            this.scrollEndClass = 'scroll-right';
            this.scrollStartClass = 'scroll-left';
            this.noNeedScrollClass = 'scroll-hide';
            this.tableCloneClass = this.options.tableCloneClass;
            this.hasScrollClass = 'scroll-init';
            this.clone = false;
            this.notScrolling = true;
        },
        attachEvents: function () {
            var self = this;

            this.onScrollRight = function (e) {
                e.preventDefault();

                if (self.notScrolling) {
                    self.notScrolling = false;

                    self.wrapper.animate({
                        scrollLeft: self.currentScroll + self.options.scrollStep,
                    }, self.options.scrollAnimationTime, function () {
                        self.notScrolling = true;
                    });
                }
            };

            this.onScrollLeft = function (e) {
                e.preventDefault();

                if (self.currentScroll > 0 && self.notScrolling) {
                    self.notScrolling = false;

                    self.wrapper.animate({
                        scrollLeft: self.currentScroll - self.options.scrollStep,
                    }, self.options.scrollAnimationTime, function () {
                        self.notScrolling = true;
                    });
                }
            };

            this.onResizeHandler = function () {
                wrapperWidth = self.wrapper.width();
                tableWidth = self.table.width();
                scrollMaxWidth = self.tableWidth - self.wrapperWidth;

                self.checkScrollPosition();
            }

            this.onScrollHandler = function () {
                self.checkScrollPosition();
            }

            // add handlers
            this.btnNext.on('click', this.onScrollRight);
            this.btnPrev.on('click', this.onScrollLeft);
            this.wrapper.on('scroll', this.onScrollHandler);
            this.win.on('resize', this.onResizeHandler);
        },
        buildFixedCol: function () {
            if (this.options.createFirstFixedCol) {
                this.table.clone(true)
                    .appendTo(this.holder)
                    .addClass(this.tableCloneClass);

                this.clone = true;
            }
        },
        deleteFixedCol: function () {
            if (this.holder.find('.' + this.tableCloneClass).length) {
                this.holder.find('.' + this.tableCloneClass).remove();
            }
        },
        refreshFixedCol: function () {
            this.deleteFixedCol();
            this.buildFixedCol();
        },
        checkTableWidth: function () {
            this.tableWidth = this.table.width();
        },
        checkWrapperWidth: function () {
            this.wrapperWidth = this.wrapper.width();
        },
        checkScrollPosition: function () {
            // find the position of the scroll
            this.currentScroll = this.wrapper.scrollLeft();
            // find the right position of the wrapper
            var wrapperRight = this.wrapper.position().left + this.wrapper.width();
            // find the right position of the table
            var tableRight = this.table.position().left + this.table.width();

            // determine the width of the table
            this.checkTableWidth();
            // determine the width of the wrapper
            this.checkWrapperWidth();

            // if the scroll is at the end position add class scrollEndClass
            if (wrapperRight >= tableRight) {
                this.holder.addClass(this.scrollEndClass);
            } else {
                this.holder.removeClass(this.scrollEndClass);
            }

            // if the scroll is at the start position add class scrollStartClass else remove class
            if (this.currentScroll <= 0) {
                this.holder.addClass(this.scrollStartClass);
            } else {
                this.holder.removeClass(this.scrollStartClass);
            }

            // table width is less then wrapper width delete fixed coll and remove navigation
            if (this.tableWidth <= this.wrapperWidth) {
                this.holder.addClass(this.noNeedScrollClass);

                this.deleteFixedCol();
                this.holder.removeClass(this.hasScrollClass);

                if (this.holder.hasClass(this.scrollEndClass)) {
                    this.holder.removeClass(this.scrollEndClass);
                }
                if (this.holder.hasClass(this.scrollStartClass)) {
                    this.holder.removeClass(this.scrollStartClass);
                }

            } else {
                // table width is larger then wrapper width add fixed coll and add navigation
                this.holder.addClass(this.hasScrollClass);

                if (this.holder.hasClass(this.noNeedScrollClass)) {
                    this.holder.removeClass(this.noNeedScrollClass);
                }
                if (!this.holder.find('.' + this.tableCloneClass).length) {
                    this.buildFixedCol();
                }
            }
        },
        refreshClasses: function () {
            this.holder.removeClass(this.scrollEndClass).removeClass(this.scrollStartClass).removeClass(this.noNeedScrollClass).removeClass(this.hasScrollClass);
        },
        destroy: function () {
            // call destroy method - element.scrollableTable('destroy');
            // destroy event
            this.btnNext.off('click', this.onScrollRight);
            this.btnPrev.off('click', this.onScrollLeft);
            this.wrapper.off('scroll', this.onScrollHandler);
            this.win.off('resize', this.onResizeHandler);

            // delete classes
            this.refreshClasses();

            // delete fixed coll
            this.deleteFixedCol();

            // destroy data
            this.holder.removeData('ScrollableTable');
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
    $.fn.scrollableTable = function (opt) {
        var args = Array.prototype.slice.call(arguments);
        var method = args[0];

        return this.each(function () {
            var $holder = jQuery(this);
            var instance = $holder.data('ScrollableTable');

            if (typeof opt === 'object' || typeof opt === 'undefined') {
                $holder.data('ScrollableTable', new ScrollableTable($.extend({
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
