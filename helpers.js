import numeral from 'numeral';
import _reduce from "lodash-es/reduce";
import moment from 'moment';
import xr from 'xr';

let diff = require('deep-diff').diff;

export function format(value = 0, format = '0') {
  if (value == null || isNaN(value)) return '-';
  return numeral(value).format(format);
}

export function toSpeed(duration = 0, distance = 0) {
  let res = 3.6 * (distance / duration);
  return res ? numeral(res).format('0.0') : '-';
}

export function mToKm(distance = 0) {
  let res = numeral(distance / 1000);
  return res.format('0');
}


export function toAvgDistance (distance, trip_count) {
  if (!distance || !trip_count) return;
  return Math.round((distance/1000) / trip_count);
}


export function humanizeTime(sec) {
  if (sec == null) return '-';
  var seconds = Math.round(sec);
  var minutes = Math.floor((seconds / 60)) % 60;
  var hours =  Math.floor(seconds / 3600);
  if (minutes < 10) minutes = "0" + minutes;
  if (hours < 10) hours = "0" + hours;
  return hours + ":" + minutes;
}

export function toHMS(seconds) {
  var days = Math.floor(seconds / 86400);
  if(days > 0) {
    let resto = seconds - days*24*60*60;
      return days + ':' + numeral(resto).format('00:00:00');
  } else {
    return seconds ? numeral(seconds).format('00:00:00') : '-';
  }
}



export function fromSec(to, val) {
  if (!!val) {
    if (to == 'hours') {
      return Math.round(val / 3600 );
    }
    if (to == 'days') {
      return Math.round(val / 3600 / 24 );
    }
  }
}

export function toPercent(value) {
  return value ? numeral(value).format('0%') : '-';
}

export function isVal(value) {
  if (value || value == 0) return true;
  return false;
}

export function shallowEqual(objA, objB, ignoreNulls=false) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key)) {
      if (ignoreNulls && objA[key] == null) continue;
      if (!objB.hasOwnProperty(key) || objA[key] !== objB[key]) {
        return false;
      }
    }
  }

  // Test for B's keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key)) {
      if (ignoreNulls && objB[key] == null) continue;
      if (!objA.hasOwnProperty(key)) return false;
    }
  }
  return true;
}

export function deepCopy(p, c){
  var c = c || {};
  for (var i in p){
    if(typeof p[i] === 'object'){
      c[i] = (p[i].constructor === Array) ? [] : {};
      deepCopy(p[i], c[i]);
    } else {
      c[i] = p[i];
    }
  }
  return c;
}

export function assign(obj, keyPath, value) {
  let lastKeyIndex = keyPath.length-1;
  for (var i = 0; i < lastKeyIndex; ++ i) {
    let key = keyPath[i];
    if (!(key in obj))
      obj[key] = {}
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

export function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
  }
  return "";
}

export function deepDiff(obj1, obj2) {
  let differences = diff(obj1, obj2) || null;
  if (differences) return differences.map(d => d.path.join('.'));
  return false;
}

export function findObjInArray(array, param, value) {
  const len = array.length;
  for (let i = 0; i < len; i++) if (array[i][param] === value) return array[i];
  return null;
}

export function findObjIndexInArray(array, param, value) {
  const len = array.length;
  for (let i = 0; i < len; i++) if (array[i][param] === value) return i;
  return null;
}

export function makeUserName(data) {
  let userName = data.username;
  let email = data.email;
  let dFN = data.first_name;
  let dLN = data.last_name;
  if (dFN || dLN) return dFN + " " + dLN;
  if (userName) return userName;
  if (email) return email.substring(0, data.email.indexOf('@'));
  return "No user name";
}

export function transformToParams(value, params = {}) {
  const joinParamAndProp = ['dow', 'is_insured', 'is_customer', 'smartphone', 'tag'];
  const transform = {
    average_speed: val => (val / 3.6).toFixed(2),
    max_speed: val => (val / 3.6).toFixed(2),
    daily_distance: val => val ? (val * 1000) : val,
    distance: val => val ? (val * 1000) : val,
    vehicle_total_distance: val => val ? (val * 1000) : val,
    idle_time: val => val / 100,
  }

  value.forEach(filter => {
    for (let prop in filter['value']) {
      let paramName = filter.id;
      let isBoolean = (typeof filter['value'][prop] == 'boolean');

      if (isBoolean || !!filter['value'][prop]) {
        if (joinParamAndProp.indexOf(filter.id) == -1)
          paramName = paramName + '_' + prop;
        params[paramName] = transform[filter.id] ?
          transform[filter.id](filter['value'][prop]) : filter['value'][prop];
      }
    }
  });
  return params;
}

export function splitData(data) {
  var halfIndex = Math.ceil(data.length / 2);
  return [data.slice(0, halfIndex), data.slice(halfIndex)];
}

export function arrToObjectById(arr) {
  return _reduce(arr, (acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

export function formatDate(date) {
  if (!date) return "";
  let time = new Date(date);
  return moment(time).format('DD\/MM\/YYYY');
}

export function makeAddressString(addressObj) {
  var address = [];
  if (addressObj) {
    if (addressObj.route) {
      address.push(addressObj.route);
    }
    if (addressObj.street_number) {
      address.push(" ", addressObj.street_number)
    }
    if (addressObj.postal_code) {
      address.push(" ", addressObj.postal_code)
    }
    if (addressObj.locality) {
      address.push(" ", addressObj.locality)
    }
    if (addressObj.country) {
      address.push(", ", addressObj.country)
    }
  }
  return address.join("");
}

export function log (v) {console.log(v); return v};


export function getJSON(url, success, error) {
  'use strict';
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success(JSON.parse(xhr.responseText));
      } else {
        if (error) error(xhr.responseText);
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
}

export function arrOfObjDiff (a, b) {
  var onlyInA = a.filter(function(current){
    return b.filter(function(current_b){
        return current_b.id == current.id}).length == 0
  });

  var onlyInB = b.filter(function(current){
    return a.filter(function(current_a){
        return current_a.id == current.id}).length == 0
  });

  let d = onlyInA.concat(onlyInB);

  return d;
}

export function isCriOS () { // check if user agent is Chrome at iOS
  var check = false;
  if (navigator.userAgent.match('CriOS')) check = true;
  return check;
}

export function isChrome () {  // check if user agent is Chrome
  let _isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  return !!_isChrome;
}

export function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}

