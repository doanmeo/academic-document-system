# ==============================================================================
# Multi-stage Root Dockerfile for Spring Boot Backend on Render / Railway
# ==============================================================================

FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Copy POM and download core dependencies
COPY backend/pom.xml .
RUN mvn dependency:resolve -B -DskipTests || true

# Copy backend source code and build executable JAR
COPY backend/src ./src
RUN mvn package -DskipTests -B

# Stage 2: Ultra-lightweight JRE 21 Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /workspace/target/academicdocs-0.0.1-SNAPSHOT.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java -XX:+UseSerialGC -Xmx350m -Xss512k -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
