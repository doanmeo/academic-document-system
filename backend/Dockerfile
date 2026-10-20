# ==============================================================================
# Multi-stage Dockerfile for Spring Boot 3.4 (Optimized for Free-Tier 512MB RAM)
# ==============================================================================

# Stage 1: Build JAR using Maven with Eclipse Temurin 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Copy POM and download core dependencies
COPY pom.xml .
RUN mvn dependency:resolve -B -DskipTests || true

# Copy source code and build executable JAR
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Ultra-lightweight JRE 21 Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built JAR from builder stage
COPY --from=builder /workspace/target/academicdocs-0.0.1-SNAPSHOT.jar app.jar

# Environment variable defaults
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

EXPOSE 8080

# Tuned JVM memory options for 512MB RAM free-tier:
# - SerialGC saves ~30-50MB RAM compared to G1GC
# - Max heap 350MB leaves ~162MB for metaspace, native memory, and thread stacks
ENTRYPOINT ["sh", "-c", "exec java -XX:+UseSerialGC -Xmx350m -Xss512k -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
