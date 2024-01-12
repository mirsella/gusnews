BASE_URL ?= "/gusnews"

all: build run

build:
	docker build -t gusnews --build-arg BASE_URL=${BASE_URL} .

run:
	docker stop gusnews || true
	docker rm gusnews || true
	docker run -d --restart unless-stopped --name gusnews -p 3000:3000 gusnews

clean:
	docker stop gusnews || true
	docker rm gusnews || true
	docker rmi gusnews || true
