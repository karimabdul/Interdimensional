!(function(window, document) {
  'use strict';

  var settings = {
    speed: 150,
    insensitivity: 5
  };

  var isCharged = false;
  var isCharging = false;
  var isOn = false;
  var lastAlpha;
  var lastBeta;
  var lastGamma;
  var control;

  function checkSupport(next) {
    window.addEventListener('deviceorientation', function checkDeviceOrientationEvent(e) {
      window.removeEventListener('deviceorientation', checkDeviceOrientationEvent, false);

      // Check support of the deviceorientation event and touch events
      if ((('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) &&
        (e.alpha != null || e.beta != null || e.gamma != null)) {

        next();
      }
    }, false);
  }

  /**
   * Parse a string with options
   * @param {String} str
   * @returns {Object|String}
   * @private
   */
  function parseOptions(str) {
    var obj = {};
    var delimiterIndex;
    var option;
    var prop;
    var val;
    var arr;
    var len;
    var i;

    // remove spaces around delimiters and split
    arr = str.replace(/\s*:\s*/g, ':').replace(/\s*,\s*/g, ',').split(',');

    // parse a string
    for (i = 0, len = arr.length; i < len; i++) {
      option = arr[i];

      // Ignore urls and a string without colon delimiters
      if (option.search(/^(http|https|ftp):\/\//) !== -1 ||
        option.search(':') === -1) {

        break;
      }

      delimiterIndex = option.indexOf(':');
      prop = option.substring(0, delimiterIndex);
      val = option.substring(delimiterIndex + 1);

      // if val is an empty string, make it undefined
      if (!val) {
        val = undefined;
      }

      // convert a string value if it is like a boolean
      if (typeof val === 'string') {
        val = val === 'true' || (val === 'false' ? false : val);
      }

      // convert a string value if it is like a number
      if (typeof val === 'string') {
        val = !isNaN(val) ? +val : val;
      }

      obj[prop] = val;
    }

    // if nothing is parsed
    if (prop == null && val == null) {
      return str;
    }

    return obj;
  }

  function calcShift(lastAngle, newAngle) {
    var diff = newAngle - lastAngle;
    var absDiff = Math.abs(diff);
    var sign = diff === 0 ? 0 : diff / absDiff;

    return absDiff > settings.insensitivity ?
      settings.speed * ((newAngle - sign * settings.insensitivity) / lastAngle - 1) : 0;
  }

  function handleTouchStartEvent() {
    Interdimensional.toggle();
  }

  function handleDeviceOrientationEvent(e) {
    if (!isOn || (lastAlpha == null && lastBeta == null)) {
      lastAlpha = e.alpha;
      lastBeta = e.beta;
      lastGamma = e.gamma;
    } else {
      if (window.innerHeight > window.innerWidth) {
        window.scrollBy(
          calcShift(lastAlpha, e.alpha),
          calcShift(lastBeta, e.beta)
        );
      } else {
        window.scrollBy(
          calcShift(lastBeta, e.beta),
          calcShift(lastGamma, e.gamma)
        );
      }
    }
  }

  function handleOrientationChangeEvent() {
    Interdimensional.kick();
  }

  function handleDOMContentLoadedEvent() {
    var data = document.body.getAttribute('data-interdimensional');

    if (data != null) {
      Interdimensional.charge(parseOptions(data));
    }
  }

  function Interdimensional() {}

  Interdimensional.charge = function(options) {
    if (!isCharged && !isCharging) {
      isCharging = true;

      checkSupport(function() {
        isCharged = true;
        isCharging = false;

        // Set settings
        for (var key in options) {
          settings[key] = options[key];
        }

        // Create the control
        control = document.createElement('div');
        control.className = 'interdimensional-control';
        document.body.appendChild(control);

        // Add event listeners
        control.addEventListener('touchstart', handleTouchStartEvent, false);
        window.addEventListener('deviceorientation', handleDeviceOrientationEvent, false);
        window.addEventListener('orientationchange', handleOrientationChangeEvent, false);
      });
    }
  };

  Interdimensional.jump = function() {
    if (!isCharged) {
      return;
    }

    isOn = true;
    control.classList.add('interdimensional-control-is-active');
  };

  Interdimensional.kick = function() {
    if (!isCharged) {
      return;
    }

    isOn = false;
    control.classList.remove('interdimensional-control-is-active');
  };

  Interdimensional.toggle = function() {
    isOn ? Interdimensional.kick() : Interdimensional.jump();
  };

  Interdimensional.discharge = function() {
    if (!isCharged) {
      return;
    }

    Interdimensional.kick();

    isCharged = false;
    document.body.removeChild(control);
    control.removeEventListener('touchstart', handleTouchStartEvent, false);
    window.removeEventListener('deviceorientation', handleDeviceOrientationEvent, false);
    window.removeEventListener('orientationchange', handleOrientationChangeEvent, false);
  };

  document.addEventListener('DOMContentLoaded', handleDOMContentLoadedEvent, false);

  window.Interdimensional = Interdimensional;
})(window, document);
