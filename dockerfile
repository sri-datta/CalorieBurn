# Step 1: Use the official Nginx image from Docker Hub
FROM nginx:alpine

# Step 2: Set the working directory inside the container
WORKDIR /usr/share/nginx/html

# Step 3: Copy all files from the current directory on the host to the working directory inside the container
COPY . /usr/share/nginx/html

# Step 4: Expose port 80 to allow external traffic to the container
EXPOSE 80

# Step 5: The default Nginx command will automatically start the web server, so no additional commands are needed
