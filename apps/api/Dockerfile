FROM node:24.2.0-alpine

WORKDIR /usr/src/Point-Of-Sale-Backend

COPY ./ ./

RUN npm install

EXPOSE 3000
ENTRYPOINT ["npm", "run"]
CMD ["dev"]