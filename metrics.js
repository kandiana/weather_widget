// const counter = new Counter();

// counter.init(
//   'BFD7FADF-E225-417B-9289-079DE6967A7F',
//   String(Math.random()).substr(2, 12),
//   'bulls and cows'
// );

const getBrowser = () => {
  if (/MSIE/.test(navigator.userAgent)) {
    return 'Internet Explorer';
  } else if (/Edg/.test(navigator.userAgent)) {
    return 'Edge';
  } else if (/Firefox/.test(navigator.userAgent)) {
    return 'Firefox';
  } else if (/Opera/.test(navigator.userAgent)) {
    return 'Opera';
  } else if (/YaBrowser/.test(navigator.userAgent)) {
    return 'Yandex Browser';
  } else if (/Chrome/.test(navigator.userAgent)) {
    return 'Google Chrome';
  } else if (/Safari/.test(navigator.userAgent)) {
    return 'Safari';
  } else {
    return 'other';
  }
};
const getPlatform = () => {
  if (
    /iPhone/.test(navigator.userAgent) ||
    /iPad/.test(navigator.userAgent) ||
    /Android/.test(navigator.userAgent) ||
    /Windows Phone/.test(navigator.userAgent) ||
    /BB10/.test(navigator.userAgent)
  ) {
    return 'touch';
  } else {
    return 'desktop';
  }
};

const getConnectionType = () => {
  if ('connection' in navigator) {
    return navigator.connection['effectiveType'];
  } else return 'unsupported option';
};

if (window.performance) {
  let [navigation] = window.performance.getEntriesByType('navigation');

  if (navigation) {
    console.log('connect = ' + Math.round(navigation.connectEnd - navigation.connectStart));
    console.log('ttfb = ' + Math.round(navigation.responseEnd - navigation.requestStart));
  }
}

// if (window.performance) {
//   let [navigation] = window.performance.getEntriesByType('navigation');

//   if (navigation) {
//     counter.send('connect', Math.round(navigation.connectEnd - navigation.connectStart));
//     counter.send('ttfb', Math.round(navigation.responseEnd - navigation.requestStart));
//   }
// }
