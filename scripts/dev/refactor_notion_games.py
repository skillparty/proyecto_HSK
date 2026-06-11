import re

def refactor_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        css = f.read()

    # Use Notion's flat cards
    css = re.sub(r'border-radius: var\(--radius-none\);', 'border-radius: var(--radius-lg);', css)
    css = re.sub(r'border-radius: var\(--radius-pill\);', 'border-radius: var(--radius-md);', css)
    
    # Remove pill borders for buttons
    css = re.sub(r'border-radius: var\(--radius-pill\)', 'border-radius: var(--radius-md)', css)

    # Use Canvas White and Surface
    css = re.sub(r'background: var\(--bg-panel\);', 'background: var(--color-bg-app);', css)
    css = re.sub(r'background: var\(--bg-card\);', 'background: var(--color-bg-card);', css)

    # Typographic scales
    css = re.sub(r'font-family: var\(--font-display\);', 'font-family: var(--font-main);', css)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(css)

refactor_file('assets/css/matrix-game-styles.css')
refactor_file('assets/css/quantifier-snake-styles.css')
refactor_file('assets/css/leaderboard-styles.css')

print("Games CSS refactored successfully for Notion theme.")
