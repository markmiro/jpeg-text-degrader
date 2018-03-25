// The worker script needs to be in the same origin as the document
// https://stackoverflow.com/a/13149715
// However, only Chrome seems to be able to support it:
// https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js"
);
