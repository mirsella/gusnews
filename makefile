BASE_URL ?= "/lmenews"

all: build run

build:
	docker build -t lmenews --build-arg BASE_URL=${BASE_URL} .

run:
	docker stop lmenews || true
	docker rm lmenews || true
	docker run -d --restart unless-stopped --name lmenews -p 3000:3000 lmenews

clean:
	docker stop lmenews || true
	docker rm lmenews || true
	docker rmi lmenews || true
