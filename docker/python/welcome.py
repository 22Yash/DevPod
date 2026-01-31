#!/usr/bin/env python3
"""
Welcome to your Python DevPod workspace! 🐍

This is a sample Python file to get you started.
You can run this file by:
1. Opening the terminal (Ctrl+`)
2. Running: python welcome.py
"""

import sys
import os
from datetime import datetime

def main():
    print("🎉 Welcome to your Python DevPod workspace!")
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Current directory: {os.getcwd()}")
    print(f"⏰ Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    print("🚀 Quick start commands:")
    print("  python --version     # Check Python version")
    print("  pip list            # List installed packages")
    print("  pip install <package>  # Install new packages")
    print()
    print("📝 Try editing this file and running it again!")
    
    # Simple interactive example
    name = input("👋 What's your name? ")
    print(f"Nice to meet you, {name}! Happy coding! 🎯")

if __name__ == "__main__":
    main()