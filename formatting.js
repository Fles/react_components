import moment from 'moment';
import numeral from 'numeral';
import {get, comp} from './functional';

window.numeral = numeral;

export {get, comp};

function isNull(v) {
  return v == null || (typeof(v) === 'number' && isNaN(v) && !isFinite(v));
}

export function ifNull(replace) {
  return v => isNull(v) ? replace : v;
}

export function numeralFmt(fmt) {
  return v => isNull(v) ? null : numeral(v).format(fmt);
}

export function latlng() {
  return v => isNull(v) ? null : v.lat.toFixed(5) + ', ' + v.lng.toFixed(5);
}

export function join(joiner) {
  return arr => Array.isArray(arr) ? arr.join(joiner) : null;
}

export function date(format) {
  return v => {
    const m = moment(v);
    return m.isValid() ? m.format(format) : null;
  }
}

export function toFixed(n) {
  return v => typeof(v) === 'number' ? v.toFixed(n) : null;
}

export function meters2km() {
  return v => typeof(v) === 'number' ? v / 1000 : null;
}

export function mps2kmph() {
  return v => typeof(v) === 'number' ? v * 3.6 : null;
}

export function divBy(b) {
  if (b === 0 || isNull(b)) return a => null;
  return a => typeof(a) === 'number' ? a / b : null;
}

export function mul(b) {
  if (b === 0 || isNull(b)) return a => null;
  return a => typeof(a) === 'number' ? a * b : null;
}

export function add(b) {
  if (b === 0 || isNull(b)) return a => null;
  return a => typeof(a) === 'number' ? a + b : null;
}

export function sub(b) {
  if (b === 0 || isNull(b)) return a => null;
  return a => typeof(a) === 'number' ? a - b : null;
}

export function replace(fmt) {
  return v => isNull(v) ? null : fmt.replace('%s', v);
}

function getDuration(seconds) {
  const d = {
    seconds: Math.round(seconds), minutes: 0, hours: 0, days: 0, years: 0
  };

  if (d.seconds > 60) {
    d.minutes = Math.floor(d.seconds / 60);
    d.seconds -= d.minutes * 60;
  }
  if (d.minutes > 60) {
    d.hours = Math.floor(d.minutes / 60);
    d.minutes -= d.hours * 60;
  }
  if (d.hours > 24) {
    d.days = Math.floor(d.hours / 24);
    d.hours -= d.days * 24;
  }
  if (d.days > 365) {
    d.years = Math.floor(d.days / 365);
    d.days -= d.years * 365;
  }
  return d;
}

/**
 * Returns a function which converts duration in seconds into string, e.g.
 * "2d 3h", "3h 30m", "30m 2s" or long "2 days, 3 hours", etc.
 */
export function duration(showShort=true, precision=2, showPlus=false) {
  const units = ['years', 'days', 'hours', 'minutes', 'seconds'];
  const shortName = {
    seconds: 's', minutes: 'm', hours: 'h', days: 'd', years: 'y'
  };
  const longName = {
    seconds: ' seconds',
    minutes: ' minutes',
    hours: ' hours',
    days: ' days',
    years: ' years',
  };

  return seconds => {
    if (isNull(seconds) || typeof(seconds) !== 'number') {
      return null;
    }

    let isNegative = false;
    if (seconds < 0) {
      seconds = -seconds;
      isNegative = true;
    }

    const duration = getDuration(seconds),
          parts = [];
    let left = precision;

    for (let i=0; i < units.length; i++) {
      let d = duration[units[i]];
      if (d > 0) {
        const unit = showShort ? shortName[units[i]] : longName[units[i]];
        parts.push(left === 1 ? (d + unit) : (d + unit + ' '));
        left--;
      }
      if (left === 0) break;
    }

    const fmt = parts.join(showShort ? ' ' : ', ');
    if (isNegative) return '-' + fmt;
    if (showPlus) return '+' + fmt;
    return fmt;
  };
}

export class Formatters {
  constructor() {
    this.fns = [];
  }

  $() {
    return (v) => {
      const fns = this.fns, len = this.fns.length;
      for (let i=0; i < len; i++) v = fns[i](v);
      return v;
    }
  }

  eval(v) {
    const fns = this.fns, len = this.fns.length;
    for (let i=0; i < len; i++) v = fns[i](v);
    return v;
  }

  get(key) { this.fns.push(get(key)); return this; }
  ifNull(v) { this.fns.push(ifNull(v)); return this; }
  join(joiner) { this.fns.push(joiner(v)); return this; }
  date(format) { this.fns.push(date(format)); return this; }
  toFixed(n) { this.fns.push(toFixed(n)); return this; }
  numeral(fmt) { this.fns.push(numeralFmt(fmt)); return this; }
  latlng() { this.fns.push(latlng()); return this; }
  meters2km() { this.fns.push(meters2km()); return this; }
  mps2kmph() { this.fns.push(mps2kmph()); return this; }
  divBy(b) { this.fns.push(divBy(b)); return this; }
  mul(b) { this.fns.push(mul(b)); return this; }
  add(b) { this.fns.push(add(b)); return this; }
  sub(b) { this.fns.push(sub(b)); return this; }
  replace(fmt) { this.fns.push(replace(fmt)); return this; }
  duration(showShort=true, precision=2, showPlus=false) {
    this.fns.push(duration(showShort, precision, showPlus));
    return this;
  }
  call(f) { this.fns.push(f); return this; }
}

function fmt() { return new Formatters(); }

export default fmt;


