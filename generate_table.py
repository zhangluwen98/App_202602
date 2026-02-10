import json

def generate_markdown_table(data, section_name):
    panels = data.get(section_name, [])
    if not panels:
        return f"No panels found for {section_name}"
    
    markdown = f"### {section_name}\n\n"
    markdown += "| Panel Title | Description | Query/Expression |\n"
    markdown += "|---|---|---|\n"
    
    for panel in panels:
        title = panel['title'].replace('|', '\\|')
        desc = panel['description'].replace('|', '\\|').replace('\n', '<br>')
        expr = panel['expr'].replace('|', '\\|').replace('\n', ' ')
        
        # Escape backticks in expr
        expr = expr.replace('`', '\\`')
        
        if expr:
            # Use pre tag for long expressions if needed, or just code ticks
            # Since markdown table cells can't handle multi-line code blocks easily, 
            # we keep it single line code span.
            expr = f"`{expr}`"
            
        markdown += f"| {title} | {desc} | {expr} |\n"
        
    return markdown

try:
    with open('output.json', 'r') as f:
        data = json.load(f)

    print(generate_markdown_table(data, 'PD Performance'))
    print("\n")
    print(generate_markdown_table(data, 'PD Network'))
except Exception as e:
    print(f"Error: {e}")
