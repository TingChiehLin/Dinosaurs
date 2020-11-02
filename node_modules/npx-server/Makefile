
nt: # test .npmignore
	@npm pack

u: # update npm and git (generates new tag)
	@/bin/bash update.sh

uf: # update even if there is nothing new committed
	@/bin/bash update.sh force

run: # run local server to general testing
	@nodemon -e js,html server.js --log 15 --edit