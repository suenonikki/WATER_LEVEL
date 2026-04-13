================================================
  HYDROFLOW - ATHLETE HYDRATION DASHBOARD
  Java + HTML/CSS/JavaScript Project
================================================

This is a water level/hydration tracking dashboard application
built with a Java backend server and pure HTML/CSS/JavaScript frontend.


PROJECT STRUCTURE
-----------------
java-project/
|-- src/
|   |-- main/
|       |-- java/
|           |-- com/
|               |-- hydroflow/
|                   |-- HydroFlowServer.java    (Main Java server)
|-- web/
|   |-- index.html                              (Main HTML page)
|   |-- dashboard.js                            (JavaScript logic)
|-- out/                                        (Compiled classes - auto-generated)
|-- run.bat                                     (Windows run script)
|-- run.sh                                      (Mac/Linux run script)
|-- README.txt                                  (This file)


REQUIREMENTS
------------
- Java JDK 11 or higher
  Download from: https://adoptium.net/ (Eclipse Temurin recommended)
  
- A web browser (Chrome, Firefox, Edge, Safari, etc.)


HOW TO RUN
----------

WINDOWS:
1. Open the java-project folder in VS Code or File Explorer
2. Double-click "run.bat"
   OR
   Open Command Prompt/Terminal in this folder and run:
   > run.bat

MAC/LINUX:
1. Open Terminal in the java-project folder
2. Make the script executable (first time only):
   $ chmod +x run.sh
3. Run the script:
   $ ./run.sh


MANUAL COMPILATION (Alternative)
--------------------------------
If the scripts don't work, you can compile and run manually:

1. Open Command Prompt/Terminal in the java-project folder

2. Create output directory:
   > mkdir out                          (Windows)
   $ mkdir -p out                       (Mac/Linux)

3. Compile:
   > javac -d out src/main/java/com/hydroflow/HydroFlowServer.java

4. Run:
   > java -cp out com.hydroflow.HydroFlowServer


ACCESSING THE DASHBOARD
-----------------------
After starting the server, open your web browser and go to:

   http://localhost:8080

You should see the HydroFlow hydration dashboard!


FEATURES
--------
- Water intake tracking with visual glass animation
- Flow rate monitoring chart
- User authentication (login/signup)
- Activity logging
- Device connection status
- Time-based greetings
- Heart rate and body temperature display
- Daily/weekly statistics


API ENDPOINTS
-------------
The Java server provides these REST API endpoints:

POST /api/login     - User login
POST /api/signup    - User registration  
GET  /api/hydration - Get hydration data
POST /api/hydration - Update water intake
GET  /api/user      - Get user profile


TROUBLESHOOTING
---------------

"java is not recognized as a command"
- Install Java JDK from https://adoptium.net/
- Add Java to your PATH environment variable

"Port 8080 already in use"
- Another application is using port 8080
- Close the other application or change PORT in HydroFlowServer.java

"File not found: /index.html"
- Make sure you run from the java-project folder
- Ensure the web/ folder exists with index.html and dashboard.js


OPENING IN VS CODE
------------------
1. Open VS Code
2. File > Open Folder > Select "java-project" folder
3. Install "Extension Pack for Java" if prompted
4. Open Terminal in VS Code (View > Terminal)
5. Run: run.bat (Windows) or ./run.sh (Mac/Linux)


CUSTOMIZATION
-------------
- Daily Goal: Edit DAILY_GOAL in dashboard.js (default: 1000ml)
- Port: Edit PORT in HydroFlowServer.java (default: 8080)
- Styling: Edit the <style> section in index.html


LICENSE
-------
This project is provided for educational purposes.
Feel free to modify and use it for your needs!

================================================
