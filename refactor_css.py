import re

with open('assets/css/styles-professional.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Remove the heavy body background image
css = re.sub(r'background-image:\s*linear-gradient[^;]+!important;', '', css)

# 2. Update navigation to look like Apple's frosted sub-nav
css = re.sub(r'\.nav-container\s*{[^}]+}', 
             '.nav-container {\n    width: 100%;\n    background: rgba(245, 245, 247, 0.8);\n    backdrop-filter: var(--backdrop-blur);\n    -webkit-backdrop-filter: var(--backdrop-blur);\n    border-bottom: 1px solid var(--color-border-subtle);\n    position: sticky;\n    top: 0;\n    z-index: 900;\n    display: flex;\n    justify-content: center;\n}', css)

# 3. Update tabs active state (remove the pinkish background)
css = re.sub(r'\.nav-tab\.active\s*{[^}]+}', 
             '.nav-tab.active {\n    color: var(--color-primary);\n    font-weight: 600;\n    background: var(--color-primary-subtle);\n}', css)

# 4. Clean up Home Hero (remove gradient and text-fill, use clean Apple typography)
css = re.sub(r'\.home-hero\s*{[^}]+}', 
             '.home-hero {\n    text-align: center;\n    padding: 80px 20px;\n    background: var(--bg-panel);\n    border-radius: var(--radius-none);\n    margin-bottom: 40px;\n    position: relative;\n    overflow: hidden;\n}', css)

css = re.sub(r'\.home-hero h2\s*{[^}]+}', 
             '.home-hero h2 {\n    font-size: var(--text-5xl);\n    font-family: var(--font-display);\n    letter-spacing: var(--tracking-hero);\n    font-weight: 600;\n    margin-bottom: 15px;\n    color: var(--text-main);\n}', css)

css = re.sub(r'\.home-hero p\s*{[^}]+}', 
             '.home-hero p {\n    font-size: var(--text-2xl);\n    font-weight: 400;\n    letter-spacing: var(--tracking-normal);\n    color: var(--text-muted);\n    max-width: 600px;\n    margin: 0 auto 40px;\n}', css)

css = re.sub(r'\.home-hero::before\s*{[^}]+}', '', css) # Remove spinning background

# 5. Buttons to Pill shape
css = re.sub(r'\.action-btn\s*{[^}]+}', 
             '.action-btn {\n    background: var(--primary);\n    color: white;\n    border: none;\n    padding: 11px 22px;\n    border-radius: var(--radius-pill);\n    font-weight: 400;\n    font-size: var(--text-base);\n    cursor: pointer;\n    transition: transform var(--transition-fast);\n}', css)

css = re.sub(r'\.btn-primary\s*{[^}]+}', 
             '.btn-primary {\n    background: var(--primary);\n    color: white;\n    border: none;\n    padding: 11px 22px;\n    border-radius: var(--radius-pill);\n    font-weight: 400;\n    font-size: var(--text-base);\n    cursor: pointer;\n    transition: transform var(--transition-fast);\n}', css)

css = re.sub(r'\.action-btn:hover,\s*\.btn-primary:hover\s*{[^}]+}', 
             '.action-btn:hover, .btn-primary:hover {\n    transform: var(--transform-active);\n}', css)

# 6. Progress bar fill
css = re.sub(r'\.progress-bar-fill\s*{[^}]+}', 
             '.progress-bar-fill {\n    height: 100%;\n    background: var(--primary);\n    border-radius: var(--radius-pill);\n    transition: width 0.6s ease;\n}', css)

# 7. Remove rogue pink colors (rgba(244, 63, 94...))
css = re.sub(r'rgba\(244,\s*63,\s*94,\s*[\d.]+\)', 'var(--color-primary-subtle)', css)
css = re.sub(r'#e11d48', 'var(--primary)', css)

# 8. Flashcard design to be flat and clean
css = re.sub(r'\.card-face\s*{[^}]+}', 
             '.card-face {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    backface-visibility: hidden;\n    border-radius: var(--radius-lg);\n    background: var(--bg-panel);\n    border: 1px solid var(--color-border);\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    padding: 40px;\n}', css)

css = re.sub(r'\.card-character\s*{[^}]+}', 
             '.card-character {\n    font-size: var(--hanzi-hero);\n    font-family: var(--font-chinese);\n    font-weight: var(--hanzi-weight);\n    margin-bottom: 20px;\n    color: var(--text-main);\n}', css)

# 9. App title
css = re.sub(r'\.app-title\s*{[^}]+}', 
             '.app-title {\n    font-size: 1.1rem;\n    font-weight: 600;\n    color: var(--text-main);\n    margin: 0;\n    white-space: nowrap;\n}', css)

with open('assets/css/styles-professional.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS refactored successfully.")
