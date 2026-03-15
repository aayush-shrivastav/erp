FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Install Keploy CLI for Linux inside the container
RUN apt-get update && apt-get install -y curl tar ca-certificates && \
    curl -fSsl https://keploy.io/install.sh | bash && \
    mv /usr/local/bin/keploy /usr/local/bin/keploy-bin

EXPOSE 5001

CMD ["npm", "start"]
