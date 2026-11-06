# Everything (Node, npm packages) lives inside this container.
# Nothing is installed on the host machine.
FROM node:22.12.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ENV PORT=5280
EXPOSE 5280

CMD ["npm", "run", "dev"]
