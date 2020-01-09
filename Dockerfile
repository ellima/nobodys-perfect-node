FROM node:12

# Create app dir
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle source
COPY . .

EXPOSE 8080
CMD ["node", "app.js"]
