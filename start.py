#!/usr/bin/env python3
"""
TON Pool - Startup Script
Запускает backend, frontend и Stripe webhook listener
"""

import subprocess
import sys
import time
import os
import signal

# Цвета для консоли
class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_banner():
    print(f"""
{Colors.BLUE}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║                   🌊 TON POOL STARTER 🌊                  ║
║                                                           ║
║  Backend:  http://localhost:3001                          ║
║  Frontend: http://localhost:3000                          ║
║  Admin:    http://localhost:3000/admin                    ║
╚═══════════════════════════════════════════════════════════╝
{Colors.END}
""")

def check_node():
    """Проверяет установлен ли Node.js"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        print(f"{Colors.GREEN}✓ Node.js: {result.stdout.strip()}{Colors.END}")
        return True
    except FileNotFoundError:
        print(f"{Colors.RED}✗ Node.js не установлен!{Colors.END}")
        return False

def kill_node_processes():
    """Останавливает все Node.js процессы"""
    print(f"{Colors.YELLOW}🔄 Останавливаю предыдущие процессы...{Colors.END}")
    if sys.platform == 'win32':
        subprocess.run(['taskkill', '/F', '/IM', 'node.exe'], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        subprocess.run(['pkill', '-f', 'node'], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

def start_backend(base_dir):
    """Запускает backend сервер"""
    print(f"{Colors.BLUE}🚀 Запускаю Backend...{Colors.END}")
    backend_dir = os.path.join(base_dir, 'backend')
    
    if sys.platform == 'win32':
        process = subprocess.Popen(
            'npx tsx watch src/index.ts',
            cwd=backend_dir,
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        process = subprocess.Popen(
            ['npx', 'tsx', 'watch', 'src/index.ts'],
            cwd=backend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    return process

def start_frontend(base_dir):
    """Запускает frontend сервер"""
    print(f"{Colors.BLUE}🎨 Запускаю Frontend...{Colors.END}")
    frontend_dir = os.path.join(base_dir, 'frontend')
    
    if sys.platform == 'win32':
        process = subprocess.Popen(
            'npx vite --host',
            cwd=frontend_dir,
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        process = subprocess.Popen(
            ['npx', 'vite', '--host'],
            cwd=frontend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    return process

def start_stripe_webhook(base_dir):
    """Запускает Stripe webhook listener"""
    print(f"{Colors.BLUE}💳 Запускаю Stripe Webhook Listener...{Colors.END}")
    
    # Проверяем установлен ли Stripe CLI
    try:
        subprocess.run('stripe --version', shell=True, capture_output=True)
    except FileNotFoundError:
        print(f"{Colors.YELLOW}⚠️  Stripe CLI не установлен. Webhook listener пропущен.{Colors.END}")
        print(f"{Colors.YELLOW}   Установите: https://stripe.com/docs/stripe-cli{Colors.END}")
        return None
    
    if sys.platform == 'win32':
        process = subprocess.Popen(
            'stripe listen --forward-to localhost:3001/api/webhook/stripe',
            cwd=base_dir,
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        process = subprocess.Popen(
            ['stripe', 'listen', '--forward-to', 'localhost:3001/api/webhook/stripe'],
            cwd=base_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    return process

def start_ngrok():
    """Запускает ngrok туннель (опционально)"""
    try:
        subprocess.run('ngrok --version', shell=True, capture_output=True)
        print(f"{Colors.BLUE}🌐 Запускаю ngrok туннель...{Colors.END}")
        
        if sys.platform == 'win32':
            process = subprocess.Popen(
                'ngrok http 3000',
                shell=True,
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            process = subprocess.Popen(
                ['ngrok', 'http', '3000'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        return process
    except FileNotFoundError:
        print(f"{Colors.YELLOW}⚠️  ngrok не установлен. Туннель пропущен.{Colors.END}")
        return None

def main():
    print_banner()
    
    # Определяем базовую директорию
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Проверяем Node.js
    if not check_node():
        print(f"{Colors.RED}Установите Node.js: https://nodejs.org/{Colors.END}")
        sys.exit(1)
    
    # Останавливаем старые процессы
    kill_node_processes()
    
    processes = []
    
    try:
        # Запускаем сервисы
        backend = start_backend(base_dir)
        processes.append(backend)
        time.sleep(3)  # Даём время backend запуститься
        
        frontend = start_frontend(base_dir)
        processes.append(frontend)
        time.sleep(2)
        
        stripe = start_stripe_webhook(base_dir)
        if stripe:
            processes.append(stripe)
        
        # Опционально запускаем ngrok
        if '--ngrok' in sys.argv:
            ngrok = start_ngrok()
            if ngrok:
                processes.append(ngrok)
        
        print(f"""
{Colors.GREEN}{Colors.BOLD}
✅ Все сервисы запущены!

📱 Откройте в браузере: http://localhost:3000
👨‍💼 Админ панель: http://localhost:3000/admin
   Логин: admin@pool.ton
   Пароль: admin123

💳 Тестовая карта Stripe: 4242 4242 4242 4242

🔑 Для мобильного кошелька запустите с флагом --ngrok:
   python start.py --ngrok
{Colors.END}
""")
        
        print(f"{Colors.YELLOW}Нажмите Ctrl+C для остановки всех сервисов...{Colors.END}")
        
        # Ждём пока пользователь не нажмёт Ctrl+C
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}🛑 Останавливаю сервисы...{Colors.END}")
        
        for p in processes:
            try:
                p.terminate()
                p.wait(timeout=5)
            except:
                p.kill()
        
        kill_node_processes()
        print(f"{Colors.GREEN}✅ Все сервисы остановлены.{Colors.END}")

if __name__ == '__main__':
    main()
