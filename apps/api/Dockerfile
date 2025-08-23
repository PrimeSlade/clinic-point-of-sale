FROM node:24.2.0-alpine

WORKDIR /usr/src/Point-of-Sale-Backend

COPY package*.json ./
RUN npm install

# COPY prisma ./prisma/

# RUN npx prisma generate

COPY . .

EXPOSE 3000
# ENTRYPOINT ["npm", "run"]
# CMD ["dev"]
