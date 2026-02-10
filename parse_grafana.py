import json
import os

file_path = '/Users/luwen/Documents/trae_projects/grafa/GLM API PD-1770624185019.json'

def extract_panel_info(panel):
    title = panel.get('title', 'No Title')
    description = panel.get('description', '')
    targets = panel.get('targets', [])
    expr = ''
    if targets and len(targets) > 0:
        expr = targets[0].get('expr', '')
    
    # Clean up newlines in expr for better display
    expr = expr.replace('\n', ' ').strip()
    
    return {
        'title': title,
        'description': description,
        'expr': expr
    }

def process_section(dashboard, section_title):
    panels = dashboard.get('panels', [])
    target_panels = []
    
    collecting = False
    
    for panel in panels:
        if panel.get('type') == 'row':
            current_title = panel.get('title', '')
            
            # Check if this is the target section
            if current_title == section_title:
                if panel.get('collapsed', False):
                    # If collapsed, panels are inside
                    sub_panels = panel.get('panels', [])
                    for sp in sub_panels:
                        target_panels.append(extract_panel_info(sp))
                    break # Done with this section since it's collapsed
                else:
                    # If not collapsed, start collecting from next panel
                    collecting = True
                    continue
            
            # If we encounter another row while collecting, stop
            if collecting:
                break
        
        elif collecting:
            target_panels.append(extract_panel_info(panel))
            
    return target_panels

try:
    with open(file_path, 'r') as f:
        dashboard = json.load(f)
        
    sections = ['PD Performance', 'PD Network']
    results = {}
    
    for section in sections:
        results[section] = process_section(dashboard, section)
        
    print(json.dumps(results, indent=2, ensure_ascii=False))

except Exception as e:
    print(f"Error: {e}")
