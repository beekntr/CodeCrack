# C++ execution environment
FROM gcc:9

# Security: Create non-root user
RUN useradd -m -s /bin/bash coder

# Install security tools and remove unnecessary packages
RUN apt-get update && apt-get install -y \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /code

# Switch to non-root user
USER coder

# Set entrypoint for security
ENTRYPOINT ["dumb-init", "--"]

# Default command - compile and run
CMD ["sh", "-c", "g++ -o solution solution.cpp -std=c++17 && ./solution"]
