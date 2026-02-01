FROM eclipse-temurin:17-jdk-jammy
USER root

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    git \
    build-essential \
    sudo \
    curl \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --version

# Install Maven
RUN curl -fsSL https://archive.apache.org/dist/maven/maven-3/3.9.4/binaries/apache-maven-3.9.4-bin.tar.gz | tar xzf - -C /opt && \
    ln -s /opt/apache-maven-3.9.4 /opt/maven && \
    ln -s /opt/maven/bin/mvn /usr/local/bin/mvn

# Install Gradle
RUN curl -fsSL https://services.gradle.org/distributions/gradle-8.3-bin.zip -o gradle.zip && \
    unzip gradle.zip -d /opt && \
    ln -s /opt/gradle-8.3 /opt/gradle && \
    ln -s /opt/gradle/bin/gradle /usr/local/bin/gradle && \
    rm gradle.zip

# Set JAVA_HOME and other environment variables
ENV JAVA_HOME=/opt/java/openjdk
ENV MAVEN_HOME=/opt/maven
ENV GRADLE_HOME=/opt/gradle
ENV PATH=$PATH:$MAVEN_HOME/bin:$GRADLE_HOME/bin

WORKDIR /workspace

# Create welcome Java file
RUN cat > /workspace/Welcome.java << 'EOF'
public class Welcome {
    public static void main(String[] args) {
        System.out.println("🚀 Welcome to DevPod Java Workspace!");
        System.out.println("☕ Java version: " + System.getProperty("java.version"));
        System.out.println("📁 Working directory: " + System.getProperty("user.dir"));
        System.out.println("");
        System.out.println("🛠️  Available tools:");
        System.out.println("   - Java " + System.getProperty("java.version"));
        System.out.println("   - Maven (mvn --version)");
        System.out.println("   - Gradle (gradle --version)");
        System.out.println("");
        System.out.println("🎯 Quick start:");
        System.out.println("   1. Compile: javac Welcome.java");
        System.out.println("   2. Run: java Welcome");
        System.out.println("   3. Create Maven project: mvn archetype:generate");
        System.out.println("   4. Create Gradle project: gradle init");
        System.out.println("");
        System.out.println("Happy coding! 🎉");
    }
}
EOF

# Create README with Java-specific instructions
RUN cat > /workspace/README.md << 'EOF'
# ☕ DevPod Java Workspace

Welcome to your Java development environment! This workspace comes pre-configured with Java 17, Maven, and Gradle.

## 🚀 Quick Start

### Test Your Setup
```bash
# Compile and run the welcome program
javac Welcome.java
java Welcome

# Check versions
java --version
mvn --version
gradle --version
```

## 📦 Creating Projects

### Maven Project
```bash
# Create a new Maven project
mvn archetype:generate \
  -DgroupId=com.example \
  -DartifactId=my-app \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false

cd my-app
mvn compile
mvn exec:java -Dexec.mainClass="com.example.App"
```

### Gradle Project
```bash
# Create a new Gradle project
mkdir my-gradle-app && cd my-gradle-app
gradle init --type java-application

# Build and run
./gradlew build
./gradlew run
```

### Simple Java Program
```bash
# Create a simple Java file
cat > HelloWorld.java << 'JAVAEOF'
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, DevPod Java!");
    }
}
JAVAEOF

# Compile and run
javac HelloWorld.java
java HelloWorld
```

## 🛠️ Available Tools

- **Java 17**: Latest LTS version with modern features
- **Maven 3.9.4**: Dependency management and build automation
- **Gradle 8.3**: Modern build tool with Kotlin DSL support
- **Git**: Version control
- **Code-server**: VS Code in the browser

## 📁 Project Structure Examples

### Maven Project Structure
```
my-app/
├── pom.xml
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/example/App.java
│   └── test/
│       └── java/
│           └── com/example/AppTest.java
└── target/
```

### Gradle Project Structure
```
my-gradle-app/
├── build.gradle
├── settings.gradle
├── src/
│   ├── main/
│   │   └── java/
│   │       └── App.java
│   └── test/
│       └── java/
│           └── AppTest.java
└── build/
```

## 🔧 Common Commands

### Maven
```bash
mvn compile          # Compile source code
mvn test            # Run tests
mvn package         # Create JAR file
mvn clean           # Clean build artifacts
mvn dependency:tree # Show dependencies
```

### Gradle
```bash
gradle build        # Build project
gradle test         # Run tests
gradle run          # Run application
gradle clean        # Clean build
gradle dependencies # Show dependencies
```

### Java
```bash
javac *.java        # Compile all Java files
java ClassName      # Run compiled class
java -cp . ClassName # Run with classpath
jar -cf app.jar *.class # Create JAR file
```

## 🎯 Development Tips

1. **Use the integrated terminal** for all commands
2. **Install Java extensions** in code-server for better IDE experience
3. **Use Maven or Gradle** for dependency management
4. **Follow Java naming conventions** (PascalCase for classes, camelCase for methods)
5. **Organize code in packages** for better structure

## 🔍 Troubleshooting

### Java Not Found?
```bash
echo $JAVA_HOME
which java
java --version
```

### Maven Issues?
```bash
echo $MAVEN_HOME
which mvn
mvn --version
```

### Gradle Issues?
```bash
echo $GRADLE_HOME
which gradle
gradle --version
```

## 📚 Learning Resources

- [Oracle Java Documentation](https://docs.oracle.com/en/java/)
- [Maven Getting Started](https://maven.apache.org/guides/getting-started/)
- [Gradle User Manual](https://docs.gradle.org/current/userguide/userguide.html)
- [Java Code Conventions](https://www.oracle.com/java/technologies/javase/codeconventions-contents.html)

Happy Java coding! ☕🚀
EOF

EXPOSE 8080

CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "--disable-telemetry", "--disable-update-check", "/workspace"]