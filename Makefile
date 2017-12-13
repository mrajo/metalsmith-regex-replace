nodebin = node_modules/.bin/

node_modules: package.json
	@npm install

test: node_modules
	@$(nodebin)nyc mocha -R spec

coverage:
	@$(nodebin)nyc report --reporter=lcov

.PHONY: test coverage
