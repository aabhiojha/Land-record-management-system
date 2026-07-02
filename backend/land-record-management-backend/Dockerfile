# syntax=docker/dockerfile:1

# ---- Build stage: compile and package the Spring Boot jar ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Resolve dependencies first so this layer is cached unless pom.xml changes.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Build the application. Tests run in CI, not in the image build.
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Runtime stage: slim JRE, non-root ----
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Run as an unprivileged user.
RUN groupadd --system app && useradd --system --gid app app

# Directory for uploaded documents (mount a volume here to persist them).
RUN mkdir -p /app/uploads && chown -R app:app /app

COPY --from=build /workspace/target/*.jar /app/app.jar
RUN chown app:app /app/app.jar

USER app
EXPOSE 8080

# app.upload.dir defaults to ./uploads relative to the working directory.
ENV APP_UPLOAD_DIR=/app/uploads
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
