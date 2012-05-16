clean:
	rm package.json

build: clean  package.json

% : %.in
	perl -p -e 's/\$$\{\{([^}]+)\}\}/defined $$ENV{$$1} ? $$ENV{$$1} : $$&/eg' $< > $@
