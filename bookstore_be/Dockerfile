# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Copy application.properties.example if application.properties is missing (since it's in .gitignore)
RUN if [ ! -f src/main/resources/application.properties ]; then \
      cp src/main/resources/application.properties.example src/main/resources/application.properties; \
    fi

RUN chmod +x ./mvnw
RUN ./mvnw package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
