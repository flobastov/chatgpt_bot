build:
	docker build -t chatgpt_bot .

run:
	docker run -d -p 3000:3000 --name chatgpt_bot --rm chatgpt_bot