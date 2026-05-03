import re

with open('assets/css/styles-professional.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update Navigation for Notion (flat white, thin border)
css = re.sub(r'\.nav-container\s*{[^}]+}', 
             '.nav-container {\n    width: 100%;\n    background: var(--bg-app);\n    border-bottom: 1px solid var(--color-border);\n    position: sticky;\n    top: 0;\n    z-index: 900;\n    display: flex;\n    justify-content: center;\n}', css)

# 2. Update Tabs active state (underlined Notion style)
css = re.sub(r'\.nav-tab\.active\s*{[^}]+}', 
             '.nav-tab.active {\n    color: var(--text-main);\n    font-weight: 500;\n    background: transparent;\n    border-bottom: 2px solid var(--text-main);\n    border-radius: 0;\n}', css)

css = re.sub(r'\.nav-tab:hover\s*{[^}]+}', 
             '.nav-tab:hover {\n    color: var(--text-main);\n    background: var(--color-bg-hover);\n}', css)

# 3. Home Hero - Deep Navy band
css = re.sub(r'\.home-hero\s*{[^}]+}', 
             '.home-hero {\n    text-align: center;\n    padding: 120px 20px;\n    background: var(--color-secondary);\n    border-radius: var(--radius-none);\n    margin-bottom: 64px;\n    position: relative;\n    overflow: hidden;\n}', css)

css = re.sub(r'\.home-hero h2\s*{[^}]+}', 
             '.home-hero h2 {\n    font-size: var(--text-5xl);\n    font-family: var(--font-display);\n    letter-spacing: var(--tracking-hero);\n    font-weight: 600;\n    margin-bottom: 20px;\n    color: var(--color-text-on-dark);\n    line-height: 1.05;\n}', css)

css = re.sub(r'\.home-hero p\s*{[^}]+}', 
             '.home-hero p {\n    font-size: var(--text-lg);\n    font-weight: 400;\n    letter-spacing: var(--tracking-normal);\n    color: var(--color-text-on-dark);\n    max-width: 600px;\n    margin: 0 auto 40px;\n    opacity: 0.9;\n}', css)

# 4. Buttons (Notion uses 8px rectangles, not pills!)
css = re.sub(r'\.action-btn\s*{[^}]+}', 
             '.action-btn {\n    background: var(--primary);\n    color: white;\n    border: none;\n    padding: 10px 18px;\n    border-radius: var(--radius-md);\n    font-weight: 500;\n    font-size: var(--text-sm);\n    cursor: pointer;\n    transition: background var(--transition-fast);\n}', css)

css = re.sub(r'\.btn-primary\s*{[^}]+}', 
             '.btn-primary {\n    background: var(--primary);\n    color: white;\n    border: none;\n    padding: 10px 18px;\n    border-radius: var(--radius-md);\n    font-weight: 500;\n    font-size: var(--text-sm);\n    cursor: pointer;\n    transition: background var(--transition-fast);\n}', css)

css = re.sub(r'\.action-btn:hover, \.btn-primary:hover\s*{[^}]+}', 
             '.action-btn:hover, .btn-primary:hover {\n    background: var(--primary-hover);\n    transform: none;\n}', css)

css = re.sub(r'\.action-btn:active, \.btn-primary:active\s*{[^}]+}', 
             '.action-btn:active, .btn-primary:active {\n    transform: var(--transform-active);\n}', css)

# 5. Feature Cards (Light gray surfaces with subtle shadows)
css = re.sub(r'\.home-card\s*{[^}]+}', 
             '.home-card {\n    background: var(--bg-card);\n    border: 1px solid var(--color-border);\n    border-radius: var(--radius-lg);\n    padding: 32px;\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    text-align: left;\n    cursor: pointer;\n    transition: transform var(--transition-fast), box-shadow var(--transition-fast);\n}', css)

css = re.sub(r'\.home-card:hover\s*{[^}]+}', 
             '.home-card:hover {\n    transform: translateY(-2px);\n    box-shadow: var(--shadow-md);\n    border-color: var(--color-border);\n}', css)

css = re.sub(r'\.home-card-icon\s*{[^}]+}', 
             '.home-card-icon {\n    font-size: 24px;\n    margin-bottom: 16px;\n    color: var(--color-text-main);\n    background: transparent;\n    width: auto;\n    height: auto;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 0;\n    padding: 0;\n}', css)

# 6. Flashcard (Documental style)
css = re.sub(r'\.card-face\s*{[^}]+}', 
             '.card-face {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    backface-visibility: hidden;\n    border-radius: var(--radius-lg);\n    background: var(--bg-app);\n    border: 1px solid var(--color-border);\n    box-shadow: var(--shadow-md);\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    padding: 40px;\n}', css)

css = re.sub(r'\.card-character\s*{[^}]+}', 
             '.card-character {\n    font-size: var(--hanzi-hero);\n    font-family: var(--font-chinese);\n    font-weight: var(--hanzi-weight);\n    margin-bottom: 20px;\n    color: var(--color-text-charcoal);\n}', css)

# 7. Remove glow focus rings, use solid Notion purple focus
css = re.sub(r':where\([^)]+\):focus-visible\s*{[^}]+}', 
             ':where(a, button, input, select, textarea, [role="button"], [tabindex]):focus-visible {\n    outline: 2px solid var(--primary);\n    outline-offset: 2px;\n}', css)

# 8. Typography and headings
css = re.sub(r'\.app-title\s*{[^}]+}', 
             '.app-title {\n    font-size: 1.1rem;\n    font-weight: 600;\n    color: var(--text-main);\n    margin: 0;\n    white-space: nowrap;\n    letter-spacing: -0.5px;\n}', css)

# 9. Clean up any remaining scale() transforms on hover
css = re.sub(r'transform: scale\([^)]+\);', 'transform: none;', css)

with open('assets/css/styles-professional.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS refactored successfully for Notion theme.")
