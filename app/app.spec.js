// 'use strict';

describe('Socket', function() {

	beforeEach(function() {
		browser().navigateTo('/');
	});

	it('should redirect to Draw', function() {
		// console.log(browser().window().path());
		expect(browser().window().path()).toBe("/");		 
	});


});