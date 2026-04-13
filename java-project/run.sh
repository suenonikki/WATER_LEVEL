#!/bin/bash

echo "================================================"
echo "  HydroFlow - Athlete Hydration Dashboard"
echo "================================================"
echo ""

# Create output directory
mkdir -p out

# Compile Java files
echo "Compiling Java files..."
javac -d out src/main/java/com/hydroflow/*.java

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Compilation failed! Make sure you have Java JDK installed."
    echo "Download from: https://adoptium.net/"
    exit 1
fi

echo "Compilation successful!"
echo ""

# Run the server
echo "Starting server..."
echo ""
java -cp out com.hydroflow.HydroFlowServer
