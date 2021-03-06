/* ========================================================================
* Phonon: accordion.js v0.0.1
* http://phonon.quarkdev.com
* ========================================================================
* Licensed under MIT (http://phonon.quarkdev.com)
* ======================================================================== */
;(function (window) {

	'use strict';

	/**
	 * Show the accordion content
	 * @param {DOMNode} defaultTarget
	 * @param {DOMNode} accordionContent
	 */
	function show(defaultTarget, accordionContent) {

		var height = accordionContent.offsetHeight;
		accordionContent.style.maxHeight = '0px';

		window.setTimeout(function() {

			var onShow = function() {

				accordionContent.off(phonon.event.transitionEnd, onShow);

				var icon = defaultTarget.parentNode.querySelector('.icon-expand-more');

				if(icon) {
					icon.classList.remove('icon-expand-more');
					icon.classList.add('icon-expand-less');
				}

			};

			accordionContent.on(phonon.event.transitionEnd, onShow);

			accordionContent.style.maxHeight = height + 'px';
			accordionContent.classList.add('accordion-active');

		}, 100);
	}

	/**
	 * Hide the accordion content
	 * @param {DOMNode} defaultTarget
	 * @param {DOMNode} accordionContent
	 */
		function hide(defaultTarget, accordionContent) {

		var onHide = function() {

			accordionContent.classList.remove('accordion-active');
			accordionContent.style.maxHeight = 'none';

			var icon = defaultTarget.parentNode.querySelector('.icon-expand-less');

			if(icon) {
				icon.classList.remove('icon-expand-less');
				icon.classList.add('icon-expand-more');
			}

			accordionContent.off(phonon.event.transitionEnd, onHide);
		};

		accordionContent.style.maxHeight = '0px';
		accordionContent.on(phonon.event.transitionEnd, onHide);
	}

	// fix #96
	function getAccordion(target) {

		for (; target && target !== document; target = target.parentNode) {
			if(target.nextElementSibling && target.nextElementSibling.classList.contains('accordion-content')) {
				return {defaultTarget: target, accordionContent: target.nextElementSibling}
			}
		}

		return null
	}

	function onPage(evt) {

		var target = getAccordion(evt.target)
		if(target === null) return

		if(target.accordionContent.classList.contains('accordion-active')) {
			hide(target.defaultTarget, target.accordionContent);
		} else {
			show(target.defaultTarget, target.accordionContent);
		}
	}

	/*
	 * Attachs event once
	 */
	document.on('pagecreated', function(evt) {

		var page = document.querySelector(evt.detail.page);

		if(page.querySelector('.accordion-content')) {
			page.on('tap', onPage);
		}
	});

	document.on('pageclosed', function(evt) {

		var page = document.querySelector(evt.detail.page);
		var accordionLists = page.querySelectorAll('.accordion-active');
		var l = accordionLists.length;
		var i = 0;

		for (; i < accordionLists.length; i++) {
			var fakeDefaultTarget = accordionLists[i].previousElementSibling;
			onPage({target: fakeDefaultTarget});
		}
	});

}(typeof window !== 'undefined' ? window : this));
