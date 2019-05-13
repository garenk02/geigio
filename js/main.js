jQuery(document).ready(function ($) {
  $('.scroll').click(function (event) {
    event.preventDefault();
    $('html,body').animate({scrollTop: $(this.hash).offset().top}, 1000);
  });
  $().UItoTop({easingType: 'easeOutQuart'});

  //set slider animation parameters
  var duration = 400,
    epsilon = (1000 / 60 / duration) / 3,
    customMinaAnimation = bezier(.42, .03, .77, .63, epsilon);

  //define a radialSlider object
  var radialSlider = function (element) {
    this.element = element;
    this.slider = this.element.find('.cd-radial-slider');
    this.slides = this.slider.children('li');
    this.slidesNumber = this.slides.length;
    this.visibleIndex = 0;
    this.nextVisible = 1;
    this.prevVisible = this.slidesNumber - 1;
    this.navigation = this.element.find('.cd-radial-slider-navigation');
    this.animating = false;
    this.mask = this.element.find('.cd-round-mask');
    this.leftMask = this.mask.find('mask').eq(0);
    this.rightMask = this.mask.find('mask').eq(1);
    this.bindEvents();
  };

  radialSlider.prototype.bindEvents = function () {
    var self = this;

    //update visible slide when clicking the navigation round elements
    this.navigation.on('click', function (event) {
      if (!self.animating) {
        self.animating = true;
        event.preventDefault();
        var direction = ($(event.target).hasClass('next')) ? 'next' : 'prev';
        //update radialSlider index properties
        self.updateIndexes(direction);
        //show new slide
        self.updateSlides(direction);
      }
    });
  };

  radialSlider.prototype.updateIndexes = function (direction) {
    if (direction == 'next') {
      this.prevVisible = this.visibleIndex;
      this.visibleIndex = this.nextVisible;
      this.nextVisible = (this.nextVisible + 1 < this.slidesNumber) ? this.nextVisible + 1 : 0;
    } else {
      this.nextVisible = this.visibleIndex;
      this.visibleIndex = this.prevVisible;
      this.prevVisible = (this.prevVisible > 0) ? this.prevVisible - 1 : this.slidesNumber - 1;
    }
  };

  radialSlider.prototype.updateSlides = function (direction) {
    var self = this;

    //store the clipPath elements which need to be animated/updated
    var clipPathVisible = Snap('#' + this.slides.eq(this.visibleIndex).find('circle').attr('id')),
      clipPathPrev = Snap('#' + this.slides.eq(this.prevVisible).find('circle').attr('id')),
      clipPathNext = Snap('#' + this.slides.eq(this.nextVisible).find('circle').attr('id'));

    var radius1 = this.slider.data('radius1'),
      radius2 = this.slider.data('radius2'),
      centerx = (direction == 'next') ? this.slider.data('centerx2') : this.slider.data('centerx1');

    this.slides.eq(this.visibleIndex).addClass('is-animating').removeClass('next-slide prev-slide');

    if (direction == 'next') {
      //animate slide content
      this.slides.eq(this.visibleIndex).addClass('content-reveal-left');
      this.slides.eq(this.prevVisible).addClass('content-hide-left');
      //mask slide image to reveal navigation round element
      this.slides.eq(this.visibleIndex).find('image').attr('style', 'mask: url(#' + this.leftMask.attr('id') + ')');

      //animate slider navigation round element
      clipPathNext.attr({
        'r': radius1,
        'cx': self.slider.data('centerx2'),
      });
      this.slides.eq(this.nextVisible).addClass('next-slide move-up');
      this.slides.filter('.prev-slide').addClass('scale-down');
    } else {
      //animate slide content
      this.slides.eq(this.visibleIndex).addClass('content-reveal-right');
      this.slides.eq(this.nextVisible).addClass('content-hide-right');
      //mask slide image to reveal navigation round element
      this.slides.eq(this.visibleIndex).find('image').attr('style', 'mask: url(#' + this.rightMask.attr('id') + ')');

      //animate slider navigation round element
      clipPathPrev.attr({
        'r': radius1,
        'cx': this.slider.data('centerx1'),
      });
      this.slides.eq(this.prevVisible).addClass('prev-slide move-up');
      this.slides.filter('.next-slide').addClass('scale-down');
    }

    // reveal new slide image - animate clipPath element
    clipPathVisible.attr({
      'r': radius1,
      'cx': centerx,
    }).animate({'r': radius2}, duration, customMinaAnimation, function () {

      if (direction == 'next') {
        self.slides.filter('.prev-slide').removeClass('prev-slide scale-down');
        clipPathPrev.attr({
          'r': radius1,
          'cx': self.slider.data('centerx1'),
        });
        self.slides.eq(self.prevVisible).removeClass('visible').addClass('prev-slide');
      } else {
        self.slides.filter('.next-slide').removeClass('next-slide scale-down');
        clipPathNext.attr({
          'r': radius1,
          'cx': self.slider.data('centerx2'),
        });
        self.slides.eq(self.nextVisible).removeClass('visible').addClass('next-slide');
      }
      self.slides.eq(self.visibleIndex).removeClass('is-animating').addClass('visible').find('image').removeAttr('style');
      self.slides.filter('.move-up').removeClass('move-up');

      setTimeout(function () {
        self.slides.eq(self.visibleIndex).removeClass('content-reveal-left content-reveal-right');
        self.slides.eq(self.prevVisible).removeClass('content-hide-left content-hide-right');
        self.slides.eq(self.nextVisible).removeClass('content-hide-left content-hide-right');
        self.animating = false;
      }, 100);
    });
  };

  //initialize the radial slider
  $('.cd-radial-slider-wrapper').each(function () {
    new radialSlider($(this));
  });

  /*
    convert a cubic bezier value to a custom mina easing
    http://stackoverflow.com/questions/25265197/how-to-convert-a-cubic-bezier-value-to-a-custom-mina-easing-snap-svg
  */
  function bezier(x1, y1, x2, y2, epsilon) {
    //https://github.com/arian/cubic-bezier
    var curveX = function (t) {
      var v = 1 - t;
      return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
    };

    var curveY = function (t) {
      var v = 1 - t;
      return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
    };

    var derivativeCurveX = function (t) {
      var v = 1 - t;
      return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (-t * t * t + 2 * v * t) * x2;
    };

    return function (t) {

      var x = t, t0, t1, t2, x2, d2, i;

      // First try a few iterations of Newton's method -- normally very fast.
      for (t2 = x, i = 0; i < 8; i++) {
        x2 = curveX(t2) - x;
        if (Math.abs(x2) < epsilon) return curveY(t2);
        d2 = derivativeCurveX(t2);
        if (Math.abs(d2) < 1e-6) break;
        t2 = t2 - x2 / d2;
      }

      t0 = 0, t1 = 1, t2 = x;

      if (t2 < t0) return curveY(t0);
      if (t2 > t1) return curveY(t1);

      // Fallback to the bisection method for reliability.
      while (t0 < t1) {
        x2 = curveX(t2);
        if (Math.abs(x2 - x) < epsilon) return curveY(t2);
        if (x > x2) t0 = t2;
        else t1 = t2;
        t2 = (t1 - t0) * .5 + t0;
      }

      // Failure
      return curveY(t2);

    };
  }

  function formatRupiah(num) {
    return (
      'Rp. ' +
      num
      .toFixed(0) // always two decimal digits
      .replace('.', ',') // replace decimal point character with ,
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    ); // use . as a separator
  }


  // Kalkulator
  function hitungEstimasi(panjang, tinggi, tipe) {
    var baseDuco = 2400000;
    var baseMelamic = 2150000;
    var baseHPL = 1860000;
    var total = 0;
    var volume = panjang * tinggi;

    switch (tipe) {
      case 'duco':
        total = volume * baseDuco;
        break;
      case 'melamic':
        total = volume * baseMelamic;
        break;
      case 'hpl':
        total = volume * baseHPL;
        break;
    }

    if (volume >= 11) {
      var diskon = total * 0.03;
      return total - diskon;
    } else {
      return total;
    }
  }

  $('#frmCalculator').submit(function (e) {
    e.preventDefault();
    var panjang = $('#panjang').val();
    var tinggi = $('#tinggi').val();
    if (panjang > 0 && tinggi > 0) {
      var total1 = hitungEstimasi(panjang, tinggi, 'duco');
      var total2 = hitungEstimasi(panjang, tinggi, 'melamic');
      var total3 = hitungEstimasi(panjang, tinggi, 'hpl');
      $('#resultArea').html('<hr/><h3>Estimasi Biaya</h3><ul class="result"><li>Finishing Duco: ' + formatRupiah(total1) + '</li><li>Finishing Melamic: ' + formatRupiah(total2) + '</li><li>Finishing HPL: ' + formatRupiah(total3) + '</li></ul>');
    }
  });
});
