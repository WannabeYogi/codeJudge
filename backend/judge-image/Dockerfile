FROM openjdk:17-jdk-slim
RUN apt-get update && apt-get install -y --no-install-recommends timeout procps && rm -rf /var/lib/apt/lists/*
WORKDIR /sandbox
COPY run.sh /run.sh
RUN chmod +x /run.sh
ENTRYPOINT ["/run.sh"]
