# Remote Chess Playing Web Application

## Build and Run

### **Prerequisites**:

* Verify node and npm is installed on your machine
    * Open a terminal on your PC
    * Run `node -v`
        * Expected output: `v12.16.2` (your version may differ and that is fine, as long as it is not displaying `node command not found`)
    * Run `npm -v`
        * Expected output: `6.14.4` (your version may differ and that is fine, as long as it is not displaying `npm command not found`)

### **Running the Server**:

1. Install necessary project dependencies
    * Open a terminal on the root directory (same directory as this `README` file)
    * Run `npm install`
    * Verify that a `node_modules` folder has been created in the root directory
2. Run server
    * Run `npm start` from the same terminal on the root directory
    * Verify that you see these 2 lines on the console:
        > listening on port 5000

        > MongoDB Connected

### **Running the Client**:

1. Install necessary project dependencies
    * Open another terminal on the root directory (same directory as this `README` file)
    * Change into the `/client` directory by running `cd client`
    * Run `npm install`
    * Verify that a `node_modules` folder has been created in the `/client` directory
2. Run client
    * Run `npm start` from the same terminal on the `/client` directory
    * Verify that you see these 3 lines on the console:
        > Compiled successfully!

        > You can now view client in the browser.

        > http://localhost:3000
3. Access client on browser
    * Open your browser (**Chrome recommended**) and follow the URL that is displayed on the console