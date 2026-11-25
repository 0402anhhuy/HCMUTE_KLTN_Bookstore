# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Route Maven Central through Google's GCS mirror first to avoid 429 rate limits on Render shared IPs
COPY settings-docker.xml /root/.m2/settings.xml

COPY pom.xml .
RUN for i in 1 2 3; do \
      mvn -s /root/.m2/settings.xml dependency:go-offline -B && exit 0; \
      echo "Maven go-offline failed ($i/3), retrying in 10s..."; sleep 10; \
    done; exit 1
COPY src src

# Copy application.properties.example if application.properties is missing (since it's in .gitignore)
RUN if [ ! -f src/main/resources/application.properties ]; then \
      cp src/main/resources/application.properties.example src/main/resources/application.properties; \
    fi

RUN mvn -s /root/.m2/settings.xml package -DskipTests -B

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
