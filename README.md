# ZeroG Sim

ZeroG Sim is an experimental Formula 1 simulation project where I explore one simple but exciting question:

**What would happen to an F1 car if gravity changed?**

This project mixes motorsport data, machine learning, and browser-based 3D technology to build a simulation that can show how grip and car behaviour change in low-gravity conditions.

---

## About the Project

The idea behind ZeroG Sim is to create a realistic and interactive F1 experience that is not just visual, but also data-driven.

Instead of depending only on a traditional physics engine, this project uses a trained machine learning model to estimate grip under different gravity levels. That model is then exported to ONNX so it can be used inside a web-based simulation.

In simple words, this project is my attempt to combine:

- real Formula 1 telemetry
- AI / machine learning
- browser-based 3D simulation
- interactive engineering-style visualisation

---

## What the Project Currently Does

At the moment, the project has two main parts:

### 1. Frontend foundation
The frontend is built with React and Vite, and it includes tools for 3D rendering and browser-based model inference.

### 2. Physics / AI pipeline
The Python workflow uses F1 telemetry to generate a dataset, train a neural network, and export the trained model as an ONNX file for later use in the simulation.

So right now, the project is in a strong **prototype / development phase** rather than being a fully finished simulator.

---

## How the Model Works

The current workflow is based on Formula 1 telemetry data from the **2024 Spa qualifying session**.

The pipeline:

- loads session data using FastF1
- selects ** fastest lap**
- extracts telemetry
- calculates speed, downforce, normal force, and effective weight
- simulates multiple gravity levels from **0.0 to 1.0**
- estimates maximum grip in newtons
- builds a training dataset
- trains a PyTorch neural network
- exports the trained model to ONNX

The exported model can then be used later in the frontend for browser-side inference.

---

## Model Inputs and Output

The current surrogate model uses:

### Inputs
- `Speed_ms`
- `Gravity_Factor`

### Output
- `Max_Grip_Newtons`

This makes the model lightweight and suitable for interactive use inside a web simulation.

---

## Tech Stack

### Frontend
- React
- Vite
- Three.js
- React Three Fiber
- Drei
- Recharts
- ONNX Runtime Web

### AI / Data Pipeline
- Python
- PyTorch
- ONNX
- FastF1
- NumPy
- Pandas
- scikit-learn


git clone <your-repo-url>
cd zerog-sim
