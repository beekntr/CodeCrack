# Python execution environment
FROM python:3.11-alpine

# Security: Create non-root user
RUN adduser -D -s /bin/sh coder

# Install security tools and remove unnecessary packages
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /code

# Switch to non-root user
USER coder

# Set entrypoint for security
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["python", "solution.py"]
