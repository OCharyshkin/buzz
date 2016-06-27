FROM node:latest

RUN mkdir parse

ADD . /parse
WORKDIR /parse
RUN npm install

ENV APP_ID 'CNl31JPPJR2vPkJR0ZznubUEkeDZWL6sD1z1jDNr'
ENV MASTER_KEY 'uj07z8koTtNw6hozfJkBHZGkV9REfJ0yfntlgOg3'
ENV DATABASE_URI 'mongodb://oleg:pass1@ds023704.mlab.com:23704/buzz-test'
ENV PORT 1337

# Optional (default : 'parse/cloud/main.js')
# ENV CLOUD_CODE_MAIN cloudCodePath

# Optional (default : '/parse')
# ENV PARSE_MOUNT mountPath

EXPOSE 1337

# Uncomment if you want to access cloud code outside of your container
# A main.js file must be present, if not Parse will not start

# VOLUME /parse/cloud               

CMD [ "npm", "start" ]
