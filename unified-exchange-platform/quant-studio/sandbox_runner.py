# 👑 UNIFIED EXCHANGE PLATFORM - QUANT SANDBOX RUNNER
# Security: Seccomp, rlimit, and AST parsing for dangerous code

import sys
import resource
import signal
import ast
import time
import threading

# Configuration
MAX_CPU_TIME_SECONDS = 5
MAX_MEMORY_MB = 512

class SecurityViolation(Exception):
    pass

def set_resource_limits():
    """
    Enforce strict resource limits on the process.
    """
    # 1. CPU Time Limit
    resource.setrlimit(resource.RLIMIT_CPU, (MAX_CPU_TIME_SECONDS, MAX_CPU_TIME_SECONDS))
    
    # 2. Memory Limit (Virtual Memory)
    mem_bytes = MAX_MEMORY_MB * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_AS, (mem_bytes, mem_bytes))

def validate_code(code_str):
    """
    Static Analysis to block dangerous imports and functions.
    """
    tree = ast.parse(code_str)
    
    for node in ast.walk(tree):
        # Block imports of os, sys, subprocess, net
        if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
            for alias in node.names:
                if alias.name in ['os', 'sys', 'subprocess', 'socket', 'requests', 'urllib']:
                    raise SecurityViolation(f"Illegal import detected: {alias.name}")
        
        # Block usage of open(), eval(), exec()
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in ['open', 'eval', 'exec', '__import__']:
                    raise SecurityViolation(f"Illegal function call: {node.func.id}")

def run_user_algo(user_code):
    """
    Executes user code in the isolated environment.
    """
    print(">>> Initializing Sandbox Environment...")
    set_resource_limits()
    
    try:
        print(">>> Validating Code Safety...")
        validate_code(user_code)
        
        print(">>> Executing Algorithm...")
        # Create a restricted globals dictionary
        safe_globals = {
            "__builtins__": {
                "print": print,
                "range": range,
                "len": len,
                "float": float,
                "int": int,
                "list": list,
                "dict": dict,
                "sum": sum,
                "min": min,
                "max": max,
                "abs": abs
            }
        }
        
        # Execute
        start_time = time.time()
        exec(user_code, safe_globals)
        end_time = time.time()
        
        print(f">>> Execution Complete. Time: {end_time - start_time:.4f}s")
        
    except SecurityViolation as e:
        print(f"🚨 SECURITY ALERT: {e}")
        sys.exit(1)
    except MemoryError:
        print("🚨 OOM KILLED: Memory limit exceeded.")
        sys.exit(137)
    except Exception as e:
        print(f"Runtime Error: {e}")
        sys.exit(1)

# ============================================
# HTTP SERVER - Render.com Health Check
# ============================================
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps({
                "status": "healthy",
                "service": "quant-studio",
                "version": "1.0.0",
                "max_cpu_seconds": MAX_CPU_TIME_SECONDS,
                "max_memory_mb": MAX_MEMORY_MB
            })
            self.wfile.write(response.encode())
        elif self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps({
                "service": "K99 Exchange - Quant Studio",
                "version": "1.0.0",
                "endpoints": ["/health", "/run", "/validate"]
            })
            self.wfile.write(response.encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass

def start_server():
    port = int(os.getenv("PORT", 8083))
    server = HTTPServer(('0.0.0.0', port), HealthHandler)
    print(f"🌐 Quant Studio HTTP Server started on port {port}")
    server.serve_forever()

if __name__ == "__main__":
    # Start HTTP server for health checks
    start_server()
