# **Synthra**

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
  - [Load Balancing Algorithms](#load-balancing-algorithms)
  - [Health Checks](#health-checks)
  - [Dynamic Server Pooling](#dynamic-server-pooling)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)

## Introduction

Welcome to Synthra Project! This project aims to provide a customizable and efficient load balancing solution for distributing incoming traffic across multiple servers. It's designed to be modular and feature-rich, allowing users to easily integrate it into their infrastructure.

## Features

### 1. Load Balancing Algorithms

Supports primary load balancing algorithms to suit different scenarios:

- [x] Round Robin
- [ ] Weighted Round Robin
- [x] Least Connections
- [ ] Source IP Hash

### 2. Health Checks

Your Load Balancer includes robust health checking capabilities to ensure optimal server performance and availability:

- HTTP/HTTPS Health Checks
  - Decides how often health checks should be performed and set timeout values for the health check requests. For example, it can perform health checks every few seconds or minutes. If a server fails a health check, you may configure to retry the check a few more times before declaring it as unhealthy.

### 3. Dynamic Server Pooling

- Dynamic Server Pooling:
  Update the load balancer's server pool dynamically based on the health status. Remove unhealthy servers from the rotation and add them back when they are healthy again.

### N. Other Features (will add soon)

## Getting Started

### Installation

1. Clone this repository. (will publish on npm once its ready)
2. Navigate to the project directory.
3. Install dependencies with `npm install`.

## Usage

1. Run your load balancer with `npm start`
2. Monitor server health and traffic distribution via the provided API functions.
3. Open `test` directory and use API functions in `config.js` and customize the configuration settings as needed.
4. Configure load balancing algorithms, health check settings, and other features.

---

_Feel free to reach out to or open issues if you have any questions or need assistance._
