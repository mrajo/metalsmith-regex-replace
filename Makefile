nodebin = node_modules/.bin/

node_modules: package.json
	@npm install

test: node_modules
	@$(nodebin)nyc mocha -R spec

coverage:
	@$(nodebin)nyc report --reporter=lcov

coverage_manual:
	curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
	chmod +x ./cc-test-reporter
	./cc-test-reporter before-build
	@$(nodebin)nyc mocha -R spec; echo $$? > .test_result
	@$(nodebin)nyc report --reporter=lcov
	./cc-test-reporter after-build --exit-code $$(cat .test_result) -r 3c8c0df73eeb33be4dcc20bfae70e0e91e3241ce48b56dbbd3ec6ad0f19fb8e7

clean:
	rm -f ./cc-test-reporter
	rm -f ./.test_result
	rm -rf .nyc_output
	rm -rf coverage

.PHONY: test coverage coverage_manual clean
