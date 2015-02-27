
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony \
		--require should \
		--reporter spec \
		--bail

test-cov:
	@NODE_ENV=test node --harmony node_modules/.bin/istanbul cover \
		node_modules/.bin/_mocha -- \
		--require should \
		--reporter spec \
		--bail

.PHONY: test
