
window.AudioCtx = (function() { return window.AudioContext || window.mozAudioContext || window.webkitAudioContext || window.msAudioContext || window.oAudioContext; })();

var Detector = {
	is_chrome: navigator.userAgent.indexOf('Chrome') > -1,
	is_firefox: navigator.userAgent.indexOf('Firefox') > -1,
	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,
	audiocontext: null,

	checkDependencies: function () {
		return window.AudioCtx && Detector.webgl && (Detector.is_chrome || Detector.is_firefox);
	}

};