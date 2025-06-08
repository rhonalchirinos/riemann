FROM node:22-alpine

RUN apk update && apk add --no-cache \
    fontconfig \
    ttf-freefont \
    bash

RUN apk add --no-cache \
    python3 \
    py3-pip \ 
    py3-requests \
    py3-flask \
    py3-pandas \
    py3-numpy

RUN ln -sf python3 /usr/bin/python && \
    ln -sf pip3 /usr/bin/pip

