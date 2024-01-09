BASE_URL ?= "/"

all: build run

build:
	docker build -t nuxt --build-arg BASE_URL=${BASE_URL} .

run:
	docker stop nuxt || true
	docker rm nuxt || true
	docker run -d --name nuxt -p 3000:3000 nuxt

clean:
	docker stop nuxt || true
	docker rm nuxt || true
	docker rmi nuxt || true
