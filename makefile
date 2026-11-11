# make SITE=lmenews
SITE ?= gusnews
BASE_URL ?= /$(SITE)

all: build run

build:
	docker build -t $(SITE) --build-arg SITE=$(SITE) --build-arg BASE_URL=$(BASE_URL) .

run:
	docker stop $(SITE) || true
	docker rm $(SITE) || true
	docker run -d --restart unless-stopped --name $(SITE) -p 3000:3000 $(SITE)

clean:
	docker stop $(SITE) || true
	docker rm $(SITE) || true
	docker rmi $(SITE) || true
